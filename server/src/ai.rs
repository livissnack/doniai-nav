use crate::auth::{user_id_from_session, AuthState};
use crate::notes::NotesState;
use axum::{
    extract::State,
    http::{HeaderMap, StatusCode},
    routing::post,
    Json, Router,
};
use serde::{Deserialize, Serialize};
use std::env;

#[derive(Clone)]
pub struct AiState {
    auth: AuthState,
    notes: NotesState,
    http: reqwest::Client,
}

#[derive(Debug, Deserialize)]
struct ChatTurn {
    role: String,
    content: String,
}

#[derive(Debug, Deserialize)]
struct CompleteBody {
    /// continue | expand | polish | fix | summarize | translate_zh | translate_en | custom | chat
    action: String,
    #[serde(default)]
    text: String,
    #[serde(default)]
    instruction: String,
    #[serde(default)]
    title: String,
    #[serde(default)]
    selection: String,
    #[serde(default)]
    messages: Vec<ChatTurn>,
}

#[derive(Debug, Serialize)]
struct ApiBody {
    ok: bool,
    message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    content: Option<String>,
}

#[derive(Debug, Serialize)]
struct DsMessage {
    role: String,
    content: String,
}

#[derive(Debug, Serialize)]
struct DsRequest {
    model: String,
    messages: Vec<DsMessage>,
    temperature: f32,
    max_tokens: u32,
}

#[derive(Debug, Deserialize)]
struct DsChoiceMessage {
    content: Option<String>,
}

#[derive(Debug, Deserialize)]
struct DsChoice {
    message: DsChoiceMessage,
}

#[derive(Debug, Deserialize)]
struct DsResponse {
    choices: Option<Vec<DsChoice>>,
    error: Option<DsError>,
}

#[derive(Debug, Deserialize)]
struct DsError {
    message: Option<String>,
}

type AiResponse = (StatusCode, Json<ApiBody>);

fn err(msg: &str, status: StatusCode) -> AiResponse {
    (
        status,
        Json(ApiBody {
            ok: false,
            message: msg.into(),
            content: None,
        }),
    )
}

fn ok(content: String) -> AiResponse {
    (
        StatusCode::OK,
        Json(ApiBody {
            ok: true,
            message: "ok".into(),
            content: Some(content),
        }),
    )
}

fn chat_system_prompt(title: &str, doc: &str, selection: &str) -> String {
    let title = if title.trim().is_empty() {
        "无"
    } else {
        title.trim()
    };
    let mut s = String::from(
        "你是嵌入「云笔记」Markdown 编辑器中的 DeepSeek 写作助手。用简洁中文对话。\n\
         当用户要求修改、生成或改写正文时，必须把最终要写入编辑器的 Markdown 放在如下标记中：\n\
         <<<APPLY mode=\"replace|insert|append\">>>\n\
         （这里是完整 Markdown 正文）\n\
         <<<END>>>\n\
         mode 含义：replace=替换全文或当前选区；insert=在光标处插入；append=追加到文末。\n\
         标记外可附简短说明。不要用多余代码围栏包裹整个 APPLY 块。\n\
         若只是问答、不改文档，则不要输出 APPLY 标记。\n\n",
    );
    s.push_str(&format!("当前笔记标题：{}\n", title));
    if !selection.trim().is_empty() {
        s.push_str("用户当前选中的内容：\n```markdown\n");
        s.push_str(selection.trim());
        s.push_str("\n```\n\n");
    }
    let doc = doc.trim();
    if !doc.is_empty() {
        let clipped = if doc.chars().count() > 12000 {
            let end: String = doc.chars().take(12000).collect();
            format!("{}…\n（正文过长，已截断）", end)
        } else {
            doc.to_string()
        };
        s.push_str("当前全文：\n```markdown\n");
        s.push_str(&clipped);
        s.push_str("\n```\n");
    } else {
        s.push_str("当前全文为空。\n");
    }
    s
}

fn build_prompt(body: &CompleteBody) -> Result<(String, String), &'static str> {
    let text = body.text.trim();
    let custom = body.instruction.trim();
    let title = body.title.trim();

    let system = "你是专业的中文 Markdown 写作助手。只输出最终 Markdown 正文，不要解释、不要包裹多余代码围栏（除非用户原文就是代码块）。保持合适的标题层级与列表格式。";

    let user = match body.action.trim() {
        "continue" => {
            if text.is_empty() {
                return Err("请先输入或选中一段文字再续写");
            }
            format!(
                "请基于以下 Markdown 内容自然续写，风格保持一致，直接输出续写部分（不要重复原文）：\n\n标题：{}\n\n{}",
                if title.is_empty() { "无" } else { title },
                text
            )
        }
        "expand" => {
            if text.is_empty() {
                return Err("请先选中或输入要扩写的内容");
            }
            format!("请扩写以下 Markdown 内容，丰富细节但不要跑题，直接输出完整扩写结果：\n\n{}", text)
        }
        "polish" => {
            if text.is_empty() {
                return Err("请先选中或输入要润色的内容");
            }
            format!("请润色以下 Markdown 内容，使表达更清晰流畅，保留原意与结构，直接输出润色后的全文：\n\n{}", text)
        }
        "fix" => {
            if text.is_empty() {
                return Err("请先选中或输入要纠错的内容");
            }
            format!("请修正以下 Markdown 中的错别字、语法与标点问题，尽量少改动原意，直接输出修正后的全文：\n\n{}", text)
        }
        "summarize" => {
            if text.is_empty() {
                return Err("请先选中或输入要总结的内容");
            }
            format!("请将以下 Markdown 总结为简洁要点列表，直接输出：\n\n{}", text)
        }
        "translate_zh" => {
            if text.is_empty() {
                return Err("请先选中或输入要翻译的内容");
            }
            format!("请将以下内容翻译成流畅中文 Markdown，直接输出译文：\n\n{}", text)
        }
        "translate_en" => {
            if text.is_empty() {
                return Err("请先选中或输入要翻译的内容");
            }
            format!("请将以下内容翻译成自然英文 Markdown，直接输出译文：\n\n{}", text)
        }
        "custom" => {
            if custom.is_empty() {
                return Err("请输入自定义指令");
            }
            if text.is_empty() {
                format!(
                    "页面标题：{}\n\n用户指令：{}\n\n请按指令生成 Markdown 内容，直接输出。",
                    if title.is_empty() { "无" } else { title },
                    custom
                )
            } else {
                format!(
                    "用户指令：{}\n\n请对以下 Markdown 执行该指令，直接输出结果：\n\n{}",
                    custom, text
                )
            }
        }
        "chat" => {
            return Err("chat");
        }
        _ => return Err("不支持的 AI 操作"),
    };

    Ok((system.into(), user))
}

fn resolve_api_key(state: &AiState, user_id: u64) -> String {
    let user_key = state.notes.deepseek_api_key_for(user_id);
    if !user_key.is_empty() {
        return user_key;
    }
    env::var("DEEPSEEK_API_KEY")
        .unwrap_or_default()
        .trim()
        .to_string()
}

pub fn init_state(auth: AuthState, notes: NotesState) -> AiState {
    AiState {
        auth,
        notes,
        http: reqwest::Client::new(),
    }
}

pub fn router(state: AiState) -> Router {
    Router::new()
        .route("/deepseek/complete", post(complete))
        .with_state(state)
}

fn build_messages(body: &CompleteBody) -> Result<Vec<DsMessage>, &'static str> {
    if body.action.trim() == "chat" {
        let last = body
            .messages
            .iter()
            .rev()
            .find(|m| m.role == "user" && !m.content.trim().is_empty());
        if last.is_none() && body.instruction.trim().is_empty() {
            return Err("请输入对话内容");
        }
        let mut msgs = vec![DsMessage {
            role: "system".into(),
            content: chat_system_prompt(&body.title, &body.text, &body.selection),
        }];
        for m in &body.messages {
            let role = m.role.trim();
            if role != "user" && role != "assistant" {
                continue;
            }
            let content = m.content.trim();
            if content.is_empty() {
                continue;
            }
            msgs.push(DsMessage {
                role: role.into(),
                content: content.into(),
            });
        }
        if let Some(inst) = Some(body.instruction.trim()).filter(|s| !s.is_empty()) {
            let has_same = body
                .messages
                .last()
                .map(|m| m.role == "user" && m.content.trim() == inst)
                .unwrap_or(false);
            if !has_same {
                msgs.push(DsMessage {
                    role: "user".into(),
                    content: inst.into(),
                });
            }
        }
        if msgs.len() < 2 {
            return Err("请输入对话内容");
        }
        return Ok(msgs);
    }

    let (system, user) = build_prompt(body)?;
    Ok(vec![
        DsMessage {
            role: "system".into(),
            content: system,
        },
        DsMessage {
            role: "user".into(),
            content: user,
        },
    ])
}

async fn complete(
    State(state): State<AiState>,
    headers: HeaderMap,
    Json(body): Json<CompleteBody>,
) -> AiResponse {
    let user_id = match user_id_from_session(&state.auth, &headers) {
        Some(id) => id,
        None => return err("请先登录", StatusCode::UNAUTHORIZED),
    };

    let api_key = resolve_api_key(&state, user_id);
    if api_key.is_empty() {
        return err(
            "未配置 DeepSeek 秘钥：请在笔记页「AI 设置」中填写，或由管理员配置 DEEPSEEK_API_KEY",
            StatusCode::SERVICE_UNAVAILABLE,
        );
    }

    let messages = match build_messages(&body) {
        Ok(v) => v,
        Err(msg) => return err(msg, StatusCode::BAD_REQUEST),
    };

    let model = env::var("DEEPSEEK_MODEL").unwrap_or_else(|_| "deepseek-chat".into());
    let base = env::var("DEEPSEEK_BASE_URL")
        .unwrap_or_else(|_| "https://api.deepseek.com".into())
        .trim_end_matches('/')
        .to_string();

    let req = DsRequest {
        model,
        messages,
        temperature: 0.7,
        max_tokens: 4096,
    };

    let resp = match state
        .http
        .post(format!("{}/chat/completions", base))
        .bearer_auth(&api_key)
        .header("Content-Type", "application/json")
        .json(&req)
        .send()
        .await
    {
        Ok(r) => r,
        Err(e) => return err(&format!("请求 DeepSeek 失败: {}", e), StatusCode::BAD_GATEWAY),
    };

    let status = resp.status();
    let parsed: DsResponse = match resp.json().await {
        Ok(v) => v,
        Err(_) => return err("DeepSeek 返回无法解析", StatusCode::BAD_GATEWAY),
    };

    if let Some(e) = parsed.error {
        return err(
            e.message.as_deref().unwrap_or("DeepSeek 接口错误"),
            StatusCode::BAD_GATEWAY,
        );
    }

    if !status.is_success() {
        return err("DeepSeek 请求失败", StatusCode::BAD_GATEWAY);
    }

    let content = parsed
        .choices
        .and_then(|c| c.into_iter().next())
        .and_then(|c| c.message.content)
        .unwrap_or_default()
        .trim()
        .to_string();

    if content.is_empty() {
        return err("模型未返回内容", StatusCode::BAD_GATEWAY);
    }

    ok(content)
}
