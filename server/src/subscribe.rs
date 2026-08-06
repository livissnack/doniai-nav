use axum::{
    extract::Query,
    http::{header, StatusCode},
    response::{IntoResponse, Response},
    Json,
};
use reqwest::Client;
use serde::Deserialize;
use std::net::IpAddr;
use std::time::Duration;

#[derive(Debug, Deserialize)]
pub struct SubscribeQuery {
    pub url: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct SubscribeBody {
    pub url: Option<String>,
}

/// GET ?url=... 或 POST {"url":"..."} 代理拉取机场订阅
pub async fn subscribe_get(Query(q): Query<SubscribeQuery>) -> Response {
    fetch_subscribe(q.url.unwrap_or_default()).await
}

pub async fn subscribe_post(Json(body): Json<SubscribeBody>) -> Response {
    fetch_subscribe(body.url.unwrap_or_default()).await
}

async fn fetch_subscribe(raw_url: String) -> Response {
    let raw_url = raw_url.trim();
    if raw_url.is_empty() {
        return err(StatusCode::BAD_REQUEST, "缺少 url 参数");
    }

    let Ok(parsed) = reqwest::Url::parse(raw_url) else {
        return err(StatusCode::BAD_REQUEST, "URL 格式无效");
    };

    if parsed.scheme() != "http" && parsed.scheme() != "https" {
        return err(StatusCode::BAD_REQUEST, "仅支持 http/https 订阅地址");
    }

    if is_blocked_host(parsed.host_str().unwrap_or("")) {
        return err(StatusCode::BAD_REQUEST, "不允许访问该主机");
    }

    let client = match Client::builder()
        .timeout(Duration::from_secs(45))
        .connect_timeout(Duration::from_secs(15))
        .redirect(reqwest::redirect::Policy::limited(10))
        .build()
    {
        Ok(c) => c,
        Err(e) => {
            return err(
                StatusCode::INTERNAL_SERVER_ERROR,
                &format!("客户端初始化失败: {e}"),
            )
        }
    };

    // Clash Party / mihomo 常见 UA；面板据此返回 Clash YAML 或 base64 节点
    let user_agents = [
        "ClashMeta/1.19.0 clash.meta mihomo",
        "clash.meta",
        "ClashforWindows/0.20.39",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    ];

    let mut last_err = String::from("订阅请求失败");
    for ua in user_agents {
        let response = match client
            .get(parsed.clone())
            .header(header::USER_AGENT, ua)
            .header(header::ACCEPT, "*/*")
            .header(header::ACCEPT_LANGUAGE, "zh-CN,zh;q=0.9")
            .send()
            .await
        {
            Ok(r) => r,
            Err(e) => {
                last_err = format!("订阅请求失败: {e}");
                continue;
            }
        };

        let status = response.status();
        if !status.is_success() {
            last_err = format!("订阅源返回 HTTP {}", status.as_u16());
            continue;
        }

        let bytes = match response.bytes().await {
            Ok(b) => b,
            Err(e) => {
                last_err = format!("读取订阅内容失败: {e}");
                continue;
            }
        };

        if bytes.is_empty() {
            last_err = "订阅内容为空".into();
            continue;
        }

        let text = String::from_utf8_lossy(&bytes).into_owned();
        let trimmed = text.trim();
        // 跳过明显的 HTML 错误页
        if trimmed.starts_with('<')
            || trimmed.to_ascii_lowercase().starts_with("<!doctype")
        {
            last_err = "订阅源返回了网页而非节点数据".into();
            continue;
        }

        return (
            StatusCode::OK,
            [(header::CONTENT_TYPE, "text/plain; charset=utf-8")],
            text,
        )
            .into_response();
    }

    err(StatusCode::BAD_GATEWAY, &last_err)
}

fn err(status: StatusCode, message: &str) -> Response {
    (
        status,
        [(header::CONTENT_TYPE, "application/json; charset=utf-8")],
        format!(r#"{{"ok":false,"message":"{}"}}"#, escape_json(message)),
    )
        .into_response()
}

fn escape_json(s: &str) -> String {
    s.replace('\\', "\\\\").replace('"', "\\\"")
}

fn is_blocked_host(host: &str) -> bool {
    let h = host.trim().trim_end_matches('.').to_ascii_lowercase();
    if h.is_empty() || h == "localhost" || h.ends_with(".localhost") || h.ends_with(".local")
    {
        return true;
    }
    if let Ok(ip) = h.parse::<IpAddr>() {
        return match ip {
            IpAddr::V4(v4) => {
                v4.is_loopback()
                    || v4.is_private()
                    || v4.is_link_local()
                    || v4.is_unspecified()
                    || v4.octets()[0] == 0
            }
            IpAddr::V6(v6) => v6.is_loopback() || v6.is_unspecified(),
        };
    }
    false
}
