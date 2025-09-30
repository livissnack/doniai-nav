<template>
  <div class="home">
    <div class="nav-box">
      <Navbar @updateCurrentNavs="updateCurrentNavs" :currentActiveMenuId="current_active_menu_id" :newPage="true"
              pageTitle="学生随机点名系统"/>
    </div>
    <div class="content-box">
      <div class="container">
        <div class="columns">
          <div class="column is-three-quarters">
            <div class="see-box">
              <div class="see-content">
                <i class="fas fa-info-circle"></i>
                注意：学生名单存于浏览器本地，只需录入一次即可！如果清除浏览器缓存，则需要再次录入学生名单！
              </div>
            </div>
            <div class="post" ref="score-card">
              <div class="history-list">
                <div class="history-title">
                  已点学生名单
                </div>
                <div class="item-content" v-for="(item, index) in historyList" :key="index">
                  <div class="item-title">学生姓名：</div>
                  <div class="item-value">{{ item.name }}</div>
                  <div class="item-time">{{ item.time }}</div>
                </div>
              </div>

              <div class="total-fenxi">
                <StudyNum :rollCallData="selectedNumData"/>
              </div>

              <div class="widget">
                <a href="#" class="sub-title title-underline">
                  点名系统
                </a>
              </div>
              <div class="tab-item">
                <div class="item-content">
                  <div class="item-title">学校：</div>
                  <div class="item-value">{{ data.school }}</div>
                </div>

                <div class="rollcall-box">
                  <div class="study-info">
                    <div class="study-name">
                      {{ selectedStudent }}
                    </div>
                    <div class="system-btns">
                      <div class="buttons">
                        <button class="button is-danger is-dark is-large" @click="startRollCall" :disabled="isRolling">
                          {{ isRolling ? '点名中...' : '开始点名' }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>


                <div class="study-remark">
                    <span class="remark">
                      {{ data.mailing }}
                    </span>
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
            <div class="study-list">
              <div class="operate-box1">
                <div class="operate-title">录入学生名单</div>
                <div class="reset-btn">
                  <button class="button is-dark is-small" @click="clearHistory">重置名单</button>
                </div>
              </div>

              <p class="control">
               <textarea class="textarea" placeholder="请输入学生名单，用空格间隔开" rows="10" v-model="studentListInput"
                         @input="updateStudentList"></textarea>
              </p>
            </div>
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
import ScoreInput from "@/components/ScoreInput.vue"
import ScoreLine from "@/components/chart/Line.vue"
import ScoreRadar from "@/components/chart/Radar.vue"
import StudyNum from "@/components/chart/StudyNum.vue";

Vue.use(BackTop)
export default {
  name: 'score',
  components: {
    StudyNum,
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
      current_active_menu_id: 1,
      isRolling: false, // 是否正在点名
      rollCallTimer: null, // 定时器
      rollCallDuration: 3000, // 滚动持续时间(毫秒)
      studentList: [], // 学生名单数组
      studentListInput: '', // 学生名单输入框内容
      selectedStudent: '等待点名', // 当前选中的学生
      data: {
        school: '第二实验小学',
        mailing: '没有辛勤的汗水，就没有成功的泪水；没有艰辛的付出，激励学习的句子就没有丰硕的果实；没有刻苦的训练，就没有闪光的金牌。',
        list: [
          { value: 5, name: '张三' },
          { value: 3, name: '李四' },
          { value: 7, name: '王五' },
        ],
      },
      historyList: [],
    }
  },
  computed: {
    selectedNumData() {
      // 统计每个学生被点名的次数
      const countMap = {}

      // 遍历历史记录，统计次数
      this.historyList.forEach(item => {
        if (countMap[item.name]) {
          countMap[item.name]++
        } else {
          countMap[item.name] = 1
        }
      })

      // 转换为饼状图所需的数据格式
      const result = []
      for (const [name, count] of Object.entries(countMap)) {
        result.push({
          value: count,
          name: name
        })
      }

      return result
    }
  },
  mounted() {
    this.loadStudentList()
    this.loadHistory()
  },
  beforeDestroy() {
    // 组件销毁前清理定时器
    if (this.rollCallTimer) {
      clearTimeout(this.rollCallTimer)
    }
  },
  methods: {
    updateCurrentNavs(obj) {
      this.current_active_menu_id = obj.menu_id
      this.getCurrentNavs(obj.menu_id)
    },
    // 更新学生名单
    updateStudentList() {
      if (this.studentListInput.trim()) {
        this.studentList = this.studentListInput.trim().split(/\s+/)
        localStorage.setItem('DONIAI_STUDENT_LIST', JSON.stringify(this.studentList))
      } else {
        this.studentList = [];
        localStorage.removeItem('DONIAI_STUDENT_LIST')
      }
    },

    loadStudentList() {
      const savedList = localStorage.getItem('DONIAI_STUDENT_LIST')
      if (savedList) {
        try {
          this.studentList = JSON.parse(savedList);
          this.studentListInput = this.studentList.join(' ')
          if (this.studentList.length > 0 && this.selectedStudent === '等待点名') {
            this.selectedStudent = this.studentList[0]
          }
        } catch (e) {
          console.error('解析学生名单失败:', e)
        }
      }
    },

    // 开始点名
    startRollCall() {
      if (this.studentList.length === 0) {
        this.$buefy.snackbar.open({
          duration: 3000,
          message: '请先录入学生名单！',
          type: 'is-danger',
          position: 'is-bottom-right',
          actionText: 'Msg'
        })
        return
      }

      this.isRolling = true
      const startTime = Date.now()

      const changeName = () => {
        if (this.studentList.length <= 1) {
          this.selectedStudent = this.studentList[0] || '无学生';
          return;
        }

        let randomIndex;
        // 确保不与当前选中的学生重复
        do {
          randomIndex = Math.floor(Math.random() * this.studentList.length);
        } while (this.studentList[randomIndex] === this.selectedStudent);

        this.selectedStudent = this.studentList[randomIndex];
      }

      const roll = () => {
        changeName()
        if (Date.now() - startTime < this.rollCallDuration) {
          requestAnimationFrame(roll)
        } else {
          // 时间到了，结束点名
          this.isRolling = false
          this.addToHistory(this.selectedStudent)
        }
      }
      roll()
    },

    // 添加历史记录方法
    addToHistory(studentName) {
      const now = new Date()
      const timeString = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`

      this.historyList.push({
        name: studentName,
        time: timeString
      })

      if (this.historyList.length > 50) {
        this.historyList.shift()
      }

      sessionStorage.setItem('DONIAI_ROLLCALL_HISTORY', JSON.stringify(this.historyList))
    },

    clearHistory() {
      this.historyList = []
      sessionStorage.removeItem('DONIAI_ROLLCALL_HISTORY')
    },

    loadHistory() {
      const savedHistory = sessionStorage.getItem('DONIAI_ROLLCALL_HISTORY')
      if (savedHistory) {
        try {
          this.historyList = JSON.parse(savedHistory)
        } catch (e) {
          console.error('解析点名历史记录失败:', e)
        }
      }
    }
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
  position: relative;
  .history-list {
    width: 200px;
    position: absolute;
    top: 16px;
    right: 32px;
    .history-title {
      text-align: right;
      color: #7957d5;
      font-size: 20px;
      margin-bottom: 12px;
    }
    .item-content {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      font-size: 14px;
      .item-time {
        margin-left: 8px;
      }
    }
  }

  .total-fenxi {
    position: absolute;
    bottom: 20px;
    right: 32px;
  }
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
}

.operate-box1 {
  display: flex;
  justify-content: space-between;
  padding: 4px 16px;
  font-size: 1em;
  font-weight: 700;
  color: #363636;
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

.study-list {
  background: #FFFFFF;
}

.rollcall-box {
  width: 100%;
  min-height: 620px;
  display: flex;
  justify-content: center;
  .study-info {
    margin-top: 100px;
    .study-name {
      height: 50px;
      text-align: center;
      font-size: 32px;
    }
  }
}
</style>
