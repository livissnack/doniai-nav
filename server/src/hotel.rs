use axum::{
    body::Body,
    extract::Query,
    response::{IntoResponse, Response},
};
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
pub struct HotelParams {
    /// 仅通过 URL Query 接收 ip 参数 (?ip=xxx)
    #[serde(default = "default_ip")]
    pub ip: String,
}

fn default_ip() -> String {
    "125.126.203.11:9901".to_string()
}

#[derive(Debug, Deserialize, Serialize)]
struct IptvItem {
    name: String,
    url: String,
    typename: Option<String>,
}

#[derive(Debug, Deserialize)]
struct IptvJson {
    data: Vec<IptvItem>,
}

pub async fn hotel_handler(
    Query(params): Query<HotelParams>,
) -> impl IntoResponse {
    let ip_param = params.ip;

    // 控制台可以看到当前正在处理哪个 IP
    println!("DEBUG: Processing GET Request for IP -> {}", ip_param);

    let base_url = format!("http://{}", ip_param);
    let client = reqwest::Client::builder()
        .user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        .timeout(std::time::Duration::from_secs(10)) // 酒店网络通常较慢，稍微加长超时
        .build()
        .unwrap();

    let mut iptv_data: Vec<IptvItem> = Vec::new();

    // 1. 尝试获取 JSON
    let json_url = format!("{}/iptv/live/1000.json", base_url);
    if let Ok(resp) = client.get(&json_url).send().await {
        if let Ok(json_res) = resp.json::<IptvJson>().await {
            iptv_data = json_res.data;
        }
    }

    // 2. 如果 JSON 为空，尝试获取 TXT 接口
    if iptv_data.is_empty() {
        let txt_url = format!("{}/ZHGXTV/Public/json/live_interface.txt", base_url);
        if let Ok(resp) = client.get(&txt_url).send().await {
            if let Ok(body_text) = resp.text().await {
                for line in body_text.lines() {
                    let parts: Vec<&str> = line.trim().split(',').collect();
                    if parts.len() >= 2 {
                        iptv_data.push(IptvItem {
                            name: parts[0].to_string(),
                            url: parts[1].to_string(),
                            typename: None,
                        });
                    }
                }
            }
        }
    }

    // 3. 构建 M3U
    let mut m3u = String::from("#EXTM3U\n");
    for tv in iptv_data {
        if tv.url.is_empty() { continue; }

        let tvg_name = &tv.name;
        // 逻辑: 获取最后一个 '-' 之前的字符串并转小写
        let tvg_logo_name = tv.name.rsplit_once('-').map(|(p, _)| p).unwrap_or(&tv.name).to_lowercase();
        let tvg_logo = format!("https://epg.112114.xyz/logo/{}.png", tvg_logo_name);
        let group_title = tv.typename.as_deref().unwrap_or("未知");

        // 智能拼接 URL
        let tv_url = if tv.url.starts_with("http") {
            tv.url.clone()
        } else {
            let separator = if tv.url.starts_with('/') { "" } else { "/" };
            format!("{}{}{}", base_url, separator, tv.url)
        };

        let line = format!(
            "#EXTINF:-1, tvg-id=\"{0}\" tvg-name=\"{0}\" tvg-logo=\"{1}\" group-title=\"{2}\",{0}\n{3}\n",
            tvg_name, tvg_logo, group_title, tv_url
        );
        m3u.push_str(&line);
    }

    Response::builder()
        .header("Content-Type", "text/plain; charset=utf-8") // 设为 text/plain 方便直接在浏览器调试查看
        .body(Body::from(m3u))
        .unwrap()
}