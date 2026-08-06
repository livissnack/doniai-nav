//! 统一备份：笔记 + 文件 → 单个 tar.gz
//!
//! 归档结构：
//!   manifest.json
//!   notes.json          (doniai-notes-v2 ExportBundle)
//!   notes-settings.json (可选)
//!   files/              (用户上传目录树)

use crate::auth::{user_id_from_session, AuthState};
use crate::files;
use crate::notes::{self, ExportBundle, NotesState, NotesUserSettings};
use axum::{
    body::Body,
    extract::{Multipart, State},
    http::{header, HeaderMap, HeaderValue, StatusCode},
    response::{IntoResponse, Response},
    routing::{get, post},
    Json, Router,
};
use flate2::read::GzDecoder;
use flate2::write::GzEncoder;
use flate2::Compression;
use serde::{Deserialize, Serialize};
use std::{
    fs::{self, File},
    io::{self, Read, Write},
    path::{Component, Path, PathBuf},
    time::{SystemTime, UNIX_EPOCH},
};
use tar::{Archive, Builder, Header};

const FORMAT: &str = "doniai-backup-v1";

#[derive(Clone)]
pub struct BackupState {
    auth: AuthState,
    notes: NotesState,
}

#[derive(Debug, Serialize, Deserialize)]
struct Manifest {
    format: String,
    version: u32,
    #[serde(rename = "exportedAt")]
    exported_at: u64,
}

#[derive(Debug, Serialize)]
struct BackupApiBody {
    ok: bool,
    message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(rename = "notesProjects")]
    notes_projects: Option<usize>,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(rename = "notesPages")]
    notes_pages: Option<usize>,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(rename = "filesCount")]
    files_count: Option<usize>,
}

pub fn init_state(auth: AuthState, notes: NotesState) -> BackupState {
    BackupState { auth, notes }
}

pub fn router(state: BackupState) -> Router {
    Router::new()
        .route("/export", get(export_backup))
        .route("/import", post(import_backup))
        .with_state(state)
}

fn now_ts() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or(0)
}

fn require_user(state: &BackupState, headers: &HeaderMap) -> Result<u64, Response> {
    user_id_from_session(&state.auth, headers).ok_or_else(|| {
        (
            StatusCode::UNAUTHORIZED,
            Json(BackupApiBody {
                ok: false,
                message: "请先登录".into(),
                notes_projects: None,
                notes_pages: None,
                files_count: None,
            }),
        )
            .into_response()
    })
}

fn json_err(msg: &str, status: StatusCode) -> Response {
    (
        status,
        Json(BackupApiBody {
            ok: false,
            message: msg.into(),
            notes_projects: None,
            notes_pages: None,
            files_count: None,
        }),
    )
        .into_response()
}

fn json_ok(
    msg: &str,
    notes_projects: usize,
    notes_pages: usize,
    files_count: usize,
) -> Response {
    (
        StatusCode::OK,
        Json(BackupApiBody {
            ok: true,
            message: msg.into(),
            notes_projects: Some(notes_projects),
            notes_pages: Some(notes_pages),
            files_count: Some(files_count),
        }),
    )
        .into_response()
}

fn append_bytes<W: Write>(tar: &mut Builder<W>, path: &str, data: &[u8]) -> io::Result<()> {
    let mut header = Header::new_gnu();
    header.set_size(data.len() as u64);
    header.set_mode(0o644);
    header.set_mtime(now_ts());
    header.set_cksum();
    tar.append_data(&mut header, path, data)
}

fn append_dir_tree<W: Write>(
    tar: &mut Builder<W>,
    disk_root: &Path,
    archive_prefix: &str,
) -> io::Result<usize> {
    if !disk_root.exists() {
        return Ok(0);
    }
    let mut count = 0usize;
    fn walk<W: Write>(
        tar: &mut Builder<W>,
        dir: &Path,
        disk_root: &Path,
        archive_prefix: &str,
        count: &mut usize,
    ) -> io::Result<()> {
        for entry in fs::read_dir(dir)? {
            let entry = entry?;
            let path = entry.path();
            let name = entry.file_name();
            let name_str = name.to_string_lossy();
            if name_str.starts_with('.') {
                continue;
            }
            let rel = path
                .strip_prefix(disk_root)
                .unwrap_or(&path)
                .to_string_lossy()
                .replace('\\', "/");
            let archive_path = format!("{}/{}", archive_prefix.trim_end_matches('/'), rel);
            if path.is_dir() {
                walk(tar, &path, disk_root, archive_prefix, count)?;
            } else if path.is_file() {
                let mut file = File::open(&path)?;
                tar.append_file(archive_path, &mut file)?;
                *count += 1;
            }
        }
        Ok(())
    }
    walk(tar, disk_root, disk_root, archive_prefix, &mut count)?;
    Ok(count)
}

fn build_archive(user_id: u64, notes: &NotesState) -> Result<PathBuf, String> {
    let stamp = now_ts();
    let out_path =
        std::env::temp_dir().join(format!("doniai-backup-{}-{}.tar.gz", user_id, stamp));

    let file = File::create(&out_path).map_err(|e| e.to_string())?;
    let enc = GzEncoder::new(file, Compression::default());
    let mut tar = Builder::new(enc);

    let manifest = Manifest {
        format: FORMAT.into(),
        version: 1,
        exported_at: stamp,
    };
    let manifest_bytes = serde_json::to_vec_pretty(&manifest).map_err(|e| e.to_string())?;
    append_bytes(&mut tar, "manifest.json", &manifest_bytes).map_err(|e| e.to_string())?;

    let bundle = notes::build_full_export_bundle(notes, user_id);
    let notes_bytes = serde_json::to_vec(&bundle).map_err(|e| e.to_string())?;
    append_bytes(&mut tar, "notes.json", &notes_bytes).map_err(|e| e.to_string())?;

    let settings = notes::export_user_settings(notes, user_id);
    let settings_bytes = serde_json::to_vec_pretty(&settings).map_err(|e| e.to_string())?;
    append_bytes(&mut tar, "notes-settings.json", &settings_bytes)
        .map_err(|e| e.to_string())?;

    let files_root = files::user_upload_root(user_id);
    append_dir_tree(&mut tar, &files_root, "files").map_err(|e| e.to_string())?;

    tar.finish().map_err(|e| e.to_string())?;
    Ok(out_path)
}

async fn export_backup(State(state): State<BackupState>, headers: HeaderMap) -> Response {
    let user_id = match require_user(&state, &headers) {
        Ok(id) => id,
        Err(r) => return r,
    };

    let path = match tokio::task::spawn_blocking({
        let notes = state.notes.clone();
        move || build_archive(user_id, &notes)
    })
    .await
    {
        Ok(Ok(v)) => v,
        Ok(Err(m)) => return json_err(&m, StatusCode::INTERNAL_SERVER_ERROR),
        Err(e) => return json_err(&e.to_string(), StatusCode::INTERNAL_SERVER_ERROR),
    };

    let bytes = match tokio::fs::read(&path).await {
        Ok(b) => b,
        Err(e) => {
            let _ = fs::remove_file(&path);
            return json_err(&e.to_string(), StatusCode::INTERNAL_SERVER_ERROR);
        }
    };
    let _ = fs::remove_file(&path);

    let filename = format!(
        "doniai-backup-{}.tar.gz",
        chrono::Local::now().format("%Y%m%d-%H%M%S")
    );
    let mut response = Response::new(Body::from(bytes));
    *response.status_mut() = StatusCode::OK;
    response.headers_mut().insert(
        header::CONTENT_TYPE,
        HeaderValue::from_static("application/gzip"),
    );
    if let Ok(v) = HeaderValue::from_str(&format!("attachment; filename=\"{}\"", filename)) {
        response
            .headers_mut()
            .insert(header::CONTENT_DISPOSITION, v);
    }
    response
}

fn sanitize_archive_rel(raw: &str) -> Option<PathBuf> {
    let trimmed = raw.trim().trim_start_matches("./").replace('\\', "/");
    if trimmed.is_empty() || trimmed.ends_with('/') {
        return None;
    }
    let rel = trimmed.strip_prefix("files/")?;
    if rel.is_empty() {
        return None;
    }
    let mut out = PathBuf::new();
    for comp in Path::new(rel).components() {
        match comp {
            Component::Normal(s) => out.push(s),
            Component::ParentDir | Component::RootDir | Component::Prefix(_) => return None,
            _ => {}
        }
    }
    if out.as_os_str().is_empty() {
        None
    } else {
        Some(out)
    }
}

fn restore_archive(
    user_id: u64,
    notes: &NotesState,
    bytes: &[u8],
) -> Result<(usize, usize, usize), String> {
    let dec = GzDecoder::new(bytes);
    let mut archive = Archive::new(dec);

    let mut notes_json: Option<Vec<u8>> = None;
    let mut settings_json: Option<Vec<u8>> = None;
    let mut file_entries: Vec<(PathBuf, Vec<u8>)> = Vec::new();
    let mut saw_manifest = false;

    for entry in archive.entries().map_err(|e| e.to_string())? {
        let mut entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path().map_err(|e| e.to_string())?;
        let path_str = path.to_string_lossy().replace('\\', "/");

        if path_str == "manifest.json" {
            let mut buf = Vec::new();
            entry.read_to_end(&mut buf).map_err(|e| e.to_string())?;
            let manifest: Manifest =
                serde_json::from_slice(&buf).map_err(|e| format!("manifest 无效: {}", e))?;
            if manifest.format != FORMAT {
                return Err(format!("不支持的备份格式: {}", manifest.format));
            }
            saw_manifest = true;
            continue;
        }

        if path_str == "notes.json" {
            let mut buf = Vec::new();
            entry.read_to_end(&mut buf).map_err(|e| e.to_string())?;
            notes_json = Some(buf);
            continue;
        }

        if path_str == "notes-settings.json" {
            let mut buf = Vec::new();
            entry.read_to_end(&mut buf).map_err(|e| e.to_string())?;
            settings_json = Some(buf);
            continue;
        }

        if path_str.starts_with("files/") && !entry.header().entry_type().is_dir() {
            if let Some(rel) = sanitize_archive_rel(&path_str) {
                let mut buf = Vec::new();
                entry.read_to_end(&mut buf).map_err(|e| e.to_string())?;
                file_entries.push((rel, buf));
            }
        }
    }

    if !saw_manifest && notes_json.is_none() && file_entries.is_empty() {
        return Err("不是有效的 doniai 备份包".into());
    }

    let mut notes_projects = 0usize;
    let mut notes_pages = 0usize;
    if let Some(buf) = notes_json {
        let bundle: ExportBundle =
            serde_json::from_slice(&buf).map_err(|e| format!("notes.json 无效: {}", e))?;
        let (p, n) = notes::import_export_bundle(notes, user_id, bundle)?;
        notes_projects = p;
        notes_pages = n;
    }

    if let Some(buf) = settings_json {
        if let Ok(settings) = serde_json::from_slice::<NotesUserSettings>(&buf) {
            notes::apply_user_settings(notes, user_id, settings);
        }
    }

    let root = files::ensure_user_upload_dir(user_id).map_err(|e| e.to_string())?;
    let mut files_count = 0usize;
    for (rel, data) in file_entries {
        let target = root.join(&rel);
        if let Some(parent) = target.parent() {
            fs::create_dir_all(parent).map_err(|e| e.to_string())?;
        }
        fs::write(&target, &data).map_err(|e| e.to_string())?;
        files_count += 1;
    }

    Ok((notes_projects, notes_pages, files_count))
}

async fn import_backup(
    State(state): State<BackupState>,
    headers: HeaderMap,
    mut multipart: Multipart,
) -> Response {
    let user_id = match require_user(&state, &headers) {
        Ok(id) => id,
        Err(r) => return r,
    };

    let mut file_data: Option<Vec<u8>> = None;
    while let Ok(Some(field)) = multipart.next_field().await {
        let name = field.name().unwrap_or("").to_string();
        if name == "file" || name == "backup" {
            match field.bytes().await {
                Ok(bytes) => file_data = Some(bytes.to_vec()),
                Err(e) => return json_err(&e.to_string(), StatusCode::BAD_REQUEST),
            }
        }
    }

    let Some(bytes) = file_data else {
        return json_err("未收到备份文件", StatusCode::BAD_REQUEST);
    };
    if bytes.len() > 512 * 1024 * 1024 {
        return json_err("备份文件过大（上限 512MB）", StatusCode::BAD_REQUEST);
    }

    let result = tokio::task::spawn_blocking({
        let notes = state.notes.clone();
        move || restore_archive(user_id, &notes, &bytes)
    })
    .await;

    match result {
        Ok(Ok((projects, pages, files_count))) => {
            let msg = format!(
                "恢复完成：笔记 {} 个项目 / {} 篇，文件 {} 个",
                projects, pages, files_count
            );
            json_ok(&msg, projects, pages, files_count)
        }
        Ok(Err(m)) => json_err(&m, StatusCode::BAD_REQUEST),
        Err(e) => json_err(&e.to_string(), StatusCode::INTERNAL_SERVER_ERROR),
    }
}
