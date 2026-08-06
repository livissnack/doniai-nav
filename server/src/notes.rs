use crate::auth::{user_id_from_session, AuthState};
use axum::{
    extract::{Path, State},
    http::{HeaderMap, StatusCode},
    routing::{get, post, put},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use std::{
    collections::HashMap,
    env,
    fs,
    sync::{Arc, RwLock},
    time::{SystemTime, UNIX_EPOCH},
};

const NOTES_STORE_FILE: &str = "notes_store.json";

#[derive(Clone)]
pub struct NotesState {
    inner: Arc<RwLock<NotesStore>>,
    auth: AuthState,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
struct NotesStore {
    users: HashMap<String, UserNotesData>,
    #[serde(default)]
    shares: HashMap<String, ShareLink>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct NotesUserSettings {
    #[serde(default, rename = "deepseekApiKey")]
    deepseek_api_key: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct UserNotesData {
    projects: Vec<Project>,
    pages: Vec<Page>,
    #[serde(rename = "nextProjectId", default = "default_next_id")]
    next_project_id: u64,
    #[serde(rename = "nextPageId", default = "default_next_id")]
    next_page_id: u64,
    #[serde(default)]
    settings: NotesUserSettings,
}

fn default_next_id() -> u64 {
    1
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Project {
    pub id: u64,
    pub name: String,
    #[serde(default)]
    pub desc: String,
    #[serde(rename = "createdAt")]
    pub created_at: u64,
    #[serde(rename = "updatedAt")]
    pub updated_at: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum PageKind {
    Folder,
    Page,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Page {
    pub id: u64,
    #[serde(rename = "projectId")]
    pub project_id: u64,
    #[serde(rename = "parentId", default)]
    pub parent_id: u64,
    pub title: String,
    pub kind: PageKind,
    #[serde(default)]
    pub content: String,
    #[serde(default)]
    pub sort: i32,
    #[serde(rename = "createdAt")]
    pub created_at: u64,
    #[serde(rename = "updatedAt")]
    pub updated_at: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct ShareLink {
    token: String,
    #[serde(rename = "userId")]
    user_id: u64,
    #[serde(rename = "pageId")]
    page_id: u64,
    /// Unix seconds; None / missing = never expire
    #[serde(rename = "expiresAt")]
    expires_at: Option<u64>,
    #[serde(rename = "createdAt")]
    created_at: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct ShareInfo {
    token: String,
    #[serde(rename = "pageId")]
    page_id: u64,
    title: String,
    #[serde(rename = "expiresAt")]
    expires_at: Option<u64>,
    #[serde(rename = "expiresIn")]
    expires_in: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct ExportPage {
    #[serde(rename = "clientId")]
    client_id: String,
    #[serde(rename = "parentClientId")]
    parent_client_id: Option<String>,
    title: String,
    kind: PageKind,
    #[serde(default)]
    content: String,
    #[serde(default)]
    sort: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct ExportProjectMeta {
    #[serde(rename = "clientId", default)]
    client_id: String,
    name: String,
    #[serde(default)]
    desc: String,
    #[serde(default)]
    pages: Vec<ExportPage>,
}

/// v1: 单项目；v2: 全量备份
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExportBundle {
    format: String,
    #[serde(rename = "exportedAt")]
    exported_at: u64,
    /// v1 单项目
    #[serde(default, skip_serializing_if = "Option::is_none")]
    project: Option<ExportProjectMeta>,
    /// v1 单项目页面（兼容旧字段）
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pages: Vec<ExportPage>,
    /// v2 多项目
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    projects: Vec<ExportProjectMeta>,
}

#[derive(Debug, Serialize)]
struct NotesApiBody {
    ok: bool,
    message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    projects: Option<Vec<Project>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    project: Option<Project>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pages: Option<Vec<Page>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    page: Option<Page>,
    #[serde(skip_serializing_if = "Option::is_none")]
    share: Option<ShareInfo>,
    #[serde(skip_serializing_if = "Option::is_none")]
    export: Option<ExportBundle>,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(rename = "importedCount")]
    imported_count: Option<usize>,
    #[serde(skip_serializing_if = "Option::is_none")]
    settings: Option<NotesUserSettings>,
}

#[derive(Debug, Deserialize)]
struct ProjectBody {
    name: String,
    #[serde(default)]
    desc: String,
}

#[derive(Debug, Deserialize)]
struct PageBody {
    #[serde(rename = "projectId")]
    project_id: u64,
    #[serde(rename = "parentId", default)]
    parent_id: u64,
    title: String,
    #[serde(default = "default_page_kind")]
    kind: PageKind,
    #[serde(default)]
    content: String,
    #[serde(default)]
    sort: i32,
}

fn default_page_kind() -> PageKind {
    PageKind::Page
}

#[derive(Debug, Deserialize)]
struct PageUpdateBody {
    title: Option<String>,
    content: Option<String>,
    #[serde(rename = "parentId")]
    parent_id: Option<u64>,
    sort: Option<i32>,
}

#[derive(Debug, Deserialize)]
struct ShareCreateBody {
    /// 1h | 24h | 7d | 30d | forever
    #[serde(rename = "expiresIn", default = "default_expires_in")]
    expires_in: String,
}

fn default_expires_in() -> String {
    "7d".into()
}

type NotesResponse = (StatusCode, Json<NotesApiBody>);

fn now_ts() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or(0)
}

fn store_path() -> String {
    env::var("NOTES_STORE_FILE").unwrap_or_else(|_| NOTES_STORE_FILE.into())
}

fn save_store(store: &NotesStore) {
    // 紧凑 JSON，大数据量时比 pretty 快一个数量级
    if let Ok(bytes) = serde_json::to_vec(store) {
        let _ = fs::write(store_path(), bytes);
    }
}

fn load_store() -> NotesStore {
    let path = store_path();
    if let Ok(content) = fs::read_to_string(&path) {
        if let Ok(store) = serde_json::from_str(&content) {
            return store;
        }
    }
    NotesStore::default()
}

fn seed_user_data() -> UserNotesData {
    let ts = now_ts();
    let project = Project {
        id: 1,
        name: "我的笔记".into(),
        desc: "默认项目".into(),
        created_at: ts,
        updated_at: ts,
    };
    let page = Page {
        id: 1,
        project_id: 1,
        parent_id: 0,
        title: "欢迎使用".into(),
        kind: PageKind::Page,
        content: "# 欢迎使用笔记\n\n支持 **Markdown** 编写，左侧可新建目录与页面。\n\n## 功能\n\n- 项目与目录树\n- Markdown 实时预览\n- 文件管理（Excel / Word 等）\n".into(),
        sort: 0,
        created_at: ts,
        updated_at: ts,
    };
    UserNotesData {
        projects: vec![project],
        pages: vec![page],
        next_project_id: 2,
        next_page_id: 2,
        settings: NotesUserSettings::default(),
    }
}

fn ensure_user(store: &mut NotesStore, user_id: u64) -> &mut UserNotesData {
    let key = user_id.to_string();
    let needs_seed = store
        .users
        .get(&key)
        .map(|u| u.projects.is_empty())
        .unwrap_or(true);
    if needs_seed {
        store.users.insert(key.clone(), seed_user_data());
        save_store(store);
    }
    store.users.get_mut(&key).unwrap()
}

fn empty_body() -> NotesApiBody {
    NotesApiBody {
        ok: false,
        message: String::new(),
        projects: None,
        project: None,
        pages: None,
        page: None,
        share: None,
        export: None,
        imported_count: None,
        settings: None,
    }
}

fn ok_projects(msg: &str, projects: Vec<Project>) -> NotesResponse {
    (
        StatusCode::OK,
        Json(NotesApiBody {
            ok: true,
            message: msg.into(),
            projects: Some(projects),
            ..empty_body()
        }),
    )
}

fn ok_project(msg: &str, project: Project) -> NotesResponse {
    (
        StatusCode::OK,
        Json(NotesApiBody {
            ok: true,
            message: msg.into(),
            project: Some(project),
            ..empty_body()
        }),
    )
}

fn ok_pages(msg: &str, pages: Vec<Page>) -> NotesResponse {
    (
        StatusCode::OK,
        Json(NotesApiBody {
            ok: true,
            message: msg.into(),
            pages: Some(pages),
            ..empty_body()
        }),
    )
}

fn ok_page(msg: &str, page: Page) -> NotesResponse {
    (
        StatusCode::OK,
        Json(NotesApiBody {
            ok: true,
            message: msg.into(),
            page: Some(page),
            ..empty_body()
        }),
    )
}

fn ok_share(msg: &str, share: ShareInfo) -> NotesResponse {
    (
        StatusCode::OK,
        Json(NotesApiBody {
            ok: true,
            message: msg.into(),
            share: Some(share),
            ..empty_body()
        }),
    )
}

fn ok_export(msg: &str, export: ExportBundle) -> NotesResponse {
    (
        StatusCode::OK,
        Json(NotesApiBody {
            ok: true,
            message: msg.into(),
            export: Some(export),
            ..empty_body()
        }),
    )
}

fn err(msg: &str, status: StatusCode) -> NotesResponse {
    (
        status,
        Json(NotesApiBody {
            ok: false,
            message: msg.into(),
            ..empty_body()
        }),
    )
}

fn require_user(state: &NotesState, headers: &HeaderMap) -> Result<u64, NotesResponse> {
    user_id_from_session(&state.auth, headers)
        .ok_or_else(|| err("请先登录", StatusCode::UNAUTHORIZED))
}

fn make_share_token() -> String {
    let nanos = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_nanos())
        .unwrap_or(0);
    format!("n{:x}", nanos)
}

fn parse_expires_in(raw: &str) -> Result<(String, Option<u64>), &'static str> {
    let key = raw.trim().to_lowercase();
    let secs: Option<u64> = match key.as_str() {
        "1h" | "1hour" => Some(3600),
        "24h" | "1d" | "day" => Some(86400),
        "7d" | "week" => Some(7 * 86400),
        "30d" | "month" => Some(30 * 86400),
        "forever" | "0" | "never" => None,
        _ => return Err("无效的时效选项"),
    };
    let expires_at = secs.map(|s| now_ts().saturating_add(s));
    let label = match key.as_str() {
        "1h" | "1hour" => "1h",
        "24h" | "1d" | "day" => "24h",
        "7d" | "week" => "7d",
        "30d" | "month" => "30d",
        _ => "forever",
    }
    .to_string();
    Ok((label, expires_at))
}

fn collect_descendants(pages: &[Page], root: u64) -> Vec<u64> {
    let mut ids = vec![root];
    let mut queue = vec![root];
    while let Some(pid) = queue.pop() {
        for p in pages {
            if p.parent_id == pid && !ids.contains(&p.id) {
                ids.push(p.id);
                queue.push(p.id);
            }
        }
    }
    ids
}

fn purge_shares_for_pages(store: &mut NotesStore, page_ids: &[u64]) {
    store
        .shares
        .retain(|_, s| !page_ids.contains(&s.page_id));
}

pub fn init_state(auth: AuthState) -> NotesState {
    NotesState {
        inner: Arc::new(RwLock::new(load_store())),
        auth,
    }
}

pub fn router(state: NotesState) -> Router {
    Router::new()
        .route("/projects", get(list_projects).post(create_project))
        .route(
            "/projects/:id",
            put(update_project).delete(delete_project),
        )
        .route("/projects/:id/pages", get(list_pages))
        .route("/projects/:id/export", get(export_project))
        .route("/export", get(export_all))
        .route("/import", post(import_notes))
        .route("/settings", get(get_settings).put(put_settings))
        .route("/pages", post(create_page))
        .route(
            "/pages/:id",
            get(get_page).put(update_page).delete(delete_page),
        )
        .route("/pages/:id/shares", post(create_share))
        .route("/shares/:token", get(get_shared_page).delete(revoke_share))
        .with_state(state)
}

impl NotesState {
    pub fn deepseek_api_key_for(&self, user_id: u64) -> String {
        let mut store = self.inner.write().unwrap();
        let data = ensure_user(&mut store, user_id);
        data.settings.deepseek_api_key.trim().to_string()
    }
}

#[derive(Debug, Deserialize)]
struct SettingsBody {
    #[serde(default, rename = "deepseekApiKey")]
    deepseek_api_key: Option<String>,
}

async fn get_settings(State(state): State<NotesState>, headers: HeaderMap) -> NotesResponse {
    let user_id = match require_user(&state, &headers) {
        Ok(id) => id,
        Err(r) => return r,
    };
    let mut store = state.inner.write().unwrap();
    let data = ensure_user(&mut store, user_id);
    (
        StatusCode::OK,
        Json(NotesApiBody {
            ok: true,
            message: "ok".into(),
            settings: Some(data.settings.clone()),
            ..empty_body()
        }),
    )
}

async fn put_settings(
    State(state): State<NotesState>,
    headers: HeaderMap,
    Json(body): Json<SettingsBody>,
) -> NotesResponse {
    let user_id = match require_user(&state, &headers) {
        Ok(id) => id,
        Err(r) => return r,
    };
    let mut store = state.inner.write().unwrap();
    let data = ensure_user(&mut store, user_id);
    if let Some(key) = body.deepseek_api_key {
        data.settings.deepseek_api_key = key.trim().to_string();
    }
    let settings = data.settings.clone();
    save_store(&store);
    (
        StatusCode::OK,
        Json(NotesApiBody {
            ok: true,
            message: "设置已保存".into(),
            settings: Some(settings),
            ..empty_body()
        }),
    )
}

async fn list_projects(State(state): State<NotesState>, headers: HeaderMap) -> NotesResponse {
    let user_id = match require_user(&state, &headers) {
        Ok(id) => id,
        Err(r) => return r,
    };
    let mut store = state.inner.write().unwrap();
    let data = ensure_user(&mut store, user_id);
    let projects = data.projects.clone();
    ok_projects("ok", projects)
}

async fn create_project(
    State(state): State<NotesState>,
    headers: HeaderMap,
    Json(body): Json<ProjectBody>,
) -> NotesResponse {
    let user_id = match require_user(&state, &headers) {
        Ok(id) => id,
        Err(r) => return r,
    };
    let name = body.name.trim();
    if name.is_empty() {
        return err("请填写项目名称", StatusCode::BAD_REQUEST);
    }
    let ts = now_ts();
    let mut store = state.inner.write().unwrap();
    let data = ensure_user(&mut store, user_id);
    let id = data.next_project_id;
    data.next_project_id += 1;
    let project = Project {
        id,
        name: name.to_string(),
        desc: body.desc.trim().to_string(),
        created_at: ts,
        updated_at: ts,
    };
    data.projects.push(project.clone());
    save_store(&store);
    ok_project("项目已创建", project)
}

async fn update_project(
    State(state): State<NotesState>,
    headers: HeaderMap,
    Path(id): Path<u64>,
    Json(body): Json<ProjectBody>,
) -> NotesResponse {
    let user_id = match require_user(&state, &headers) {
        Ok(id) => id,
        Err(r) => return r,
    };
    let name = body.name.trim();
    if name.is_empty() {
        return err("请填写项目名称", StatusCode::BAD_REQUEST);
    }
    let mut store = state.inner.write().unwrap();
    let data = ensure_user(&mut store, user_id);
    let Some(project) = data.projects.iter_mut().find(|p| p.id == id) else {
        return err("项目不存在", StatusCode::NOT_FOUND);
    };
    project.name = name.to_string();
    project.desc = body.desc.trim().to_string();
    project.updated_at = now_ts();
    let cloned = project.clone();
    save_store(&store);
    ok_project("已更新", cloned)
}

async fn delete_project(
    State(state): State<NotesState>,
    headers: HeaderMap,
    Path(id): Path<u64>,
) -> NotesResponse {
    let user_id = match require_user(&state, &headers) {
        Ok(id) => id,
        Err(r) => return r,
    };
    let mut store = state.inner.write().unwrap();
    let (projects, removed_pages) = {
        let data = ensure_user(&mut store, user_id);
        let before = data.projects.len();
        data.projects.retain(|p| p.id != id);
        if data.projects.len() == before {
            return err("项目不存在", StatusCode::NOT_FOUND);
        }
        let removed_pages: Vec<u64> = data
            .pages
            .iter()
            .filter(|p| p.project_id == id)
            .map(|p| p.id)
            .collect();
        data.pages.retain(|p| p.project_id != id);
        (data.projects.clone(), removed_pages)
    };
    purge_shares_for_pages(&mut store, &removed_pages);
    save_store(&store);
    ok_projects("项目已删除", projects)
}

async fn list_pages(
    State(state): State<NotesState>,
    headers: HeaderMap,
    Path(project_id): Path<u64>,
) -> NotesResponse {
    let user_id = match require_user(&state, &headers) {
        Ok(id) => id,
        Err(r) => return r,
    };
    let mut store = state.inner.write().unwrap();
    let data = ensure_user(&mut store, user_id);
    let pages: Vec<Page> = data
        .pages
        .iter()
        .filter(|p| p.project_id == project_id)
        .cloned()
        .collect();
    ok_pages("ok", pages)
}

async fn create_page(
    State(state): State<NotesState>,
    headers: HeaderMap,
    Json(body): Json<PageBody>,
) -> NotesResponse {
    let user_id = match require_user(&state, &headers) {
        Ok(id) => id,
        Err(r) => return r,
    };
    let title = body.title.trim();
    if title.is_empty() {
        return err("请填写标题", StatusCode::BAD_REQUEST);
    }
    let mut store = state.inner.write().unwrap();
    let data = ensure_user(&mut store, user_id);
    if !data.projects.iter().any(|p| p.id == body.project_id) {
        return err("项目不存在", StatusCode::NOT_FOUND);
    }
    let ts = now_ts();
    let id = data.next_page_id;
    data.next_page_id += 1;
    let page = Page {
        id,
        project_id: body.project_id,
        parent_id: body.parent_id,
        title: title.to_string(),
        kind: body.kind,
        content: body.content,
        sort: body.sort,
        created_at: ts,
        updated_at: ts,
    };
    data.pages.push(page.clone());
    save_store(&store);
    ok_page("已创建", page)
}

async fn get_page(
    State(state): State<NotesState>,
    headers: HeaderMap,
    Path(id): Path<u64>,
) -> NotesResponse {
    let user_id = match require_user(&state, &headers) {
        Ok(id) => id,
        Err(r) => return r,
    };
    let mut store = state.inner.write().unwrap();
    let data = ensure_user(&mut store, user_id);
    let Some(page) = data.pages.iter().find(|p| p.id == id).cloned() else {
        return err("页面不存在", StatusCode::NOT_FOUND);
    };
    ok_page("ok", page)
}

async fn update_page(
    State(state): State<NotesState>,
    headers: HeaderMap,
    Path(id): Path<u64>,
    Json(body): Json<PageUpdateBody>,
) -> NotesResponse {
    let user_id = match require_user(&state, &headers) {
        Ok(id) => id,
        Err(r) => return r,
    };
    let mut store = state.inner.write().unwrap();
    let data = ensure_user(&mut store, user_id);
    let Some(page) = data.pages.iter_mut().find(|p| p.id == id) else {
        return err("页面不存在", StatusCode::NOT_FOUND);
    };
    if let Some(t) = body.title {
        let t = t.trim();
        if !t.is_empty() {
            page.title = t.to_string();
        }
    }
    if let Some(c) = body.content {
        page.content = c;
    }
    if let Some(pid) = body.parent_id {
        page.parent_id = pid;
    }
    if let Some(s) = body.sort {
        page.sort = s;
    }
    page.updated_at = now_ts();
    let cloned = page.clone();
    save_store(&store);
    ok_page("已保存", cloned)
}

async fn delete_page(
    State(state): State<NotesState>,
    headers: HeaderMap,
    Path(id): Path<u64>,
) -> NotesResponse {
    let user_id = match require_user(&state, &headers) {
        Ok(id) => id,
        Err(r) => return r,
    };
    let mut store = state.inner.write().unwrap();
    let (pages, remove_ids) = {
        let data = ensure_user(&mut store, user_id);
        if !data.pages.iter().any(|p| p.id == id) {
            return err("页面不存在", StatusCode::NOT_FOUND);
        }
        let remove_ids = collect_descendants(&data.pages, id);
        data.pages.retain(|p| !remove_ids.contains(&p.id));
        (data.pages.clone(), remove_ids)
    };
    purge_shares_for_pages(&mut store, &remove_ids);
    save_store(&store);
    ok_pages("已删除", pages)
}

async fn create_share(
    State(state): State<NotesState>,
    headers: HeaderMap,
    Path(id): Path<u64>,
    Json(body): Json<ShareCreateBody>,
) -> NotesResponse {
    let user_id = match require_user(&state, &headers) {
        Ok(id) => id,
        Err(r) => return r,
    };
    let (expires_in, expires_at) = match parse_expires_in(&body.expires_in) {
        Ok(v) => v,
        Err(msg) => return err(msg, StatusCode::BAD_REQUEST),
    };

    let mut store = state.inner.write().unwrap();
    let page = {
        let data = ensure_user(&mut store, user_id);
        let Some(page) = data.pages.iter().find(|p| p.id == id).cloned() else {
            return err("页面不存在", StatusCode::NOT_FOUND);
        };
        if page.kind != PageKind::Page {
            return err("只能分享文档页面", StatusCode::BAD_REQUEST);
        }
        page
    };

    let token = make_share_token();
    let link = ShareLink {
        token: token.clone(),
        user_id,
        page_id: id,
        expires_at,
        created_at: now_ts(),
    };
    store.shares.insert(token.clone(), link);
    save_store(&store);

    ok_share(
        "分享链接已创建",
        ShareInfo {
            token,
            page_id: id,
            title: page.title,
            expires_at,
            expires_in,
        },
    )
}

async fn get_shared_page(
    State(state): State<NotesState>,
    Path(token): Path<String>,
) -> NotesResponse {
    let store = state.inner.read().unwrap();
    let Some(link) = store.shares.get(&token).cloned() else {
        return err("分享不存在或已失效", StatusCode::NOT_FOUND);
    };
    if let Some(exp) = link.expires_at {
        if now_ts() > exp {
            return err("分享已过期", StatusCode::GONE);
        }
    }
    let Some(user) = store.users.get(&link.user_id.to_string()) else {
        return err("分享不存在或已失效", StatusCode::NOT_FOUND);
    };
    let Some(page) = user.pages.iter().find(|p| p.id == link.page_id).cloned() else {
        return err("分享的笔记已删除", StatusCode::NOT_FOUND);
    };
    if page.kind != PageKind::Page {
        return err("分享内容无效", StatusCode::BAD_REQUEST);
    }
    ok_page("ok", page)
}

async fn revoke_share(
    State(state): State<NotesState>,
    headers: HeaderMap,
    Path(token): Path<String>,
) -> NotesResponse {
    let user_id = match require_user(&state, &headers) {
        Ok(id) => id,
        Err(r) => return r,
    };
    let mut store = state.inner.write().unwrap();
    let Some(link) = store.shares.get(&token).cloned() else {
        return err("分享不存在", StatusCode::NOT_FOUND);
    };
    if link.user_id != user_id {
        return err("无权操作", StatusCode::FORBIDDEN);
    }
    store.shares.remove(&token);
    save_store(&store);
    (
        StatusCode::OK,
        Json(NotesApiBody {
            ok: true,
            message: "已取消分享".into(),
            ..empty_body()
        }),
    )
}

fn pages_to_export(pages: &[Page], project_id: u64) -> Vec<ExportPage> {
    let mut out: Vec<ExportPage> = pages
        .iter()
        .filter(|p| p.project_id == project_id)
        .map(|p| ExportPage {
            client_id: p.id.to_string(),
            parent_client_id: if p.parent_id == 0 {
                None
            } else {
                Some(p.parent_id.to_string())
            },
            title: p.title.clone(),
            kind: p.kind.clone(),
            content: p.content.clone(),
            sort: p.sort,
        })
        .collect();
    out.sort_by(|a, b| a.sort.cmp(&b.sort).then_with(|| a.client_id.cmp(&b.client_id)));
    out
}

/// O(n) 两遍映射：先分配 ID，再写入
fn import_pages_fast(
    data: &mut UserNotesData,
    project_id: u64,
    mut pages: Vec<ExportPage>,
    ts: u64,
) -> usize {
    if pages.is_empty() {
        return 0;
    }
    pages.sort_by(|a, b| a.sort.cmp(&b.sort));
    let mut id_map: HashMap<String, u64> = HashMap::with_capacity(pages.len());
    for item in &pages {
        let new_id = data.next_page_id;
        data.next_page_id += 1;
        id_map.insert(item.client_id.clone(), new_id);
    }
    data.pages.reserve(pages.len());
    let count = pages.len();
    for item in pages {
        let parent_id = item
            .parent_client_id
            .as_ref()
            .filter(|p| !p.is_empty() && p.as_str() != "0")
            .and_then(|p| id_map.get(p).copied())
            .unwrap_or(0);
        let id = id_map[&item.client_id];
        let title = item.title.trim();
        data.pages.push(Page {
            id,
            project_id,
            parent_id,
            title: if title.is_empty() {
                "未命名".into()
            } else {
                title.to_string()
            },
            kind: item.kind,
            content: item.content,
            sort: item.sort,
            created_at: ts,
            updated_at: ts,
        });
    }
    count
}

fn import_one_project(
    data: &mut UserNotesData,
    name: &str,
    desc: &str,
    pages: Vec<ExportPage>,
    ts: u64,
) -> (Project, usize) {
    let project_id = data.next_project_id;
    data.next_project_id += 1;
    let project = Project {
        id: project_id,
        name: name.to_string(),
        desc: desc.to_string(),
        created_at: ts,
        updated_at: ts,
    };
    data.projects.push(project.clone());
    let n = import_pages_fast(data, project_id, pages, ts);
    (project, n)
}

async fn export_project(
    State(state): State<NotesState>,
    headers: HeaderMap,
    Path(project_id): Path<u64>,
) -> NotesResponse {
    let user_id = match require_user(&state, &headers) {
        Ok(id) => id,
        Err(r) => return r,
    };
    let mut store = state.inner.write().unwrap();
    let data = ensure_user(&mut store, user_id);
    let Some(project) = data.projects.iter().find(|p| p.id == project_id).cloned() else {
        return err("项目不存在", StatusCode::NOT_FOUND);
    };
    let pages = pages_to_export(&data.pages, project_id);

    ok_export(
        "ok",
        ExportBundle {
            format: "doniai-notes-v1".into(),
            exported_at: now_ts(),
            project: Some(ExportProjectMeta {
                client_id: project.id.to_string(),
                name: project.name,
                desc: project.desc,
                pages: Vec::new(),
            }),
            pages,
            projects: Vec::new(),
        },
    )
}

async fn export_all(State(state): State<NotesState>, headers: HeaderMap) -> NotesResponse {
    let user_id = match require_user(&state, &headers) {
        Ok(id) => id,
        Err(r) => return r,
    };
    ok_export("ok", build_full_export_bundle(&state, user_id))
}

/// 供统一备份模块调用
pub fn build_full_export_bundle(state: &NotesState, user_id: u64) -> ExportBundle {
    let mut store = state.inner.write().unwrap();
    let data = ensure_user(&mut store, user_id);
    let mut projects = Vec::with_capacity(data.projects.len());
    for project in &data.projects {
        projects.push(ExportProjectMeta {
            client_id: project.id.to_string(),
            name: project.name.clone(),
            desc: project.desc.clone(),
            pages: pages_to_export(&data.pages, project.id),
        });
    }
    ExportBundle {
        format: "doniai-notes-v2".into(),
        exported_at: now_ts(),
        project: None,
        pages: Vec::new(),
        projects,
    }
}

pub fn export_user_settings(state: &NotesState, user_id: u64) -> NotesUserSettings {
    let mut store = state.inner.write().unwrap();
    let data = ensure_user(&mut store, user_id);
    data.settings.clone()
}

pub fn apply_user_settings(state: &NotesState, user_id: u64, settings: NotesUserSettings) {
    let mut store = state.inner.write().unwrap();
    let data = ensure_user(&mut store, user_id);
    data.settings = settings;
    save_store(&store);
}

/// 导入笔记备份，返回 (项目数, 页面数)
pub fn import_export_bundle(
    state: &NotesState,
    user_id: u64,
    body: ExportBundle,
) -> Result<(usize, usize), String> {
    let format = body.format.trim();
    let mut store = state.inner.write().unwrap();
    let data = ensure_user(&mut store, user_id);
    let ts = now_ts();

    let mut project_count = 0usize;
    let mut page_count = 0usize;

    match format {
        "doniai-notes-v2" => {
            if body.projects.is_empty() {
                return Err("备份中没有项目".into());
            }
            for proj in body.projects {
                let name = proj.name.trim();
                if name.is_empty() {
                    continue;
                }
                let (_project, n) =
                    import_one_project(data, name, proj.desc.trim(), proj.pages, ts);
                project_count += 1;
                page_count += n;
            }
            if project_count == 0 {
                return Err("没有可导入的有效项目".into());
            }
        }
        "doniai-notes-v1" | "" => {
            if let Some(p) = body.project {
                let pages = if !body.pages.is_empty() {
                    body.pages
                } else {
                    p.pages
                };
                let name = p.name.trim();
                if name.is_empty() {
                    return Err("项目名称不能为空".into());
                }
                let (_project, n) = import_one_project(data, name, p.desc.trim(), pages, ts);
                project_count = 1;
                page_count = n;
            } else if !body.projects.is_empty() {
                for proj in body.projects {
                    let name = proj.name.trim();
                    if name.is_empty() {
                        continue;
                    }
                    let (_project, n) =
                        import_one_project(data, name, proj.desc.trim(), proj.pages, ts);
                    project_count += 1;
                    page_count += n;
                }
                if project_count == 0 {
                    return Err("没有可导入的有效项目".into());
                }
            } else {
                return Err("不是有效的笔记备份".into());
            }
        }
        _ => return Err("不支持的导入格式".into()),
    }

    save_store(&store);
    Ok((project_count, page_count))
}

async fn import_notes(
    State(state): State<NotesState>,
    headers: HeaderMap,
    Json(body): Json<ExportBundle>,
) -> NotesResponse {
    let user_id = match require_user(&state, &headers) {
        Ok(id) => id,
        Err(r) => return r,
    };

    match import_export_bundle(&state, user_id, body) {
        Ok((project_count, page_count)) => (
            StatusCode::OK,
            Json(NotesApiBody {
                ok: true,
                message: if project_count > 1 {
                    format!("成功导入 {} 个项目 / {} 篇笔记", project_count, page_count)
                } else {
                    format!("导入成功（{} 篇笔记）", page_count)
                },
                imported_count: Some(page_count),
                ..empty_body()
            }),
        ),
        Err(m) => err(&m, StatusCode::BAD_REQUEST),
    }
}
