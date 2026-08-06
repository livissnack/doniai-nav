use crate::auth::{user_id_from_session, AuthState};
use axum::{
    body::Body,
    extract::{Multipart, Query, State},
    http::{HeaderMap, HeaderValue, StatusCode},
    response::Response,
    routing::{delete, get, post, put},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use std::{
    env,
    path::{Component, Path, PathBuf},
};

const UPLOAD_ROOT: &str = "data/uploads";

#[derive(Clone)]
pub struct FilesState {
    auth: AuthState,
}

#[derive(Debug, Serialize)]
struct FilesApiBody {
    ok: bool,
    message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    items: Option<Vec<FileEntry>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    item: Option<FileEntry>,
    #[serde(skip_serializing_if = "Option::is_none")]
    content: Option<String>,
}

#[derive(Debug, Serialize)]
struct FileEntry {
    name: String,
    path: String,
    #[serde(rename = "isDir")]
    is_dir: bool,
    size: u64,
    #[serde(rename = "updatedAt")]
    updated_at: u64,
    ext: String,
}

#[derive(Debug, Deserialize)]
struct PathQuery {
    path: Option<String>,
}

#[derive(Debug, Deserialize)]
struct FolderBody {
    path: Option<String>,
    name: String,
}

#[derive(Debug, Deserialize)]
struct RenameBody {
    path: String,
    #[serde(rename = "newName")]
    new_name: String,
}

#[derive(Debug, Deserialize)]
struct TextBody {
    path: String,
    content: String,
}

type FilesResponse = (StatusCode, Json<FilesApiBody>);

fn upload_root() -> String {
    env::var("UPLOAD_ROOT").unwrap_or_else(|_| UPLOAD_ROOT.into())
}

fn user_root(user_id: u64) -> PathBuf {
    PathBuf::from(upload_root()).join(user_id.to_string())
}

fn sanitize_rel_path(raw: &str) -> Result<PathBuf, &'static str> {
    let trimmed = raw.trim().trim_start_matches(['/', '\\']);
    if trimmed.is_empty() {
        return Ok(PathBuf::new());
    }
    let mut out = PathBuf::new();
    for comp in Path::new(trimmed).components() {
        match comp {
            Component::Normal(s) => out.push(s),
            Component::ParentDir | Component::RootDir | Component::Prefix(_) => {
                return Err("非法路径");
            }
            _ => {}
        }
    }
    Ok(out)
}

fn abs_path(user_id: u64, rel: &Path) -> PathBuf {
    user_root(user_id).join(rel)
}

fn ensure_user_dir(user_id: u64) -> std::io::Result<PathBuf> {
    let root = user_root(user_id);
    std::fs::create_dir_all(&root)?;
    Ok(root)
}

fn file_mtime(path: &Path) -> u64 {
    std::fs::metadata(path)
        .and_then(|m| m.modified())
        .ok()
        .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
        .map(|d| d.as_secs())
        .unwrap_or(0)
}

fn list_dir(user_id: u64, rel: &Path) -> Result<Vec<FileEntry>, String> {
    let dir = abs_path(user_id, rel);
    if !dir.exists() {
        return Ok(vec![]);
    }
    if !dir.is_dir() {
        return Err("不是目录".into());
    }
    let mut items = Vec::new();
    let entries = std::fs::read_dir(&dir).map_err(|e| e.to_string())?;
    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        let meta = entry.metadata().map_err(|e| e.to_string())?;
        let name = entry.file_name().to_string_lossy().to_string();
        if name.starts_with('.') {
            continue;
        }
        let mut child_rel = rel.to_path_buf();
        child_rel.push(&name);
        let path_str = child_rel.to_string_lossy().replace('\\', "/");
        let ext = if meta.is_dir() {
            String::new()
        } else {
            Path::new(&name)
                .extension()
                .map(|e| format!(".{}", e.to_string_lossy().to_lowercase()))
                .unwrap_or_default()
        };
        items.push(FileEntry {
            name,
            path: path_str,
            is_dir: meta.is_dir(),
            size: if meta.is_file() { meta.len() } else { 0 },
            updated_at: file_mtime(&entry.path()),
            ext,
        });
    }
    items.sort_by(|a, b| {
        b.is_dir
            .cmp(&a.is_dir)
            .then_with(|| a.name.to_lowercase().cmp(&b.name.to_lowercase()))
    });
    Ok(items)
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
        }),
    )
}

fn ok_upload(msg: &str, item: FileEntry, items: Vec<FileEntry>) -> FilesResponse {
    (
        StatusCode::OK,
        Json(FilesApiBody {
            ok: true,
            message: msg.into(),
            items: Some(items),
            item: Some(item),
            content: None,
        }),
    )
}

fn ok_text(msg: &str, content: String) -> FilesResponse {
    (
        StatusCode::OK,
        Json(FilesApiBody {
            ok: true,
            message: msg.into(),
            items: None,
            item: None,
            content: Some(content),
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
        }),
    )
}

fn require_user(state: &FilesState, headers: &HeaderMap) -> Result<u64, FilesResponse> {
    user_id_from_session(&state.auth, headers)
        .ok_or_else(|| err("请先登录", StatusCode::UNAUTHORIZED))
}

fn is_text_ext(ext: &str) -> bool {
    matches!(
        ext,
        ".md" | ".txt" | ".json" | ".yaml" | ".yml" | ".xml" | ".csv" | ".log" | ".html" | ".htm"
    )
}

pub fn init_state(auth: AuthState) -> FilesState {
    let _ = std::fs::create_dir_all(upload_root());
    FilesState { auth }
}

pub fn router(state: FilesState) -> Router {
    Router::new()
        .route("/list", get(list_files))
        .route("/upload", post(upload_file))
        .route("/folder", post(create_folder))
        .route("/rename", put(rename_file))
        .route("/text", get(get_text).put(put_text))
        .route("/raw", get(download_raw))
        .route("/binary", put(upload_binary))
        .route("/item", delete(delete_item))
        .with_state(state)
}

async fn list_files(
    State(state): State<FilesState>,
    headers: HeaderMap,
    Query(q): Query<PathQuery>,
) -> FilesResponse {
    let user_id = match require_user(&state, &headers) {
        Ok(id) => id,
        Err(r) => return r,
    };
    let rel = match sanitize_rel_path(q.path.as_deref().unwrap_or("")) {
        Ok(p) => p,
        Err(m) => return err(m, StatusCode::BAD_REQUEST),
    };
    if let Err(e) = ensure_user_dir(user_id) {
        return err(&e.to_string(), StatusCode::INTERNAL_SERVER_ERROR);
    }
    match list_dir(user_id, &rel) {
        Ok(items) => ok_items("ok", items),
        Err(m) => err(&m, StatusCode::BAD_REQUEST),
    }
}

async fn create_folder(
    State(state): State<FilesState>,
    headers: HeaderMap,
    Json(body): Json<FolderBody>,
) -> FilesResponse {
    let user_id = match require_user(&state, &headers) {
        Ok(id) => id,
        Err(r) => return r,
    };
    let name = body.name.trim();
    if name.is_empty() || name.contains('/') || name.contains('\\') {
        return err("文件夹名称无效", StatusCode::BAD_REQUEST);
    }
    let parent = match sanitize_rel_path(body.path.as_deref().unwrap_or("")) {
        Ok(p) => p,
        Err(m) => return err(m, StatusCode::BAD_REQUEST),
    };
    let mut target = abs_path(user_id, &parent);
    target.push(name);
    if target.exists() {
        return err("已存在同名项", StatusCode::CONFLICT);
    }
    if let Err(e) = std::fs::create_dir_all(&target) {
        return err(&e.to_string(), StatusCode::INTERNAL_SERVER_ERROR);
    }
    let items = list_dir(user_id, &parent).unwrap_or_default();
    ok_items("文件夹已创建", items)
}

async fn upload_file(
    State(state): State<FilesState>,
    headers: HeaderMap,
    mut multipart: Multipart,
) -> FilesResponse {
    let user_id = match require_user(&state, &headers) {
        Ok(id) => id,
        Err(r) => return r,
    };
    let _ = ensure_user_dir(user_id);
    let mut rel_path = PathBuf::new();
    let mut file_data: Option<(String, Vec<u8>)> = None;

    while let Ok(Some(field)) = multipart.next_field().await {
        let name = field.name().unwrap_or("").to_string();
        if name == "path" {
            if let Ok(text) = field.text().await {
                rel_path = sanitize_rel_path(&text).unwrap_or_default();
            }
        } else if name == "file" {
            let filename = field
                .file_name()
                .map(|s| s.to_string())
                .unwrap_or_else(|| "upload.bin".into());
            if let Ok(bytes) = field.bytes().await {
                file_data = Some((filename, bytes.to_vec()));
            }
        }
    }

    let Some((filename, data)) = file_data else {
        return err("未收到文件", StatusCode::BAD_REQUEST);
    };
    let safe_name = Path::new(&filename)
        .file_name()
        .map(|s| s.to_string_lossy().to_string())
        .unwrap_or_else(|| "upload.bin".into());
    let mut target = abs_path(user_id, &rel_path);
    target.push(&safe_name);
    if target.exists() {
        let stem = Path::new(&safe_name)
            .file_stem()
            .map(|s| s.to_string_lossy().to_string())
            .unwrap_or_else(|| "file".into());
        let ext = Path::new(&safe_name)
            .extension()
            .map(|e| format!(".{}", e.to_string_lossy()))
            .unwrap_or_default();
        let stamp = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map(|d| d.as_millis())
            .unwrap_or(0);
        let renamed = format!("{}_{}{}", stem, stamp, ext);
        target.pop();
        target.push(&renamed);
    }
    if let Some(parent) = target.parent() {
        let _ = std::fs::create_dir_all(parent);
    }
    if let Err(e) = std::fs::write(&target, &data) {
        return err(&e.to_string(), StatusCode::INTERNAL_SERVER_ERROR);
    }
    let final_name = target
        .file_name()
        .map(|s| s.to_string_lossy().to_string())
        .unwrap_or(safe_name);
    let mut item_rel = rel_path.clone();
    item_rel.push(&final_name);
    let path_str = item_rel.to_string_lossy().replace('\\', "/");
    let ext = Path::new(&final_name)
        .extension()
        .map(|e| format!(".{}", e.to_string_lossy().to_lowercase()))
        .unwrap_or_default();
    let item = FileEntry {
        name: final_name,
        path: path_str,
        is_dir: false,
        size: data.len() as u64,
        updated_at: file_mtime(&target),
        ext,
    };
    let items = list_dir(user_id, &rel_path).unwrap_or_default();
    ok_upload("上传成功", item, items)
}

async fn upload_binary(
    State(state): State<FilesState>,
    headers: HeaderMap,
    mut multipart: Multipart,
) -> FilesResponse {
    let user_id = match require_user(&state, &headers) {
        Ok(id) => id,
        Err(r) => return r,
    };
    let mut rel_file = String::new();
    let mut file_data: Option<Vec<u8>> = None;

    while let Ok(Some(field)) = multipart.next_field().await {
        let name = field.name().unwrap_or("").to_string();
        if name == "path" {
            if let Ok(text) = field.text().await {
                rel_file = text;
            }
        } else if name == "file" {
            if let Ok(bytes) = field.bytes().await {
                file_data = Some(bytes.to_vec());
            }
        }
    }

    let rel = match sanitize_rel_path(&rel_file) {
        Ok(p) => p,
        Err(m) => return err(m, StatusCode::BAD_REQUEST),
    };
    let Some(data) = file_data else {
        return err("未收到文件内容", StatusCode::BAD_REQUEST);
    };
    let target = abs_path(user_id, &rel);
    if target.is_dir() {
        return err("不能覆盖目录", StatusCode::BAD_REQUEST);
    }
    if let Some(parent) = target.parent() {
        let _ = std::fs::create_dir_all(parent);
    }
    if let Err(e) = std::fs::write(&target, &data) {
        return err(&e.to_string(), StatusCode::INTERNAL_SERVER_ERROR);
    }
    ok_items("已保存", vec![])
}

async fn rename_file(
    State(state): State<FilesState>,
    headers: HeaderMap,
    Json(body): Json<RenameBody>,
) -> FilesResponse {
    let user_id = match require_user(&state, &headers) {
        Ok(id) => id,
        Err(r) => return r,
    };
    let rel = match sanitize_rel_path(&body.path) {
        Ok(p) => p,
        Err(m) => return err(m, StatusCode::BAD_REQUEST),
    };
    let new_name = body.new_name.trim();
    if new_name.is_empty() || new_name.contains('/') || new_name.contains('\\') {
        return err("新名称无效", StatusCode::BAD_REQUEST);
    }
    let from = abs_path(user_id, &rel);
    if !from.exists() {
        return err("文件不存在", StatusCode::NOT_FOUND);
    }
    let mut to = from.clone();
    to.set_file_name(new_name);
    if to.exists() {
        return err("目标名称已存在", StatusCode::CONFLICT);
    }
    if let Err(e) = std::fs::rename(&from, &to) {
        return err(&e.to_string(), StatusCode::INTERNAL_SERVER_ERROR);
    }
    let parent = rel.parent().map(|p| p.to_path_buf()).unwrap_or_default();
    let items = list_dir(user_id, &parent).unwrap_or_default();
    ok_items("已重命名", items)
}

async fn delete_item(
    State(state): State<FilesState>,
    headers: HeaderMap,
    Query(q): Query<PathQuery>,
) -> FilesResponse {
    let user_id = match require_user(&state, &headers) {
        Ok(id) => id,
        Err(r) => return r,
    };
    let rel = match sanitize_rel_path(q.path.as_deref().unwrap_or("")) {
        Ok(p) => p,
        Err(m) => return err(m, StatusCode::BAD_REQUEST),
    };
    if rel.as_os_str().is_empty() {
        return err("不能删除根目录", StatusCode::BAD_REQUEST);
    }
    let target = abs_path(user_id, &rel);
    if !target.exists() {
        return err("不存在", StatusCode::NOT_FOUND);
    }
    let parent = rel.parent().unwrap_or(&PathBuf::new()).to_path_buf();
    let result = if target.is_dir() {
        std::fs::remove_dir_all(&target)
    } else {
        std::fs::remove_file(&target)
    };
    if let Err(e) = result {
        return err(&e.to_string(), StatusCode::INTERNAL_SERVER_ERROR);
    }
    let items = list_dir(user_id, &parent).unwrap_or_default();
    ok_items("已删除", items)
}

async fn get_text(
    State(state): State<FilesState>,
    headers: HeaderMap,
    Query(q): Query<PathQuery>,
) -> FilesResponse {
    let user_id = match require_user(&state, &headers) {
        Ok(id) => id,
        Err(r) => return r,
    };
    let rel = match sanitize_rel_path(q.path.as_deref().unwrap_or("")) {
        Ok(p) => p,
        Err(m) => return err(m, StatusCode::BAD_REQUEST),
    };
    let target = abs_path(user_id, &rel);
    if !target.is_file() {
        return err("文件不存在", StatusCode::NOT_FOUND);
    }
    let ext = target
        .extension()
        .map(|e| format!(".{}", e.to_string_lossy().to_lowercase()))
        .unwrap_or_default();
    if !is_text_ext(&ext) && ext != ".md" {
        return err("该文件请使用二进制接口打开", StatusCode::BAD_REQUEST);
    }
    let content = std::fs::read_to_string(&target).unwrap_or_default();
    ok_text("ok", content)
}

async fn put_text(
    State(state): State<FilesState>,
    headers: HeaderMap,
    Json(body): Json<TextBody>,
) -> FilesResponse {
    let user_id = match require_user(&state, &headers) {
        Ok(id) => id,
        Err(r) => return r,
    };
    let rel = match sanitize_rel_path(&body.path) {
        Ok(p) => p,
        Err(m) => return err(m, StatusCode::BAD_REQUEST),
    };
    let target = abs_path(user_id, &rel);
    if let Some(parent) = target.parent() {
        let _ = std::fs::create_dir_all(parent);
    }
    if let Err(e) = std::fs::write(&target, body.content.as_bytes()) {
        return err(&e.to_string(), StatusCode::INTERNAL_SERVER_ERROR);
    }
    ok_text("已保存", body.content)
}

async fn download_raw(
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
    if !target.is_file() {
        return Err(err("文件不存在", StatusCode::NOT_FOUND));
    }
    let data = std::fs::read(&target).map_err(|e| err(&e.to_string(), StatusCode::INTERNAL_SERVER_ERROR))?;
    let filename = target
        .file_name()
        .map(|s| s.to_string_lossy().to_string())
        .unwrap_or_else(|| "file".into());
    let ext = target
        .extension()
        .map(|e| e.to_string_lossy().to_lowercase())
        .unwrap_or_default();
    let mime = match ext.as_str() {
        "png" => "image/png",
        "jpg" | "jpeg" => "image/jpeg",
        "gif" => "image/gif",
        "webp" => "image/webp",
        "svg" => "image/svg+xml",
        "pdf" => "application/pdf",
        "doc" => "application/msword",
        "docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "xls" => "application/vnd.ms-excel",
        "xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "ppt" => "application/vnd.ms-powerpoint",
        "pptx" => "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "md" | "txt" | "json" | "csv" => "text/plain; charset=utf-8",
        _ => "application/octet-stream",
    };
    let mut resp = Response::new(Body::from(data));
    *resp.status_mut() = StatusCode::OK;
    let headers_mut = resp.headers_mut();
    let _ = headers_mut.insert(
        "Content-Type",
        HeaderValue::from_str(mime).unwrap_or(HeaderValue::from_static("application/octet-stream")),
    );
    let disposition = format!("inline; filename=\"{}\"", filename);
    let _ = headers_mut.insert(
        "Content-Disposition",
        HeaderValue::from_str(&disposition).unwrap_or(HeaderValue::from_static("inline")),
    );
    Ok(resp)
}
