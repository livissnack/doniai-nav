use crate::captcha::CaptchaState;
use axum::{
    extract::{Path, Request, State},
    http::StatusCode,
    middleware::{self, Next},
    response::{IntoResponse, Response},
    routing::{get, post, put},
    Extension, Json, Router,
};
use argon2::{
    password_hash::{PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header as JwtHeader, Validation};
use rand_core::OsRng;
use serde::{Deserialize, Serialize};
use std::{
    collections::HashMap,
    env,
    fs,
    sync::{Arc, RwLock},
    time::{SystemTime, UNIX_EPOCH},
};

const USERS_FILE: &str = "auth_users.json";
pub const ADMIN_EMAIL: &str = "admin@doniai.com";
pub const TOKEN_HEADER: &str = "x-session-token";
/// JWT 有效期：30 天
const JWT_EXPIRE_SECS: i64 = 30 * 24 * 3600;

#[derive(Clone)]
pub struct AuthState {
    pub db: Arc<RwLock<AuthDb>>,
    pub jwt_secret: String,
    pub captcha: CaptchaState,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SidebarPanels {
    #[serde(default = "default_true")]
    pub news: bool,
    #[serde(default = "default_true")]
    pub tools: bool,
    #[serde(default = "default_true")]
    pub music: bool,
    #[serde(default = "default_true")]
    pub weather: bool,
    #[serde(default = "default_true")]
    pub todo: bool,
    #[serde(default = "default_true")]
    pub price: bool,
}

fn default_true() -> bool {
    true
}

impl Default for SidebarPanels {
    fn default() -> Self {
        Self {
            news: true,
            tools: true,
            music: true,
            weather: true,
            todo: true,
            price: true,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct UserRecord {
    id: u64,
    username: String,
    email: String,
    password_hash: String,
    #[serde(rename = "displayName")]
    display_name: String,
    #[serde(default)]
    sidebar_panels: SidebarPanels,
    #[serde(default = "default_true")]
    enabled: bool,
    #[serde(default, rename = "isAdmin")]
    is_admin: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuthDb {
    #[serde(default = "default_true", rename = "registrationEnabled")]
    registration_enabled: bool,
    users: Vec<UserRecord>,
}

#[derive(Debug, Serialize)]
pub struct UserPublic {
    pub id: u64,
    pub username: String,
    pub email: String,
    #[serde(rename = "displayName")]
    pub display_name: String,
    #[serde(rename = "isAdmin")]
    pub is_admin: bool,
}

#[derive(Debug, Serialize)]
struct AdminUserPublic {
    id: u64,
    username: String,
    email: String,
    #[serde(rename = "displayName")]
    display_name: String,
    enabled: bool,
    #[serde(rename = "isAdmin")]
    is_admin: bool,
}

#[derive(Debug, Serialize)]
struct AuthApiBody {
    ok: bool,
    message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    user: Option<UserPublic>,
    #[serde(skip_serializing_if = "Option::is_none")]
    token: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none", rename = "sidebarPanels")]
    sidebar_panels: Option<HashMap<String, bool>>,
}

type AuthResponse = (StatusCode, Json<AuthApiBody>);

#[derive(Debug, Deserialize)]
pub struct RegisterBody {
    pub username: String,
    pub email: String,
    pub password: String,
    #[serde(rename = "displayName")]
    pub display_name: Option<String>,
    #[serde(rename = "captchaId")]
    pub captcha_id: String,
    #[serde(rename = "captchaCode")]
    pub captcha_code: String,
}

#[derive(Debug, Serialize)]
struct CaptchaApiBody {
    ok: bool,
    message: String,
    #[serde(rename = "captchaId", skip_serializing_if = "Option::is_none")]
    captcha_id: Option<String>,
    #[serde(rename = "captchaImage", skip_serializing_if = "Option::is_none")]
    captcha_image: Option<String>,
}

type CaptchaResponse = (StatusCode, Json<CaptchaApiBody>);

#[derive(Debug, Deserialize)]
pub struct LoginBody {
    pub email: String,
    pub password: String,
}

#[derive(Debug, Deserialize)]
pub struct PanelsBody {
    pub panels: HashMap<String, bool>,
}

#[derive(Debug, Deserialize)]
pub struct ChangePasswordBody {
    #[serde(rename = "currentPassword")]
    pub current_password: String,
    #[serde(rename = "newPassword")]
    pub new_password: String,
}

#[derive(Debug, Serialize)]
struct PublicSettingsBody {
    ok: bool,
    message: String,
    #[serde(rename = "registrationEnabled")]
    registration_enabled: bool,
}

#[derive(Debug, Serialize)]
struct AdminApiBody {
    ok: bool,
    message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    users: Option<Vec<AdminUserPublic>>,
    #[serde(rename = "registrationEnabled", skip_serializing_if = "Option::is_none")]
    registration_enabled: Option<bool>,
}

#[derive(Debug, Deserialize)]
struct SetUserEnabledBody {
    enabled: bool,
}

#[derive(Debug, Deserialize)]
struct RegistrationSettingsBody {
    #[serde(rename = "registrationEnabled")]
    registration_enabled: bool,
}

type AdminResponse = (StatusCode, Json<AdminApiBody>);

#[derive(Debug, Serialize, Deserialize)]
struct Claims {
    sub: u64,
    exp: usize,
}

fn now_secs() -> i64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_secs() as i64)
        .unwrap_or(0)
}

fn hash_password(password: &str) -> Result<String, String> {
    let salt = SaltString::generate(&mut OsRng);
    Argon2::default()
        .hash_password(password.as_bytes(), &salt)
        .map(|h| h.to_string())
        .map_err(|e| e.to_string())
}

fn verify_password(password: &str, hash: &str) -> bool {
    let Ok(parsed) = PasswordHash::new(hash) else {
        return false;
    };
    Argon2::default()
        .verify_password(password.as_bytes(), &parsed)
        .is_ok()
}

fn user_public(u: &UserRecord) -> UserPublic {
    UserPublic {
        id: u.id,
        username: u.username.clone(),
        email: u.email.clone(),
        display_name: u.display_name.clone(),
        is_admin: u.is_admin,
    }
}

fn admin_user_public(u: &UserRecord) -> AdminUserPublic {
    AdminUserPublic {
        id: u.id,
        username: u.username.clone(),
        email: u.email.clone(),
        display_name: u.display_name.clone(),
        enabled: u.enabled,
        is_admin: u.is_admin,
    }
}

fn is_admin_user(db: &AuthDb, user_id: u64) -> bool {
    find_user(db, user_id).map(|u| u.is_admin).unwrap_or(false)
}

fn migrate_db(mut db: AuthDb) -> AuthDb {
    for user in db.users.iter_mut() {
        if user.email.eq_ignore_ascii_case(ADMIN_EMAIL) {
            user.is_admin = true;
            user.enabled = true;
        }
    }
    db
}

fn panels_map(p: &SidebarPanels) -> HashMap<String, bool> {
    HashMap::from([
        ("news".into(), p.news),
        ("tools".into(), p.tools),
        ("music".into(), p.music),
        ("weather".into(), p.weather),
        ("todo".into(), p.todo),
        ("price".into(), p.price),
    ])
}

fn apply_panels(panels: &mut SidebarPanels, patch: &HashMap<String, bool>) {
    for (k, v) in patch {
        match k.as_str() {
            "news" => panels.news = *v,
            "tools" => panels.tools = *v,
            "music" => panels.music = *v,
            "weather" => panels.weather = *v,
            "todo" => panels.todo = *v,
            "price" => panels.price = *v,
            _ => {}
        }
    }
}

fn next_user_id(db: &AuthDb) -> u64 {
    db.users.iter().map(|u| u.id).max().unwrap_or(0).saturating_add(1)
}

fn save_db(db: &AuthDb) {
    if let Ok(json) = serde_json::to_string_pretty(db) {
        let _ = fs::write(users_file_path(), json);
    }
}

fn users_file_path() -> String {
    env::var("AUTH_USERS_FILE").unwrap_or_else(|_| USERS_FILE.into())
}

fn load_db() -> AuthDb {
    let path = users_file_path();
    if let Ok(content) = fs::read_to_string(&path) {
        if let Ok(db) = serde_json::from_str::<AuthDb>(&content) {
            if !db.users.is_empty() {
                let db = migrate_db(db);
                save_db(&db);
                return db;
            }
        }
    }
    seed_default_admin()
}

fn seed_default_admin() -> AuthDb {
    let hash = hash_password("admin123").unwrap_or_default();
    let db = AuthDb {
        registration_enabled: true,
        users: vec![UserRecord {
            id: 1,
            username: "admin".into(),
            email: ADMIN_EMAIL.into(),
            password_hash: hash,
            display_name: "管理员".into(),
            sidebar_panels: SidebarPanels::default(),
            enabled: true,
            is_admin: true,
        }],
    };
    save_db(&db);
    db
}

pub fn init_state() -> AuthState {
    let jwt_secret = env::var("JWT_SECRET")
        .unwrap_or_else(|_| "doniai-nav-jwt-change-in-production".into());
    AuthState {
        db: Arc::new(RwLock::new(load_db())),
        jwt_secret,
        captcha: crate::captcha::init_state(),
    }
}

fn issue_token(state: &AuthState, user_id: u64) -> Result<String, String> {
    let exp = (now_secs() + JWT_EXPIRE_SECS) as usize;
    let claims = Claims { sub: user_id, exp };
    encode(
        &JwtHeader::default(),
        &claims,
        &EncodingKey::from_secret(state.jwt_secret.as_bytes()),
    )
    .map_err(|e| e.to_string())
}

pub fn verify_token(state: &AuthState, token: &str) -> Option<u64> {
    let data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(state.jwt_secret.as_bytes()),
        &Validation::default(),
    )
    .ok()?;
    Some(data.claims.sub)
}

fn find_user<'a>(db: &'a AuthDb, id: u64) -> Option<&'a UserRecord> {
    db.users.iter().find(|u| u.id == id)
}

fn find_user_mut<'a>(db: &'a mut AuthDb, id: u64) -> Option<&'a mut UserRecord> {
    db.users.iter_mut().find(|u| u.id == id)
}

fn ok_json(
    status: StatusCode,
    message: &str,
    user: Option<UserPublic>,
    token: Option<String>,
    panels: Option<HashMap<String, bool>>,
) -> AuthResponse {
    (
        status,
        Json(AuthApiBody {
            ok: true,
            message: message.into(),
            user,
            token,
            sidebar_panels: panels,
        }),
    )
}

fn err_json(status: StatusCode, message: &str) -> AuthResponse {
    (
        status,
        Json(AuthApiBody {
            ok: false,
            message: message.into(),
            user: None,
            token: None,
            sidebar_panels: None,
        }),
    )
}

pub fn router(state: AuthState) -> Router {
    let protected = Router::new()
        .route("/me", get(me_handler))
        .route("/panels", get(get_panels_handler).put(put_panels_handler))
        .route("/logout", post(logout_handler))
        .route("/password", put(change_password_handler))
        .route("/admin/users", get(admin_list_users))
        .route("/admin/users/:id/enabled", put(admin_set_user_enabled))
        .route("/admin/settings", get(admin_get_settings).put(admin_put_settings))
        .route_layer(middleware::from_fn_with_state(state.clone(), session_middleware));

    Router::new()
        .route("/public-settings", get(public_settings_handler))
        .route("/captcha", get(captcha_handler))
        .route("/register", post(register_handler))
        .route("/login", post(login_handler))
        .merge(protected)
        .with_state(state)
}

fn admin_ok(
    message: &str,
    users: Option<Vec<AdminUserPublic>>,
    registration_enabled: Option<bool>,
) -> AdminResponse {
    (
        StatusCode::OK,
        Json(AdminApiBody {
            ok: true,
            message: message.into(),
            users,
            registration_enabled,
        }),
    )
}

fn admin_err(message: &str, status: StatusCode) -> AdminResponse {
    (
        status,
        Json(AdminApiBody {
            ok: false,
            message: message.into(),
            users: None,
            registration_enabled: None,
        }),
    )
}

fn require_admin(state: &AuthState, user_id: u64) -> Result<(), AdminResponse> {
    let db = state.db.read().unwrap();
    if !is_admin_user(&db, user_id) {
        return Err(admin_err("需要管理员权限", StatusCode::FORBIDDEN));
    }
    Ok(())
}

async fn public_settings_handler(State(state): State<AuthState>) -> impl IntoResponse {
    use axum::http::{header, HeaderValue};

    let db = state.db.read().unwrap();
    let mut response = (
        StatusCode::OK,
        Json(PublicSettingsBody {
            ok: true,
            message: "ok".into(),
            registration_enabled: db.registration_enabled,
        }),
    )
        .into_response();
    response.headers_mut().insert(
        header::CACHE_CONTROL,
        HeaderValue::from_static("public, max-age=60"),
    );
    response
}

async fn admin_list_users(
    State(state): State<AuthState>,
    Extension(user_id): Extension<u64>,
) -> AdminResponse {
    if let Err(r) = require_admin(&state, user_id) {
        return r;
    }
    let db = state.db.read().unwrap();
    let users: Vec<AdminUserPublic> = db.users.iter().map(admin_user_public).collect();
    admin_ok("ok", Some(users), None)
}

async fn admin_set_user_enabled(
    State(state): State<AuthState>,
    Extension(user_id): Extension<u64>,
    Path(id): Path<u64>,
    Json(body): Json<SetUserEnabledBody>,
) -> AdminResponse {
    if let Err(r) = require_admin(&state, user_id) {
        return r;
    }

    let mut db = state.db.write().unwrap();
    let Some(user) = find_user(&db, id) else {
        return admin_err("用户不存在", StatusCode::NOT_FOUND);
    };
    if user.is_admin {
        return admin_err("不能禁用管理员账号", StatusCode::BAD_REQUEST);
    }

    let Some(user) = find_user_mut(&mut db, id) else {
        return admin_err("用户不存在", StatusCode::NOT_FOUND);
    };
    user.enabled = body.enabled;
    save_db(&db);

    let msg = if body.enabled {
        "用户已启用"
    } else {
        "用户已禁用"
    };
    admin_ok(msg, None, None)
}

async fn admin_get_settings(
    State(state): State<AuthState>,
    Extension(user_id): Extension<u64>,
) -> AdminResponse {
    if let Err(r) = require_admin(&state, user_id) {
        return r;
    }
    let db = state.db.read().unwrap();
    admin_ok("ok", None, Some(db.registration_enabled))
}

async fn admin_put_settings(
    State(state): State<AuthState>,
    Extension(user_id): Extension<u64>,
    Json(body): Json<RegistrationSettingsBody>,
) -> AdminResponse {
    if let Err(r) = require_admin(&state, user_id) {
        return r;
    }
    let mut db = state.db.write().unwrap();
    db.registration_enabled = body.registration_enabled;
    save_db(&db);
    let msg = if body.registration_enabled {
        "已开放注册"
    } else {
        "已关闭注册"
    };
    admin_ok(msg, None, Some(db.registration_enabled))
}

async fn captcha_handler(State(state): State<AuthState>) -> CaptchaResponse {
    match state.captcha.issue() {
        Ok((id, image)) => (
            StatusCode::OK,
            Json(CaptchaApiBody {
                ok: true,
                message: "ok".into(),
                captcha_id: Some(id),
                captcha_image: Some(image),
            }),
        ),
        Err(msg) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(CaptchaApiBody {
                ok: false,
                message: msg.into(),
                captcha_id: None,
                captcha_image: None,
            }),
        ),
    }
}

async fn register_handler(
    State(state): State<AuthState>,
    Json(body): Json<RegisterBody>,
) -> AuthResponse {
    {
        let db = state.db.read().unwrap();
        if !db.registration_enabled {
            return err_json(StatusCode::FORBIDDEN, "注册功能已关闭，请联系管理员");
        }
    }

    if let Err(msg) = state.captcha.verify(&body.captcha_id, &body.captcha_code) {
        return err_json(StatusCode::BAD_REQUEST, msg);
    }

    let username = body.username.trim();
    let email = body.email.trim().to_lowercase();
    let password = body.password.trim();

    if username.len() < 2 {
        return err_json(StatusCode::BAD_REQUEST, "用户名至少 2 个字符");
    }
    if !email.contains('@') || !email.contains('.') {
        return err_json(StatusCode::BAD_REQUEST, "请输入有效邮箱");
    }
    if password.len() < 6 {
        return err_json(StatusCode::BAD_REQUEST, "密码至少 6 位");
    }

    let mut db = state.db.write().unwrap();
    if db.users.iter().any(|u| u.username == username) {
        return err_json(StatusCode::CONFLICT, "用户名已存在");
    }
    if db.users.iter().any(|u| u.email == email) {
        return err_json(StatusCode::CONFLICT, "邮箱已被注册");
    }

    let password_hash = match hash_password(password) {
        Ok(h) => h,
        Err(_) => return err_json(StatusCode::INTERNAL_SERVER_ERROR, "密码加密失败"),
    };

    let id = next_user_id(&db);
    let display_name = body
        .display_name
        .filter(|s| !s.trim().is_empty())
        .unwrap_or_else(|| username.to_string());

    let user = UserRecord {
        id,
        username: username.to_string(),
        email: email.clone(),
        password_hash,
        display_name: display_name.trim().to_string(),
        sidebar_panels: SidebarPanels::default(),
        enabled: true,
        is_admin: false,
    };

    let public = user_public(&user);
    let panels = panels_map(&user.sidebar_panels);
    db.users.push(user);
    save_db(&db);
    drop(db);

    let token = match issue_token(&state, id) {
        Ok(t) => t,
        Err(_) => return err_json(StatusCode::INTERNAL_SERVER_ERROR, "签发令牌失败"),
    };

    ok_json(
        StatusCode::OK,
        "注册成功",
        Some(public),
        Some(token),
        Some(panels),
    )
}

async fn login_handler(
    State(state): State<AuthState>,
    Json(body): Json<LoginBody>,
) -> AuthResponse {
    let email = body.email.trim().to_lowercase();
    let password = body.password.trim();

    if email.is_empty() || password.is_empty() {
        return err_json(StatusCode::BAD_REQUEST, "请输入邮箱和密码");
    }

    let db = state.db.read().unwrap();
    let found = db.users.iter().find(|u| u.email == email);

    let Some(user) = found else {
        return err_json(StatusCode::UNAUTHORIZED, "邮箱或密码错误");
    };

    if !verify_password(password, &user.password_hash) {
        return err_json(StatusCode::UNAUTHORIZED, "邮箱或密码错误");
    }

    if !user.enabled {
        return err_json(StatusCode::FORBIDDEN, "账号已被禁用，请联系管理员");
    }

    let public = user_public(user);
    let panels = panels_map(&user.sidebar_panels);
    let user_id = user.id;
    drop(db);

    let token = match issue_token(&state, user_id) {
        Ok(t) => t,
        Err(_) => return err_json(StatusCode::INTERNAL_SERVER_ERROR, "签发令牌失败"),
    };

    ok_json(
        StatusCode::OK,
        "登录成功",
        Some(public),
        Some(token),
        Some(panels),
    )
}

async fn me_handler(
    State(state): State<AuthState>,
    Extension(user_id): Extension<u64>,
) -> AuthResponse {
    let db = state.db.read().unwrap();
    let Some(user) = find_user(&db, user_id) else {
        return err_json(StatusCode::UNAUTHORIZED, "用户不存在或已失效");
    };
    let public = user_public(user);
    let panels = panels_map(&user.sidebar_panels);
    ok_json(StatusCode::OK, "ok", Some(public), None, Some(panels))
}

async fn get_panels_handler(
    State(state): State<AuthState>,
    Extension(user_id): Extension<u64>,
) -> AuthResponse {
    let db = state.db.read().unwrap();
    let Some(user) = find_user(&db, user_id) else {
        return err_json(StatusCode::UNAUTHORIZED, "用户不存在或已失效");
    };
    ok_json(
        StatusCode::OK,
        "ok",
        None,
        None,
        Some(panels_map(&user.sidebar_panels)),
    )
}

async fn put_panels_handler(
    State(state): State<AuthState>,
    Extension(user_id): Extension<u64>,
    Json(body): Json<PanelsBody>,
) -> AuthResponse {
    let mut db = state.db.write().unwrap();
    let Some(user) = find_user_mut(&mut db, user_id) else {
        return err_json(StatusCode::UNAUTHORIZED, "用户不存在或已失效");
    };
    apply_panels(&mut user.sidebar_panels, &body.panels);
    let panels = panels_map(&user.sidebar_panels);
    save_db(&db);
    ok_json(StatusCode::OK, "已保存", None, None, Some(panels))
}

async fn logout_handler() -> AuthResponse {
    ok_json(StatusCode::OK, "已退出", None, None, None)
}

async fn change_password_handler(
    State(state): State<AuthState>,
    Extension(user_id): Extension<u64>,
    Json(body): Json<ChangePasswordBody>,
) -> AuthResponse {
    let current = body.current_password.trim();
    let new_pass = body.new_password.trim();

    if current.is_empty() || new_pass.is_empty() {
        return err_json(StatusCode::BAD_REQUEST, "请填写当前密码和新密码");
    }
    if new_pass.len() < 6 {
        return err_json(StatusCode::BAD_REQUEST, "新密码至少 6 位");
    }
    if current == new_pass {
        return err_json(StatusCode::BAD_REQUEST, "新密码不能与当前密码相同");
    }

    let mut db = state.db.write().unwrap();
    let Some(user) = find_user_mut(&mut db, user_id) else {
        return err_json(StatusCode::UNAUTHORIZED, "用户不存在或已失效");
    };

    if !verify_password(current, &user.password_hash) {
        return err_json(StatusCode::UNAUTHORIZED, "当前密码不正确");
    }

    let password_hash = match hash_password(new_pass) {
        Ok(h) => h,
        Err(_) => return err_json(StatusCode::INTERNAL_SERVER_ERROR, "密码加密失败"),
    };

    user.password_hash = password_hash;
    save_db(&db);

    ok_json(StatusCode::OK, "密码已修改", None, None, None)
}

pub fn user_id_from_session(state: &AuthState, headers: &axum::http::HeaderMap) -> Option<u64> {
    let token = headers
        .get(TOKEN_HEADER)
        .and_then(|v| v.to_str().ok())
        .map(str::trim)
        .filter(|s| !s.is_empty())?;
    let user_id = verify_token(state, token)?;
    let db = state.db.read().unwrap();
    let user = find_user(&db, user_id)?;
    if !user.enabled {
        return None;
    }
    Some(user_id)
}

async fn session_middleware(
    State(state): State<AuthState>,
    mut req: Request,
    next: Next,
) -> Result<Response, axum::http::StatusCode> {
    let token = req
        .headers()
        .get(TOKEN_HEADER)
        .and_then(|v| v.to_str().ok())
        .map(str::trim)
        .filter(|s| !s.is_empty());

    let Some(token) = token else {
        return Err(axum::http::StatusCode::UNAUTHORIZED);
    };

    let Some(user_id) = verify_token(&state, token) else {
        return Err(axum::http::StatusCode::UNAUTHORIZED);
    };

    let enabled = {
        let db = state.db.read().unwrap();
        find_user(&db, user_id).map(|u| u.enabled)
    };
    match enabled {
        None => return Err(axum::http::StatusCode::UNAUTHORIZED),
        Some(false) => return Err(axum::http::StatusCode::FORBIDDEN),
        Some(true) => {}
    }

    req.extensions_mut().insert(user_id);
    Ok(next.run(req).await)
}
