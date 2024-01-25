import axios from 'axios'

// 环境的切换
if (process.env.NODE_ENV === 'development') {
  axios.defaults.baseURL = 'https://hi.doniai.com/'
} else if (process.env.NODE_ENV === 'debug') {
  axios.defaults.baseURL = 'https://hi.doniai.com/'
} else if (process.env.NODE_ENV === 'production') {
  axios.defaults.baseURL = 'https://hi.doniai.com/'
}

// 请求超时时间
axios.defaults.timeout = 10000

// post请求头
axios.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8'

// 请求拦截器
axios.interceptors.request.use(
  config => {
    // 每次发送请求之前判断是否存在token，如果存在，则统一在http请求的header都加上token，不用每次请求都手动添加了
    // 即使本地存在token，也有可能token是过期的，所以在响应拦截器中要对返回状态进行判断
    const token = ''
    token && (config.headers.Authorization = token)
    return config
  },
  error => {
    return Promise.error(error)
  }
)

// 响应拦截器
axios.interceptors.response.use(
  response => {
    if (response.status === 200) {
      return Promise.resolve(response)
    } else {
      return Promise.reject(response)
    }
  },
  // 服务器状态码不是200的情况
  error => {
    if (error && error.response) {
      let res = {}
      res.code = error.response.status
      res.msg = throwErr(error.response.status, error.response) //throwErr 捕捉服务端的http状态码 定义在utils工具类的方法
      return Promise.reject(res)
    }
    return Promise.reject(error)
  }
)

export default function request(method, url, data) {
  //暴露 request 给我们好API 管理
  method = method.toLocaleLowerCase() //封装RESTful API的各种请求方式 以 post get delete为例
  if (method === 'get') {
    return axios.get(url, { params: data })
  } else if (method === 'post') {
    if (data instanceof FormData) {
      var config = {}
      config.headers = { 'Content-Type': 'multipart/form-data' }
      return axios.post(url, data, config)
    } else {
      return axios.post(url, data)
    }
  } else if (method === 'put') {
    return axios.put(url, data)
  } else if (method === 'delete') {
    return axios.delete(url, { params: data })
  } else {
    return '请求方法错误'
  }
}

//axios捕错
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
      message = `请求地址出错: ${response.config.url}`
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
