//! Extended file operations: copy, batch, zip, trash, quota, range download helpers.
use crate::files::{
    abs_path_pub as abs_path, ensure_user_dir_pub as ensure_user_dir, list_dir_pub as list_dir,
    sanitize_rel_path_pub as sanitize_rel_path, user_root_pub as user_root, FileEntryPublic as FileEntry,
    FilesApiBodyPublic as FilesApiBody, FilesState,
};
use axum::{
    body::Body,
    extract::{Query, State},
    http::{HeaderMap, HeaderValue, StatusCode},
    response::Response,
    Json,
};
use serde::{Deserialize, Serialize};
use std::{
    env,
    fs::{self, File},
    io::{Read, Seek, SeekFrom, Write},
    path::{Path, PathBuf},
    time::{SystemTime, UNIX_EPOCH},
};
use zip::{write::FileOptions, CompressionMethod, ZipWriter};

const TRASH_DIR: &str = ".trash";
const TRASH_INDEX: &str = "index.json";

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TrashEntry {
    pub id: String,
    #[serde(rename = "originalPath")]
    pub original_path: String,
    pub name: String,
    #[serde(rename = "isDir")]
    pub is_dir: bool,
    pub size: u64,
    #[serde(rename = "deletedAt")]
    pub deleted_at: u64,
}

#[derive(Debug, Serialize)]
pub struct QuotaInfo {
    pub used: u64,
    pub limit: u64,
    #[serde(rename = "maxFile")]
    pub max_file: u64,
}

#[derive(Debug, Deserialize)]
pub struct CopyBody {
    pub path: String,
    #[serde(rename = "targetDir")]
    pub target_dir: Option<String>,
    #[serde(rename = "newName")]
    pub new_name: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct BatchBody {
    pub action: String,
    pub paths: Vec<String>,
    #[serde(rename = "targetDir")]
    pub target_dir: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct PathQuery {
    pub path: Option<String>,
}

type FilesResponse = (StatusCode, Json<FilesApiBody>);

fn now_secs() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or(0)
}

fn ok_items(msg: &str, items: Vec<FileEntry>) -> FilesResponse {
    (
        StatusCode::OK,
        Json(FilesApiBody {
            ok: true,
            message: msg.into(),
            items: Some(items),
            item: None,
            content: None,
            trash: None,
            quota: None,
        }),
    )
}

fn ok_trash(msg: &str, trash: Vec<TrashEntry>) -> FilesResponse {
    (
        StatusCode::OK,
        Json(FilesApiBody {
            ok: true,
            message: msg.into(),
            items: None,
            item: None,
            content: None,
            trash: Some(trash),
            quota: None,
        }),
    )
}

fn ok_quota(q: QuotaInfo) -> FilesResponse {
    (
        StatusCode::OK,
        Json(FilesApiBody {
            ok: true,
            message: "ok".into(),
            items: None,
            item: None,
            content: None,
            trash: None,
            quota: Some(q),
        }),
    )
}

fn err(msg: &str, status: StatusCode) -> FilesResponse {
    (
        status,
        Json(FilesApiBody {
            ok: false,
            message: msg.into(),
            items: None,
            item: None,
            content: None,
            trash: None,
            quota: None,
        }),
    )
}

fn require_user(state: &FilesState, headers: &HeaderMap) -> Result<u64, FilesResponse> {
    crate::auth::user_id_from_session(&state.auth, headers)
        .ok_or_else(|| err("请先登录", StatusCode::UNAUTHORIZED))
}

pub fn max_file_bytes() -> u64 {
    env::var("UPLOAD_MAX_FILE_BYTES")
        .ok()
        .and_then(|s| s.parse().ok())
        .unwrap_or(200 * 1024 * 1024) // 200MB
}

pub fn quota_bytes() -> u64 {
    env::var("UPLOAD_QUOTA_BYTES")
        .ok()
        .and_then(|s| s.parse().ok())
        .unwrap_or(5 * 1024 * 1024 * 1024) // 5GB
}

fn dir_size(path: &Path) -> u64 {
    let mut total = 0u64;
    let Ok(entries) = fs::read_dir(path) else {
        return 0;
    };
    for entry in entries.flatten() {
        let p = entry.path();
        let name = entry.file_name().to_string_lossy().to_string();
        if name == TRASH_DIR || name.starts_with('.') {
            continue;
        }
        if p.is_dir() {
            total = total.saturating_add(dir_size(&p));
        } else if let Ok(meta) = entry.metadata() {
            total = total.saturating_add(meta.len());
        }
    }
    total
}

fn trash_root(user_id: u64) -> PathBuf {
    user_root(user_id).join(TRASH_DIR)
}

fn trash_index_path(user_id: u64) -> PathBuf {
    trash_root(user_id).join(TRASH_INDEX)
}

fn load_trash_index(user_id: u64) -> Vec<TrashEntry> {
    let path = trash_index_path(user_id);
    let Ok(text) = fs::read_to_string(&path) else {
        return vec![];
    };
    serde_json::from_str(&text).unwrap_or_default()
}

fn save_trash_index(user_id: u64, entries: &[TrashEntry]) -> Result<(), String> {
    let root = trash_root(user_id);
    fs::create_dir_all(&root).map_err(|e| e.to_string())?;
    let path = trash_index_path(user_id);
    let text = serde_json::to_string_pretty(entries).map_err(|e| e.to_string())?;
    fs::write(path, text).map_err(|e| e.to_string())
}

fn unique_name_in(dir: &Path, name: &str) -> String {
    let candidate = dir.join(name);
    if !candidate.exists() {
        return name.to_string();
    }
    let path = Path::new(name);
    let stem = path
        .file_stem()
        .map(|s| s.to_string_lossy().to_string())
        .unwrap_or_else(|| name.to_string());
    let ext = path
        .extension()
        .map(|e| format!(".{}", e.to_string_lossy()))
        .unwrap_or_default();
    for i in 1..10_000 {
        let n = format!("{stem} ({i}){ext}");
        if !dir.join(&n).exists() {
            return n;
        }
    }
    format!("{stem}_{}{ext}", now_secs())
}

fn copy_recursive(from: &Path, to: &Path) -> Result<(), String> {
    if from.is_dir() {
        fs::create_dir_all(to).map_err(|e| e.to_string())?;
        for entry in fs::read_dir(from).map_err(|e| e.to_string())? {
            let entry = entry.map_err(|e| e.to_string())?;
            let name = entry.file_name();
            copy_recursive(&entry.path(), &to.join(name))?;
        }
        Ok(())
    } else {
        if let Some(parent) = to.parent() {
            fs::create_dir_all(parent).map_err(|e| e.to_string())?;
        }
        fs::copy(from, to).map_err(|e| e.to_string())?;
        Ok(())
    }
}

fn zip_dir(dir: &Path, prefix: &Path, zip: &mut ZipWriter<File>, options: FileOptions) -> Result<(), String> {
    for entry in fs::read_dir(dir).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        let name = entry.file_name().to_string_lossy().to_string();
        if name.starts_with('.') {
            continue;
        }
        let rel = prefix.join(&name);
        let rel_str = rel.to_string_lossy().replace('\\', "/");
        if path.is_dir() {
            zip.add_directory(format!("{rel_str}/"), options)
                .map_err(|e| e.to_string())?;
            zip_dir(&path, &rel, zip, options)?;
        } else {
            zip.start_file(&rel_str, options).map_err(|e| e.to_string())?;
            let mut f = File::open(&path).map_err(|e| e.to_string())?;
            let mut buf = Vec::new();
            f.read_to_end(&mut buf).map_err(|e| e.to_string())?;
            zip.write_all(&buf).map_err(|e| e.to_string())?;
        }
    }
    Ok(())
}

pub fn check_upload_allowed(user_id: u64, incoming: u64) -> Result<(), String> {
    let max_file = max_file_bytes();
    if incoming > max_file {
        return Err(format!("文件超过大小限制（最大 {} MB）", max_file / 1024 / 1024));
    }
    let used = dir_size(&user_root(user_id));
    let limit = quota_bytes();
    if used.saturating_add(incoming) > limit {
        return Err(format!(
            "存储空间不足（已用 {} / {} MB）",
            used / 1024 / 1024,
            limit / 1024 / 1024
        ));
    }
    Ok(())
}

pub async fn copy_item(
    State(state): State<FilesState>,
    headers: HeaderMap,
    Json(body): Json<CopyBody>,
) -> FilesResponse {
    let user_id = match require_user(&state, &headers) {
        Ok(id) => id,
        Err(r) => return r,
    };
    let rel = match sanitize_rel_path(&body.path) {
        Ok(p) => p,
        Err(m) => return err(m, StatusCode::BAD_REQUEST),
    };
    let target_rel = match sanitize_rel_path(body.target_dir.as_deref().unwrap_or("")) {
        Ok(p) => p,
        Err(m) => return err(m, StatusCode::BAD_REQUEST),
    };
    let from = abs_path(user_id, &rel);
    if !from.exists() {
        return err("文件不存在", StatusCode::NOT_FOUND);
    }
    let dest_dir = abs_path(user_id, &target_rel);
    if let Err(e) = fs::create_dir_all(&dest_dir) {
        return err(&e.to_string(), StatusCode::INTERNAL_SERVER_ERROR);
    }
    let orig_name = from
        .file_name()
        .map(|s| s.to_string_lossy().to_string())
        .unwrap_or_else(|| "copy".into());
    let new_name = body
        .new_name
        .as_deref()
        .map(str::trim)
        .filter(|s| !s.is_empty())
        .map(|s| s.replace(['/', '\\'], "_"))
        .unwrap_or_else(|| {
            let path = Path::new(&orig_name);
            let stem = path
                .file_stem()
                .map(|s| s.to_string_lossy().to_string())
                .unwrap_or(orig_name.clone());
            let ext = path
                .extension()
                .map(|e| format!(".{}", e.to_string_lossy()))
                .unwrap_or_default();
            unique_name_in(&dest_dir, &format!("{stem} 副本{ext}"))
        });
    let to = dest_dir.join(&new_name);
    if to.exists() {
        return err("目标已存在同名项", StatusCode::CONFLICT);
    }
    if from.is_file() {
        if let Ok(meta) = from.metadata() {
            if let Err(e) = check_upload_allowed(user_id, meta.len()) {
                return err(&e, StatusCode::PAYLOAD_TOO_LARGE);
            }
        }
    }
    if let Err(e) = copy_recursive(&from, &to) {
        return err(&e, StatusCode::INTERNAL_SERVER_ERROR);
    }
    let parent = rel.parent().map(|p| p.to_path_buf()).unwrap_or_default();
    ok_items("已复制", list_dir(user_id, &parent).unwrap_or_default())
}

pub async fn batch_ops(
    State(state): State<FilesState>,
    headers: HeaderMap,
    Json(body): Json<BatchBody>,
) -> FilesResponse {
    let user_id = match require_user(&state, &headers) {
        Ok(id) => id,
        Err(r) => return r,
    };
    let action = body.action.trim().to_lowercase();
    let mut last_parent = PathBuf::new();
    for raw in &body.paths {
        let rel = match sanitize_rel_path(raw) {
            Ok(p) => p,
            Err(_) => continue,
        };
        if rel.as_os_str().is_empty() {
            continue;
        }
        last_parent = rel.parent().map(|p| p.to_path_buf()).unwrap_or_default();
        match action.as_str() {
            "delete" => {
                let _ = soft_delete(user_id, &rel);
            }
            "purge" => {
                let _ = hard_delete(user_id, &rel);
            }
            "move" => {
                let target = body.target_dir.clone().unwrap_or_default();
                let _ = move_one(user_id, &rel, &target);
            }
            "restore" => {
                let _ = restore_one(user_id, raw);
            }
            _ => return err("未知批量操作", StatusCode::BAD_REQUEST),
        }
    }
    if action == "restore" || action == "purge" {
        return ok_trash("ok", load_trash_index(user_id));
    }
    ok_items("ok", list_dir(user_id, &last_parent).unwrap_or_default())
}

fn move_one(user_id: u64, rel: &Path, target_dir: &str) -> Result<(), String> {
    let target_rel = sanitize_rel_path(target_dir)?;
    let from = abs_path(user_id, rel);
    if !from.exists() {
        return Err("不存在".into());
    }
    let dest_dir = abs_path(user_id, &target_rel);
    fs::create_dir_all(&dest_dir).map_err(|e| e.to_string())?;
    let name = from.file_name().ok_or("无效路径")?;
    let to = dest_dir.join(name);
    if to.exists() {
        return Err("目标已存在".into());
    }
    if from.is_dir() && to.starts_with(&from) {
        return Err("不能移动到自身内部".into());
    }
    fs::rename(&from, &to).map_err(|e| e.to_string())
}

fn soft_delete(user_id: u64, rel: &Path) -> Result<(), String> {
    let from = abs_path(user_id, rel);
    if !from.exists() {
        return Err("不存在".into());
    }
    let trash = trash_root(user_id);
    fs::create_dir_all(&trash).map_err(|e| e.to_string())?;
    let id = format!("{}", now_secs() * 1000 + (rand_u32() as u64 % 1000));
    let name = from
        .file_name()
        .map(|s| s.to_string_lossy().to_string())
        .unwrap_or_else(|| "item".into());
    let dest = trash.join(&id);
    fs::rename(&from, &dest).map_err(|e| e.to_string())?;
    let meta = dest.metadata().ok();
    let is_dir = meta.as_ref().map(|m| m.is_dir()).unwrap_or(false);
    let size = if is_dir {
        dir_size(&dest)
    } else {
        meta.map(|m| m.len()).unwrap_or(0)
    };
    let mut index = load_trash_index(user_id);
    index.insert(
        0,
        TrashEntry {
            id: id.clone(),
            original_path: rel.to_string_lossy().replace('\\', "/"),
            name,
            is_dir,
            size,
            deleted_at: now_secs(),
        },
    );
    save_trash_index(user_id, &index)
}

fn hard_delete(user_id: u64, rel: &Path) -> Result<(), String> {
    // If path looks like trash id
    let trash = trash_root(user_id);
    let as_id = rel.to_string_lossy().to_string();
    let target = if trash.join(&as_id).exists() {
        trash.join(&as_id)
    } else {
        abs_path(user_id, rel)
    };
    if !target.exists() {
        return Err("不存在".into());
    }
    if target.is_dir() {
        fs::remove_dir_all(&target).map_err(|e| e.to_string())?;
    } else {
        fs::remove_file(&target).map_err(|e| e.to_string())?;
    }
    let mut index = load_trash_index(user_id);
    index.retain(|e| e.id != as_id);
    save_trash_index(user_id, &index)?;
    Ok(())
}

fn restore_one(user_id: u64, id_or_path: &str) -> Result<(), String> {
    let id = id_or_path.trim();
    let mut index = load_trash_index(user_id);
    let Some(pos) = index.iter().position(|e| e.id == id || e.original_path == id) else {
        return Err("回收站中不存在".into());
    };
    let entry = index.remove(pos);
    let from = trash_root(user_id).join(&entry.id);
    if !from.exists() {
        save_trash_index(user_id, &index)?;
        return Err("回收站文件已丢失".into());
    }
    let dest_rel = sanitize_rel_path(&entry.original_path)?;
    let mut to = abs_path(user_id, &dest_rel);
    if to.exists() {
        let parent = to.parent().map(|p| p.to_path_buf()).unwrap_or_else(|| user_root(user_id));
        let name = unique_name_in(&parent, &entry.name);
        to = parent.join(name);
    }
    if let Some(parent) = to.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    fs::rename(&from, &to).map_err(|e| e.to_string())?;
    save_trash_index(user_id, &index)
}

fn rand_u32() -> u32 {
    use std::collections::hash_map::DefaultHasher;
    use std::hash::{Hash, Hasher};
    let mut h = DefaultHasher::new();
    now_secs().hash(&mut h);
    std::thread::current().id().hash(&mut h);
    h.finish() as u32
}

pub async fn list_trash(
    State(state): State<FilesState>,
    headers: HeaderMap,
) -> FilesResponse {
    let user_id = match require_user(&state, &headers) {
        Ok(id) => id,
        Err(r) => return r,
    };
    let _ = ensure_user_dir(user_id);
    ok_trash("ok", load_trash_index(user_id))
}

pub async fn get_quota(
    State(state): State<FilesState>,
    headers: HeaderMap,
) -> FilesResponse {
    let user_id = match require_user(&state, &headers) {
        Ok(id) => id,
        Err(r) => return r,
    };
    let _ = ensure_user_dir(user_id);
    ok_quota(QuotaInfo {
        used: dir_size(&user_root(user_id)),
        limit: quota_bytes(),
        max_file: max_file_bytes(),
    })
}

pub async fn download_zip(
    State(state): State<FilesState>,
    headers: HeaderMap,
    Query(q): Query<PathQuery>,
) -> Result<Response, FilesResponse> {
    let user_id = match require_user(&state, &headers) {
        Ok(id) => id,
        Err(r) => return Err(r),
    };
    let rel = match sanitize_rel_path(q.path.as_deref().unwrap_or("")) {
        Ok(p) => p,
        Err(m) => return Err(err(m, StatusCode::BAD_REQUEST)),
    };
    let target = abs_path(user_id, &rel);
    if !target.is_dir() {
        return Err(err("只能打包文件夹", StatusCode::BAD_REQUEST));
    }
    let tmp_name = format!("zip_{}_{}.zip", user_id, now_secs());
    let tmp_path = env::temp_dir().join(&tmp_name);
    {
        let file = File::create(&tmp_path).map_err(|e| err(&e.to_string(), StatusCode::INTERNAL_SERVER_ERROR))?;
        let mut zip = ZipWriter::new(file);
        let options = FileOptions::default().compression_method(CompressionMethod::Deflated);
        let root_name = target
            .file_name()
            .map(|s| s.to_string_lossy().to_string())
            .unwrap_or_else(|| "folder".into());
        zip_dir(&target, Path::new(&root_name), &mut zip, options)
            .map_err(|e| err(&e, StatusCode::INTERNAL_SERVER_ERROR))?;
        zip.finish()
            .map_err(|e| err(&e.to_string(), StatusCode::INTERNAL_SERVER_ERROR))?;
    }
    let data = fs::read(&tmp_path).map_err(|e| err(&e.to_string(), StatusCode::INTERNAL_SERVER_ERROR))?;
    let _ = fs::remove_file(&tmp_path);
    let filename = format!(
        "{}.zip",
        target
            .file_name()
            .map(|s| s.to_string_lossy().to_string())
            .unwrap_or_else(|| "folder".into())
    );
    let mut resp = Response::new(Body::from(data));
    *resp.status_mut() = StatusCode::OK;
    let headers_mut = resp.headers_mut();
    let _ = headers_mut.insert(
        "Content-Type",
        HeaderValue::from_static("application/zip"),
    );
    let disposition = format!("attachment; filename=\"{}\"", filename);
    let _ = headers_mut.insert(
        "Content-Disposition",
        HeaderValue::from_str(&disposition).unwrap_or(HeaderValue::from_static("attachment")),
    );
    Ok(resp)
}

pub fn soft_delete_path(user_id: u64, rel: &Path) -> Result<(), String> {
    soft_delete(user_id, rel)
}

pub fn build_range_response(target: &Path, headers: &HeaderMap) -> Result<Response, String> {
    let meta = fs::metadata(target).map_err(|e| e.to_string())?;
    let len = meta.len();
    let mime = mime_guess::from_path(target)
        .first_or_octet_stream()
        .essence_str()
        .to_string();
    let filename = target
        .file_name()
        .map(|s| s.to_string_lossy().to_string())
        .unwrap_or_else(|| "file".into());

    let range_hdr = headers
        .get(axum::http::header::RANGE)
        .and_then(|v| v.to_str().ok());

    let (status, start, end, body_bytes) = if let Some(range) = range_hdr {
        // bytes=START-END
        let range = range.trim();
        if let Some(rest) = range.strip_prefix("bytes=") {
            let mut parts = rest.splitn(2, '-');
            let start_s = parts.next().unwrap_or("0");
            let end_s = parts.next().unwrap_or("");
            let start: u64 = start_s.parse().unwrap_or(0);
            let end: u64 = if end_s.is_empty() {
                len.saturating_sub(1)
            } else {
                end_s.parse().unwrap_or(len.saturating_sub(1)).min(len.saturating_sub(1))
            };
            if start >= len || start > end {
                return Err("invalid range".into());
            }
            let mut file = File::open(target).map_err(|e| e.to_string())?;
            file.seek(SeekFrom::Start(start)).map_err(|e| e.to_string())?;
            let take = (end - start + 1) as usize;
            let mut buf = vec![0u8; take];
            file.read_exact(&mut buf).map_err(|e| e.to_string())?;
            (StatusCode::PARTIAL_CONTENT, start, end, buf)
        } else {
            let data = fs::read(target).map_err(|e| e.to_string())?;
            (StatusCode::OK, 0, len.saturating_sub(1), data)
        }
    } else {
        let data = fs::read(target).map_err(|e| e.to_string())?;
        (StatusCode::OK, 0, len.saturating_sub(1), data)
    };

    let mut resp = Response::new(Body::from(body_bytes));
    *resp.status_mut() = status;
    let h = resp.headers_mut();
    let _ = h.insert(
        "Content-Type",
        HeaderValue::from_str(&mime).unwrap_or(HeaderValue::from_static("application/octet-stream")),
    );
    let _ = h.insert("Accept-Ranges", HeaderValue::from_static("bytes"));
    let _ = h.insert(
        "Content-Length",
        HeaderValue::from_str(&((end - start + 1).to_string())).unwrap_or(HeaderValue::from_static("0")),
    );
    if status == StatusCode::PARTIAL_CONTENT {
        let cr = format!("bytes {start}-{end}/{len}");
        let _ = h.insert(
            "Content-Range",
            HeaderValue::from_str(&cr).unwrap_or(HeaderValue::from_static("bytes */0")),
        );
    }
    let disposition = format!("inline; filename=\"{}\"", filename);
    let _ = h.insert(
        "Content-Disposition",
        HeaderValue::from_str(&disposition).unwrap_or(HeaderValue::from_static("inline")),
    );
    Ok(resp)
}
