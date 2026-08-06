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
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tls: Option<bool>,
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
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tfo: Option<bool>,

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
    #[serde(skip_serializing_if = "Option::is_none", rename = "auth-str")]
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
    #[serde(skip_serializing_if = "Option::is_none")]
    pub udp: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none", rename = "idle-session-check-interval")]
    pub idle_session_check_interval: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none", rename = "idle-session-timeout")]
    pub idle_session_timeout: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none", rename = "min-idle-session")]
    pub min_idle_session: Option<u32>,
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
    let raw = String::from_utf8_lossy(&body);
    // 兼容误用 JSON.stringify 包一层字符串的旧前端
    let input = {
        let trimmed = raw.trim();
        if trimmed.starts_with('"') && trimmed.ends_with('"') {
            serde_json::from_str::<String>(trimmed).unwrap_or_else(|_| raw.to_string())
        } else {
            raw.to_string()
        }
    };
    let mut proxies = Vec::new();

    for line in input.lines() {
        let line = line.trim();
        let lower = line.to_ascii_lowercase();
        let p = if lower.starts_with("vmess://") {
            parse_vmess(line)
        } else if lower.starts_with("vless://") {
            parse_vless(line)
        } else if lower.starts_with("hysteria") {
            parse_hysteria(line)
        } else if lower.starts_with("ss://") {
            parse_ss(line)
        } else if lower.starts_with("trojan://") {
            parse_trojan(line)
        } else if lower.starts_with("anytls://") {
            parse_anytls(line)
        } else {
            None
        };

        if let Some(node) = p {
            proxies.push(node);
        }
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

    let names_yaml = proxies
        .iter()
        .map(|p| format!("      - {}", yaml_quote_scalar(&p.name)))
        .collect::<Vec<_>>()
        .join("\n");

    let template = include_str!("clash_template.yaml");
    let final_config = template
        .replace("__PROXIES_PLACEHOLDER__", &proxies_yaml)
        .replace("__NAMES_PLACEHOLDER__", &names_yaml);

    ([("Content-Type", "text/yaml; charset=utf-8")], final_config)
}

// --- 3. 解析函数实现 ---

fn yaml_quote_scalar(value: &str) -> String {
    // 避免 [自建] 这类名称被 YAML 解析成数组
    if value.is_empty()
        || value.chars().any(|c| {
            matches!(
                c,
                ':' | '#' | '{' | '}' | '[' | ']' | ',' | '&' | '*' | '!' | '|' | '>' | '\''
                    | '"' | '%' | '@' | '`'
            ) || c.is_whitespace()
        })
    {
        format!("\"{}\"", value.replace('\\', "\\\\").replace('"', "\\\""))
    } else {
        value.to_string()
    }
}

fn decode_base64_flexible(input: &str) -> Option<Vec<u8>> {
    let cleaned = input.trim().replace('-', "+").replace('_', "/");
    if let Ok(bytes) = BASE64_STANDARD.decode(&cleaned) {
        return Some(bytes);
    }
    // 补齐 padding 后再试
    let pad = (4 - cleaned.len() % 4) % 4;
    let padded = format!("{}{}", cleaned, "=".repeat(pad));
    BASE64_STANDARD.decode(padded).ok()
}

fn parse_ss(u: &str) -> Option<ClashProxy> {
    let body = u.strip_prefix("ss://")?;

    // 1. 分割名称 (#)
    let (main_part, name) = match body.rsplit_once('#') {
        Some((left, right)) => (
            left,
            urlencoding::decode(right)
                .unwrap_or(right.into())
                .to_string(),
        ),
        None => (body, "ss_node".to_string()),
    };

    // 2. SIP002: base64(method:password)@host:port
    //    旧格式: base64(method:password@host:port)
    let (cipher, password, server, port) = if let Some((user_info_b64, server_info)) =
        main_part.split_once('@')
    {
        let decoded_auth = decode_base64_flexible(user_info_b64)?;
        let auth_str = String::from_utf8(decoded_auth).ok()?;
        let (cipher, password) = auth_str.split_once(':')?;
        let (server, port_str) = server_info.rsplit_once(':')?;
        let port = port_str.parse::<u16>().ok()?;
        (
            cipher.to_string(),
            password.to_string(),
            server.to_string(),
            port,
        )
    } else {
        let decoded = decode_base64_flexible(main_part)?;
        let decoded_str = String::from_utf8(decoded).ok()?;
        let (method_password, server_info) = decoded_str.split_once('@')?;
        let (cipher, password) = method_password.split_once(':')?;
        let (server, port_str) = server_info.rsplit_once(':')?;
        let port = port_str.parse::<u16>().ok()?;
        (
            cipher.to_string(),
            password.to_string(),
            server.to_string(),
            port,
        )
    };

    Some(ClashProxy {
        name,
        r#type: "ss".into(),
        server,
        port,
        cipher: Some(cipher),
        password: Some(password),
        udp: Some(true),
        ..Default::default()
    })
}

fn parse_vless(u: &str) -> Option<ClashProxy> {
    let parsed = Url::parse(u).ok()?;
    let query: HashMap<_, _> = parsed.query_pairs().into_owned().collect();

    let name = parsed
        .fragment()
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
        tls: Some(is_reality || security == "tls"),
        flow: query.get("flow").cloned().filter(|s| !s.is_empty()),
        network: query.get("type").cloned().or(Some("tcp".into())),
        servername: query.get("sni").cloned(),
        reality_opts: if is_reality {
            Some(RealityOpts {
                public_key: query.get("pbk").cloned().unwrap_or_default(),
                short_id: query.get("sid").cloned(),
            })
        } else {
            None
        },
        client_fingerprint: query.get("fp").or(query.get("fingerprint")).cloned(),
        skip_cert_verify: Some(query.get("insecure") == Some(&"1".into())),
        udp: Some(true),
        ..Default::default()
    })
}

fn parse_trojan(u: &str) -> Option<ClashProxy> {
    let parsed = Url::parse(u).ok()?;
    let query: HashMap<_, _> = parsed.query_pairs().into_owned().collect();
    let name = parsed
        .fragment()
        .map(|f| urlencoding::decode(f).unwrap_or(f.into()).to_string())
        .unwrap_or_else(|| "trojan_node".into());
    let password = parsed.username();
    if password.is_empty() {
        return None;
    }

    Some(ClashProxy {
        name,
        r#type: "trojan".into(),
        server: parsed.host_str()?.to_string(),
        port: parsed.port().unwrap_or(443),
        password: Some(urlencoding::decode(password).unwrap_or(password.into()).to_string()),
        tls: Some(true),
        sni: query.get("sni").or(query.get("peer")).cloned(),
        network: query.get("type").cloned(),
        skip_cert_verify: Some(query.get("allowInsecure") == Some(&"1".into())
            || query.get("insecure") == Some(&"1".into())),
        udp: Some(true),
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
        tls: Some(v.tls == "tls"),
        network: Some(v.net),
        ws_opts: Some(WsOpts { path: v.path, headers }),
        ..Default::default()
    })
}

fn parse_hysteria(u: &str) -> Option<ClashProxy> {
    let parsed = Url::parse(u).ok()?;
    let is_h2 = u.starts_with("hysteria2");
    let name = parsed
        .fragment()
        .map(|f| urlencoding::decode(f).unwrap_or(f.into()).to_string())
        .unwrap_or_else(|| "hysteria_node".into());

    let query: HashMap<_, _> = parsed.query_pairs().into_owned().collect();
    let bandwidth = |keys: &[&str]| {
        keys.iter()
            .find_map(|k| query.get(*k))
            .cloned()
            .map(|v| v.replace("Mbps", "").replace("mbps", ""))
    };

    Some(ClashProxy {
        name,
        r#type: if is_h2 { "hysteria2" } else { "hysteria" }.into(),
        server: parsed.host_str()?.to_string(),
        port: parsed.port().or_else(|| {
            // https 默认 443 / http 默认 80
            match parsed.scheme() {
                "hysteria2" | "hy2" => Some(443),
                _ => None,
            }
        })?,
        tls: Some(true),
        password: if is_h2 {
            let user = parsed.username();
            if user.is_empty() {
                query.get("password").cloned()
            } else {
                Some(urlencoding::decode(user).unwrap_or(user.into()).to_string())
            }
        } else {
            None
        },
        auth_str: if !is_h2 {
            query
                .get("auth")
                .or(query.get("auth-str"))
                .cloned()
        } else {
            None
        },
        up: bandwidth(&["up", "upmbps"]),
        down: bandwidth(&["down", "downmbps"]),
        sni: query.get("peer").or(query.get("sni")).cloned(),
        skip_cert_verify: Some(query.get("insecure") == Some(&"1".into())),
        alpn: query.get("alpn").map(|v| vec![v.clone()]),
        obfs: query.get("obfs").cloned(),
        obfs_password: query.get("obfs-password").cloned(),
        ..Default::default()
    })
}

/// anytls://password@host:port?sni=&fp=&insecure=&alpn=#name
fn parse_anytls(u: &str) -> Option<ClashProxy> {
    if let Some(node) = parse_anytls_with_url(u) {
        return Some(node);
    }
    parse_anytls_manual(u)
}

fn parse_anytls_with_url(u: &str) -> Option<ClashProxy> {
    let parsed = Url::parse(u).ok()?;
    let query: HashMap<_, _> = parsed.query_pairs().into_owned().collect();
    let name = parsed
        .fragment()
        .map(|f| urlencoding::decode(f).unwrap_or(f.into()).to_string())
        .unwrap_or_else(|| "anytls_node".into());

    let password = parsed.username();
    if password.is_empty() {
        return None;
    }

    build_anytls_proxy(
        name,
        parsed.host_str()?.to_string(),
        parsed.port().unwrap_or(443),
        urlencoding::decode(password)
            .unwrap_or(password.into())
            .to_string(),
        &query,
    )
}

/// 兼容密码含未转义特殊字符、Url 库解析失败的情况
fn parse_anytls_manual(u: &str) -> Option<ClashProxy> {
    let lower = u.to_ascii_lowercase();
    if !lower.starts_with("anytls://") {
        return None;
    }
    let body = &u["anytls://".len()..];

    let (main, name) = match body.rsplit_once('#') {
        Some((left, right)) => (
            left,
            urlencoding::decode(right)
                .unwrap_or(right.into())
                .to_string(),
        ),
        None => (body, "anytls_node".to_string()),
    };

    let (auth_host, query_str) = match main.split_once('?') {
        Some((left, right)) => (left, right),
        None => (main, ""),
    };

    let (password, host_port) = auth_host.rsplit_once('@')?;
    let (server, port_str) = host_port.rsplit_once(':')?;
    let port = port_str
        .split('/')
        .next()
        .and_then(|p| p.parse::<u16>().ok())
        .unwrap_or(443);

    let query: HashMap<String, String> = url::form_urlencoded::parse(query_str.as_bytes())
        .into_owned()
        .collect();

    build_anytls_proxy(
        name,
        server.to_string(),
        port,
        urlencoding::decode(password)
            .unwrap_or(password.into())
            .to_string(),
        &query,
    )
}

fn build_anytls_proxy(
    name: String,
    server: String,
    port: u16,
    password: String,
    query: &HashMap<String, String>,
) -> Option<ClashProxy> {
    if password.is_empty() || server.is_empty() {
        return None;
    }

    let parse_u32 = |keys: &[&str]| {
        keys.iter()
            .find_map(|k| query.get(*k))
            .and_then(|v| v.parse::<u32>().ok())
    };

    let insecure = query.get("insecure").map(|s| s.as_str()) == Some("1")
        || query.get("allowInsecure").map(|s| s.as_str()) == Some("1")
        || query.get("skip-cert-verify").map(|s| s.as_str()) == Some("true")
        || query.get("skip-cert-verify").map(|s| s.as_str()) == Some("1");

    Some(ClashProxy {
        name,
        r#type: "anytls".into(),
        server,
        port,
        password: Some(password),
        sni: query.get("sni").or(query.get("peer")).cloned(),
        client_fingerprint: query
            .get("fp")
            .or(query.get("fingerprint"))
            .or(query.get("client-fingerprint"))
            .cloned(),
        skip_cert_verify: Some(insecure),
        alpn: query.get("alpn").map(|v| {
            v.split(',')
                .map(|s| s.trim().to_string())
                .filter(|s| !s.is_empty())
                .collect()
        }),
        udp: Some(true),
        idle_session_check_interval: parse_u32(&[
            "idle_session_check_interval",
            "idle-session-check-interval",
        ]),
        idle_session_timeout: parse_u32(&["idle_session_timeout", "idle-session-timeout"]),
        min_idle_session: parse_u32(&["min_idle_session", "min-idle-session"]),
        ..Default::default()
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parse_sample_links() {
        let vless = parse_vless(
            "vless://06a0a567-4e14-4b19-9bf8-70eccbba1ddb@80.75.218.223:47833?encryption=none&security=reality&flow=xtls-rprx-vision&type=tcp&sni=www.amazon.com&pbk=QWbn09eWFDcBnck72-kcdLMWchaZ9zLGNpUlwz1BGQE&fp=chrome#[自建] 德国 01",
        )
        .expect("vless");
        assert_eq!(vless.r#type, "vless");
        assert_eq!(vless.server, "80.75.218.223");
        assert_eq!(vless.port, 47833);
        assert!(vless.reality_opts.is_some());

        let hy = parse_hysteria(
            "hysteria://1.2.3.4:12854?protocol=udp&auth=pekopeko&peer=wechat.com&insecure=1&upmbps=50&downmbps=250&alpn=h3#hysteria",
        )
        .expect("hysteria");
        assert_eq!(hy.r#type, "hysteria");
        assert_eq!(hy.up.as_deref(), Some("50"));
        assert_eq!(hy.down.as_deref(), Some("250"));
        assert_eq!(hy.auth_str.as_deref(), Some("pekopeko"));

        let ss = parse_ss(
            "ss://YWVzLTI1Ni1nY206cjROQndqczFxOWRWenJ0cWxNZUpzcDdlWnlDaTY4bEVyVms1dURzbw==@151.242.189.239:33560#[自建] 台湾 01",
        )
        .expect("ss");
        assert_eq!(ss.r#type, "ss");
        assert_eq!(ss.cipher.as_deref(), Some("aes-256-gcm"));
        assert_eq!(ss.server, "151.242.189.239");

        let hy2 = parse_hysteria(
            "hysteria2://P%40ssw0rd1234@example.com:443/?protocol=udp&obfs=salamander&obfs-password=obfs_pwd&sni=www.example.com&insecure=0&up=100Mbps&down=200Mbps#MyHysteria",
        )
        .expect("hysteria2");
        assert_eq!(hy2.r#type, "hysteria2");
        assert_eq!(hy2.password.as_deref(), Some("P@ssw0rd1234"));
        assert_eq!(hy2.up.as_deref(), Some("100"));
    }

    #[test]
    fn parse_anytls_link() {
        let node = parse_anytls(
            "anytls://P%40ssw0rd@1.2.3.4:443?sni=www.example.com&fp=chrome&insecure=1&alpn=h2,http/1.1&idle_session_check_interval=30&idle_session_timeout=30&min_idle_session=0#AnyTLS-Demo",
        )
        .expect("anytls");
        assert_eq!(node.r#type, "anytls");
        assert_eq!(node.server, "1.2.3.4");
        assert_eq!(node.port, 443);
        assert_eq!(node.password.as_deref(), Some("P@ssw0rd"));
        assert_eq!(node.sni.as_deref(), Some("www.example.com"));
        assert_eq!(node.client_fingerprint.as_deref(), Some("chrome"));
        assert_eq!(node.skip_cert_verify, Some(true));
        assert_eq!(node.alpn.as_ref().map(|a| a.len()), Some(2));
        assert_eq!(node.idle_session_check_interval, Some(30));
        assert_eq!(node.min_idle_session, Some(0));
        assert_eq!(node.name, "AnyTLS-Demo");

        let yaml = serde_yaml::to_string(&node).expect("yaml");
        assert!(yaml.contains("type: anytls"), "{yaml}");
        assert!(yaml.contains("password:"), "{yaml}");
    }

    #[test]
    fn convert_includes_anytls_in_yaml() {
        let input = "anytls://P%40ssw0rd@1.2.3.4:443?sni=www.example.com&fp=chrome&insecure=1#AnyTLS-Demo\nvless://06a0a567-4e14-4b19-9bf8-70eccbba1ddb@80.75.218.223:47833?encryption=none&security=reality&type=tcp&sni=www.amazon.com&pbk=abc&fp=chrome#vless1";
        let mut proxies = Vec::new();
        for line in input.lines() {
            let line = line.trim();
            let p = if line.starts_with("vless://") {
                parse_vless(line)
            } else if line.starts_with("anytls://") {
                parse_anytls(line)
            } else {
                None
            };
            if let Some(node) = p {
                proxies.push(node);
            }
        }
        assert_eq!(proxies.len(), 2);
        assert!(proxies.iter().any(|p| p.r#type == "anytls"));
        let yaml = serde_yaml::to_string(&proxies).unwrap();
        assert!(yaml.contains("anytls"), "{yaml}");
    }
}