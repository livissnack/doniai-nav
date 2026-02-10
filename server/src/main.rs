mod models;
mod fetcher;

use models::AggregatedData;
use fetcher::do_fetch_all;

use axum::{
    extract::Query,
    middleware::{self, Next},
    response::{Response, IntoResponse},
    routing::get,
    http::{StatusCode, Request, header},
    Json, Router,
};
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

// 认证中间件
async fn auth_middleware(req: Request<axum::body::Body>, next: Next) -> Result<Response, StatusCode> {
    let token = env::var("AUTH_TOKEN").unwrap_or_else(|_| "g9PlwDgwiWHxXbyKvHVcAJ3z5WlABNGjS20FGi6g".into());
    let auth_header = req.headers().get(header::AUTHORIZATION).and_then(|h| h.to_str().ok());

    if let Some(auth) = auth_header {
        if auth == format!("Bearer {}", token) {
            return Ok(next.run(req).await);
        }
    }
    Err(StatusCode::UNAUTHORIZED)
}

// 刷新任务
async fn perform_refresh() {
    let new_data = do_fetch_all().await;
    {
        let mut cache = GLOBAL_CACHE.write().unwrap();
        *cache = Some(new_data.clone());
    }
    if let Ok(json) = serde_json::to_string_pretty(&new_data) {
        let _ = fs::write(CACHE_FILE, json).await;
    }
    println!("[{}] Cache Updated", chrono::Local::now());
}

// 接口处理函数
async fn get_data_handler(Query(params): Query<FilterQuery>) -> impl IntoResponse {
    let cache = GLOBAL_CACHE.read().unwrap();
    let data = match &*cache {
        Some(d) => d,
        None => return (StatusCode::SERVICE_UNAVAILABLE, "Data not ready").into_response(),
    };

    match params.data_type.as_deref() {
        Some("news") => Json(&data.news).into_response(),
        Some("rate") => Json(&data.exchange_rate).into_response(),
        Some("fuel") => Json(&data.fuel_price).into_response(),
        Some("weather") => Json(&data.weather).into_response(),
        Some("bing") => Json(&data.bing).into_response(),
        Some("music") => Json(&data.bing).into_response(),
        _ => Json(data).into_response(),
    }
}

#[tokio::main]
async fn main() {
    // 1. 初始化文件恢复
    if let Ok(content) = fs::read_to_string(CACHE_FILE).await {
        if let Ok(data) = serde_json::from_str(&content) {
            *GLOBAL_CACHE.write().unwrap() = Some(data);
        }
    }

    // 2. 初始抓取
    if GLOBAL_CACHE.read().unwrap().is_none() {
        perform_refresh().await;
    }

    // 3. 定时任务 (每天凌晨 00:01)
    let sched = JobScheduler::new().await.unwrap();
    sched.add(Job::new_async("0 1 0 * * *", |_uuid, _l| Box::pin(perform_refresh())).unwrap()).await.unwrap();
    sched.start().await.unwrap();

    // 4. 路由
    let app = Router::new()
        .route("/all", get(get_data_handler))
        .route("/refresh", get(|| async { perform_refresh().await; "OK" }))
        .layer(middleware::from_fn(auth_middleware));

    let addr = format!("0.0.0.0:{}", env::var("PORT").unwrap_or_else(|_| "3000".into()));
    println!("Listening on {}", addr);
    axum::serve(tokio::net::TcpListener::bind(addr).await.unwrap(), app).await.unwrap();
}