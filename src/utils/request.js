const DEFAULT_TIMEOUT = 10000

function combineUrl(baseURL, url) {
  const base = String(baseURL || '').replace(/\/+$/, '')
  const path = String(url || '').replace(/^\/+/, '')
  if (!base) return `/${path}`
  return `${base}/${path}`
}

function appendQuery(url, params) {
  if (!params || typeof params !== 'object') return url
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return
    search.append(key, String(value))
  })
  const qs = search.toString()
  if (!qs) return url
  return url.includes('?') ? `${url}&${qs}` : `${url}?${qs}`
}

function needsServiceBearer(url) {
  if (!url) return false
  const path = String(url).split('?')[0]
  return /^\/(all|hotel|convert|refresh)(\/|$)/.test(path)
}

function buildHeaders(url, body, extraHeaders = {}) {
  const headers = { ...extraHeaders }
  const serviceToken =
    import.meta.env.VITE_SECRET_KEY || import.meta.env.VUE_APP_SECRET_KEY

  if (serviceToken && needsServiceBearer(url)) {
    headers.Authorization = `Bearer ${serviceToken}`
  }

  const sessionToken = localStorage.getItem('doniaiNavAuthToken')
  if (sessionToken) {
    headers['X-Session-Token'] = sessionToken
  }

  if (body instanceof FormData) {
    return headers
  }

  if (
    body !== undefined &&
    body !== null &&
    !headers['Content-Type'] &&
    !headers['content-type']
  ) {
    headers['Content-Type'] = 'application/json;charset=UTF-8'
  }

  return headers
}

async function parseResponseBody(response, responseType) {
  if (responseType === 'arraybuffer') {
    return response.arrayBuffer()
  }
  if (responseType === 'blob') {
    return response.blob()
  }
  if (responseType === 'text') {
    return response.text()
  }

  const text = await response.text()
  if (!text) return null

  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    try {
      return JSON.parse(text)
    } catch {
      return text
    }
  }

  return text
}

function createTimeoutSignal(timeout) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  return {
    signal: controller.signal,
    clear: () => clearTimeout(timer),
  }
}

async function fetchRequest(config) {
  const {
    method = 'GET',
    url,
    data,
    params,
    headers: extraHeaders = {},
    timeout = DEFAULT_TIMEOUT,
    responseType,
  } = config

  const baseURL = import.meta.env.VITE_SERVER_URL || ''
  const requestUrl = appendQuery(combineUrl(baseURL, url), params)
  const upperMethod = method.toUpperCase()
  const hasBody = !['GET', 'HEAD'].includes(upperMethod)
  const body = hasBody
    ? data instanceof FormData
      ? data
      : data !== undefined && data !== null
        ? JSON.stringify(data)
        : undefined
    : undefined

  const headers = buildHeaders(url, body, extraHeaders)
  const { signal, clear } = createTimeoutSignal(timeout)

  let response
  try {
    response = await fetch(requestUrl, {
      method: upperMethod,
      headers,
      body,
      signal,
      credentials: 'same-origin',
    })
  } catch (error) {
    clear()
    if (error?.name === 'AbortError') {
      return Promise.reject({ code: 408, msg: '请求超时' })
    }
    return Promise.reject({ code: 0, msg: error?.message || '网络错误' })
  } finally {
    clear()
  }

  const responseData = await parseResponseBody(response, responseType)
  const result = {
    data: responseData,
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
    config,
  }

  if (response.status === 200) {
    return result
  }

  const serverMsg =
    responseData &&
    typeof responseData === 'object' &&
    (responseData.message || responseData.msg)

  return Promise.reject({
    code: response.status,
    msg: serverMsg || throwErr(response.status, { config: { url } }),
    response: result,
  })
}

export default function request(method, url, data, options = {}) {
  const normalizedMethod = String(method || 'get').toLowerCase()

  if (normalizedMethod === 'get') {
    return fetchRequest({
      method: 'GET',
      url,
      params: data,
      ...options,
    })
  }

  if (normalizedMethod === 'post') {
    return fetchRequest({
      method: 'POST',
      url,
      data,
      ...options,
    })
  }

  if (normalizedMethod === 'put') {
    return fetchRequest({
      method: 'PUT',
      url,
      data,
      ...options,
    })
  }

  if (normalizedMethod === 'delete') {
    return fetchRequest({
      method: 'DELETE',
      url,
      params: data,
      ...options,
    })
  }

  return Promise.reject({ code: 0, msg: '请求方法错误' })
}

export const throwErr = (code, response) => {
  let message = '请求错误'
  switch (code) {
    case 400:
      message = '请求错误'
      break
    case 401:
      message = '未授权，请登录'
      break
    case 403:
      message = '拒绝访问'
      break
    case 404:
      message = `请求地址出错: ${response?.config?.url || ''}`
      break
    case 408:
      message = '请求超时'
      break
    case 500:
      message = '服务器内部错误'
      break
    case 501:
      message = '服务未实现'
      break
    case 502:
      message = '网关错误'
      break
    case 503:
      message = '服务不可用'
      break
    case 504:
      message = '网关超时'
      break
    case 505:
      message = 'HTTP版本不受支持'
      break
    default:
  }
  return message
}
