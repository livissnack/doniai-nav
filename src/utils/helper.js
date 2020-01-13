export function removeArr(_arr, _obj) {
  let length = _arr.length
  for (let i = 0; i < length; i++) {
    if (_arr[i] == _obj) {
      _arr.splice(i, 1)
      return _arr
    }
  }
}
