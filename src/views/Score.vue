<template>
  <div class="home">
    <div class="nav-box">
      <Navbar @updateCurrentNavs="updateCurrentNavs" :currentActiveMenuId="current_active_menu_id" :newPage="true"
              pageTitle="学生分数查询系统"/>
    </div>
    <div class="content-box">
      <div class="container">
        <UtilPageColumns>
        <div class="columns">
          <div class="column is-three-quarters">
            <ScoreInput :loading="searchLoading" :initial-key="routeKey" @search="fetchScore" />
            <div class="operate-box">
              <o-button variant="success" size="small" icon-pack="fas" icon-left="share-alt" @click="copyShareUrl">分享
              </o-button>
              <o-button variant="info" size="small" icon-pack="fas" icon-left="download" :loading="downloadStatus" @click="downloadScoreCard">
                下载分数卡片
              </o-button>
            </div>
            <div class="see-box">
              <div class="see-content">
                <AppIcon name="info-circle"  />
                注意：查询分数卡功能只开放15天，请尽快下载分数卡片
              </div>
            </div>
            <div v-if="!dataLoaded" class="score-empty">
              <AppIcon name="id-card"  />
              <p>请输入查询秘钥，或打开老师分享的带 <code>?key=</code> 的链接查看分数卡。</p>
              <p class="score-empty__hint">分数查询服务若已过期，请使用下方示例预览版式并下载保存。</p>
            </div>
            <div class="post" ref="score-card">
              <div class="widget">
                <a href="#" class="sub-title title-underline">
                  分数详情
                </a>
                <span v-if="!dataLoaded" class="preview-tag">示例预览</span>
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
                <div class="item-content" v-for="(item, index) in scoreItems" :key="index">
                  <div class="item-score">
                    <div class="item-title">{{ item.name }}：</div>
                    <div class="item-value">{{ item.score }}</div>
                  </div>
                  <div class="item-remark">
                    <o-tooltip
                      class="tooltip-remark"
                      variant="danger"
                      :label="`${data.name}同学：最高分（${item.maxScore}）`"
                      multiline
                    >
                      <small>
                        <AppIcon name="question-circle" pack="regular" />
                        班级最高分{{ item.maxScore }}
                      </small>
                    </o-tooltip>
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
                  <ScoreLine :scoreList="scoreList" :subjectNames="subjectNames" />
                </div>
                <div class="chart-box mt20">
                  <div class="chart-title">
                    二、分数雷达图
                  </div>
                  <ScoreRadar :scoreList="scoreList" :subjectNames="subjectNames" />
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
          <SidebarColumn />
        </div>
        </UtilPageColumns>
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
import { saveAs } from 'file-saver'
import Navbar from '@/components/Navbar.vue'
import SidebarColumn from '@/components/SidebarColumn.vue'
import UtilPageColumns from '@/components/UtilPageColumns.vue'
import Footer from '@/components/Footer.vue'
import ScoreInput from '@/components/ScoreInput.vue'
import ScoreLine from '@/components/chart/Line.vue'
import ScoreRadar from '@/components/chart/Radar.vue'
import { getStudentScore } from '@/services/api'

const DEMO_SCORE = {
  school: '第二实验小学',
  class: '一（22）班',
  name: '张三',
  list: [
    { name: '语文', score: 89, maxScore: 100, isScore: true },
    { name: '数学', score: 90, maxScore: 99, isScore: true },
    { name: '思想', score: 94, maxScore: 100, isScore: false },
    { name: '体育', score: 95, maxScore: 100, isScore: false },
    { name: '美术', score: 74, maxScore: 100, isScore: false },
    { name: '道法', score: 68, maxScore: 100, isScore: false },
  ],
  mailing:
    '没有辛勤的汗水，就没有成功的泪水；没有艰辛的付出，激励学习的句子就没有丰硕的果实；没有刻苦的训练，就没有闪光的金牌。',
}

function normalizeScorePayload(res) {
  const raw = res?.data
  const scoreBlock = raw?.score
  const body =
    (scoreBlock && typeof scoreBlock === 'object' && (scoreBlock.data ?? scoreBlock)) ||
    raw?.data ||
    raw

  if (!body || typeof body !== 'object' || !Array.isArray(body.list)) {
    return null
  }

  return {
    school: body.school || '—',
    class: body.class || body.className || '—',
    name: body.name || '—',
    list: body.list.map((item) => ({
      name: item.name,
      score: Number(item.score) || 0,
      maxScore: Number(item.maxScore) || 100,
      isScore: item.isScore !== false,
    })),
    mailing: body.mailing || body.remark || '',
  }
}

export default {
  name: 'Score',
  components: {
    ScoreLine,
    ScoreRadar,
    ScoreInput,
    Navbar,
    SidebarColumn,
    UtilPageColumns,
    Footer
  },
  data() {
    return {
      year: (new Date().getFullYear()),
      downloadStatus: false,
      searchLoading: false,
      dataLoaded: false,
      lastSearchKey: '',
      current_active_menu_id: 1,
      downloadImgUrl: '',
      data: { ...DEMO_SCORE, list: DEMO_SCORE.list.map((item) => ({ ...item })) },
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
    routeKey() {
      const key = this.$route.query?.key
      return typeof key === 'string' ? key : ''
    },
    shareUrl() {
      const url = new URL(window.location.href)
      const key = this.lastSearchKey || this.routeKey
      if (key) {
        url.searchParams.set('key', key)
      }
      return url.toString()
    },
    totalScore() {
      let tmpTotalScore = 0
      this.data.list.map(a => {
        if (a.isScore) {
          tmpTotalScore = tmpTotalScore + a.score
        }
      })
      return tmpTotalScore
    },
    scoreList() {
      return this.data.list.map((a) => a.score)
    },
    scoreItems() {
      return this.data.list.filter((item) => item.isScore)
    },
    subjectNames() {
      return this.data.list.map((item) => item.name)
    },
  },
  created() {
    if (this.routeKey) {
      this.lastSearchKey = this.routeKey
      this.fetchScore(this.routeKey)
    }
  },
  methods: {
    updateCurrentNavs(obj) {
      this.current_active_menu_id = obj.menu_id
    },
    async fetchScore(key) {
      const secret = String(key || '').trim()
      if (!secret) return

      this.searchLoading = true
      try {
        const res = await getStudentScore(secret)
        const parsed = normalizeScorePayload(res)
        if (!parsed) {
          throw new Error('invalid score payload')
        }
        this.data = parsed
        this.dataLoaded = true
        this.lastSearchKey = secret
        if (this.$route.query?.key !== secret) {
          this.$router.replace({ path: '/score', query: { key: secret } })
        }
        this.$notify({
          duration: 3000,
          message: `已加载 ${parsed.name} 的分数卡`,
          type: 'is-success',
          position: 'is-bottom-right',
          actionText: 'Msg',
        })
      } catch (e) {
        console.error('fetchScore failed:', e)
        this.$notify({
          duration: 4000,
          message: '分数查询失败：秘钥无效或服务已过期，可先使用下方示例分数卡下载保存',
          type: 'is-danger',
          position: 'is-bottom-right',
          actionText: 'Msg',
        })
      } finally {
        this.searchLoading = false
      }
    },
    downloadScoreCard() {
      const dom = this.$refs['score-card']
      if (!dom) return
      this.downloadStatus = true
      html2canvas(dom, {
        allowTaint: true,
        scale: 1.5,
        backgroundColor: '#ffffff',
        logging: false,
      })
        .then((canvas) => {
          canvas.toBlob((blob) => {
            if (blob) {
              saveAs(blob, `score-${Date.now()}.png`)
              this.$notify({
                duration: 3000,
                message: '分数卡图片下载成功！',
                type: 'is-success',
                position: 'is-bottom-right',
                actionText: 'Msg',
              })
            }
            this.downloadStatus = false
          }, 'image/png', 0.92)
        })
        .catch((e) => {
          console.error('download score card failed:', e)
          this.$notify({
            duration: 3000,
            message: '分数卡图片下载失败！',
            type: 'is-danger',
            position: 'is-bottom-right',
            actionText: 'Msg',
          })
          this.downloadStatus = false
        })
    },
    copyShareUrl() {
      this.$copyText(this.shareUrl).then(() => this.onCopySuccess()).catch(() => this.onCopyError({ text: '复制失败' }))
    },
    onCopySuccess() {
      this.$notify({
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
      this.$notify({
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

  .preview-tag {
    margin-left: 10px;
    padding: 2px 8px;
    border-radius: 999px;
    background: #f3ecff;
    color: #6943d0;
    font-size: 12px;
    font-weight: 600;
  }
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

.score-empty {
  margin-bottom: 16px;
  padding: 16px 18px;
  border: 1px dashed #d8d8d8;
  border-radius: 8px;
  background: #fafafa;
  color: #666;
  font-size: 14px;
  line-height: 1.6;

  i {
    color: #6943d0;
    margin-right: 6px;
  }

  code {
    padding: 1px 6px;
    border-radius: 4px;
    background: #eee;
    color: #444;
    font-size: 12px;
  }
}

.score-empty__hint {
  margin-top: 6px;
  font-size: 12px;
  color: #999;
}

@media screen and (max-width: 768px) {
  .operate-box {
    flex-direction: column;
    gap: 8px;

    :deep(.button) {
      width: 100%;
    }
  }
}
</style>
