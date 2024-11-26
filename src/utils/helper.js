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

export function fetchSsSubscribe(base64Content) {
  try {
    const decodedContent = Buffer.from(base64Content, 'base64').toString('utf-8')
    return decodedContent.split('\n').filter(line => line.trim() !== '')
  } catch (error) {
    console.error('Error fetching node subscribe:', error)
    throw error
  }
}

export function parseSsUrl(url) {
  const [base64Content, serverName] = url.replace('ss://', '').split('#')
  const ssContent = Buffer.from(base64Content, 'base64').toString('utf-8')
  const [methodAndPassword, server] = ssContent.replace('ss://', '').split('@')
  const [method, password] = methodAndPassword.split(':')
  const [serverHost, serverPort] = server.split(':');
  return {
    name: decodeURIComponent(serverName),
    type: 'ss',
    server: serverHost,
    port: parseInt(serverPort, 10),
    cipher: method,
    udp: true,
    password: decodeURIComponent(password)
  };
}

export function generateClashConfig(nodes) {
  let proxies = nodes.map(parseSsUrl)
  let proxiesNames = proxies.map(proxy => proxy.name)
  return {
    'mixed-port': 7890,
    'allow-lan': true,
    'bind-address': '*',
    mode: 'rule',
    'log-level': 'info',
    'external-controller': '127.0.0.1:9090',
    dns: {
      enable: true,
      ipv6: false,
      'default-nameserver': ['223.5.5.5', '119.29.29.29'],
      'enhanced-mode': 'fake-ip',
      'fake-ip-range': '198.18.0.1/16',
      'use-hosts': true,
      nameserver: ['https://doh.pub/dns-query', 'https://dns.alidns.com/dns-query'],
      fallback: ['https://doh.dns.sb/dns-query', 'https://dns.cloudflare.com/dns-query', 'https://dns.twnic.tw/dns-query', 'tls://8.8.4.4:853'],
      'fallback-filter': { geoip: true, ipcidr: ['240.0.0.0/4', '0.0.0.0/32'] },
    },
    proxies: proxies,
    'proxy-groups': [
      {
        name: '多尼爱',
        type: 'select',
        proxies: proxiesNames
      },
      {
        name: '自动选择',
        type: 'url-test',
        proxies: proxiesNames,
        url: 'http://www.gstatic.com/generate_204',
        interval: 86400,
      },
      {
        name: '故障转移',
        type: 'fallback',
        proxies: proxiesNames,
        url: 'http://www.gstatic.com/generate_204',
        interval: 7200,
      },
    ],
    rules: [
      'DOMAIN,cdn1718626335.ppgnginx.com,DIRECT',
      'DOMAIN-SUFFIX,services.googleapis.cn,多尼爱',
      'DOMAIN-SUFFIX,xn--ngstr-lra8j.com,多尼爱',
      'DOMAIN,safebrowsing.urlsec.qq.com,DIRECT',
      'DOMAIN,safebrowsing.googleapis.com,DIRECT',
      'DOMAIN,developer.apple.com,多尼爱',
      'DOMAIN-SUFFIX,digicert.com,多尼爱',
      'DOMAIN,ocsp.apple.com,多尼爱',
      'DOMAIN,ocsp.comodoca.com,多尼爱',
      'DOMAIN,ocsp.usertrust.com,多尼爱',
      'DOMAIN,ocsp.sectigo.com,多尼爱',
      'DOMAIN,ocsp.verisign.net,多尼爱',
      'DOMAIN-SUFFIX,apple-dns.net,多尼爱',
      'DOMAIN,testflight.apple.com,多尼爱',
      'DOMAIN,sandbox.itunes.apple.com,多尼爱',
      'DOMAIN,itunes.apple.com,多尼爱',
      'DOMAIN-SUFFIX,apps.apple.com,多尼爱',
      'DOMAIN-SUFFIX,blobstore.apple.com,多尼爱',
      'DOMAIN,cvws.icloud-content.com,多尼爱',
      'DOMAIN-SUFFIX,mzstatic.com,DIRECT',
      'DOMAIN-SUFFIX,itunes.apple.com,DIRECT',
      'DOMAIN-SUFFIX,icloud.com,DIRECT',
      'DOMAIN-SUFFIX,icloud-content.com,DIRECT',
      'DOMAIN-SUFFIX,me.com,DIRECT',
      'DOMAIN-SUFFIX,aaplimg.com,DIRECT',
      'DOMAIN-SUFFIX,cdn20.com,DIRECT',
      'DOMAIN-SUFFIX,cdn-apple.com,DIRECT',
      'DOMAIN-SUFFIX,akadns.net,DIRECT',
      'DOMAIN-SUFFIX,akamaiedge.net,DIRECT',
      'DOMAIN-SUFFIX,edgekey.net,DIRECT',
      'DOMAIN-SUFFIX,mwcloudcdn.com,DIRECT',
      'DOMAIN-SUFFIX,mwcname.com,DIRECT',
      'DOMAIN-SUFFIX,apple.com,DIRECT',
      'DOMAIN-SUFFIX,apple-cloudkit.com,DIRECT',
      'DOMAIN-SUFFIX,apple-mapkit.com,DIRECT',
      'DOMAIN-SUFFIX,126.com,DIRECT',
      'DOMAIN-SUFFIX,126.net,DIRECT',
      'DOMAIN-SUFFIX,127.net,DIRECT',
      'DOMAIN-SUFFIX,163.com,DIRECT',
      'DOMAIN-SUFFIX,360buyimg.com,DIRECT',
      'DOMAIN-SUFFIX,36kr.com,DIRECT',
      'DOMAIN-SUFFIX,acfun.tv,DIRECT',
      'DOMAIN-SUFFIX,air-matters.com,DIRECT',
      'DOMAIN-SUFFIX,aixifan.com,DIRECT',
      'DOMAIN-KEYWORD,alicdn,DIRECT',
      'DOMAIN-KEYWORD,alipay,DIRECT',
      'DOMAIN-KEYWORD,taobao,DIRECT',
      'DOMAIN-SUFFIX,amap.com,DIRECT',
      'DOMAIN-SUFFIX,autonavi.com,DIRECT',
      'DOMAIN-KEYWORD,baidu,DIRECT',
      'DOMAIN-SUFFIX,bdimg.com,DIRECT',
      'DOMAIN-SUFFIX,bdstatic.com,DIRECT',
      'DOMAIN-SUFFIX,bilibili.com,DIRECT',
      'DOMAIN-SUFFIX,bilivideo.com,DIRECT',
      'DOMAIN-SUFFIX,caiyunapp.com,DIRECT',
      'DOMAIN-SUFFIX,clouddn.com,DIRECT',
      'DOMAIN-SUFFIX,cnbeta.com,DIRECT',
      'DOMAIN-SUFFIX,cnbetacdn.com,DIRECT',
      'DOMAIN-SUFFIX,cootekservice.com,DIRECT',
      'DOMAIN-SUFFIX,csdn.net,DIRECT',
      'DOMAIN-SUFFIX,ctrip.com,DIRECT',
      'DOMAIN-SUFFIX,dgtle.com,DIRECT',
      'DOMAIN-SUFFIX,dianping.com,DIRECT',
      'DOMAIN-SUFFIX,douban.com,DIRECT',
      'DOMAIN-SUFFIX,doubanio.com,DIRECT',
      'DOMAIN-SUFFIX,duokan.com,DIRECT',
      'DOMAIN-SUFFIX,easou.com,DIRECT',
      'DOMAIN-SUFFIX,ele.me,DIRECT',
      'DOMAIN-SUFFIX,feng.com,DIRECT',
      'DOMAIN-SUFFIX,fir.im,DIRECT',
      'DOMAIN-SUFFIX,frdic.com,DIRECT',
      'DOMAIN-SUFFIX,g-cores.com,DIRECT',
      'DOMAIN-SUFFIX,godic.net,DIRECT',
      'DOMAIN-SUFFIX,gtimg.com,DIRECT',
      'DOMAIN,cdn.hockeyapp.net,DIRECT',
      'DOMAIN-SUFFIX,hongxiu.com,DIRECT',
      'DOMAIN-SUFFIX,hxcdn.net,DIRECT',
      'DOMAIN-SUFFIX,iciba.com,DIRECT',
      'DOMAIN-SUFFIX,ifeng.com,DIRECT',
      'DOMAIN-SUFFIX,ifengimg.com,DIRECT',
      'DOMAIN-SUFFIX,ipip.net,DIRECT',
      'DOMAIN-SUFFIX,iqiyi.com,DIRECT',
      'DOMAIN-SUFFIX,jd.com,DIRECT',
      'DOMAIN-SUFFIX,jianshu.com,DIRECT',
      'DOMAIN-SUFFIX,knewone.com,DIRECT',
      'DOMAIN-SUFFIX,le.com,DIRECT',
      'DOMAIN-SUFFIX,lecloud.com,DIRECT',
      'DOMAIN-SUFFIX,lemicp.com,DIRECT',
      'DOMAIN-SUFFIX,licdn.com,DIRECT',
      'DOMAIN-SUFFIX,luoo.net,DIRECT',
      'DOMAIN-SUFFIX,meituan.com,DIRECT',
      'DOMAIN-SUFFIX,meituan.net,DIRECT',
      'DOMAIN-SUFFIX,mi.com,DIRECT',
      'DOMAIN-SUFFIX,miaopai.com,DIRECT',
      'DOMAIN-SUFFIX,microsoft.com,DIRECT',
      'DOMAIN-SUFFIX,microsoftonline.com,DIRECT',
      'DOMAIN-SUFFIX,miui.com,DIRECT',
      'DOMAIN-SUFFIX,miwifi.com,DIRECT',
      'DOMAIN-SUFFIX,mob.com,DIRECT',
      'DOMAIN-SUFFIX,netease.com,DIRECT',
      'DOMAIN-SUFFIX,office.com,DIRECT',
      'DOMAIN-SUFFIX,office365.com,DIRECT',
      'DOMAIN-KEYWORD,officecdn,DIRECT',
      'DOMAIN-SUFFIX,oschina.net,DIRECT',
      'DOMAIN-SUFFIX,ppsimg.com,DIRECT',
      'DOMAIN-SUFFIX,pstatp.com,DIRECT',
      'DOMAIN-SUFFIX,qcloud.com,DIRECT',
      'DOMAIN-SUFFIX,qdaily.com,DIRECT',
      'DOMAIN-SUFFIX,qdmm.com,DIRECT',
      'DOMAIN-SUFFIX,qhimg.com,DIRECT',
      'DOMAIN-SUFFIX,qhres.com,DIRECT',
      'DOMAIN-SUFFIX,qidian.com,DIRECT',
      'DOMAIN-SUFFIX,qihucdn.com,DIRECT',
      'DOMAIN-SUFFIX,qiniu.com,DIRECT',
      'DOMAIN-SUFFIX,qiniucdn.com,DIRECT',
      'DOMAIN-SUFFIX,qiyipic.com,DIRECT',
      'DOMAIN-SUFFIX,qq.com,DIRECT',
      'DOMAIN-SUFFIX,qqurl.com,DIRECT',
      'DOMAIN-SUFFIX,rarbg.to,DIRECT',
      'DOMAIN-SUFFIX,ruguoapp.com,DIRECT',
      'DOMAIN-SUFFIX,segmentfault.com,DIRECT',
      'DOMAIN-SUFFIX,sinaapp.com,DIRECT',
      'DOMAIN-SUFFIX,smzdm.com,DIRECT',
      'DOMAIN-SUFFIX,snapdrop.net,DIRECT',
      'DOMAIN-SUFFIX,sogou.com,DIRECT',
      'DOMAIN-SUFFIX,sogoucdn.com,DIRECT',
      'DOMAIN-SUFFIX,sohu.com,DIRECT',
      'DOMAIN-SUFFIX,soku.com,DIRECT',
      'DOMAIN-SUFFIX,speedtest.net,DIRECT',
      'DOMAIN-SUFFIX,sspai.com,DIRECT',
      'DOMAIN-SUFFIX,suning.com,DIRECT',
      'DOMAIN-SUFFIX,taobao.com,DIRECT',
      'DOMAIN-SUFFIX,tencent.com,DIRECT',
      'DOMAIN-SUFFIX,tenpay.com,DIRECT',
      'DOMAIN-SUFFIX,tianyancha.com,DIRECT',
      'DOMAIN-SUFFIX,tmall.com,DIRECT',
      'DOMAIN-SUFFIX,tudou.com,DIRECT',
      'DOMAIN-SUFFIX,umetrip.com,DIRECT',
      'DOMAIN-SUFFIX,upaiyun.com,DIRECT',
      'DOMAIN-SUFFIX,upyun.com,DIRECT',
      'DOMAIN-SUFFIX,veryzhun.com,DIRECT',
      'DOMAIN-SUFFIX,weather.com,DIRECT',
      'DOMAIN-SUFFIX,weibo.com,DIRECT',
      'DOMAIN-SUFFIX,xiami.com,DIRECT',
      'DOMAIN-SUFFIX,xiami.net,DIRECT',
      'DOMAIN-SUFFIX,xiaomicp.com,DIRECT',
      'DOMAIN-SUFFIX,ximalaya.com,DIRECT',
      'DOMAIN-SUFFIX,xmcdn.com,DIRECT',
      'DOMAIN-SUFFIX,xunlei.com,DIRECT',
      'DOMAIN-SUFFIX,yhd.com,DIRECT',
      'DOMAIN-SUFFIX,yihaodianimg.com,DIRECT',
      'DOMAIN-SUFFIX,yinxiang.com,DIRECT',
      'DOMAIN-SUFFIX,ykimg.com,DIRECT',
      'DOMAIN-SUFFIX,youdao.com,DIRECT',
      'DOMAIN-SUFFIX,youku.com,DIRECT',
      'DOMAIN-SUFFIX,zealer.com,DIRECT',
      'DOMAIN-SUFFIX,zhihu.com,DIRECT',
      'DOMAIN-SUFFIX,zhimg.com,DIRECT',
      'DOMAIN-SUFFIX,zimuzu.tv,DIRECT',
      'DOMAIN-SUFFIX,zoho.com,DIRECT',
      'DOMAIN-KEYWORD,amazon,多尼爱',
      'DOMAIN-KEYWORD,google,多尼爱',
      'DOMAIN-KEYWORD,gmail,多尼爱',
      'DOMAIN-KEYWORD,youtube,多尼爱',
      'DOMAIN-KEYWORD,facebook,多尼爱',
      'DOMAIN-SUFFIX,fb.me,多尼爱',
      'DOMAIN-SUFFIX,fbcdn.net,多尼爱',
      'DOMAIN-KEYWORD,twitter,多尼爱',
      'DOMAIN-KEYWORD,instagram,多尼爱',
      'DOMAIN-KEYWORD,dropbox,多尼爱',
      'DOMAIN-SUFFIX,twimg.com,多尼爱',
      'DOMAIN-KEYWORD,blogspot,多尼爱',
      'DOMAIN-SUFFIX,youtu.be,多尼爱',
      'DOMAIN-KEYWORD,whatsapp,多尼爱',
      'DOMAIN-KEYWORD,admarvel,REJECT',
      'DOMAIN-KEYWORD,admaster,REJECT',
      'DOMAIN-KEYWORD,adsage,REJECT',
      'DOMAIN-KEYWORD,adsmogo,REJECT',
      'DOMAIN-KEYWORD,adsrvmedia,REJECT',
      'DOMAIN-KEYWORD,adwords,REJECT',
      'DOMAIN-KEYWORD,adservice,REJECT',
      'DOMAIN-SUFFIX,appsflyer.com,REJECT',
      'DOMAIN-KEYWORD,domob,REJECT',
      'DOMAIN-SUFFIX,doubleclick.net,REJECT',
      'DOMAIN-KEYWORD,duomeng,REJECT',
      'DOMAIN-KEYWORD,dwtrack,REJECT',
      'DOMAIN-KEYWORD,guanggao,REJECT',
      'DOMAIN-KEYWORD,lianmeng,REJECT',
      'DOMAIN-SUFFIX,mmstat.com,REJECT',
      'DOMAIN-KEYWORD,mopub,REJECT',
      'DOMAIN-KEYWORD,omgmta,REJECT',
      'DOMAIN-KEYWORD,openx,REJECT',
      'DOMAIN-KEYWORD,partnerad,REJECT',
      'DOMAIN-KEYWORD,pingfore,REJECT',
      'DOMAIN-KEYWORD,supersonicads,REJECT',
      'DOMAIN-KEYWORD,uedas,REJECT',
      'DOMAIN-KEYWORD,umeng,REJECT',
      'DOMAIN-KEYWORD,usage,REJECT',
      'DOMAIN-SUFFIX,vungle.com,REJECT',
      'DOMAIN-KEYWORD,wlmonitor,REJECT',
      'DOMAIN-KEYWORD,zjtoolbar,REJECT',
      'DOMAIN-SUFFIX,9to5mac.com,多尼爱',
      'DOMAIN-SUFFIX,abpchina.org,多尼爱',
      'DOMAIN-SUFFIX,adblockplus.org,多尼爱',
      'DOMAIN-SUFFIX,adobe.com,多尼爱',
      'DOMAIN-SUFFIX,akamaized.net,多尼爱',
      'DOMAIN-SUFFIX,alfredapp.com,多尼爱',
      'DOMAIN-SUFFIX,amplitude.com,多尼爱',
      'DOMAIN-SUFFIX,ampproject.org,多尼爱',
      'DOMAIN-SUFFIX,android.com,多尼爱',
      'DOMAIN-SUFFIX,angularjs.org,多尼爱',
      'DOMAIN-SUFFIX,aolcdn.com,多尼爱',
      'DOMAIN-SUFFIX,apkpure.com,多尼爱',
      'DOMAIN-SUFFIX,appledaily.com,多尼爱',
      'DOMAIN-SUFFIX,appshopper.com,多尼爱',
      'DOMAIN-SUFFIX,appspot.com,多尼爱',
      'DOMAIN-SUFFIX,arcgis.com,多尼爱',
      'DOMAIN-SUFFIX,archive.org,多尼爱',
      'DOMAIN-SUFFIX,armorgames.com,多尼爱',
      'DOMAIN-SUFFIX,aspnetcdn.com,多尼爱',
      'DOMAIN-SUFFIX,att.com,多尼爱',
      'DOMAIN-SUFFIX,awsstatic.com,多尼爱',
      'DOMAIN-SUFFIX,azureedge.net,多尼爱',
      'DOMAIN-SUFFIX,azurewebsites.net,多尼爱',
      'DOMAIN-SUFFIX,bing.com,多尼爱',
      'DOMAIN-SUFFIX,bintray.com,多尼爱',
      'DOMAIN-SUFFIX,bit.com,多尼爱',
      'DOMAIN-SUFFIX,bit.ly,多尼爱',
      'DOMAIN-SUFFIX,bitbucket.org,多尼爱',
      'DOMAIN-SUFFIX,bjango.com,多尼爱',
      'DOMAIN-SUFFIX,bkrtx.com,多尼爱',
      'DOMAIN-SUFFIX,blog.com,多尼爱',
      'DOMAIN-SUFFIX,blogcdn.com,多尼爱',
      'DOMAIN-SUFFIX,blogger.com,多尼爱',
      'DOMAIN-SUFFIX,blogsmithmedia.com,多尼爱',
      'DOMAIN-SUFFIX,blogspot.com,多尼爱',
      'DOMAIN-SUFFIX,blogspot.hk,多尼爱',
      'DOMAIN-SUFFIX,bloomberg.com,多尼爱',
      'DOMAIN-SUFFIX,box.com,多尼爱',
      'DOMAIN-SUFFIX,box.net,多尼爱',
      'DOMAIN-SUFFIX,cachefly.net,多尼爱',
      'DOMAIN-SUFFIX,chromium.org,多尼爱',
      'DOMAIN-SUFFIX,cl.ly,多尼爱',
      'DOMAIN-SUFFIX,cloudflare.com,多尼爱',
      'DOMAIN-SUFFIX,cloudfront.net,多尼爱',
      'DOMAIN-SUFFIX,cloudmagic.com,多尼爱',
      'DOMAIN-SUFFIX,cmail19.com,多尼爱',
      'DOMAIN-SUFFIX,cnet.com,多尼爱',
      'DOMAIN-SUFFIX,cocoapods.org,多尼爱',
      'DOMAIN-SUFFIX,comodoca.com,多尼爱',
      'DOMAIN-SUFFIX,crashlytics.com,多尼爱',
      'DOMAIN-SUFFIX,culturedcode.com,多尼爱',
      'DOMAIN-SUFFIX,d.pr,多尼爱',
      'DOMAIN-SUFFIX,danilo.to,多尼爱',
      'DOMAIN-SUFFIX,dayone.me,多尼爱',
      'DOMAIN-SUFFIX,db.tt,多尼爱',
      'DOMAIN-SUFFIX,deskconnect.com,多尼爱',
      'DOMAIN-SUFFIX,disq.us,多尼爱',
      'DOMAIN-SUFFIX,disqus.com,多尼爱',
      'DOMAIN-SUFFIX,disquscdn.com,多尼爱',
      'DOMAIN-SUFFIX,dnsimple.com,多尼爱',
      'DOMAIN-SUFFIX,docker.com,多尼爱',
      'DOMAIN-SUFFIX,dribbble.com,多尼爱',
      'DOMAIN-SUFFIX,droplr.com,多尼爱',
      'DOMAIN-SUFFIX,duckduckgo.com,多尼爱',
      'DOMAIN-SUFFIX,dueapp.com,多尼爱',
      'DOMAIN-SUFFIX,dytt8.net,多尼爱',
      'DOMAIN-SUFFIX,edgecastcdn.net,多尼爱',
      'DOMAIN-SUFFIX,edgekey.net,多尼爱',
      'DOMAIN-SUFFIX,edgesuite.net,多尼爱',
      'DOMAIN-SUFFIX,engadget.com,多尼爱',
      'DOMAIN-SUFFIX,entrust.net,多尼爱',
      'DOMAIN-SUFFIX,eurekavpt.com,多尼爱',
      'DOMAIN-SUFFIX,evernote.com,多尼爱',
      'DOMAIN-SUFFIX,fabric.io,多尼爱',
      'DOMAIN-SUFFIX,fast.com,多尼爱',
      'DOMAIN-SUFFIX,fastly.net,多尼爱',
      'DOMAIN-SUFFIX,fc2.com,多尼爱',
      'DOMAIN-SUFFIX,feedburner.com,多尼爱',
      'DOMAIN-SUFFIX,feedly.com,多尼爱',
      'DOMAIN-SUFFIX,feedsportal.com,多尼爱',
      'DOMAIN-SUFFIX,fiftythree.com,多尼爱',
      'DOMAIN-SUFFIX,firebaseio.com,多尼爱',
      'DOMAIN-SUFFIX,flexibits.com,多尼爱',
      'DOMAIN-SUFFIX,flickr.com,多尼爱',
      'DOMAIN-SUFFIX,flipboard.com,多尼爱',
      'DOMAIN-SUFFIX,g.co,多尼爱',
      'DOMAIN-SUFFIX,gabia.net,多尼爱',
      'DOMAIN-SUFFIX,geni.us,多尼爱',
      'DOMAIN-SUFFIX,gfx.ms,多尼爱',
      'DOMAIN-SUFFIX,ggpht.com,多尼爱',
      'DOMAIN-SUFFIX,ghostnoteapp.com,多尼爱',
      'DOMAIN-SUFFIX,git.io,多尼爱',
      'DOMAIN-KEYWORD,github,多尼爱',
      'DOMAIN-SUFFIX,globalsign.com,多尼爱',
      'DOMAIN-SUFFIX,gmodules.com,多尼爱',
      'DOMAIN-SUFFIX,godaddy.com,多尼爱',
      'DOMAIN-SUFFIX,golang.org,多尼爱',
      'DOMAIN-SUFFIX,gongm.in,多尼爱',
      'DOMAIN-SUFFIX,goo.gl,多尼爱',
      'DOMAIN-SUFFIX,goodreaders.com,多尼爱',
      'DOMAIN-SUFFIX,goodreads.com,多尼爱',
      'DOMAIN-SUFFIX,gravatar.com,多尼爱',
      'DOMAIN-SUFFIX,gstatic.com,多尼爱',
      'DOMAIN-SUFFIX,gvt0.com,多尼爱',
      'DOMAIN-SUFFIX,hockeyapp.net,多尼爱',
      'DOMAIN-SUFFIX,hotmail.com,多尼爱',
      'DOMAIN-SUFFIX,icons8.com,多尼爱',
      'DOMAIN-SUFFIX,ifixit.com,多尼爱',
      'DOMAIN-SUFFIX,ift.tt,多尼爱',
      'DOMAIN-SUFFIX,ifttt.com,多尼爱',
      'DOMAIN-SUFFIX,iherb.com,多尼爱',
      'DOMAIN-SUFFIX,imageshack.us,多尼爱',
      'DOMAIN-SUFFIX,img.ly,多尼爱',
      'DOMAIN-SUFFIX,imgur.com,多尼爱',
      'DOMAIN-SUFFIX,imore.com,多尼爱',
      'DOMAIN-SUFFIX,instapaper.com,多尼爱',
      'DOMAIN-SUFFIX,ipn.li,多尼爱',
      'DOMAIN-SUFFIX,is.gd,多尼爱',
      'DOMAIN-SUFFIX,issuu.com,多尼爱',
      'DOMAIN-SUFFIX,itgonglun.com,多尼爱',
      'DOMAIN-SUFFIX,itun.es,多尼爱',
      'DOMAIN-SUFFIX,ixquick.com,多尼爱',
      'DOMAIN-SUFFIX,j.mp,多尼爱',
      'DOMAIN-SUFFIX,js.revsci.net,多尼爱',
      'DOMAIN-SUFFIX,jshint.com,多尼爱',
      'DOMAIN-SUFFIX,jtvnw.net,多尼爱',
      'DOMAIN-SUFFIX,justgetflux.com,多尼爱',
      'DOMAIN-SUFFIX,kat.cr,多尼爱',
      'DOMAIN-SUFFIX,klip.me,多尼爱',
      'DOMAIN-SUFFIX,libsyn.com,多尼爱',
      'DOMAIN-SUFFIX,linkedin.com,多尼爱',
      'DOMAIN-SUFFIX,line-apps.com,多尼爱',
      'DOMAIN-SUFFIX,linode.com,多尼爱',
      'DOMAIN-SUFFIX,lithium.com,多尼爱',
      'DOMAIN-SUFFIX,littlehj.com,多尼爱',
      'DOMAIN-SUFFIX,live.com,多尼爱',
      'DOMAIN-SUFFIX,live.net,多尼爱',
      'DOMAIN-SUFFIX,livefilestore.com,多尼爱',
      'DOMAIN-SUFFIX,llnwd.net,多尼爱',
      'DOMAIN-SUFFIX,macid.co,多尼爱',
      'DOMAIN-SUFFIX,macromedia.com,多尼爱',
      'DOMAIN-SUFFIX,macrumors.com,多尼爱',
      'DOMAIN-SUFFIX,mashable.com,多尼爱',
      'DOMAIN-SUFFIX,mathjax.org,多尼爱',
      'DOMAIN-SUFFIX,medium.com,多尼爱',
      'DOMAIN-SUFFIX,mega.co.nz,多尼爱',
      'DOMAIN-SUFFIX,mega.nz,多尼爱',
      'DOMAIN-SUFFIX,megaupload.com,多尼爱',
      'DOMAIN-SUFFIX,microsofttranslator.com,多尼爱',
      'DOMAIN-SUFFIX,mindnode.com,多尼爱',
      'DOMAIN-SUFFIX,mobile01.com,多尼爱',
      'DOMAIN-SUFFIX,modmyi.com,多尼爱',
      'DOMAIN-SUFFIX,msedge.net,多尼爱',
      'DOMAIN-SUFFIX,myfontastic.com,多尼爱',
      'DOMAIN-SUFFIX,name.com,多尼爱',
      'DOMAIN-SUFFIX,nextmedia.com,多尼爱',
      'DOMAIN-SUFFIX,nsstatic.net,多尼爱',
      'DOMAIN-SUFFIX,nssurge.com,多尼爱',
      'DOMAIN-SUFFIX,nyt.com,多尼爱',
      'DOMAIN-SUFFIX,nytimes.com,多尼爱',
      'DOMAIN-SUFFIX,omnigroup.com,多尼爱',
      'DOMAIN-SUFFIX,onedrive.com,多尼爱',
      'DOMAIN-SUFFIX,onenote.com,多尼爱',
      'DOMAIN-SUFFIX,ooyala.com,多尼爱',
      'DOMAIN-SUFFIX,openvpn.net,多尼爱',
      'DOMAIN-SUFFIX,openwrt.org,多尼爱',
      'DOMAIN-SUFFIX,orkut.com,多尼爱',
      'DOMAIN-SUFFIX,osxdaily.com,多尼爱',
      'DOMAIN-SUFFIX,outlook.com,多尼爱',
      'DOMAIN-SUFFIX,ow.ly,多尼爱',
      'DOMAIN-SUFFIX,paddleapi.com,多尼爱',
      'DOMAIN-SUFFIX,parallels.com,多尼爱',
      'DOMAIN-SUFFIX,parse.com,多尼爱',
      'DOMAIN-SUFFIX,pdfexpert.com,多尼爱',
      'DOMAIN-SUFFIX,periscope.tv,多尼爱',
      'DOMAIN-SUFFIX,pinboard.in,多尼爱',
      'DOMAIN-SUFFIX,pinterest.com,多尼爱',
      'DOMAIN-SUFFIX,pixelmator.com,多尼爱',
      'DOMAIN-SUFFIX,pixiv.net,多尼爱',
      'DOMAIN-SUFFIX,playpcesor.com,多尼爱',
      'DOMAIN-SUFFIX,playstation.com,多尼爱',
      'DOMAIN-SUFFIX,playstation.com.hk,多尼爱',
      'DOMAIN-SUFFIX,playstation.net,多尼爱',
      'DOMAIN-SUFFIX,playstationnetwork.com,多尼爱',
      'DOMAIN-SUFFIX,pushwoosh.com,多尼爱',
      'DOMAIN-SUFFIX,rime.im,多尼爱',
      'DOMAIN-SUFFIX,servebom.com,多尼爱',
      'DOMAIN-SUFFIX,sfx.ms,多尼爱',
      'DOMAIN-SUFFIX,shadowsocks.org,多尼爱',
      'DOMAIN-SUFFIX,sharethis.com,多尼爱',
      'DOMAIN-SUFFIX,shazam.com,多尼爱',
      'DOMAIN-SUFFIX,skype.com,多尼爱',
      'DOMAIN-SUFFIX,smartdns多尼爱.com,多尼爱',
      'DOMAIN-SUFFIX,smartmailcloud.com,多尼爱',
      'DOMAIN-SUFFIX,sndcdn.com,多尼爱',
      'DOMAIN-SUFFIX,sony.com,多尼爱',
      'DOMAIN-SUFFIX,soundcloud.com,多尼爱',
      'DOMAIN-SUFFIX,sourceforge.net,多尼爱',
      'DOMAIN-SUFFIX,spotify.com,多尼爱',
      'DOMAIN-SUFFIX,squarespace.com,多尼爱',
      'DOMAIN-SUFFIX,sstatic.net,多尼爱',
      'DOMAIN-SUFFIX,st.luluku.pw,多尼爱',
      'DOMAIN-SUFFIX,stackoverflow.com,多尼爱',
      'DOMAIN-SUFFIX,startpage.com,多尼爱',
      'DOMAIN-SUFFIX,staticflickr.com,多尼爱',
      'DOMAIN-SUFFIX,steamcommunity.com,多尼爱',
      'DOMAIN-SUFFIX,symauth.com,多尼爱',
      'DOMAIN-SUFFIX,symcb.com,多尼爱',
      'DOMAIN-SUFFIX,symcd.com,多尼爱',
      'DOMAIN-SUFFIX,tapbots.com,多尼爱',
      'DOMAIN-SUFFIX,tapbots.net,多尼爱',
      'DOMAIN-SUFFIX,tdesktop.com,多尼爱',
      'DOMAIN-SUFFIX,techcrunch.com,多尼爱',
      'DOMAIN-SUFFIX,techsmith.com,多尼爱',
      'DOMAIN-SUFFIX,thepiratebay.org,多尼爱',
      'DOMAIN-SUFFIX,theverge.com,多尼爱',
      'DOMAIN-SUFFIX,time.com,多尼爱',
      'DOMAIN-SUFFIX,timeinc.net,多尼爱',
      'DOMAIN-SUFFIX,tiny.cc,多尼爱',
      'DOMAIN-SUFFIX,tinypic.com,多尼爱',
      'DOMAIN-SUFFIX,tmblr.co,多尼爱',
      'DOMAIN-SUFFIX,todoist.com,多尼爱',
      'DOMAIN-SUFFIX,trello.com,多尼爱',
      'DOMAIN-SUFFIX,trustasiassl.com,多尼爱',
      'DOMAIN-SUFFIX,tumblr.co,多尼爱',
      'DOMAIN-SUFFIX,tumblr.com,多尼爱',
      'DOMAIN-SUFFIX,tweetdeck.com,多尼爱',
      'DOMAIN-SUFFIX,tweetmarker.net,多尼爱',
      'DOMAIN-SUFFIX,twitch.tv,多尼爱',
      'DOMAIN-SUFFIX,txmblr.com,多尼爱',
      'DOMAIN-SUFFIX,typekit.net,多尼爱',
      'DOMAIN-SUFFIX,ubertags.com,多尼爱',
      'DOMAIN-SUFFIX,ublock.org,多尼爱',
      'DOMAIN-SUFFIX,ubnt.com,多尼爱',
      'DOMAIN-SUFFIX,ulyssesapp.com,多尼爱',
      'DOMAIN-SUFFIX,urchin.com,多尼爱',
      'DOMAIN-SUFFIX,usertrust.com,多尼爱',
      'DOMAIN-SUFFIX,v.gd,多尼爱',
      'DOMAIN-SUFFIX,v2ex.com,多尼爱',
      'DOMAIN-SUFFIX,vimeo.com,多尼爱',
      'DOMAIN-SUFFIX,vimeocdn.com,多尼爱',
      'DOMAIN-SUFFIX,vine.co,多尼爱',
      'DOMAIN-SUFFIX,vivaldi.com,多尼爱',
      'DOMAIN-SUFFIX,vox-cdn.com,多尼爱',
      'DOMAIN-SUFFIX,vsco.co,多尼爱',
      'DOMAIN-SUFFIX,vultr.com,多尼爱',
      'DOMAIN-SUFFIX,w.org,多尼爱',
      'DOMAIN-SUFFIX,w3schools.com,多尼爱',
      'DOMAIN-SUFFIX,webtype.com,多尼爱',
      'DOMAIN-SUFFIX,wikiwand.com,多尼爱',
      'DOMAIN-SUFFIX,wikileaks.org,多尼爱',
      'DOMAIN-SUFFIX,wikimedia.org,多尼爱',
      'DOMAIN-SUFFIX,wikipedia.com,多尼爱',
      'DOMAIN-SUFFIX,wikipedia.org,多尼爱',
      'DOMAIN-SUFFIX,windows.com,多尼爱',
      'DOMAIN-SUFFIX,windows.net,多尼爱',
      'DOMAIN-SUFFIX,wire.com,多尼爱',
      'DOMAIN-SUFFIX,wordpress.com,多尼爱',
      'DOMAIN-SUFFIX,workflowy.com,多尼爱',
      'DOMAIN-SUFFIX,wp.com,多尼爱',
      'DOMAIN-SUFFIX,wsj.com,多尼爱',
      'DOMAIN-SUFFIX,wsj.net,多尼爱',
      'DOMAIN-SUFFIX,xda-developers.com,多尼爱',
      'DOMAIN-SUFFIX,xeeno.com,多尼爱',
      'DOMAIN-SUFFIX,xiti.com,多尼爱',
      'DOMAIN-SUFFIX,yahoo.com,多尼爱',
      'DOMAIN-SUFFIX,yimg.com,多尼爱',
      'DOMAIN-SUFFIX,ying.com,多尼爱',
      'DOMAIN-SUFFIX,yoyo.org,多尼爱',
      'DOMAIN-SUFFIX,ytimg.com,多尼爱',
      'DOMAIN-SUFFIX,telegra.ph,多尼爱',
      'DOMAIN-SUFFIX,telegram.org,多尼爱',
      'IP-CIDR,91.108.4.0/22,多尼爱,no-resolve',
      'IP-CIDR,91.108.8.0/21,多尼爱,no-resolve',
      'IP-CIDR,91.108.16.0/22,多尼爱,no-resolve',
      'IP-CIDR,91.108.56.0/22,多尼爱,no-resolve',
      'IP-CIDR,149.154.160.0/20,多尼爱,no-resolve',
      'IP-CIDR6,2001:67c:4e8::/48,多尼爱,no-resolve',
      'IP-CIDR6,2001:b28:f23d::/48,多尼爱,no-resolve',
      'IP-CIDR6,2001:b28:f23f::/48,多尼爱,no-resolve',
      'IP-CIDR,120.232.181.162/32,多尼爱,no-resolve',
      'IP-CIDR,120.241.147.226/32,多尼爱,no-resolve',
      'IP-CIDR,120.253.253.226/32,多尼爱,no-resolve',
      'IP-CIDR,120.253.255.162/32,多尼爱,no-resolve',
      'IP-CIDR,120.253.255.34/32,多尼爱,no-resolve',
      'IP-CIDR,120.253.255.98/32,多尼爱,no-resolve',
      'IP-CIDR,180.163.150.162/32,多尼爱,no-resolve',
      'IP-CIDR,180.163.150.34/32,多尼爱,no-resolve',
      'IP-CIDR,180.163.151.162/32,多尼爱,no-resolve',
      'IP-CIDR,180.163.151.34/32,多尼爱,no-resolve',
      'IP-CIDR,203.208.39.0/24,多尼爱,no-resolve',
      'IP-CIDR,203.208.40.0/24,多尼爱,no-resolve',
      'IP-CIDR,203.208.41.0/24,多尼爱,no-resolve',
      'IP-CIDR,203.208.43.0/24,多尼爱,no-resolve',
      'IP-CIDR,203.208.50.0/24,多尼爱,no-resolve',
      'IP-CIDR,220.181.174.162/32,多尼爱,no-resolve',
      'IP-CIDR,220.181.174.226/32,多尼爱,no-resolve',
      'IP-CIDR,220.181.174.34/32,多尼爱,no-resolve',
      'DOMAIN,injections.adguard.org,DIRECT',
      'DOMAIN,local.adguard.org,DIRECT',
      'DOMAIN-SUFFIX,local,DIRECT',
      'IP-CIDR,127.0.0.0/8,DIRECT',
      'IP-CIDR,172.16.0.0/12,DIRECT',
      'IP-CIDR,192.168.0.0/16,DIRECT',
      'IP-CIDR,10.0.0.0/8,DIRECT',
      'IP-CIDR,17.0.0.0/8,DIRECT',
      'IP-CIDR,100.64.0.0/10,DIRECT',
      'IP-CIDR,224.0.0.0/4,DIRECT',
      'IP-CIDR6,fe80::/10,DIRECT',
      'DOMAIN-SUFFIX,cn,DIRECT',
      'DOMAIN-KEYWORD,-cn,DIRECT',
      'GEOIP,CN,DIRECT',
      'MATCH,多尼爱',
    ]
  }
}
