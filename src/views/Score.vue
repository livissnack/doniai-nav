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
            <div class="operate-box">
              <b-button type="is-success" size="is-small" icon-pack="fas" icon-left="share-alt" v-clipboard:copy="shareUrl" v-clipboard:success="onCopySuccess" v-clipboard:error="onCopyError">分享
              </b-button>
              <b-button type="is-info" size="is-small" icon-pack="fas" icon-left="download" :loading="downloadStatus" @click="downloadScoreCard">
                下载分数卡片
              </b-button>
            </div>
            <div class="see-box">
              <div class="see-content">
                <i class="fas fa-info-circle"></i>
                注意：查询分数卡功能只开放15天，请尽快下载分数卡片
              </div>
            </div>
            <div class="post" ref="score-card">
              <div class="widget">
                <a href="#" class="sub-title title-underline">
                  分数详情
                </a>
              </div>
              <div class="tab-item">
                <div class="item-content">
                  <div class="item-title">学校：</div>
                  <div class="item-value">{{ data.school }}</div>
                </div>
                <div class="item-content">
                  <div class="item-title">班级：</div>
                  <div class="item-value">{{ data.class }}</div>
                </div>
                <div class="item-content">
                  <div class="item-title">学生姓名：</div>
                  <div class="item-value">{{ data.name }}</div>
                </div>
                <div class="item-content" v-for="(item, index) in data.list" :key="index" v-if="item.isScore">
                  <div class="item-score">
                    <div class="item-title">{{ item.name }}：</div>
                    <div class="item-value">{{ item.isScore ? item.score : '' }}</div>
                  </div>
                  <div class="item-remark">
                    <b-tooltip class="tooltip-remark" v-if="item.isScore" type="is-danger" :label="`张三同学：最高分（${item.maxScore}）`" multilined>
                      <small>
                        <i class="far fa-question-circle"></i>
                        班级最高分{{ item.maxScore }}
                      </small>
                    </b-tooltip>
                  </div>
                </div>
                <div class="item-content">
                  <div class="item-title">总分：</div>
                  <div class="item-value">{{ totalScore }}</div>
                </div>
                <div class="study-remark">
                    <span class="remark">
                      {{ data.mailing }}
                    </span>
                </div>
                <div class="chart-box mt20">
                  <div class="chart-title">
                    一、分数条形图
                  </div>
                  <ScoreLine :scoreList="scoreList"/>
                </div>
                <div class="chart-box mt20">
                  <div class="chart-title">
                    二、分数雷达图
                  </div>
                  <ScoreRadar :scoreList="scoreList"/>
                </div>
                <div class="copyright-box">
                  <div class="copyright-content">
                    <span>© {{ year }} Doniai</span>
                    数据来源：{{ data.school }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="column">
            <Sidebar />
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
      year: (new Date().getFullYear()),
      downloadStatus: false,
      current_active_menu_id: 1,
      downloadImgUrl: '',
      data: {
        school: '第二实验小学',
        class: '一（22）班',
        name: '张三',
        list: [
          {
            name: '语文',
            score: 89,
            maxScore: 100,
            isScore: true,
          },
          {
            name: '数学',
            score: 90,
            maxScore: 99,
            isScore: true,
          },
          {
            name: '思想',
            score: 94,
            maxScore: 100,
            isScore: false,
          },
          {
            name: '体育',
            score: 95,
            maxScore: 100,
            isScore: false,
          },
          {
            name: '美术',
            score: 74,
            maxScore: 100,
            isScore: false,
          },
          {
            name: '道法',
            score: 68,
            maxScore: 100,
            isScore: false,
          },
        ],
        mailing: '没有辛勤的汗水，就没有成功的泪水；没有艰辛的付出，激励学习的句子就没有丰硕的果实；没有刻苦的训练，就没有闪光的金牌。',
      },
      studyRemarks: [
          '愿云彩、艳阳一直陪伴你走到海角天涯；鲜花、绿草相随你铺展远大的前程。',
          '目标的坚定是性格中最必要的力量源泉之一，也是成功的武器之一。',
          '人生的意义在于追求，在于奋斗，更在于不懈地与困难作斗争。',
          '惟有埋头才能出头，天天学习，天天进步。',
          '驾驭命运的舵是奋斗。不抱有一丝幻想，不放弃一点机会，不停止一日努力。',
          '没有辛勤的汗水，就没有成功的泪水；没有艰辛的付出，激励学习的句子就没有丰硕的果实；没有刻苦的训练，就没有闪光的金牌。',
      ],
    }
  },
  computed: {
    shareUrl() {
      return window.location.href
    },
    totalScore() {
      let tmpTotalScore = 0
      this.data.list.map((a, b) => {
        if (a.isScore) {
          tmpTotalScore = tmpTotalScore + a.score
        }
      })
      return tmpTotalScore
    },
    scoreList() {
      let tmpScoreList = []
      this.data.list.map((a) => {
        tmpScoreList.push(a.score)
      })
      return tmpScoreList
    },
  },
  methods: {
    updateCurrentNavs(obj) {
      this.current_active_menu_id = obj.menu_id
      this.getCurrentNavs(obj.menu_id)
    },
    downloadScoreCard() {
      this.downloadStatus = true
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
        this.downloadStatus = false
      }).catch(() => {
        this.$buefy.snackbar.open({
          duration: 3000,
          message: '分数卡图片下载失败！',
          type: 'is-danger',
          position: 'is-bottom-right',
          actionText: 'Msg'
        })
        this.downloadStatus = false
      })
    },
    onCopySuccess() {
      this.$buefy.snackbar.open({
        duration: 3000,
        message: `已复制分享链接: ${this.shareUrl} !`,
        type: 'is-success',
        position: 'is-top',
        actionText: 'Msg'
      })
    },
    onCopyError(err) {
      if (err.text === undefined) {
        err.text = '复制失败'
      }
      this.$buefy.snackbar.open({
        duration: 3000,
        message: `${err.text}`,
        type: 'is-danger',
        position: 'is-top',
        actionText: 'Msg'
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
  padding: 16px 30px;
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
    display: flex;
    justify-content: flex-start;
    align-items: center;
    font-size: 14px;
    margin-bottom: 4px;
    .item-title {
      font-weight: bold;
    }
    .item-value {
      font-size: 13px;
      color: #666;
    }
    .item-score {
      width: 100px;
      display: flex;
      justify-content: flex-start;
      align-items: center;
    }
    .item-remark {
      margin-left: 20px;
      .tooltip-remark {
        font-size: 12px;
        padding: 0 10px;
        letter-spacing: 1.5px;
      }
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

.operate-box {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.study-remark {
  margin-top: 12px;
  font-size: 14px;
  color: #222222;
  font-weight: bold;
}

.see-box {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
  .see-content {
    font-size: 12px;
    color: #9c9c9c;
  }
}

.copyright-box {
  display: flex;
  justify-content: center;
  .copyright-content {
    font-size: 12px;
    color: #9c9c9c;
  }
}
</style>
