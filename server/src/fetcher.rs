use crate::models::AggregatedData;
use reqwest::Client;
use reqwest::header;
use std::time::Duration;

pub async fn do_fetch_all() -> AggregatedData {
    let client = Client::builder()
        .timeout(Duration::from_secs(20))
        .build()
        .unwrap();

    let region = "蕲春"; // 默认地区
    let music_type = "netease"; // 网易

    let fuel_url = format!("https://60s.viki.moe/v2/fuel-price?region={}", region);
    let music_url = format!("https://v.iarc.top/?type=playlist&id=7783760543&server={}", music_type);

    let (polymeric_news, ex, fuel, weather, bing, music) = tokio::join!(
        fetch_single(&client, "https://api1.livissnack.com/news"),
        fetch_single(&client, "https://60s.viki.moe/v2/exchange-rate?currency=USD"),
        fetch_single(&client, &fuel_url),
        fetch_single(&client, "https://60s.viki.moe/v2/weather"),
        fetch_single(&client, "https://60s.viki.moe/v2/bing"),
        fetch_single(&client, &music_url)
    );

    AggregatedData {
        news: polymeric_news,
        exchange_rate: ex,
        fuel_price: fuel,
        weather: weather,
        bing: bing,
        music: music,
        updated_at: chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string(),
    }
}

async fn fetch_single(client: &Client, url: &str) -> serde_json::Value {
    // 1. 从 URL 中解析出 Host
    let url_parsed = reqwest::Url::parse(url).unwrap();
    let host = url_parsed.host_str().unwrap_or("");

    // 2. 发起请求并添加请求头
    let response = client.get(url)
        // 设置 User-Agent (模拟 Chrome 浏览器)
        .header(header::USER_AGENT, "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
        // 设置 Host
        .header(header::HOST, host)
        .send()
        .await;

    match response {
        Ok(resp) => {
            // 建议增加一个状态码检查，防止 403/500 等错误被当作 JSON 解析
            if resp.status().is_success() {
                resp.json().await.unwrap_or(serde_json::json!({"error": "parse error"}))
            } else {
                serde_json::json!({
                    "error": format!("API returned status: {}", resp.status()),
                    "url": url
                })
            }
        },
        Err(e) => serde_json::json!({"error": e.to_string()}),
    }
}