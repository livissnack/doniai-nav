use axum::{
    extract::State,
    http::StatusCode,
    routing::post,
    Json, Router,
};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::time::{Duration, Instant};

const MAX_BATCH: usize = 30;
const PROBE_TIMEOUT_SECS: u64 = 10;

#[derive(Clone)]
pub struct DockerProbeState {
    client: Client,
}

#[derive(Debug, Deserialize)]
struct ProbeBatchBody {
    urls: Vec<String>,
}

#[derive(Debug, Serialize)]
struct ProbeBatchResponse {
    ok: bool,
    message: String,
    results: Vec<ProbeResult>,
}

#[derive(Debug, Serialize, Clone)]
struct ProbeResult {
    url: String,
    ok: bool,
    ms: u32,
    #[serde(rename = "statusCode", skip_serializing_if = "Option::is_none")]
    status_code: Option<u16>,
    #[serde(skip_serializing_if = "Option::is_none")]
    error: Option<String>,
}

type ApiResponse = (StatusCode, Json<ProbeBatchResponse>);

pub fn init_state() -> DockerProbeState {
    let client = Client::builder()
        .timeout(Duration::from_secs(PROBE_TIMEOUT_SECS))
        .redirect(reqwest::redirect::Policy::limited(5))
        .user_agent("DoniaiNav-DockerProbe/1.0")
        .build()
        .unwrap_or_else(|_| Client::new());

    DockerProbeState { client }
}

pub fn router(state: DockerProbeState) -> Router {
    Router::new()
        .route("/probe-batch", post(probe_batch))
        .with_state(state)
}

fn normalize_base_url(raw: &str) -> Option<String> {
    let url = raw.trim();
    if url.starts_with("http://") || url.starts_with("https://") {
        Some(url.trim_end_matches('/').to_string())
    } else {
        None
    }
}

async fn probe_registry(client: &Client, base: &str) -> ProbeResult {
    let paths = ["/v2/", "/"];
    let mut last = ProbeResult {
        url: base.to_string(),
        ok: false,
        ms: 0,
        status_code: None,
        error: Some("不可达".into()),
    };

    for path in paths {
        let url = format!("{base}{path}");
        let started = Instant::now();
        match client
            .get(&url)
            .header("Accept", "application/json, */*")
            .send()
            .await
        {
            Ok(resp) => {
                let code = resp.status().as_u16();
                let ms = started.elapsed().as_millis().min(u128::from(u32::MAX)) as u32;
                let ok = matches!(code, 200 | 401 | 403) || (200..400).contains(&code);
                return ProbeResult {
                    url: base.to_string(),
                    ok,
                    ms,
                    status_code: Some(code),
                    error: if ok { None } else { Some(format!("HTTP {code}")) },
                };
            }
            Err(e) => {
                last.ms = started.elapsed().as_millis().min(u128::from(u32::MAX)) as u32;
                last.error = Some(e.to_string());
            }
        }
    }

    last
}

async fn probe_batch(
    State(state): State<DockerProbeState>,
    Json(body): Json<ProbeBatchBody>,
) -> ApiResponse {
    if body.urls.is_empty() {
        return (
            StatusCode::BAD_REQUEST,
            Json(ProbeBatchResponse {
                ok: false,
                message: "urls 不能为空".into(),
                results: vec![],
            }),
        );
    }
    if body.urls.len() > MAX_BATCH {
        return (
            StatusCode::BAD_REQUEST,
            Json(ProbeBatchResponse {
                ok: false,
                message: format!("单次最多探测 {MAX_BATCH} 个 URL"),
                results: vec![],
            }),
        );
    }

    let mut normalized = Vec::new();
    for raw in &body.urls {
        let Some(url) = normalize_base_url(raw) else {
            normalized.push(ProbeResult {
                url: raw.trim().to_string(),
                ok: false,
                ms: 0,
                status_code: None,
                error: Some("URL 需以 http:// 或 https:// 开头".into()),
            });
            continue;
        };
        let result = probe_registry(&state.client, &url).await;
        normalized.push(result);
    }

    (
        StatusCode::OK,
        Json(ProbeBatchResponse {
            ok: true,
            message: "探测完成".into(),
            results: normalized,
        }),
    )
}
