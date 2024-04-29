import request from '../utils/request'
const ApiVersion = 'api/v1.0'

/*
|--------------------------------------------------------------------------
| api methods
|--------------------------------------------------------------------------
|
|
*/
export async function getBgImage() {
  return request('get', `${ApiVersion}/crawler/bing`)
}

export async function getHotNews(type = 'baidu') {
  return request('get', `${ApiVersion}/crawler/news?type=${type}`)
}

export async function getWeather(lat, lon) {
  return request('get', `https://ecomoldsteel.com/api/weather?latitude=${lat}&longitude=${lon}`)
}
