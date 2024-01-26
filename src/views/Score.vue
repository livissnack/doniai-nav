<template>
  <div class="home">
    <div class="nav-box">
      <Navbar @updateCurrentNavs="updateCurrentNavs" :currentActiveMenuId="current_active_menu_id" :newPage="true"
              pageTitle="学生分数查询系统"/>
    </div>
    <div class="content-box">
      <div class="container">
        <div class="columns">
          <div class="column is-three-quarters">
            <ScoreInput/>
            <div class="post" ref="score-card">
              <div class="widget">
                <a href="#" class="sub-title title-underline">
                  分数详情
                </a>
                <div class="download-box" @click="downloadScoreCard">
                  下载分数卡
                </div>
              </div>
              <div class="tab-item">
                <div class="item-content">
                  <div class="item-title">学生姓名：</div>
                  <div class="item-value">张三</div>
                </div>
                <div class="item-content">
                  <div class="item-title">语文：</div>
                  <div class="item-value">100</div>
                  <div class="item-remark">
                    <b-tooltip type="is-warning"
                               label="张三同学：最高分（100）"
                               multilined>
                      <small>
                        <i class="far fa-question-circle"></i>
                        班级最高分
                      </small>
                    </b-tooltip>
                  </div>
                </div>
                <div class="item-content">
                  <div class="item-title">数学：</div>
                  <div class="item-value">100</div>
                  <div class="item-remark">
                    <b-tooltip type="is-warning"
                               label="张三同学：最高分（100）"
                               multilined>
                      <small>
                        <i class="far fa-question-circle"></i>
                        班级最高分
                      </small>
                    </b-tooltip>
                  </div>
                </div>
                <div class="item-content">
                  <div class="item-title">总分：</div>
                  <div class="item-value">100</div>
                  <div class="item-remark">
                    <b-tooltip type="is-warning"
                               label="张三同学：最高分（100）"
                               multilined>
                      <small>
                        <i class="far fa-question-circle"></i>
                        班级最高分
                      </small>
                    </b-tooltip>
                  </div>
                </div>
                <div class="chart-box mt40">
                  <div class="chart-title">
                    一、分数条形图
                  </div>
                  <ScoreLine/>
                </div>
                <div class="chart-box mt20">
                  <div class="chart-title">
                    二、分数雷达图
                  </div>
                  <ScoreRadar/>
                </div>
              </div>
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
import html2canvas from 'html2canvas'
import Vue from 'vue'
import Navbar from '@/components/Navbar.vue'
import Sidebar from '@/components/Sidebar.vue'
import BackTop from '@mlqt/vue-back-top'
import Footer from '@/components/Footer.vue'
import ScoreInput from "@/components/ScoreInput.vue"
import ScoreLine from "@/components/chart/Line.vue"
import ScoreRadar from "@/components/chart/Radar.vue"

Vue.use(BackTop)
export default {
  name: 'score',
  components: {
    ScoreLine,
    ScoreRadar,
    ScoreInput,
    Navbar,
    Sidebar,
    Footer
  },
  data() {
    return {
      current_active_menu_id: 1,
      downloadImgUrl: '',
    }
  },
  methods: {
    updateCurrentNavs(obj) {
      this.current_active_menu_id = obj.menu_id
      this.getCurrentNavs(obj.menu_id)
    },
    downloadScoreCard() {
      let dom = this.$refs['score-card']
      html2canvas(dom, {
        allowTaint: true,
        taintTest: true,
        // useCORS: true,
      }).then((canvas) => {
        this.downloadImgUrl = canvas.toDataURL('image/png')
        const link = document.createElement('a')
        link.href = this.downloadImgUrl
        link.download = 'score.png'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        this.$buefy.snackbar.open({
          duration: 3000,
          message: '分数卡图片下载成功！',
          type: 'is-success',
          position: 'is-bottom-right',
          actionText: 'Msg'
        })
      }).catch(() => {
        this.$buefy.snackbar.open({
          duration: 3000,
          message: '分数卡图片下载失败！',
          type: 'is-danger',
          position: 'is-bottom-right',
          actionText: 'Msg'
        })
      })
    },
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

.is-active {
  color: #7957d5 !important;
  font-weight: bold;
}

.mt14 {
  margin-top: 14px;
}

.mt20 {
  margin-top: 20px;
}

.mt40 {
  margin-top: 40px;
}

.score-box {
  background: #FFFFFF;
}

.post {
  background: #ffffff;
  padding: 35px;
  margin-bottom: 35px;
}

.widget {
  position: relative;
  margin-bottom: 20px;
  .download-box {
    right: 0;
    top: 0;
    position: absolute;
    color: #7957d5;
    &:hover {
      text-decoration: underline;
    }
  }
}

.title-underline {
  text-decoration: none;
  border-bottom: 1px solid #e67e22;
}

.tab-item {
  .item-content {
    width: 200px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    .item-remark {
      margin-left: 20px;
    }
  }

  .chart-box {
    .chart-title {
      text-align: center;
      color: #1a1a1a;
      font-weight: bold;
      margin-bottom: 16px;
    }
  }

  .box-item {
    box-shadow: 1px 1px 5px #ccc5c5;
  }
}
</style>
