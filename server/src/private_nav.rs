use crate::auth::{user_id_from_session, AuthState};
use axum::{
    extract::{Path, State},
    http::{HeaderMap, StatusCode},
    routing::{get, post, put},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use std::{
    collections::HashMap,
    env,
    fs,
    sync::{Arc, RwLock},
};

const NAV_STORE_FILE: &str = "private_nav_store.json";
const NAV_DEFAULT_FILE: &str = "private_nav_default.json";

#[derive(Clone)]
pub struct PrivateNavState {
    inner: Arc<RwLock<PrivateNavStore>>,
    auth: AuthState,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
struct PrivateNavStore {
    users: HashMap<String, UserNavData>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct UserNavData {
    categories: Vec<NavCategory>,
    #[serde(rename = "nextCategoryId", default = "default_next_id")]
    next_category_id: u64,
    #[serde(rename = "nextItemId", default = "default_next_id")]
    next_item_id: u64,
}

fn default_next_id() -> u64 {
    100
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NavCategory {
    pub id: u64,
    pub title: String,
    pub items: Vec<NavItem>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NavItem {
    #[serde(default)]
    pub id: u64,
    pub name: String,
    pub href: String,
    pub color: String,
    #[serde(rename = "isNotNewBlack", skip_serializing_if = "Option::is_none")]
    pub is_not_new_black: Option<bool>,
}

#[derive(Debug, Serialize)]
struct NavApiBody {
    ok: bool,
    message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    categories: Option<Vec<NavCategory>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    category: Option<NavCategory>,
    #[serde(skip_serializing_if = "Option::is_none")]
    item: Option<NavItem>,
}

#[derive(Debug, Deserialize)]
struct CategoryBody {
    title: String,
}

#[derive(Debug, Deserialize)]
struct ItemBody {
    name: String,
    href: String,
    #[serde(default = "default_color")]
    color: String,
    #[serde(rename = "isNotNewBlack", default)]
    is_not_new_black: bool,
}

fn default_color() -> String {
    "is-primary".into()
}

type NavResponse = (StatusCode, Json<NavApiBody>);

fn store_path() -> String {
    env::var("PRIVATE_NAV_STORE_FILE").unwrap_or_else(|_| NAV_STORE_FILE.into())
}

fn default_path() -> String {
    env::var("PRIVATE_NAV_DEFAULT_FILE").unwrap_or_else(|_| NAV_DEFAULT_FILE.into())
}

fn save_store(store: &PrivateNavStore) {
    if let Ok(json) = serde_json::to_string_pretty(store) {
        let _ = fs::write(store_path(), json);
    }
}

fn load_store() -> PrivateNavStore {
    let path = store_path();
    if let Ok(content) = fs::read_to_string(&path) {
        if let Ok(store) = serde_json::from_str(&content) {
            return store;
        }
    }
    PrivateNavStore::default()
}

fn assign_missing_ids(categories: &mut [NavCategory], next_item: &mut u64) {
    for cat in categories.iter_mut() {
        for item in cat.items.iter_mut() {
            if item.id == 0 {
                *next_item = (*next_item).max(1);
                item.id = *next_item;
                *next_item += 1;
            }
        }
    }
}

fn load_default_categories() -> Vec<NavCategory> {
    let path = default_path();
    if let Ok(content) = fs::read_to_string(&path) {
        if let Ok(mut cats) = serde_json::from_str::<Vec<NavCategory>>(&content) {
            let mut next_item = 1u64;
            assign_missing_ids(&mut cats, &mut next_item);
            return cats;
        }
    }
    vec![]
}

fn max_ids(categories: &[NavCategory]) -> (u64, u64) {
    let mut max_cat = 0u64;
    let mut max_item = 0u64;
    for c in categories {
        max_cat = max_cat.max(c.id);
        for i in &c.items {
            max_item = max_item.max(i.id);
        }
    }
    (max_cat, max_item)
}

fn empty_user_nav_data() -> UserNavData {
    UserNavData {
        categories: vec![],
        next_category_id: 1,
        next_item_id: 1,
    }
}

fn ensure_user_nav(store: &mut PrivateNavStore, user_id: u64) -> &mut UserNavData {
    let key = user_id.to_string();
    if !store.users.contains_key(&key) {
        store.users.insert(key.clone(), empty_user_nav_data());
        save_store(store);
    }
    store.users.get_mut(&key).unwrap()
}

fn ok_categories(message: &str, categories: Vec<NavCategory>) -> NavResponse {
    (
        StatusCode::OK,
        Json(NavApiBody {
            ok: true,
            message: message.into(),
            categories: Some(categories),
            category: None,
            item: None,
        }),
    )
}

fn ok_category(message: &str, category: NavCategory) -> NavResponse {
    (
        StatusCode::OK,
        Json(NavApiBody {
            ok: true,
            message: message.into(),
            categories: None,
            category: Some(category),
            item: None,
        }),
    )
}

fn ok_item(message: &str, item: NavItem) -> NavResponse {
    (
        StatusCode::OK,
        Json(NavApiBody {
            ok: true,
            message: message.into(),
            categories: None,
            category: None,
            item: Some(item),
        }),
    )
}

fn err(message: &str, status: StatusCode) -> NavResponse {
    (
        status,
        Json(NavApiBody {
            ok: false,
            message: message.into(),
            categories: None,
            category: None,
            item: None,
        }),
    )
}

fn require_user(state: &PrivateNavState, headers: &HeaderMap) -> Result<u64, NavResponse> {
    user_id_from_session(&state.auth, headers)
        .ok_or_else(|| err("请先登录", StatusCode::UNAUTHORIZED))
}

fn normalize_color(color: &str) -> String {
    let c = color.trim();
    if ["is-primary", "is-success", "is-danger", "is-warning", "is-info"].contains(&c) {
        c.to_string()
    } else {
        "is-primary".into()
    }
}

fn find_item_indices(data: &UserNavData, item_id: u64) -> Option<(usize, usize)> {
    for (ci, cat) in data.categories.iter().enumerate() {
        if let Some(ii) = cat.items.iter().position(|i| i.id == item_id) {
            return Some((ci, ii));
        }
    }
    None
}

pub fn init_state(auth: AuthState) -> PrivateNavState {
    PrivateNavState {
        inner: Arc::new(RwLock::new(load_store())),
        auth,
    }
}

pub fn router(state: PrivateNavState) -> Router {
    Router::new()
        .route("/private", get(list_nav))
        .route("/private/reset", post(reset_nav))
        .route("/private/categories", post(create_category))
        .route("/private/categories/:id", put(update_category).delete(delete_category))
        .route("/private/categories/:cid/items", post(create_item))
        .route("/private/items/:id", put(update_item).delete(delete_item))
        .with_state(state)
}

async fn list_nav(State(state): State<PrivateNavState>, headers: HeaderMap) -> NavResponse {
    let user_id = match require_user(&state, &headers) {
        Ok(id) => id,
        Err(r) => return r,
    };
    let store = state.inner.read().unwrap();
    let key = user_id.to_string();
    if let Some(data) = store.users.get(&key) {
        return ok_categories("ok", data.categories.clone());
    }
    drop(store);

    let mut store = state.inner.write().unwrap();
    let data = ensure_user_nav(&mut store, user_id);
    ok_categories("ok", data.categories.clone())
}

async fn reset_nav(State(state): State<PrivateNavState>, headers: HeaderMap) -> NavResponse {
    let user_id = match require_user(&state, &headers) {
        Ok(id) => id,
        Err(r) => return r,
    };
    let categories = load_default_categories();
    let (max_cat, max_item) = max_ids(&categories);
    let mut store = state.inner.write().unwrap();
    store.users.insert(
        user_id.to_string(),
        UserNavData {
            categories: categories.clone(),
            next_category_id: max_cat.saturating_add(1).max(1),
            next_item_id: max_item.saturating_add(1).max(1),
        },
    );
    save_store(&store);
    ok_categories("已恢复默认导航", categories)
}

async fn create_category(
    State(state): State<PrivateNavState>,
    headers: HeaderMap,
    Json(body): Json<CategoryBody>,
) -> NavResponse {
    let user_id = match require_user(&state, &headers) {
        Ok(id) => id,
        Err(r) => return r,
    };
    let title = body.title.trim();
    if title.is_empty() {
        return err("请填写分类名称", StatusCode::BAD_REQUEST);
    }

    let mut store = state.inner.write().unwrap();
    let data = ensure_user_nav(&mut store, user_id);
    let id = data.next_category_id;
    data.next_category_id += 1;
    let category = NavCategory {
        id,
        title: title.to_string(),
        items: vec![],
    };
    data.categories.push(category);
    let categories = data.categories.clone();
    save_store(&store);
    ok_categories("分类已添加", categories)
}

async fn update_category(
    State(state): State<PrivateNavState>,
    headers: HeaderMap,
    Path(id): Path<u64>,
    Json(body): Json<CategoryBody>,
) -> NavResponse {
    let user_id = match require_user(&state, &headers) {
        Ok(id) => id,
        Err(r) => return r,
    };
    let title = body.title.trim();
    if title.is_empty() {
        return err("请填写分类名称", StatusCode::BAD_REQUEST);
    }

    let mut store = state.inner.write().unwrap();
    let data = ensure_user_nav(&mut store, user_id);
    let Some(cat) = data.categories.iter_mut().find(|c| c.id == id) else {
        return err("分类不存在", StatusCode::NOT_FOUND);
    };
    cat.title = title.to_string();
    let cloned = cat.clone();
    save_store(&store);
    ok_category("分类已更新", cloned)
}

async fn delete_category(
    State(state): State<PrivateNavState>,
    headers: HeaderMap,
    Path(id): Path<u64>,
) -> NavResponse {
    let user_id = match require_user(&state, &headers) {
        Ok(id) => id,
        Err(r) => return r,
    };

    let mut store = state.inner.write().unwrap();
    let data = ensure_user_nav(&mut store, user_id);
    let before = data.categories.len();
    data.categories.retain(|c| c.id != id);
    if data.categories.len() == before {
        return err("分类不存在", StatusCode::NOT_FOUND);
    }
    let categories = data.categories.clone();
    save_store(&store);
    ok_categories("分类已删除", categories)
}

async fn create_item(
    State(state): State<PrivateNavState>,
    headers: HeaderMap,
    Path(cid): Path<u64>,
    Json(body): Json<ItemBody>,
) -> NavResponse {
    let user_id = match require_user(&state, &headers) {
        Ok(id) => id,
        Err(r) => return r,
    };
    let name = body.name.trim();
    let href = body.href.trim();
    if name.is_empty() {
        return err("请填写站点名称", StatusCode::BAD_REQUEST);
    }
    if href.is_empty() {
        return err("请填写链接地址", StatusCode::BAD_REQUEST);
    }

    let mut store = state.inner.write().unwrap();
    let data = ensure_user_nav(&mut store, user_id);
    let Some(cat) = data.categories.iter_mut().find(|c| c.id == cid) else {
        return err("分类不存在", StatusCode::NOT_FOUND);
    };
    let id = data.next_item_id;
    data.next_item_id += 1;
    let item = NavItem {
        id,
        name: name.to_string(),
        href: href.to_string(),
        color: normalize_color(&body.color),
        is_not_new_black: if body.is_not_new_black { Some(true) } else { None },
    };
    cat.items.push(item.clone());
    save_store(&store);
    ok_item("导航已添加", item)
}

async fn update_item(
    State(state): State<PrivateNavState>,
    headers: HeaderMap,
    Path(id): Path<u64>,
    Json(body): Json<ItemBody>,
) -> NavResponse {
    let user_id = match require_user(&state, &headers) {
        Ok(id) => id,
        Err(r) => return r,
    };
    let name = body.name.trim();
    let href = body.href.trim();
    if name.is_empty() || href.is_empty() {
        return err("请填写名称和链接", StatusCode::BAD_REQUEST);
    }

    let mut store = state.inner.write().unwrap();
    let data = ensure_user_nav(&mut store, user_id);
    let Some((ci, ii)) = find_item_indices(data, id) else {
        return err("导航不存在", StatusCode::NOT_FOUND);
    };
    let item = &mut data.categories[ci].items[ii];
    item.name = name.to_string();
    item.href = href.to_string();
    item.color = normalize_color(&body.color);
    item.is_not_new_black = if body.is_not_new_black { Some(true) } else { None };
    let cloned = item.clone();
    save_store(&store);
    ok_item("导航已更新", cloned)
}

async fn delete_item(
    State(state): State<PrivateNavState>,
    headers: HeaderMap,
    Path(id): Path<u64>,
) -> NavResponse {
    let user_id = match require_user(&state, &headers) {
        Ok(id) => id,
        Err(r) => return r,
    };

    let mut store = state.inner.write().unwrap();
    let data = ensure_user_nav(&mut store, user_id);
    let mut found = false;
    for cat in &mut data.categories {
        let before = cat.items.len();
        cat.items.retain(|i| i.id != id);
        if cat.items.len() < before {
            found = true;
            break;
        }
    }
    if !found {
        return err("导航不存在", StatusCode::NOT_FOUND);
    }
    let categories = data.categories.clone();
    save_store(&store);
    ok_categories("导航已删除", categories)
}
