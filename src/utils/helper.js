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
      var obj = JSON.parse(str)
      if (typeof obj == 'object' && obj) {
        return true
      } else {
        return false
      }
    } catch (e) {
      return false
    }
  }
  return false
}

export function jsonp(url,data,callback){
       return new Promise((resolve, reject) => {
          let _url = url + '?page=' + data.page + '&callback='+callback;  //一定要有一个回调函数
          const callbackName = callback;
          let head = document.getElementsByTagName('head')[0];
          //设置传递给后台的回调参数名
          let script = document.createElement('script');
          head.appendChild(script);
          //创建jsonp回调函数
          window[callbackName] = json =>{
              resolve(json)
              head.removeChild(script);
              clearTimeout(script.timer);
              window[callbackName] = null;
          }
          //发送请求
          script.src = _url;
       })
  }
