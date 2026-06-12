import request from '../utils/request'
const ApiVersion = ''

export async function getBgImage() {
  return request('get', `${ApiVersion}/all?type=bing`)
}

/** 一次拉取聚合数据（新闻/天气/音乐/汇率/油价/Bing 等） */
export async function getAllAggregated() {
  return request('get', `${ApiVersion}/all`)
}

export async function getHotNews(t) {
  return request('get', `${ApiVersion}/all?type=news`)
}

export async function getWeather() {
  return request('get', `${ApiVersion}/all?type=weather`)
}

export async function getMusic() {
  return request('get', `${ApiVersion}/all?type=music`)
}

/** 经后端 /refresh 代理拉取订阅，避免浏览器直连 CORS */
export async function getNodeSubscribe(url) {
  return request('get', '/refresh', { url })
}

export async function getExchangeRate() {
  return request('get', `${ApiVersion}/all?type=rate`);
}

export async function getFuelPrice() {
  return request('get', `${ApiVersion}/all?type=fuel`);
}

export async function getHotelIptvM3u(ip) {
  return request('get', `${ApiVersion}/hotel?ip=${ip}`);
}

export async function getNodeParse(links) {
  return request('post', `${ApiVersion}/convert`, links);
}

export async function getStudentScore(key) {
  return request('get', `${ApiVersion}/all`, { type: 'score', key })
}