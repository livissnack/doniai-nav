<template>
  <div class="home">
    <div class="nav-box">
      <Navbar :newPage="true" :newUrl="`/utils/cover`" pageTitle="封面生成器">
      </Navbar>
    </div>

    <div class="section-box">
      <div class="title-box">
        <div class="title">
          <span>封面生成器</span>
        </div>
        <div class="subtitle">
          <span>快速、轻松地制作漂亮的封面</span>
        </div>
      </div>
      <div class="content-box">
        <div class="left-box">
          <div class="set-box">
            <b-field label="Simple">
              <b-slider type="is-success" v-model="value"></b-slider>
            </b-field>
          </div>
        </div>
        <div class="right-box">
          adsdsa
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
import BackTop from '@mlqt/vue-back-top'
import Footer from '@/components/Footer.vue'

Vue.use(BackTop)
export default {
  name: 'Project',
  components: {
    Navbar,
    Footer,
  },
  data() {
    return {

    }
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
.home {
  .nav-box {
    text-align: center;
    background: #FFFFFF;
    border-top: 1px solid #ebebeb;
  }
  .section-box {
    padding: 20px 0;
    .title-box {
      .title {
        text-align: center;
      }
      .subtitle {
        text-align: center;
      }
    }
    .content-box {
      padding: 20px;
      display: flex;
      justify-content: space-between;
      height: 800px;
      .left-box {
        width: 400px;
        min-width: 400px;
        border: 1px solid rgba(75, 85, 99, 1);
        border-radius: 6px;
        .set-box {
          padding: 20px;
        }
      }
      .right-box {
        margin-left: 20px;
        flex: 1;
        border: 1px solid rgba(75, 85, 99, 1);
        border-radius: 6px;
      }
    }
  }
}
</style>
    