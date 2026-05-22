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

/* 按钮、Toast 通知等实心样式 */
.button.is-danger,
.notification.is-danger {
  background-color: #ff3860;
  border-color: transparent;
  color: #fff;

  &:hover {
    background-color: #ff3860;
    border-color: transparent;
    color: #fff;
  }
}

/* 表单校验：红框 + 可读文字，避免整块红底盖住输入内容 */
.input.is-danger,
.textarea.is-danger,
.select.is-danger select {
  background-color: #fff;
  border-color: #ef4444;
  color: #1f2937;
}

.help.is-danger {
  background: transparent;
  color: #ef4444;
}

/* 首页导航卡片（data.json 的 color 类名） */
.tab-item a.is-danger,
a.box-item.is-danger {
  background-color: #ff3860;
  border-color: transparent;
  color: #fff;

  &:hover {
    background-color: #f14668;
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

/* 所有带 Sidebar 的页面：侧栏列与卡片宽度 */
.columns > .column {
  min-width: 0;
}

.column .sidebar {
  width: 100%;
  max-width: 100%;
}

@media screen and (max-width: 768px) {
  .columns > .column {
    width: 100% !important;
  }
}
</style>
