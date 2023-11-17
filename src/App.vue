<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'app'
}
</script>

<style lang="less">
#app {
  font-family: 'Helvetica Neue', Helvetica, Arial, 'Hiragino Sans GB',
  'Hiragino Sans GB W3', 'WenQuanYi Micro Hei', 'Microsoft YaHei UI',
  'Microsoft YaHei', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: #ebebeb;
}

.is-primary {
  background-color: #6943d0;
  border-color: transparent;
  color: white;

  &:hover {
    background-color: #714dd2;
    border-color: transparent;
    color: white;
  }
}

.is-success {
  background-color: #20bc56;
  border-color: transparent;
  color: #fff;

  &:hover {
    background-color: #22c65b;
    border-color: transparent;
    color: #fff;
  }
}

.is-danger {
  background-color: #ff3860;
  border-color: transparent;
  color: #fff;

  &:hover {
    background-color: #ff3860;
    border-color: transparent;
    color: #fff;
  }
}

.is-warning {
  background-color: #ffd83d;
  border-color: transparent;
  color: #fff;

  &:hover {
    background-color: #ffdb4a;
    border-color: transparent;
    color: #fff;
  }
}

.is-info {
  background-color: #0e71de;
  border-color: transparent;
  color: #fff;

  &:hover {
    background-color: #0f77ea;
    border-color: transparent;
    color: #fff;
  }
}
</style>
