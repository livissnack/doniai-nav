export function removeArr(_arr, _obj) {
  let length = _arr.length
  for (let i = 0; i < length; i++) {
    if (_arr[i] == _obj) {
      _arr.splice(i, 1)
      return _arr
    }
  }
}

export function timeNow() {
  let time = new Date()
  let year = time.getFullYear()
  let month =
    time.getMonth() + 1 < 10 ? '0' + (time.getMonth() + 1) : time.getMonth() + 1
  let day = time.getDate() < 10 ? '0' + time.getDate() : time.getDate()
  let hour = time.getHours() < 10 ? '0' + time.getHours() : time.getHours()
  let minute =
    time.getMinutes() < 10 ? '0' + time.getMinutes() : time.getMinutes()
  let second =
    time.getSeconds() < 10 ? '0' + time.getSeconds() : time.getSeconds()
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`
}

export function year() {
  let time = new Date()
  return time.getFullYear()
}

export function month() {
  let time = new Date()
  return time.getMonth() + 1 < 10
    ? '0' + (time.getMonth() + 1)
    : time.getMonth() + 1
}

export function day() {
  let time = new Date()
  return time.getDate()
}

export function monningAndAfternoonText() {
  let time = new Date()
  let hour = time.getHours()
  return hour > 12 ? '下午' : '上午'
}

export function baiduAiSug(content) {
  let sugurl = 'http://suggestion.baidu.com/su?wd=#content#&cb=window.baidu.sug'
  sugurl = sugurl.replace('#content#', content)
  window.baidu = {
    sug: function(json) {
      return json.s
    }
  }
  let script = document.createElement('script')
  script.src = sugurl
  document.getElementsByTagName('head')[0].appendChild(script)
}

export function googleAiSug(content) {
  let sugurl =
    'http://suggestqueries.google.com/complete/search?client=chrome&q=#content#&jsonp=window.google.sug'
  sugurl = sugurl.replace('#content#', content)
  window.google = {
    sug: function(json) {
      return json[1]
    }
  }
  let script = document.createElement('script')
  script.src = sugurl
  document.getElementsByTagName('head')[0].appendChild(script)
}

export function bingAiSug(content) {
  let sugurl =
    'http://api.bing.com/qsonhs.aspx?type=cb&q=#content#&cb=window.bing.sug'
  sugurl = sugurl.replace('#content#', content)
  window.bing = {
    sug: function(json) {
      let text_arr = json.AS.Results[0].Suggests.map(obj => {
        return obj.Txt
      })
      return text_arr
    }
  }
  let script = document.createElement('script')
  script.src = sugurl
  document.getElementsByTagName('head')[0].appendChild(script)
}

export function isJSON(str) {
  if (typeof str == 'string') {
    try {
      let obj = JSON.parse(str)
      return !!(typeof obj == 'object' && obj);
    } catch (e) {
      return false
    }
  }
  return false
}

export function jsonp(url,data,callback){
  return new Promise((resolve, reject)=> {
    let _url= url + '?page=' + data.page + '&callback='+callback; //一定要有一个回调函数
    const callbackName = callback;
    let head= document.getElementsByTagName('head')[0];
    //设置传递给后台的回调参数名
    let script= document.createElement('script');
    head.appendChild(script);
    //创建jsonp回调函数
    window[callbackName] =json=>{
      resolve(json)
      head.removeChild(script);
      clearTimeout(script.timer);
      window[callbackName] = null;
    }
  //发送请求
  script.src=_url;
  })
}

export function getResourceType(video_url) {
  if(isM3u8(video_url)) {
    return "hls";
  }

  if(isFlv(video_url)) {
    return "flv";
  }

  if(isMpd(video_url)) {
    return "mpd";
  }

  if(isPhp(video_url)) {
    return "php";
  }

  if(isMp4(video_url) || isOgg(video_url) || isWebm(video_url) || isMkv(video_url) || is3gp(video_url) || isAvi(video_url)) {
    return 'video';
  }

  return "unknow";
}

export function isM3u8(url) {
  return new URL(url).pathname.endsWith('.m3u8')
}

export function isFlv(url) {
  return new URL(url).pathname.endsWith('.flv')
}

export function isMpd(url) {
  return new URL(url).pathname.endsWith('.mpd')
}

export function isPhp(url) {
  return new URL(url).pathname.endsWith('.php')
}

export function isMp4(url) {
  return new URL(url).pathname.endsWith('.mp4')
}

export function isOgg(url) {
  return new URL(url).pathname.endsWith('.ogg')
}

export function isWebm(url) {
  return new URL(url).pathname.endsWith('.webm')
}

export function isMkv(url) {
  return new URL(url).pathname.endsWith('.mkv')
}

export function is3gp(url) {
  return new URL(url).pathname.endsWith('.3gp')
}

export function isAvi(url) {
  return new URL(url).pathname.endsWith('.avi')
}

export function isHttps(url) {
  return new URL(url).protocol.startsWith('https')
}

export function isEmpty(obj) {
  return typeof obj === "undefined" || obj === null || obj === "" || obj === "0" || obj === false || obj === 0 || obj === [];
}