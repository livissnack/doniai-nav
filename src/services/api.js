import request from '../utils/request'
const ApiVersion = ''

export async function getBgImage() {
  return request('get', `${ApiVersion}/all?type=bing`)
}

export async function getHotNews(t) {
  return request('get', `${ApiVersion}/all?type=news`)
}

export async function getWeather() {
  return request('get', `${ApiVersion}/all?type=weather`)
}

export async function getBase64(str) {
  return request('post', `${ApiVersion}/b64`, {
    str: str,
  })
}

export async function getMusic() {
  return request('get', `${ApiVersion}/all?type=music`)
}

export async function getNodeSubscribe(url) {
  return request('get', url)
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