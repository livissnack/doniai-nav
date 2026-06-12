import request from '@/utils/request'

/** 批量探测 Docker 镜像加速 URL（服务端请求，避免浏览器跨域） */
export function probeDockerMirrors(urls) {
  return request('post', '/docker/probe-batch', { urls }, { timeout: 60000 })
}
