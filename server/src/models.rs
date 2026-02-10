use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct AggregatedData {
    pub news: serde_json::Value,
    pub exchange_rate: serde_json::Value,
    pub fuel_price: serde_json::Value,
    pub weather: serde_json::Value,
    pub bing: serde_json::Value,
    pub music: serde_json::Value,
    pub updated_at: String,
}

impl AggregatedData {
    #[allow(dead_code)]
    pub fn empty() -> Self {
        Self {
            news: serde_json::json!({"error": "no data"}),
            exchange_rate: serde_json::json!({"error": "no data"}),
            fuel_price: serde_json::json!({"error": "no data"}),
            weather: serde_json::json!({"error": "no data"}),
            bing: serde_json::json!({"error": "no data"}),
            music: serde_json::json!({"error": "no data"}),
            updated_at: "Never".to_string(),
        }
    }
}