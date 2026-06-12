<template>
  <div class="home">
    <div class="nav-box">
      <Navbar
        @updateCurrentNavs="updateCurrentNavs"
        :currentActiveMenuId="current_active_menu_id"
        :newPage="true"
        pageTitle="学生随机点名系统"
      />
    </div>

    <div class="content-box">
      <div class="container">
        <UtilPageColumns>
          <div class="columns">
            <div class="column is-three-quarters">
              <div class="tip-banner">
                <i class="fas fa-info-circle"></i>
                <span>学生名单存于浏览器本地，只需录入一次。清除浏览器缓存后需重新录入。</span>
              </div>

              <div class="rollcall-card">
                <div class="card-header">
                  <div class="card-title">
                    <i class="fas fa-random"></i>
                    随机点名
                  </div>
                  <div class="school-tag">
                    <i class="fas fa-school"></i>
                    {{ data.school }}
                  </div>
                </div>

                <div class="rollcall-stage" :class="{ 'is-rolling': isRolling }">
                  <div class="stage-label">当前学生</div>
                  <div class="student-name">{{ selectedStudent }}</div>
                  <div class="student-meta">
                    共 {{ studentList.length }} 人 · 已点 {{ historyList.length }} 次
                  </div>
                  <o-button
                    variant="danger"
                    size="large"
                    icon-pack="fas"
                    :icon-left="isRolling ? 'spinner' : 'play'"
                    :loading="isRolling"
                    :disabled="isRolling || !studentList.length"
                    @click="startRollCall"
                  >
                    {{ isRolling ? '点名中…' : '开始点名' }}
                  </o-button>
                </div>

                <div class="quote-box">
                  <i class="fas fa-quote-left"></i>
                  <p>{{ data.mailing }}</p>
                </div>

                <div class="card-footer">
                  © {{ year }} Doniai · 数据来源：{{ data.school }}
                </div>
              </div>
            </div>

            <div class="column sidebar-column">
              <div class="side-card">
                <div class="side-card-header">
                  <span class="side-title">
                    <i class="fas fa-user-edit"></i>
                    录入学生名单
                  </span>
                  <o-button size="small" variant="dark" outlined @click="clearHistory">重置记录</o-button>
                </div>
                <textarea
                  class="student-textarea"
                  placeholder="请输入学生名单，用空格隔开&#10;例如：张三 李四 王五"
                  rows="8"
                  v-model="studentListInput"
                  @input="updateStudentList"
                />
                <div class="student-count">
                  已录入 <strong>{{ studentList.length }}</strong> 名学生
                </div>
              </div>

              <div class="side-card">
                <div class="side-card-header">
                  <span class="side-title">
                    <i class="fas fa-history"></i>
                    已点学生
                    <span class="badge">{{ historyList.length }}</span>
                  </span>
                </div>
                <div v-if="historyList.length" class="history-list">
                  <div v-for="(item, index) in historyList.slice().reverse()" :key="index" class="history-item">
                    <span class="history-index">{{ historyList.length - index }}</span>
                    <span class="history-name">{{ item.name }}</span>
                    <span class="history-time">{{ item.time }}</span>
                  </div>
                </div>
                <div v-else class="history-empty">
                  <i class="fas fa-inbox"></i>
                  <span>暂无点名记录</span>
                </div>
              </div>

              <div class="side-card chart-card">
                <div class="side-card-header">
                  <span class="side-title">
                    <i class="fas fa-chart-pie"></i>
                    点名统计
                  </span>
                </div>
                <div class="chart-wrap">
                  <StudyNum :rollCallData="selectedNumData" />
                </div>
              </div>
            </div>
          </div>
        </UtilPageColumns>
      </div>
    </div>

    <div class="backtop">
      <back-top color="#409EFF" :size="1.1" :slow="10"></back-top>
    </div>
    <div id="footer">
      <Footer />
    </div>
  </div>
</template>

<script>
import Navbar from '@/components/Navbar.vue'
import UtilPageColumns from '@/components/UtilPageColumns.vue'
import Footer from '@/components/Footer.vue'
import StudyNum from '@/components/chart/StudyNum.vue'

export default {
  name: 'Rollcall',
  components: {
    StudyNum,
    Navbar,
    UtilPageColumns,
    Footer,
  },
  data() {
    return {
      year: new Date().getFullYear(),
      current_active_menu_id: 1,
      isRolling: false,
      rollCallDuration: 3000,
      studentList: [],
      studentListInput: '',
      selectedStudent: '等待点名',
      data: {
        school: '第二实验小学',
        mailing:
          '没有辛勤的汗水，就没有成功的泪水；没有艰辛的付出，就没有丰硕的果实；没有刻苦的训练，就没有闪光的金牌。',
      },
      historyList: [],
    }
  },
  computed: {
    selectedNumData() {
      const countMap = {}
      this.historyList.forEach((item) => {
        countMap[item.name] = (countMap[item.name] || 0) + 1
      })
      return Object.entries(countMap).map(([name, count]) => ({ value: count, name }))
    },
  },
  mounted() {
    this.loadStudentList()
    this.loadHistory()
  },
  beforeUnmount() {
    if (this.rollCallTimer) {
      clearTimeout(this.rollCallTimer)
    }
  },
  methods: {
    updateCurrentNavs(obj) {
      this.current_active_menu_id = obj.menu_id
    },
    updateStudentList() {
      if (this.studentListInput.trim()) {
        this.studentList = this.studentListInput.trim().split(/\s+/)
        localStorage.setItem('DONIAI_STUDENT_LIST', JSON.stringify(this.studentList))
      } else {
        this.studentList = []
        localStorage.removeItem('DONIAI_STUDENT_LIST')
      }
    },
    loadStudentList() {
      const savedList = localStorage.getItem('DONIAI_STUDENT_LIST')
      if (!savedList) return
      try {
        this.studentList = JSON.parse(savedList)
        this.studentListInput = this.studentList.join(' ')
        if (this.studentList.length > 0 && this.selectedStudent === '等待点名') {
          this.selectedStudent = this.studentList[0]
        }
      } catch (e) {
        console.error('解析学生名单失败:', e)
      }
    },
    startRollCall() {
      if (!this.studentList.length) {
        this.$notify({
          duration: 3000,
          message: '请先录入学生名单！',
          type: 'is-danger',
          position: 'is-bottom-right',
          actionText: 'Msg',
        })
        return
      }

      this.isRolling = true
      const startTime = Date.now()

      const changeName = () => {
        if (this.studentList.length <= 1) {
          this.selectedStudent = this.studentList[0] || '无学生'
          return
        }
        let randomIndex
        do {
          randomIndex = Math.floor(Math.random() * this.studentList.length)
        } while (this.studentList[randomIndex] === this.selectedStudent)
        this.selectedStudent = this.studentList[randomIndex]
      }

      const roll = () => {
        changeName()
        if (Date.now() - startTime < this.rollCallDuration) {
          requestAnimationFrame(roll)
        } else {
          this.isRolling = false
          this.addToHistory(this.selectedStudent)
        }
      }
      roll()
    },
    addToHistory(studentName) {
      const now = new Date()
      const timeString = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
      this.historyList.push({ name: studentName, time: timeString })
      if (this.historyList.length > 50) {
        this.historyList.shift()
      }
      sessionStorage.setItem('DONIAI_ROLLCALL_HISTORY', JSON.stringify(this.historyList))
    },
    clearHistory() {
      this.historyList = []
      sessionStorage.removeItem('DONIAI_ROLLCALL_HISTORY')
      this.$notify({
        duration: 2000,
        message: '点名记录已重置',
        type: 'is-success',
        position: 'is-bottom-right',
        actionText: 'Msg',
      })
    },
    loadHistory() {
      const savedHistory = sessionStorage.getItem('DONIAI_ROLLCALL_HISTORY')
      if (!savedHistory) return
      try {
        this.historyList = JSON.parse(savedHistory)
      } catch (e) {
        console.error('解析点名历史记录失败:', e)
      }
    },
  },
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

.content-box {
  padding-bottom: 40px;
}

.tip-banner {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 16px;
  padding: 12px 14px;
  font-size: 13px;
  line-height: 1.6;
  color: #666;
  background: #f0f8ff;
  border: 1px solid #d6ebff;
  border-radius: 8px;
  border-left: 3px solid #2095f2;

  i {
    margin-top: 2px;
    color: #2095f2;
    flex-shrink: 0;
  }
}

.rollcall-card {
  background: #fff;
  border-radius: 8px;
  border: 1px solid #eee;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  margin-bottom: 200px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
  background: linear-gradient(135deg, #fafbfc 0%, #fff 100%);

  .card-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 18px;
    font-weight: 700;
    color: #363636;

    i {
      color: #7957d5;
    }
  }

  .school-tag {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 12px;
    font-size: 13px;
    color: #666;
    background: #f5f5f5;
    border-radius: 16px;

    i {
      color: #7957d5;
    }
  }
}

.rollcall-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 320px;
  padding: 40px 24px;
  background: linear-gradient(180deg, #faf8ff 0%, #fff 100%);

  .stage-label {
    font-size: 13px;
    color: #888;
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-bottom: 12px;
  }

  .student-name {
    font-size: 48px;
    font-weight: 800;
    color: #363636;
    text-align: center;
    line-height: 1.2;
    min-height: 58px;
    transition: color 0.15s;
    word-break: break-all;
  }

  &.is-rolling .student-name {
    color: #7957d5;
    animation: namePulse 0.12s ease-in-out infinite alternate;
  }

  .student-meta {
    margin: 16px 0 28px;
    font-size: 13px;
    color: #aaa;
  }
}

@keyframes namePulse {
  from {
    transform: scale(1);
    opacity: 0.85;
  }
  to {
    transform: scale(1.03);
    opacity: 1;
  }
}

.quote-box {
  display: flex;
  gap: 10px;
  margin: 0 24px;
  padding: 14px 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 3px solid #e67e22;

  i {
    color: #e67e22;
    font-size: 14px;
    margin-top: 3px;
    flex-shrink: 0;
  }

  p {
    margin: 0;
    font-size: 14px;
    line-height: 1.7;
    color: #555;
    font-weight: 500;
  }
}

.card-footer {
  margin-top: 20px;
  padding: 14px 24px;
  text-align: center;
  font-size: 12px;
  color: #bbb;
  border-top: 1px solid #f0f0f0;
}

.sidebar-column {
  min-width: 0;
}

.side-card {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.05);
  padding: 16px;
  margin-bottom: 16px;

  &.chart-card {
    padding-bottom: 8px;
  }
}

.side-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.side-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 700;
  color: #363636;

  i {
    color: #7957d5;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    height: 20px;
    padding: 0 6px;
    font-size: 12px;
    font-weight: 600;
    color: #fff;
    background: #7957d5;
    border-radius: 10px;
  }
}

.student-textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 12px 14px;
  font-size: 14px;
  line-height: 1.65;
  color: #363636;
  background: #fafafa;
  border: 1px solid #dbdbdb;
  border-radius: 6px;
  resize: vertical;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:hover {
    border-color: #b5b5b5;
  }

  &:focus {
    outline: none;
    background: #fff;
    border-color: #7957d5;
    box-shadow: 0 0 0 3px rgba(121, 87, 213, 0.15);
  }

  &::placeholder {
    color: #b5b5b5;
  }
}

.student-count {
  margin-top: 10px;
  font-size: 13px;
  color: #888;

  strong {
    color: #7957d5;
    font-size: 15px;
  }
}

.history-list {
  max-height: 200px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 3px;
  }
}

.history-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  font-size: 13px;
  background: #f8f9fa;
  border-radius: 6px;
  transition: background 0.15s;

  &:hover {
    background: #f0ebff;
  }

  .history-index {
    flex-shrink: 0;
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 700;
    color: #7957d5;
    background: #ede8f8;
    border-radius: 50%;
  }

  .history-name {
    flex: 1;
    font-weight: 600;
    color: #363636;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .history-time {
    flex-shrink: 0;
    font-size: 12px;
    color: #aaa;
    font-family: Consolas, Monaco, monospace;
  }
}

.history-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 28px 16px;
  color: #ccc;
  font-size: 13px;

  i {
    font-size: 28px;
  }
}

.chart-wrap {
  display: flex;
  justify-content: center;
  overflow: hidden;

  :deep(.line-box) {
    width: 100%;
    max-width: 320px;
    height: 280px;
  }
}

@media screen and (max-width: 768px) {
  .rollcall-stage {
    min-height: 260px;
    padding: 32px 16px;

    .student-name {
      font-size: 36px;
    }
  }

  .card-header {
    padding: 14px 16px;
  }

  .quote-box {
    margin: 0 16px;
  }
}
</style>
