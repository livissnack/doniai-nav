use base64::{engine::general_purpose::STANDARD as B64, Engine};
use captcha::{filters::Noise, Captcha};
use rand_core::{OsRng, RngCore};
use std::{
    collections::HashMap,
    sync::{Arc, RwLock},
    time::{SystemTime, UNIX_EPOCH},
};

const CAPTCHA_TTL_SECS: i64 = 300;
const MAX_STORED: usize = 500;

#[derive(Clone)]
pub struct CaptchaState {
    inner: Arc<RwLock<HashMap<String, CaptchaEntry>>>,
}

#[derive(Debug, Clone)]
struct CaptchaEntry {
    answer: String,
    expires_at: i64,
}

fn now_secs() -> i64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_secs() as i64)
        .unwrap_or(0)
}

fn normalize_answer(s: &str) -> String {
    s.trim().to_ascii_lowercase()
}

fn random_id() -> String {
    let mut buf = [0u8; 16];
    OsRng.fill_bytes(&mut buf);
    B64.encode(buf)
}

pub fn init_state() -> CaptchaState {
    CaptchaState {
        inner: Arc::new(RwLock::new(HashMap::new())),
    }
}

impl CaptchaState {
    pub fn issue(&self) -> Result<(String, String), &'static str> {
        self.purge_expired();

        let mut cap = Captcha::new();
        cap.add_chars(4)
            .apply_filter(Noise::new(0.35))
            .apply_filter(Noise::new(0.25))
            .view(140, 48);

        let answer = normalize_answer(&cap.chars_as_string());
        let b64 = cap.as_base64().ok_or("生成验证码失败")?;
        let image = format!("data:image/png;base64,{}", b64);
        let id = random_id();
        let expires_at = now_secs() + CAPTCHA_TTL_SECS;

        let mut store = self.inner.write().unwrap();
        if store.len() >= MAX_STORED {
            store.clear();
        }
        store.insert(
            id.clone(),
            CaptchaEntry {
                answer,
                expires_at,
            },
        );

        Ok((id, image))
    }

    pub fn verify(&self, id: &str, code: &str) -> Result<(), &'static str> {
        self.purge_expired();
        let id = id.trim();
        if id.is_empty() {
            return Err("请填写验证码");
        }
        let code = normalize_answer(code);
        if code.is_empty() {
            return Err("请填写验证码");
        }

        let mut store = self.inner.write().unwrap();
        let Some(entry) = store.remove(id) else {
            return Err("验证码已失效，请刷新后重试");
        };
        if entry.expires_at < now_secs() {
            return Err("验证码已过期，请刷新后重试");
        }
        if entry.answer != code {
            return Err("验证码错误");
        }
        Ok(())
    }

    fn purge_expired(&self) {
        let now = now_secs();
        let mut store = self.inner.write().unwrap();
        store.retain(|_, e| e.expires_at >= now);
    }
}
