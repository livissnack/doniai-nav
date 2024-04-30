import request from '../utils/request'
const ApiVersion = 'api/v1.0'

export async function getBgImage() {
  return request('post', `${ApiVersion}/bing`)
}

export async function getHotNews(t) {
  return request('post', `${ApiVersion}/news`)
}

export async function getWeather(lat, lon) {
  return request('post', `${ApiVersion}/weather`, {
    latitude: lat,
    longitude: lon
  })
}

export async function getMedia(keyword) {
  return request('post', `${ApiVersion}/media`, {
    keyword: keyword,
  })
}

