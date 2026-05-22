<template>
  <div class="sidebar">
    <div v-if="showNews" class="section-box">
      <AsyncNews />
    </div>
    <div v-if="showTools" class="section-box">
      <AsyncTools />
    </div>
    <div v-if="showMusic" class="section-box">
      <AsyncMusic />
    </div>
    <div v-if="showWeather" class="section-box">
      <AsyncWeather />
    </div>
    <div v-if="showTodo" class="section-box task-todo">
      <AsyncTodo />
    </div>
    <div v-if="showPrice" class="section-box task-todo">
      <AsyncPrice />
    </div>
  </div>
</template>

<script>
import { authStore, isPanelVisible } from '@/store/auth'

export default {
  name: 'Sidebar',
  components: {
    AsyncNews: () => import(/* webpackChunkName: "panel-news" */ '@/components/News.vue'),
    AsyncTools: () => import(/* webpackChunkName: "panel-tools" */ '@/components/tools/index.vue'),
    AsyncMusic: () => import(/* webpackChunkName: "panel-music" */ '@/components/Music.vue'),
    AsyncWeather: () => import(/* webpackChunkName: "panel-weather" */ '@/components/Weather.vue'),
    AsyncTodo: () => import(/* webpackChunkName: "panel-todo" */ '@/components/Todo.vue'),
    AsyncPrice: () => import(/* webpackChunkName: "panel-price" */ '@/components/PricePanel.vue'),
  },
  computed: {
    panelState() {
      return authStore.sidebarPanels
    },
    showNews() {
      return isPanelVisible('news')
    },
    showTools() {
      return isPanelVisible('tools')
    },
    showMusic() {
      return isPanelVisible('music')
    },
    showWeather() {
      return isPanelVisible('weather')
    },
    showTodo() {
      return isPanelVisible('todo')
    },
    showPrice() {
      return isPanelVisible('price')
    },
  },
}
</script>

<style lang="less" scoped>
.sidebar {
  width: 100%;
  max-width: 100%;
  min-width: 0;
}

.section-box {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  margin-bottom: 20px;
  box-sizing: border-box;

  /deep/ .util-box,
  /deep/ .news-panel,
  /deep/ .music-box,
  /deep/ .weather-box,
  /deep/ .panel,
  /deep/ .card {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    box-sizing: border-box;
    overflow: hidden;
  }

  /deep/ .music-player,
  /deep/ .aplayer,
  /deep/ .news-body,
  /deep/ .news-carousel,
  /deep/ .news-footer {
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0;
  }

  /deep/ .weather-box .media-left {
    margin-left: 0;
  }

  /deep/ .weather-box .card-content .media {
    flex-wrap: wrap;
  }

  /deep/ .panel-block,
  /deep/ .todo-list {
    max-width: 100%;
  }
}

@media screen and (max-width: 768px) {
  .section-box {
    margin-bottom: 16px;

    /deep/ .util-box,
    /deep/ .news-panel,
    /deep/ .music-box,
    /deep/ .weather-box,
    /deep/ .panel {
      border-radius: 12px;
      box-shadow: 0 2px 12px rgba(15, 23, 42, 0.08);
    }
  }
}
</style>
