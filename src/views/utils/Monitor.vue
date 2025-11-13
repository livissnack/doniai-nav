<template>
  <div class="home">
    <div class="nav-box">
      <Navbar :newPage="true" pageTitle="服务器监控助手"/>
    </div>
    <div class="content-box">
      <div class="container">
        <div class="columns">
          <div class="column is-three-quarters">
            <div class="monitor-container">
              <!-- 添加监控探针组件 -->
              <MonitorProbe />
            </div>
          </div>
          <div class="column">
            <Sidebar/>
          </div>
        </div>
      </div>
    </div>

    <div class="backtop">
      <back-top color="#409EFF" :size="1.1" :slow="10"></back-top>
    </div>
    <div id="footer">
      <Footer/>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import Navbar from '@/components/Navbar.vue'
import Sidebar from '@/components/Sidebar.vue'
import BackTop from '@mlqt/vue-back-top'
import Footer from '@/components/Footer.vue'
import MonitorProbe from '@/components/MonitorProbe.vue'
import {isEmpty} from "@/utils/helper"

Vue.use(BackTop)
export default {
  name: 'json',
  components: {
    Navbar,
    Sidebar,
    Footer,
    MonitorProbe,
  },
  data() {
    return {

    }
  },
  created() {

  },
  methods: {

  }
}
</script>

<style lang="less" scoped>
.nav-box {
  text-align: center;
  background: #ffffff;
  border-top: 1px solid #ebebeb;
  margin-bottom: 35px;
  border-bottom: 2px solid #e1e1e1;
}

.monitor-container {
  background: #FFFFFF;
  min-height: 1200px;
  margin-bottom: 40px;
}
</style>
