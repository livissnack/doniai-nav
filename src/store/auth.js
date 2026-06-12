import { reactive } from 'vue'
import { invalidatePrivateNavCache } from '@/services/navData'
import {
  loginApi,
  registerApi,
  fetchMeApi,
  fetchPublicSettingsApi,
  updatePanelsApi,
  logoutApi,
  changePasswordApi,
} from '@/services/authApi'

const TOKEN_KEY = 'doniaiNavAuthToken'
const PRIVATE_MENU_ID = 2

export const SIDEBAR_PANELS = [
  { id: 'news', title: '热门新闻' },
  { id: 'tools', title: '常用工具' },
  { id: 'music', title: '音乐播放器' },
  { id: 'weather', title: '天气' },
  { id: 'todo', title: '工作任务' },
  { id: 'price', title: '实时快讯' },
]

const DEFAULT_PANELS = {
  news: true,
  tools: true,
  music: true,
  weather: true,
  todo: true,
  price: true,
}

function normalizePanels(panels) {
  return { ...DEFAULT_PANELS, ...(panels || {}) }
}

function getToken() {
  return localStorage.getItem(TOKEN_KEY) || ''
}

export function hasStoredToken() {
  return !!getToken()
}

function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}

export const authStore = reactive({
  user: null,
  sidebarPanels: { ...DEFAULT_PANELS },
  registrationEnabled: true,
})

let authReadyResolve
export const authReady = new Promise((resolve) => {
  authReadyResolve = resolve
})

function applySession(data) {
  if (data.user) {
    authStore.user = data.user
  }
  if (data.sidebarPanels) {
    authStore.sidebarPanels = normalizePanels(data.sidebarPanels)
  }
}

function clearSession() {
  authStore.user = null
  authStore.sidebarPanels = { ...DEFAULT_PANELS }
  setToken('')
}

function mapApiError(err, fallback = '请求失败') {
  const body = err?.response?.data
  if (body?.message) return body.message
  if (err?.msg) return err.msg
  return fallback
}

async function loadPublicSettings() {
  try {
    const { data } = await fetchPublicSettingsApi()
    if (data?.ok) {
      authStore.registrationEnabled = data.registrationEnabled !== false
    }
  } catch {
    // 保持默认开放
  }
}

export async function initAuth() {
  const settingsTask = loadPublicSettings()
  const token = getToken()
  if (!token) {
    await settingsTask
    authReadyResolve()
    return
  }
  try {
    const [, meRes] = await Promise.all([settingsTask, fetchMeApi()])
    const { data } = meRes
    if (data?.ok && data.user) {
      applySession(data)
    } else {
      clearSession()
    }
  } catch (err) {
    // 仅 token 失效时清除；网络错误保留 token，下次路由仍会重试
    if (err?.code === 401 || err?.code === 403) {
      clearSession()
    }
  } finally {
    authReadyResolve()
  }
}

export function isLoggedIn() {
  return !!authStore.user && !!getToken()
}

export function isAdmin() {
  return !!authStore.user?.isAdmin
}

export function isRegistrationEnabled() {
  return authStore.registrationEnabled !== false
}

export function isPrivateMenu(menuId) {
  return Number(menuId) === PRIVATE_MENU_ID
}

export function canAccessMenu(menuId) {
  if (!isPrivateMenu(menuId)) return true
  return isLoggedIn()
}

export function isPanelVisible(panelId) {
  return authStore.sidebarPanels[panelId] !== false
}

export const authActions = {
  async register({ username, email, password, displayName, captchaId, captchaCode }) {
    try {
      const { data } = await registerApi({
        username,
        email,
        password,
        displayName,
        captchaId,
        captchaCode,
      })
      if (data?.ok) {
        setToken(data.token)
        applySession(data)
        return { ok: true, message: data.message || '注册成功', user: data.user }
      }
      return { ok: false, message: data?.message || '注册失败' }
    } catch (err) {
      return { ok: false, message: mapApiError(err, '注册失败，请检查网络或后端服务') }
    }
  },

  async login({ email, password }) {
    try {
      const { data } = await loginApi({ email, password })
      if (data?.ok) {
        setToken(data.token)
        applySession(data)
        return { ok: true, message: data.message || '登录成功', user: data.user }
      }
      return { ok: false, message: data?.message || '登录失败' }
    } catch (err) {
      return { ok: false, message: mapApiError(err, '登录失败，请检查网络或后端服务') }
    }
  },

  async logout() {
    try {
      await logoutApi()
    } catch {
      // 客户端清除即可
    }
    clearSession()
    invalidatePrivateNavCache()
    return { ok: true }
  },

  async setPanelVisible(panelId, visible) {
    if (!authStore.user) return
    authStore.sidebarPanels[panelId] = visible
    try {
      const { data } = await updatePanelsApi({ ...authStore.sidebarPanels })
      if (data?.ok && data.sidebarPanels) {
        authStore.sidebarPanels = normalizePanels(data.sidebarPanels)
      }
    } catch (e) {
      console.warn('save panels failed', e)
    }
  },

  async resetPanels() {
    if (!authStore.user) return
    authStore.sidebarPanels = { ...DEFAULT_PANELS }
    try {
      const { data } = await updatePanelsApi({ ...DEFAULT_PANELS })
      if (data?.ok && data.sidebarPanels) {
        authStore.sidebarPanels = normalizePanels(data.sidebarPanels)
      }
    } catch (e) {
      console.warn('reset panels failed', e)
    }
  },

  async changePassword({ currentPassword, newPassword }) {
    try {
      const { data } = await changePasswordApi({
        currentPassword,
        newPassword,
      })
      if (data?.ok) {
        return { ok: true, message: data.message || '密码已修改' }
      }
      return { ok: false, message: data?.message || '修改失败' }
    } catch (err) {
      return { ok: false, message: mapApiError(err, '修改失败，请检查网络或后端服务') }
    }
  },
}
