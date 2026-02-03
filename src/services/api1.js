
// AI资讯快报
export async function getVikiAiNews() {
  return request('https://60s.viki.moe/v2/ai-news');
}

export async function getVikiExchangeRate() {
  return request('https://60s.viki.moe/v2/exchange-rate');
}

export async function getVikiRandomMusic() {
  return request('https://60s.viki.moe/v2/ncm-rank/list');
}

export async function getVikiRandomMusicDetail(id) {
  return request(`https://60s.viki.moe/v2/ncm-rank/${id}`);
}

export async function getVikiWeatherData(params = {}) {
  const url = buildUrlWithParams('https://60s.viki.moe/v2/weather', params);
  return request(url);
}

export async function request(url, options = {}) {
  try {
    const response = await fetch(url, {
      method: 'GET', // 默认 GET 请求
      redirect: 'follow',
      ...options // 合并自定义配置
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Request failed:', error);
    throw error; // 抛出错误供上层处理
  }
}

function buildUrlWithParams(url, params = {}) {
  const searchParams = new URLSearchParams(params);
  return `${url}?${searchParams.toString()}`;
}
