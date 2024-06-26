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
  return typeof obj === "undefined" || obj === null || obj === "" || obj === "0" || obj === false || obj === 0;
}

export function debounce(fn, delay) {
  let timeout;
  return function(){
    clearTimeout(timeout)
    timeout = setTimeout(()=>{
      fn.apply(this, arguments)
    },delay)
  }
}

export function throttle(fn, delay) {
  let timer;
  return function(){
    if(!timer) {
      fn.apply(this, arguments)
      timer = setTimeout(()=>{
        clearTimeout(timer)
        timer = null
      },delay)
    }
  }
}

/**
 * @description: 随机密码
 * @param {*} len 密码位数
 * @param {*} modeArr 密码难度：high(大小写数字特殊字符)、medium(大小写数字)、low(小写数字)
 * @Author: livissnack
 */
export function randomPass(len = 16, modeArr = ['lower', 'number']) {
  const lowerCaseArr = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',];
  const upperCaseArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
  const numberArr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const specialArr = ['~', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '[', '{', ']', '}', '-', '_', '=', '+', '|', ';', ':', "'", '"', ',', '.', '/', '?', '`'];
  const passArr = [];
  let password = '';

  //指定参数随机获取一个字符
  const specifyRandom = function (...arr) {
    let str = "";
    arr.forEach(item => {
      str += item[Math.floor(Math.random() * item.length)]
    });
    return str;
  }
  modeArr = modeArr.sort()
  let modeStr = modeArr.join('_')
  switch (modeStr) {
    case 'lower':
      password += specifyRandom(lowerCaseArr);
      passArr.push(...lowerCaseArr);
      break;
    case 'number':
      password += specifyRandom(numberArr);
      passArr.push(...numberArr);
      break;
    case 'special':
      password += specifyRandom(specialArr);
      passArr.push(...specialArr);
      break;
    case 'upper':
      password += specifyRandom(upperCaseArr);
      passArr.push(...upperCaseArr);
      break;
    case 'lower_number':
      password += specifyRandom(lowerCaseArr, numberArr);
      passArr.push(...lowerCaseArr, ...numberArr);
      break;
    case 'lower_special':
      password += specifyRandom(lowerCaseArr, specialArr);
      passArr.push(...lowerCaseArr, ...specialArr);
      break;
    case 'lower_upper':
      password += specifyRandom(lowerCaseArr, upperCaseArr);
      passArr.push(...lowerCaseArr, ...upperCaseArr);
      break;
    case 'number_special':
      password += specifyRandom(numberArr, specialArr);
      passArr.push(...numberArr, ...specialArr);
      break;
    case 'number_upper':
      password += specifyRandom(numberArr, upperCaseArr);
      passArr.push(...numberArr, ...upperCaseArr);
      break;
    case 'special_upper':
      password += specifyRandom(specialArr, upperCaseArr);
      passArr.push(...specialArr, ...upperCaseArr);
      break;
    case 'lower_number_special':
      password += specifyRandom(lowerCaseArr, numberArr, specialArr);
      passArr.push(...lowerCaseArr, ...numberArr, ...specialArr);
      break;
    case 'lower_number_upper':
      password += specifyRandom(lowerCaseArr, numberArr, upperCaseArr);
      passArr.push(...lowerCaseArr, ...numberArr, ...upperCaseArr);
      break;
    case 'lower_special_upper':
      password += specifyRandom(lowerCaseArr, specialArr, upperCaseArr);
      passArr.push(...lowerCaseArr, ...specialArr, ...upperCaseArr);
      break;
    case 'number_special_upper':
      password += specifyRandom(numberArr, specialArr, upperCaseArr);
      passArr.push(...numberArr, ...specialArr, ...upperCaseArr);
      break;
    case 'lower_number_special_upper':
      password += specifyRandom(lowerCaseArr, upperCaseArr, numberArr, specialArr);
      passArr.push(...lowerCaseArr, ...upperCaseArr, ...numberArr, ...specialArr);
      break;
    default:
      password += specifyRandom(lowerCaseArr, numberArr);
      passArr.push(...lowerCaseArr, ...numberArr);
  }

  const forLen = len - password.length;
  for (let i = 0; i < forLen; i++) {
    password += specifyRandom(passArr);
  }

  return password;
}

/**
 * 预加载图片
 * @param imgs
 * @returns {*[]}
 */
export function preloadMulitImg(imgs) {
  let imgList = []
  for (let i = 0; i < imgs.length; i++) {
    let img = new Image()
    img.src = imgs[i]
    imgList.push(img)
  }
  return imgList
}


export function isBase64(str) {
  // 检查字符串是否为空或者全是空白字符
  if (!str || str.trim() === '') {
      return false;
  }

  // Base64编码只包含特定的字符集
  const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

  // 检查字符串中的每个字符是否都在Base64的字符集中
  for (let i = 0; i < str.length; i++) {
      if (base64Chars.indexOf(str.charAt(i)) === -1) {
          return false;
      }
  }

  // Base64编码的字符串长度应为4的倍数，除非末尾是填充的 '='
  if (str.length % 4 !== 0) {
      return false;
  }

  // 检查 '=' 符号是否合法出现，只能在末尾且数量为0、1或2个
  const equalSigns = str.split('=').pop().length;
  if ([0, 1, 2].indexOf(equalSigns) === -1) {
      return false;
  }

  // 上述条件都满足，则很可能是Base64编码
  return true;
}

/**
 * 等额本息计算
 * @param loanAmount
 * @param annualInterestRate
 * @param loanYears
 * @returns {string}
 */
export function calculateEqualInstallment(loanAmount, annualInterestRate, loanYears) {
  // 将年利率转换为月利率
  const monthlyInterestRate = annualInterestRate / 100 / 12;

  // 计算还款总月数
  const totalMonths = loanYears * 12;

  // 使用等额本息公式计算月供
  const monthlyPayment = loanAmount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, totalMonths)) /
      (Math.pow(1 + monthlyInterestRate, totalMonths) - 1);
  let repaymentPrincipal = 0;
  let repaymentInterest = 0;
  let remainingPrincipal = 0;
  const repaymentSchedule = [];
  for (let month = 1; month <= totalMonths; month++) {
    const interestOfTheMonth = loanAmount * monthlyInterestRate;
    const paymentOfTheMonth = interestOfTheMonth + monthlyPayment;
    let paidPrincipal = 0;
    if (loanAmount > monthlyPayment) {
      paidPrincipal = monthlyPayment - interestOfTheMonth;
      loanAmount -= paidPrincipal;
    } else {
      paidPrincipal = loanAmount;
      loanAmount = 0;
    }
    const monthlyPrincipal = paidPrincipal;

    repaymentPrincipal += monthlyPrincipal  //累计还款本金
    repaymentInterest += interestOfTheMonth //累计还款利息
    // 存储每期还款信息
    repaymentSchedule.push({
      month: `第${month}期`,
      payment: monthlyPayment.toFixed(2),
      principal: monthlyPrincipal.toFixed(2),
      repaymentPrincipal: repaymentPrincipal.toFixed(2),
      repaymentInterest: repaymentInterest.toFixed(2),
      remainingPrincipal: loanAmount.toFixed(2),
      interest: interestOfTheMonth.toFixed(2),
    });
  }

  return repaymentSchedule; // 返回保留两位小数的月供
}

/**
 * 等额本金计算
 * @param loanAmount
 * @param annualInterestRate
 * @param loanYears
 * @returns {*[]}
 */
export function calculatePrincipalInstallment(loanAmount, annualInterestRate, loanYears) {
  // 将年利率转换为月利率
  const monthlyInterestRate = annualInterestRate / 100 / 12;

  // 计算还款总月数
  const totalMonths = loanYears * 12;

  // 每月偿还的本金
  const monthlyPrincipal = loanAmount / totalMonths;

  // 初始化已还本金累计和还款计划数组
  let paidPrincipal = 0;
  let paidInterest = 0;
  const repaymentSchedule = [];

  for (let month = 1; month <= totalMonths; month++) {
    // 当月应还利息
    const interestOfTheMonth = (loanAmount - paidPrincipal) * monthlyInterestRate;

    // 当月总还款额
    const paymentOfTheMonth = monthlyPrincipal + interestOfTheMonth;

    // 累加已还本金
    paidPrincipal += monthlyPrincipal;
    paidInterest += interestOfTheMonth

    // 存储每期还款信息
    repaymentSchedule.push({
      month: `第${month}期`,
      payment: paymentOfTheMonth.toFixed(2),
      principal: monthlyPrincipal.toFixed(2),
      interest: interestOfTheMonth.toFixed(2),
      repaymentPrincipal: paidPrincipal.toFixed(2),
      repaymentInterest: paidInterest.toFixed(2),
      remainingPrincipal: (loanAmount - paidPrincipal).toFixed(2),
    });
  }

  return repaymentSchedule;
}
