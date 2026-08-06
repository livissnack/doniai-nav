mod models;
mod fetcher;
mod hotel;
mod converter;
mod auth;
mod captcha;
mod monitor;
mod docker_probe;
mod private_nav;
mod notes;
mod files;
mod files_ops;
mod ai;
mod backup;
mod subscribe;

use models::AggregatedData;
use fetcher::do_fetch_all;

use axum::{
    extract::{Query, Request},
    middleware::{self, Next},
    response::{Response, IntoResponse},
    routing::{get, post},
    http::{HeaderValue, Method, StatusCode, header},
    Json, Router,
};
use tower_http::compression::CompressionLayer;
use tower_http::cors::{AllowOrigin, CorsLayer};
use once_cell::sync::Lazy;
use std::sync::{Arc, RwLock};
use tokio::fs;
use tokio_cron_scheduler::{Job, JobScheduler};
use std::env;
use serde::Deserialize;

static GLOBAL_CACHE: Lazy<Arc<RwLock<Option<AggregatedData>>>> =
    Lazy::new(|| Arc::new(RwLock::new(None)));

const CACHE_FILE: &str = "data_cache.json";

#[derive(Deserialize)]
struct FilterQuery {
    #[serde(rename = "type")]
    data_type: Option<String>,
}

// 认证中间件（OPTIONS 预检由外层 CORS 处理，此处直接放行）
async fn auth_middleware(req: Request<axum::body::Body>, next: Next) -> Result<Response, StatusCode> {
    if req.method() == Method::OPTIONS {
        return Ok(next.run(req).await);
    }

    let token = env::var("AUTH_TOKEN").unwrap_or_else(|_| "g9PlwDgwiWHxXbyKvHVcAJ3z5WlABNGjS20FGi6g".into());
    let auth_header = req.headers().get(header::AUTHORIZATION).and_then(|h| h.to_str().ok());

    if let Some(auth) = auth_header {
        if auth == format!("Bearer {}", token) {
            return Ok(next.run(req).await);
        }
    }
    Err(StatusCode::UNAUTHORIZED)
}

/// 本地调试白名单：localhost / 127.0.0.1 / [::1] 任意端口；
/// 额外来源可通过环境变量 `CORS_ALLOWED_ORIGINS` 配置（逗号分隔），例如 `http://172.16.5.27:1343`
fn cors_layer() -> CorsLayer {
    let extra: Vec<String> = env::var("CORS_ALLOWED_ORIGINS")
        .map(|s| {
            s.split(',')
                .map(str::trim)
                .filter(|o| !o.is_empty())
                .map(String::from)
                .collect()
        })
        .unwrap_or_default();

    let allow_origin = AllowOrigin::predicate(move |origin: &HeaderValue, _| {
        let Ok(origin) = origin.to_str() else {
            return false;
        };
        if origin.starts_with("http://localhost:")
            || origin.starts_with("http://127.0.0.1:")
            || origin.starts_with("http://[::1]:")
        {
            return true;
        }
        extra.iter().any(|allowed| origin == allowed)
    });

    CorsLayer::new()
        .allow_origin(allow_origin)
        .allow_methods([
            Method::GET,
            Method::POST,
            Method::PUT,
            Method::DELETE,
            Method::OPTIONS,
        ])
        .allow_headers([
            header::CONTENT_TYPE,
            header::AUTHORIZATION,
            header::HeaderName::from_static("x-session-token"),
        ])
        // localhost 访问局域网 IP（如 172.16.x.x）时 Chrome 需要此头
        .allow_private_network(true)
}

// 刷新任务
async fn perform_refresh() {
    let new_data = do_fetch_all().await;
    {
        let mut cache = GLOBAL_CACHE.write().unwrap();
        *cache = Some(new_data.clone());
    }
    if let Ok(json) = serde_json::to_string(&new_data) {
        let _ = fs::write(CACHE_FILE, json).await;
    }
    println!("[{}] Cache Updated", chrono::Local::now());
}

fn apply_public_cache(response: &mut Response, max_age: u64) {
    if let Ok(value) = HeaderValue::from_str(&format!("public, max-age={}", max_age)) {
        response.headers_mut().insert(header::CACHE_CONTROL, value);
    }
}

// 接口处理函数
async fn get_data_handler(Query(params): Query<FilterQuery>) -> impl IntoResponse {
    let cache = GLOBAL_CACHE.read().unwrap();
    let data = match &*cache {
        Some(d) => d,
        None => return (StatusCode::SERVICE_UNAVAILABLE, "Data not ready").into_response(),
    };

    let mut response = match params.data_type.as_deref() {
        Some("news") => Json(&data.news).into_response(),
        Some("rate") => Json(&data.exchange_rate).into_response(),
        Some("fuel") => Json(&data.fuel_price).into_response(),
        Some("weather") => Json(&data.weather).into_response(),
        Some("bing") => Json(&data.bing).into_response(),
        Some("music") => Json(&data.music).into_response(),
        _ => Json(data).into_response(),
    };
    apply_public_cache(&mut response, 300);
    response
}

#[tokio::main]
async fn main() {
    // 1. 初始化文件恢复
    if let Ok(content) = fs::read_to_string(CACHE_FILE).await {
        if let Ok(data) = serde_json::from_str(&content) {
            *GLOBAL_CACHE.write().unwrap() = Some(data);
        }
    }

    // 2. 初始抓取：先占位并后台刷新，避免阻塞监听端口
    if GLOBAL_CACHE.read().unwrap().is_none() {
        *GLOBAL_CACHE.write().unwrap() = Some(AggregatedData::empty());
        tokio::spawn(perform_refresh());
    }

    // 3. 定时任务 (每天凌晨 00:12)
    let sched = JobScheduler::new().await.unwrap();
    sched.add(Job::new_async("0 12 0 * * *", |_uuid, _l| Box::pin(perform_refresh())).unwrap()).await.unwrap();
    sched.start().await.unwrap();

    // 4. 路由（CORS 为最外层；/auth 为用户 JWT，其余接口仍用服务 Bearer）
    let auth_state = auth::init_state();
    let monitor_state = monitor::init_state(auth_state.clone());
    monitor::spawn_checker(monitor_state.clone());
    let docker_probe_state = docker_probe::init_state();
    let nav_state = private_nav::init_state(auth_state.clone());
    let notes_state = notes::init_state(auth_state.clone());
    let files_state = files::init_state(auth_state.clone());
    let ai_state = ai::init_state(auth_state.clone(), notes_state.clone());
    let backup_state = backup::init_state(auth_state.clone(), notes_state.clone());

    let api = Router::new()
        .route("/all", get(get_data_handler).post(get_data_handler))
        .route("/hotel", get(hotel::hotel_handler))
        .route("/convert", post(converter::convert_handler))
        .route("/refresh", get(|| async { perform_refresh().await; "OK" }))
        .route(
            "/subscribe",
            get(subscribe::subscribe_get).post(subscribe::subscribe_post),
        )
        .layer(middleware::from_fn(auth_middleware));

    let app = Router::new()
        .nest("/auth", auth::router(auth_state))
        .nest("/monitor", monitor::router(monitor_state))
        .nest("/docker", docker_probe::router(docker_probe_state))
        .nest("/nav", private_nav::router(nav_state))
        .nest("/notes", notes::router(notes_state))
        .nest("/files", files::router(files_state))
        .nest("/ai", ai::router(ai_state))
        .nest("/backup", backup::router(backup_state))
        .merge(api)
        .layer(CompressionLayer::new())
        .layer(cors_layer());

    let addr = format!("0.0.0.0:{}", env::var("PORT").unwrap_or_else(|_| "3001".into()));
    println!("Listening on {}", addr);
    axum::serve(tokio::net::TcpListener::bind(addr).await.unwrap(), app).await.unwrap();
}