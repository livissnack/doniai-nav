<template>
  <div class="home">
    <div class="backtop">
      <back-top color="#409EFF" :size="1.1" :slow="10"></back-top>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import BackTop from '@mlqt/vue-back-top'

Vue.use(BackTop)
export default {
  name: 'BtnDesign',
  components: {
  },
  data() {
    return {}
  },
  methods: {
    jumpSoftwareDetail(item) {
      this.$router.push({
        path: `/utils/software/${item.id}`
      })
    },
  }
}
</script>

<style lang="less" scoped>
</style>
