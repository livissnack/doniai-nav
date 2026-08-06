use crate::auth::{user_id_from_session, AuthState};
use axum::{
    extract::{Path, State},
    http::{HeaderMap, StatusCode},
    routing::{get, post, put},
    Json, Router,
};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::{
    env,
    fs,
    sync::{Arc, RwLock},
    time::{Duration, Instant, SystemTime, UNIX_EPOCH},
};

const MONITOR_FILE: &str = "monitor_store.json";
const MAX_CHECKS: usize = 90;

#[derive(Clone)]
pub struct MonitorState {
    inner: Arc<RwLock<MonitorStore>>,
    auth: AuthState,
    client: Client,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
struct MonitorStore {
    sites: Vec<MonitorSite>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct MonitorSite {
    id: String,
    #[serde(rename = "userId")]
    user_id: u64,
    name: String,
    url: String,
    method: String,
    #[serde(rename = "intervalSec")]
    interval_sec: u64,
    enabled: bool,
    checks: Vec<CheckRecord>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct CheckRecord {
    at: i64,
    up: bool,
    #[serde(rename = "statusCode")]
    status_code: Option<u16>,
    ms: u32,
    #[serde(skip_serializing_if = "Option::is_none")]
    error: Option<String>,
}

#[derive(Debug, Serialize)]
struct MonitorApiBody {
    ok: bool,
    message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    sites: Option<Vec<SitePublic>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    site: Option<SitePublic>,
}

#[derive(Debug, Serialize)]
struct SitePublic {
    id: String,
    name: String,
    url: String,
    method: String,
    #[serde(rename = "intervalSec")]
    interval_sec: u64,
    enabled: bool,
    status: String,
    #[serde(rename = "statusCode")]
    status_code: Option<u16>,
    #[serde(rename = "responseMs")]
    response_ms: Option<u32>,
    #[serde(rename = "uptimePercent")]
    uptime_percent: f64,
    #[serde(rename = "lastCheckAt")]
    last_check_at: Option<i64>,
    #[serde(rename = "lastError")]
    last_error: Option<String>,
    history: Vec<HistoryBar>,
}

#[derive(Debug, Serialize)]
struct HistoryBar {
    up: bool,
    ms: u32,
}

#[derive(Debug, Deserialize)]
struct SiteBody {
    name: String,
    url: String,
    #[serde(default = "default_method")]
    method: String,
    #[serde(rename = "intervalSec", default = "default_interval")]
    interval_sec: u64,
    #[serde(default = "default_true")]
    enabled: bool,
}

fn default_method() -> String {
    "GET".into()
}

fn default_interval() -> u64 {
    300
}

fn default_true() -> bool {
    true
}

type MonitorResponse = (StatusCode, Json<MonitorApiBody>);

fn now_secs() -> i64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_secs() as i64)
        .unwrap_or(0)
}

fn store_path() -> String {
    env::var("MONITOR_STORE_FILE").unwrap_or_else(|_| MONITOR_FILE.into())
}

fn save_store(store: &MonitorStore) {
    if let Ok(json) = serde_json::to_string_pretty(store) {
        let _ = fs::write(store_path(), json);
    }
}

fn migrate_store(mut store: MonitorStore) -> MonitorStore {
    let mut changed = false;
    for site in store.sites.iter_mut() {
        if site.user_id == 0 {
            site.user_id = 1;
            changed = true;
        }
    }
    if changed {
        save_store(&store);
    }
    store
}

fn load_store() -> MonitorStore {
    let path = store_path();
    if let Ok(content) = fs::read_to_string(&path) {
        if let Ok(store) = serde_json::from_str(&content) {
            return migrate_store(store);
        }
    }
    MonitorStore::default()
}

fn sites_for_user(store: &MonitorStore, user_id: u64) -> Vec<SitePublic> {
    store
        .sites
        .iter()
        .filter(|s| s.user_id == user_id)
        .map(site_to_public)
        .collect()
}

fn require_user(state: &MonitorState, headers: &HeaderMap) -> Result<u64, MonitorResponse> {
    user_id_from_session(&state.auth, headers)
        .ok_or_else(|| err("请先登录", StatusCode::UNAUTHORIZED))
}

pub fn init_state(auth: AuthState) -> MonitorState {
    let client = Client::builder()
        .timeout(Duration::from_secs(20))
        .redirect(reqwest::redirect::Policy::limited(5))
        .user_agent("DoniaiNav-Monitor/1.0")
        .build()
        .unwrap_or_else(|_| Client::new());

    MonitorState {
        inner: Arc::new(RwLock::new(load_store())),
        auth,
        client,
    }
}

fn ok_sites(message: &str, sites: Vec<SitePublic>) -> MonitorResponse {
    (
        StatusCode::OK,
        Json(MonitorApiBody {
            ok: true,
            message: message.into(),
            sites: Some(sites),
            site: None,
        }),
    )
}

fn ok_site(message: &str, site: SitePublic) -> MonitorResponse {
    (
        StatusCode::OK,
        Json(MonitorApiBody {
            ok: true,
            message: message.into(),
            sites: None,
            site: Some(site),
        }),
    )
}

fn err(message: &str, status: StatusCode) -> MonitorResponse {
    (
        status,
        Json(MonitorApiBody {
            ok: false,
            message: message.into(),
            sites: None,
            site: None,
        }),
    )
}

fn normalize_url(raw: &str) -> Option<String> {
    let url = raw.trim();
    if url.starts_with("http://") || url.starts_with("https://") {
        Some(url.to_string())
    } else {
        None
    }
}

fn calc_uptime(checks: &[CheckRecord]) -> f64 {
    if checks.is_empty() {
        return 100.0;
    }
    let up = checks.iter().filter(|c| c.up).count();
    (up as f64 / checks.len() as f64) * 100.0
}

fn site_to_public(site: &MonitorSite) -> SitePublic {
    let last = site.checks.last();
    let status = if !site.enabled {
        "paused".into()
    } else if last.map(|c| c.up).unwrap_or(false) {
        "up".into()
    } else if last.is_some() {
        "down".into()
    } else {
        "pending".into()
    };

    SitePublic {
        id: site.id.clone(),
        name: site.name.clone(),
        url: site.url.clone(),
        method: site.method.clone(),
        interval_sec: site.interval_sec,
        enabled: site.enabled,
        status,
        status_code: last.and_then(|c| c.status_code),
        response_ms: last.map(|c| c.ms),
        uptime_percent: (calc_uptime(&site.checks) * 10.0).round() / 10.0,
        last_check_at: last.map(|c| c.at),
        last_error: last.and_then(|c| c.error.clone()),
        history: site
            .checks
            .iter()
            .map(|c| HistoryBar { up: c.up, ms: c.ms })
            .collect(),
    }
}

async fn probe(client: &Client, url: &str, method: &str) -> CheckRecord {
    let started = Instant::now();
    let req = match method.to_uppercase().as_str() {
        "HEAD" => client.head(url),
        _ => client.get(url),
    };

    match req.send().await {
        Ok(resp) => {
            let code = resp.status().as_u16();
            let up = (200..400).contains(&code);
            CheckRecord {
                at: now_secs(),
                up,
                status_code: Some(code),
                ms: started.elapsed().as_millis().min(u128::from(u32::MAX)) as u32,
                error: None,
            }
        }
        Err(e) => CheckRecord {
            at: now_secs(),
            up: false,
            status_code: None,
            ms: started.elapsed().as_millis().min(u128::from(u32::MAX)) as u32,
            error: Some(e.to_string()),
        },
    }
}

fn push_check(site: &mut MonitorSite, record: CheckRecord) {
    site.checks.push(record);
    if site.checks.len() > MAX_CHECKS {
        let drain = site.checks.len() - MAX_CHECKS;
        site.checks.drain(0..drain);
    }
}

pub async fn check_site(state: &MonitorState, site_id: &str) -> bool {
    let target = {
        let store = state.inner.read().unwrap();
        let Some(site) = store.sites.iter().find(|s| s.id == site_id) else {
            return false;
        };
        if !site.enabled {
            return false;
        }
        (site.url.clone(), site.method.clone())
    };

    let record = probe(&state.client, &target.0, &target.1).await;

    let mut store = state.inner.write().unwrap();
    let Some(site) = store.sites.iter_mut().find(|s| s.id == site_id) else {
        return false;
    };
    push_check(site, record);
    save_store(&store);
    true
}

pub async fn run_scheduled_checks(state: MonitorState) {
    let due: Vec<String> = {
        let store = state.inner.read().unwrap();
        let now = now_secs();
        store
            .sites
            .iter()
            .filter(|s| {
                if !s.enabled {
                    return false;
                }
                let last = s.checks.last().map(|c| c.at).unwrap_or(0);
                now - last >= s.interval_sec as i64
            })
            .map(|s| s.id.clone())
            .collect()
    };

    for id in due {
        check_site(&state, &id).await;
    }
}

pub fn spawn_checker(state: MonitorState) {
    tokio::spawn(async move {
        loop {
            run_scheduled_checks(state.clone()).await;
            tokio::time::sleep(Duration::from_secs(30)).await;
        }
    });
}

pub fn router(state: MonitorState) -> Router {
    Router::new()
        .route(
            "/sites",
            get(list_public_sites).post(create_site),
        )
        .route("/sites/manage", get(list_manage_sites))
        .route("/sites/:id", put(update_site).delete(delete_site))
        .route("/sites/:id/check", post(check_one_site))
        .route("/check-all", post(check_all_sites))
        .with_state(state)
}

async fn list_public_sites(
    State(state): State<MonitorState>,
    headers: HeaderMap,
) -> MonitorResponse {
    let user_id = match require_user(&state, &headers) {
        Ok(id) => id,
        Err(r) => return r,
    };
    let store = state.inner.read().unwrap();
    ok_sites("ok", sites_for_user(&store, user_id))
}

async fn list_manage_sites(
    State(state): State<MonitorState>,
    headers: HeaderMap,
) -> MonitorResponse {
    let user_id = match require_user(&state, &headers) {
        Ok(id) => id,
        Err(r) => return r,
    };
    let store = state.inner.read().unwrap();
    ok_sites("ok", sites_for_user(&store, user_id))
}

async fn create_site(
    State(state): State<MonitorState>,
    headers: HeaderMap,
    Json(body): Json<SiteBody>,
) -> MonitorResponse {
    let user_id = match require_user(&state, &headers) {
        Ok(id) => id,
        Err(r) => return r,
    };

    let name = body.name.trim();
    if name.is_empty() {
        return err("请填写站点名称", StatusCode::BAD_REQUEST);
    }
    let Some(url) = normalize_url(&body.url) else {
        return err("URL 需以 http:// 或 https:// 开头", StatusCode::BAD_REQUEST);
    };
    let method = if body.method.eq_ignore_ascii_case("HEAD") {
        "HEAD".to_string()
    } else {
        "GET".to_string()
    };
    let interval_sec = body.interval_sec.clamp(60, 3600);

    let id = format!("{}_{}", user_id, now_secs());
    let site = MonitorSite {
        id: id.clone(),
        user_id,
        name: name.to_string(),
        url,
        method,
        interval_sec,
        enabled: body.enabled,
        checks: vec![],
    };

    let mut store = state.inner.write().unwrap();
    store.sites.push(site.clone());
    save_store(&store);
    let public = site_to_public(&site);

    let state_clone = state.clone();
    tokio::spawn(async move {
        check_site(&state_clone, &id).await;
    });

    ok_site("已添加", public)
}

async fn update_site(
    State(state): State<MonitorState>,
    headers: HeaderMap,
    Path(id): Path<String>,
    Json(body): Json<SiteBody>,
) -> MonitorResponse {
    let user_id = match require_user(&state, &headers) {
        Ok(id) => id,
        Err(r) => return r,
    };

    let name = body.name.trim();
    if name.is_empty() {
        return err("请填写站点名称", StatusCode::BAD_REQUEST);
    }
    let Some(url) = normalize_url(&body.url) else {
        return err("URL 需以 http:// 或 https:// 开头", StatusCode::BAD_REQUEST);
    };
    let method = if body.method.eq_ignore_ascii_case("HEAD") {
        "HEAD".to_string()
    } else {
        "GET".to_string()
    };
    let interval_sec = body.interval_sec.clamp(60, 3600);

    let mut store = state.inner.write().unwrap();
    let Some(site) = store.sites.iter_mut().find(|s| s.id == id && s.user_id == user_id) else {
        return err("站点不存在", StatusCode::NOT_FOUND);
    };
    site.name = name.to_string();
    site.url = url;
    site.method = method;
    site.interval_sec = interval_sec;
    site.enabled = body.enabled;
    let public = site_to_public(site);
    save_store(&store);
    ok_site("已更新", public)
}

async fn delete_site(
    State(state): State<MonitorState>,
    headers: HeaderMap,
    Path(id): Path<String>,
) -> MonitorResponse {
    let user_id = match require_user(&state, &headers) {
        Ok(id) => id,
        Err(r) => return r,
    };

    let mut store = state.inner.write().unwrap();
    let before = store.sites.len();
    store.sites.retain(|s| !(s.id == id && s.user_id == user_id));
    if store.sites.len() == before {
        return err("站点不存在", StatusCode::NOT_FOUND);
    }
    save_store(&store);
    ok_sites("已删除", vec![])
}

async fn check_one_site(
    State(state): State<MonitorState>,
    headers: HeaderMap,
    Path(id): Path<String>,
) -> MonitorResponse {
    let user_id = match require_user(&state, &headers) {
        Ok(id) => id,
        Err(r) => return r,
    };
    {
        let store = state.inner.read().unwrap();
        let owned = store
            .sites
            .iter()
            .any(|s| s.id == id && s.user_id == user_id);
        if !owned {
            return err("站点不存在", StatusCode::NOT_FOUND);
        }
    }
    if !check_site(&state, &id).await {
        return err("站点不存在或未启用", StatusCode::NOT_FOUND);
    }
    let store = state.inner.read().unwrap();
    let Some(site) = store.sites.iter().find(|s| s.id == id && s.user_id == user_id) else {
        return err("站点不存在", StatusCode::NOT_FOUND);
    };
    ok_site("检测完成", site_to_public(site))
}

async fn check_all_sites(
    State(state): State<MonitorState>,
    headers: HeaderMap,
) -> MonitorResponse {
    let user_id = match require_user(&state, &headers) {
        Ok(id) => id,
        Err(r) => return r,
    };
    let ids: Vec<String> = {
        let store = state.inner.read().unwrap();
        store
            .sites
            .iter()
            .filter(|s| s.user_id == user_id && s.enabled)
            .map(|s| s.id.clone())
            .collect()
    };
    for id in ids {
        check_site(&state, &id).await;
    }
    list_public_sites(State(state), headers).await
}
