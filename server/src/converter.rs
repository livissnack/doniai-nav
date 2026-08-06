use axum::{body::Bytes, response::IntoResponse}; // 修正为 axum
use serde::{Deserialize, Serialize};
use base64::{prelude::BASE64_STANDARD, Engine};
use url::Url;
use std::collections::HashMap;

// --- 1. 结构体定义 (增加 Default 派生) ---

#[derive(Serialize, Deserialize, Debug, Clone, Default)]
pub struct ClashProxy {
    pub name: String,
    pub r#type: String,
    pub server: String,
    pub port: u16,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub uuid: Option<String>,
    pub tls: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub flow: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub network: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub servername: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none", rename = "reality-opts")]
    pub reality_opts: Option<RealityOpts>,
    #[serde(skip_serializing_if = "Option::is_none", rename = "client-fingerprint")]
    pub client_fingerprint: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none", rename = "skip-cert-verify")]
    pub skip_cert_verify: Option<bool>,
    pub tfo: bool,

    // 兼容性字段
    #[serde(skip_serializing_if = "Option::is_none")]
    pub password: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none", rename = "alterId")]
    pub alter_id: Option<u8>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cipher: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none", rename = "ws-opts")]
    pub ws_opts: Option<WsOpts>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub sni: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub auth_str: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub up: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub down: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub alpn: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub obfs: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none", rename = "obfs-password")]
    pub obfs_password: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone, Default)]
pub struct RealityOpts {
    #[serde(rename = "public-key")]
    pub public_key: String,
    #[serde(skip_serializing_if = "Option::is_none", rename = "short-id")]
    pub short_id: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone, Default)]
pub struct WsOpts {
    pub path: String,
    pub headers: HashMap<String, String>,
}

#[derive(Deserialize)]
struct VmessJson {
    ps: String, add: String, port: u16, id: String, aid: u8, scy: String, net: String, tls: String, host: String, path: String,
}

// --- 2. 核心 Handler ---

pub async fn convert_handler(body: Bytes) -> impl IntoResponse {
    let input = String::from_utf8_lossy(&body);
    let mut proxies = Vec::new();

    for line in input.lines() {
        let line = line.trim();
        let p = if line.starts_with("vmess://") {
            parse_vmess(line)
        } else if line.starts_with("vless://") {
            parse_vless(line)
        } else if line.starts_with("hysteria") {
            parse_hysteria(line)
        } else if line.starts_with("ss://") {
            parse_ss(line)
        } else {
            None
        };

        if let Some(node) = p { proxies.push(node); }
    }

    // 转换为 YAML 逻辑保持不变...
    let proxies_yaml = proxies.iter().map(|p| {
        let y = serde_yaml::to_string(&p).unwrap_or_default();
        let trimmed = y.strip_prefix("---\n").unwrap_or(&y).trim_end();
        trimmed.lines().enumerate().map(|(i, line)| {
            if i == 0 {
                format!("  - {}", line.strip_prefix("- ").unwrap_or(line))
            } else {
                format!("    {}", line)
            }
        }).collect::<Vec<_>>().join("\n")
    }).collect::<Vec<_>>().join("\n");

    let names_yaml = proxies.iter()
        .map(|p| format!("      - {}", p.name))
        .collect::<Vec<_>>()
        .join("\n");

    let template = include_str!("clash_template.yaml");
    let final_config = template
        .replace("__PROXIES_PLACEHOLDER__", &proxies_yaml)
        .replace("__NAMES_PLACEHOLDER__", &names_yaml);

    ([("Content-Type", "text/yaml; charset=utf-8")], final_config)
}

// --- 3. 解析函数实现 ---

fn parse_ss(u: &str) -> Option<ClashProxy> {
    let body = u.strip_prefix("ss://")?;

    // 1. 分割名称 (#)
    let (main_part, name) = match body.rsplit_once('#') {
        Some((left, right)) => (left, urlencoding::decode(right).unwrap_or(right.into()).to_string()),
        None => (body, "ss_node".to_string()),
    };

    // 2. 分割认证与地址 (@)
    let (user_info_b64, server_info) = main_part.split_once('@')?;

    // 3. 解码 Base64 认证信息 (method:password)
    let decoded_auth = BASE64_STANDARD.decode(user_info_b64).ok()?;
    let auth_str = String::from_utf8(decoded_auth).ok()?;
    let (cipher, password) = auth_str.split_once(':')?;

    // 4. 解析 Host 和 Port
    let (server, port_str) = server_info.split_once(':')?;
    let port = port_str.parse::<u16>().ok()?;

    Some(ClashProxy {
        name,
        r#type: "ss".into(),
        server: server.to_string(),
        port,
        cipher: Some(cipher.to_string()),
        password: Some(password.to_string()),
        ..Default::default()
    })
}

fn parse_vless(u: &str) -> Option<ClashProxy> {
    let parsed = Url::parse(u).ok()?;
    let query: HashMap<_, _> = parsed.query_pairs().into_owned().collect();

    let name = parsed.fragment()
        .map(|f| urlencoding::decode(f).unwrap_or(f.into()).to_string())
        .unwrap_or_else(|| "vless_node".into());

    let security = query.get("security").map(|s| s.as_str()).unwrap_or("");
    let is_reality = security == "reality";

    Some(ClashProxy {
        name,
        r#type: "vless".into(),
        server: parsed.host_str()?.to_string(),
        port: parsed.port()?,
        uuid: Some(parsed.username().to_string()),
        tls: is_reality || security == "tls",
        flow: query.get("flow").cloned(),
        network: query.get("type").cloned().or(Some("tcp".into())),
        servername: query.get("sni").cloned(),
        reality_opts: if is_reality {
            Some(RealityOpts {
                public_key: query.get("pbk").cloned().unwrap_or_default(),
                short_id: query.get("sid").cloned(),
            })
        } else { None },
        client_fingerprint: query.get("fp").or(query.get("fingerprint")).cloned(),
        skip_cert_verify: Some(query.get("insecure") == Some(&"1".into())),
        ..Default::default()
    })
}

fn parse_vmess(u: &str) -> Option<ClashProxy> {
    let b64 = u.strip_prefix("vmess://")?;
    let decoded = BASE64_STANDARD.decode(b64).ok()?;
    let v: VmessJson = serde_json::from_slice(&decoded).ok()?;

    let mut headers = HashMap::new();
    if !v.host.is_empty() {
        headers.insert("Host".into(), v.host);
    }

    Some(ClashProxy {
        name: v.ps,
        r#type: "vmess".into(),
        server: v.add,
        port: v.port,
        uuid: Some(v.id),
        alter_id: Some(v.aid),
        cipher: Some(v.scy),
        tls: v.tls == "tls",
        network: Some(v.net),
        ws_opts: Some(WsOpts { path: v.path, headers }),
        ..Default::default()
    })
}

fn parse_hysteria(u: &str) -> Option<ClashProxy> {
    let parsed = Url::parse(u).ok()?;
    let is_h2 = u.starts_with("hysteria2");
    let name = parsed.fragment()
        .map(|f| urlencoding::decode(f).unwrap_or(f.into()).to_string())
        .unwrap_or("hysteria_node".into());

    let query: HashMap<_, _> = parsed.query_pairs().into_owned().collect();

    Some(ClashProxy {
        name,
        r#type: if is_h2 { "hysteria2" } else { "hysteria" }.into(),
        server: parsed.host_str()?.to_string(),
        port: parsed.port()?,
        tls: true,
        password: if is_h2 { Some(parsed.username().to_string()) } else { None },
        auth_str: if !is_h2 { query.get("auth").cloned() } else { None },
        up: query.get("up").cloned().map(|v| v.replace("Mbps", "")),
        down: query.get("down").cloned().map(|v| v.replace("Mbps", "")),
        sni: query.get("peer").or(query.get("sni")).cloned(),
        skip_cert_verify: Some(query.get("insecure") == Some(&"1".into())),
        alpn: query.get("alpn").map(|v| vec![v.clone()]),
        obfs: query.get("obfs").cloned(),
        obfs_password: query.get("obfs-password").cloned(),
        ..Default::default()
    })
}