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
  let hour = time.getHours()
  let minute = time.getMinutes()
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
