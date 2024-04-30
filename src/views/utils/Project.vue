<template>
  <div class="home">
    <div class="nav-box">
      <Navbar :newPage="true" :newUrl="`/utils/project`" pageTitle="项目管理">
      </Navbar>
    </div>

    <div class="content-box">
      <div class="container">
        <div class="toolbox">
          <div class="chat-left-box">
            <div class="chat-left-top-box">
              <div class="header-box">
                <div class="left">
                  <div class="left-title">
                    <div class="project-name">项目管理面板</div>
                    <div class="project-remark">构建完美、简约、艺术型项目管理</div>
                  </div>
                </div>
              </div>

              <div class="chat-history-list-box">
                <div class="chat-history-item" :class="i === 1 ? 'is-active' : ''" v-for="i in 20">
                  <div class="chat-title">
                    互联网写手
                  </div>
                  <div class="chat-info">
                    <div class="chat-num">0条对话</div>
                    <div class="chat-last-time">2023/11/15 10:05:44</div>
                  </div>
                  <div class="chat-delete">
                    <img src="../../assets/chatgpt/close.svg" alt="delete-chat">
                  </div>
                </div>
              </div>
            </div>
            <div class="chat-left-bottom-box">
              <div class="setting-icon">
                <img class="img" src="../../assets/chatgpt/setting.svg" alt="setting-icon">
              </div>
              <div class="new-chat">
                <div class="icon-box">
                  <img class="img" src="../../assets/chatgpt/plus.svg" alt="setting-icon">
                </div>
                <div class="title">创建新的项目</div>
              </div>
            </div>
          </div>
        </div>
        <div class="project">
          <div class="project-header">
            <div class="project-filter-box">
              <div class="left-box">
                <div class="user-filter">
                  <div class="me">
                    我的
                    <b-tag rounded>2</b-tag>
                  </div>
                  <div class="all">
                    <b-button rounded>所有
                      <b-tag rounded>20</b-tag>
                    </b-button>
                  </div>
                </div>
              </div>
              <div class="right-box">
                <div class="condition-filter">
                  <b-dropdown position="is-bottom-left" append-to-body aria-role="menu" trap-focus>
                    <template #trigger>
                      <a class="navbar-item fz12" role="button">
                        <span>按最近创建</span>
                        <b-icon pack="fas" icon="angle-down"></b-icon>
                      </a>
                    </template>

                    <b-dropdown-item aria-role="listitem">按最近创建</b-dropdown-item>
                    <b-dropdown-item aria-role="listitem">按最近截止</b-dropdown-item>
                    <b-dropdown-item aria-role="listitem">按最近更新</b-dropdown-item>
                    <b-dropdown-item aria-role="listitem">按最高优先级</b-dropdown-item>
                  </b-dropdown>
                  <b-dropdown position="is-bottom-left" append-to-body aria-role="menu" trap-focus>
                    <template #trigger>
                      <a class="navbar-item fz12" role="button">
                        <span>筛选</span>
                        <b-icon pack="fas" icon="angle-down"></b-icon>
                      </a>
                    </template>

                    <b-dropdown-item aria-role="menu-item" :focusable="false" custom paddingless>
                      <form action="">
                        <div class="modal-card" style="width:300px;">
                          <section class="modal-card-body">
                            <b-field label="Email">
                              <b-input
                                  type="email"
                                  placeholder="Your email"
                                  required>
                              </b-input>
                            </b-field>

                            <b-field label="Password">
                              <b-input
                                  type="password"
                                  password-reveal
                                  placeholder="Your password"
                                  required>
                              </b-input>
                            </b-field>

                            <b-checkbox>Remember me</b-checkbox>
                          </section>
                          <footer class="modal-card-foot">
                            <b-button
                                label="Login"
                                type="is-primary"/>
                          </footer>
                        </div>
                      </form>
                    </b-dropdown-item>
                  </b-dropdown>
                </div>
              </div>
            </div>
          </div>
          <div class="project-box">
            <div class="project-item-box">
              <div class="project-item-status-title">计划中</div>
              <div class="project-item-add-task" @click="handleAddTaskPopup">
                <div class="plus-icon">
                  <img class="img" src="../../assets/chatgpt/plus.svg" alt="plus">
                </div>
                <div class="task-remark">添加任务</div>
              </div>
              <div class="project-item-task-cards">
                <div class="task-card" v-for="(task, index) in tasks" :key="index">
                  <div class="task-card-content">
                    <div class="task-card-tmp1">
                      <div class="task-switch-status">
                        <b-radio v-model="task.completeStatus" name="name"></b-radio>
                      </div>
                      <div class="task-text">
                        {{ task.name }}
                      </div>
                      <div class="task-more">
                        <div class="icon-box">
                          <i class="fas fa-ellipsis-h"></i>
                        </div>
                      </div>
                    </div>
                    <div class="task-card-tmp2">
                      <div class="task-process">
                        <div class="task-has-day">
                          {{ task.endTime | formatDate }}
                        </div>
                        <div class="task-process-value">
                          10%
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="task-line-box">
                    <div class="task-line"></div>
                  </div>
                  <div class="task-card-footer">
                    <div class="date-box">
                      <div class="icon">
                        <i class="fas fa-calendar-alt"></i>
                      </div>
                      <div class="date">09/19</div>
                    </div>
                    <div class="task-peoples">
                      <div class="avatar-item">
                        <Avatar :circle="true"/>
                      </div>
                      <div class="avatar-item">
                        <Avatar :circle="true"/>
                      </div>
                      <div class="avatar-item">
                        <div class="icon-box">
                          <i class="fas fa-ellipsis-h"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="project-item-box">
              <div class="project-item-status-title">开发进行中</div>
              <div class="project-item-add-task">
                <div class="plus-icon">
                  <img class="img" src="../../assets/chatgpt/plus.svg" alt="plus">
                </div>
                <div class="task-remark">添加任务</div>
              </div>
              <div class="project-item-task-cards">
                <div class="task-card">
                  <div class="task-card-content">
                    <div class="task-card-tmp1">
                      <div class="task-switch-status">
                        <b-radio v-model="radio" name="name"></b-radio>
                      </div>
                      <div class="task-text">
                        DIY物料硬件打分，并实时展示分值升降百分比（以当前选中为1）
                      </div>
                      <div class="task-more">
                        <div class="icon-box">
                          <i class="fas fa-ellipsis-h"></i>
                        </div>
                      </div>
                    </div>
                    <div class="task-card-tmp2">
                      <div class="task-process">
                        <div class="task-has-day">
                          还剩4天
                        </div>
                        <div class="task-process-value">
                          10%
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="task-line-box">
                    <div class="task-line"></div>
                  </div>
                  <div class="task-card-footer">
                    <div class="date-box">
                      <div class="icon">
                        <i class="fas fa-calendar-alt"></i>
                      </div>
                      <div class="date">09/19</div>
                    </div>
                    <div class="task-peoples">
                      <div class="avatar-item">
                        <Avatar :circle="true"/>
                      </div>
                      <div class="avatar-item">
                        <Avatar :circle="true"/>
                      </div>
                      <div class="avatar-item">
                        <div class="icon-box">
                          <i class="fas fa-ellipsis-h"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="project-item-box">
              <div class="project-item-status-title">测试验收上线中</div>
              <div class="project-item-add-task">
                <div class="plus-icon">
                  <img class="img" src="../../assets/chatgpt/plus.svg" alt="plus">
                </div>
                <div class="task-remark">添加任务</div>
              </div>
              <div class="project-item-task-cards">
                <div class="task-card">
                  <div class="task-card-content">
                    <div class="task-card-tmp1">
                      <div class="task-switch-status">
                        <b-radio v-model="radio" name="name"></b-radio>
                      </div>
                      <div class="task-text">
                        DIY物料硬件打分，并实时展示分值升降百分比（以当前选中为1）
                      </div>
                      <div class="task-more">
                        <div class="icon-box">
                          <i class="fas fa-ellipsis-h"></i>
                        </div>
                      </div>
                    </div>
                    <div class="task-card-tmp2">
                      <div class="task-process">
                        <div class="task-has-day">
                          还剩4天
                        </div>
                        <div class="task-process-value">
                          10%
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="task-line-box">
                    <div class="task-line"></div>
                  </div>
                  <div class="task-card-footer">
                    <div class="date-box">
                      <div class="icon">
                        <i class="fas fa-calendar-alt"></i>
                      </div>
                      <div class="date">09/19</div>
                    </div>
                    <div class="task-peoples">
                      <div class="avatar-item">
                        <Avatar :circle="true"/>
                      </div>
                      <div class="avatar-item">
                        <Avatar :circle="true"/>
                      </div>
                      <div class="avatar-item">
                        <div class="icon-box">
                          <i class="fas fa-ellipsis-h"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="project-item-box">
              <div class="project-item-status-title">完成验收上线</div>
              <div class="project-item-add-task">
                <div class="plus-icon">
                  <img class="img" src="../../assets/chatgpt/plus.svg" alt="plus">
                </div>
                <div class="task-remark">添加任务</div>
              </div>
              <div class="project-item-task-cards">
                <div class="task-card">
                  <div class="task-card-content">
                    <div class="task-card-tmp1">
                      <div class="task-switch-status">
                        <b-radio v-model="radio" name="name"></b-radio>
                      </div>
                      <div class="task-text">
                        DIY物料硬件打分，并实时展示分值升降百分比（以当前选中为1）
                      </div>
                      <div class="task-more">
                        <div class="icon-box">
                          <i class="fas fa-ellipsis-h"></i>
                        </div>
                      </div>
                    </div>
                    <div class="task-card-tmp2">
                      <div class="task-process">
                        <div class="task-has-day">
                          还剩4天
                        </div>
                        <div class="task-process-value">
                          10%
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="task-line-box">
                    <div class="task-line"></div>
                  </div>
                  <div class="task-card-footer">
                    <div class="date-box">
                      <div class="icon">
                        <i class="fas fa-calendar-alt"></i>
                      </div>
                      <div class="date">09/19</div>
                    </div>
                    <div class="task-peoples">
                      <div class="avatar-item">
                        <Avatar :circle="true"/>
                      </div>
                      <div class="avatar-item">
                        <Avatar :circle="true"/>
                      </div>
                      <div class="avatar-item">
                        <div class="icon-box">
                          <i class="fas fa-ellipsis-h"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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

    <AddTask ref="projectAddTask" :popup-status="addTaskPopup"/>
  </div>
</template>

<script>
import Vue from 'vue'
import dayjs from 'dayjs'
let relativeTime = require('dayjs/plugin/relativeTime')
let zhLocale = require('dayjs/locale/zh-cn')
import Navbar from '@/components/Navbar.vue'
import BackTop from '@mlqt/vue-back-top'
import Footer from '@/components/Footer.vue'
import Avatar from '@/components/Avatar.vue'
import AddTask from '@/components/task/Add.vue'
dayjs.extend(relativeTime).locale(zhLocale)

Vue.use(BackTop)
export default {
  name: 'Project',
  components: {
    Navbar,
    Footer,
    Avatar,
    AddTask,
  },
  data() {
    return {
      tasks: [
        {
          id: 1,
          name: 'DIY物料硬件打分，并实时展示分值升降百分比（以当前选中为1）',
          completeStatus: false,
          endTime: '2023-11-21',
          groupPeople: [
            {
              id: 1,
              name: '张三',
              avatar: '',
            },
            {
              id: 2,
              name: '李四',
              avatar: '',
            },
            {
              id: 3,
              name: '王五',
              avatar: '',
            },
          ],
        },
        {
          id: 2,
          name: 'DIY物料硬件打分，并实时展示分值升降百分比（以当前选中为1）',
          completeStatus: false,
          endTime: '2023-11-30',
          groupPeople: [
            {
              id: 1,
              name: '张三',
              avatar: '',
            },
            {
              id: 2,
              name: '李四',
              avatar: '',
            },
            {
              id: 3,
              name: '王五',
              avatar: '',
            },
          ],
        },
        {
          id: 3,
          name: 'DIY物料硬件打分，并实时展示分值升降百分比（以当前选中为1）',
          completeStatus: false,
          endTime: '2023-11-01',
          groupPeople: [
            {
              id: 1,
              name: '张三',
              avatar: '',
            },
            {
              id: 2,
              name: '李四',
              avatar: '',
            },
            {
              id: 3,
              name: '王五',
              avatar: '',
            },
          ],
        },
        {
          id: 4,
          name: 'DIY物料硬件打分，并实时展示分值升降百分比（以当前选中为1）',
          completeStatus: false,
          endTime: '2020-09-19',
          groupPeople: [
            {
              id: 1,
              name: '张三',
              avatar: '',
            },
            {
              id: 2,
              name: '李四',
              avatar: '',
            },
            {
              id: 3,
              name: '王五',
              avatar: '',
            },
          ],
        },
        {
          id: 5,
          name: 'DIY物料硬件打分，并实时展示分值升降百分比（以当前选中为1）',
          completeStatus: false,
          endTime: '2020-09-19',
          groupPeople: [
            {
              id: 1,
              name: '张三',
              avatar: '',
            },
            {
              id: 2,
              name: '李四',
              avatar: '',
            },
            {
              id: 3,
              name: '王五',
              avatar: '',
            },
          ],
        },
        {
          id: 6,
          name: 'DIY物料硬件打分，并实时展示分值升降百分比（以当前选中为1）',
          completeStatus: false,
          endTime: '2020-09-19',
          groupPeople: [
            {
              id: 1,
              name: '张三',
              avatar: '',
            },
            {
              id: 2,
              name: '李四',
              avatar: '',
            },
            {
              id: 3,
              name: '王五',
              avatar: '',
            },
          ],
        },
        {
          id: 7,
          name: 'DIY物料硬件打分，并实时展示分值升降百分比（以当前选中为1）',
          completeStatus: false,
          endTime: '2020-09-19',
          groupPeople: [
            {
              id: 1,
              name: '张三',
              avatar: '',
            },
            {
              id: 2,
              name: '李四',
              avatar: '',
            },
            {
              id: 3,
              name: '王五',
              avatar: '',
            },
          ],
        },
        {
          id: 8,
          name: 'DIY物料硬件打分，并实时展示分值升降百分比（以当前选中为1）',
          completeStatus: false,
          endTime: '2020-09-19',
          groupPeople: [
            {
              id: 1,
              name: '张三',
              avatar: '',
            },
            {
              id: 2,
              name: '李四',
              avatar: '',
            },
            {
              id: 3,
              name: '王五',
              avatar: '',
            },
          ],
        },
      ],
      addTaskPopup: false,
    }
  },
  filters: {
    formatDate(value) {
      return dayjs().to(dayjs(value))
    }
  },
  methods: {
    onCopySuccess() {
      this.$buefy.snackbar.open({
        duration: 3000,
        message: `${this.showMoney}`,
        type: 'is-success',
        position: 'is-bottom-right',
        actionText: 'Msg'
      })
    },
    handleCopyText(str) {
      this.$copyText(str).then(() => {
        let tmpStr = str.substring(0, 40)
        this.$buefy.snackbar.open({
          duration: 3000,
          message: `复制成功：${tmpStr} ...`,
          type: 'is-success',
          position: 'is-bottom-right',
          actionText: 'Msg'
        })
      }, (e) => {
        this.$buefy.snackbar.open({
          duration: 3000,
          message: `复制失败：${e.message}`,
          type: 'is-danger',
          position: 'is-bottom-right',
          actionText: 'Msg'
        })
      })
    },
    jumpSoftwareDetail(item) {
      this.$router.push({
        path: `/utils/software/${item.id}`
      })
    },
    handleAddTaskPopup() {
      this.addTaskPopup = true
      this.$refs.projectAddTask.initPopupDialog()
    },
  }
}
</script>

<style lang="less" scoped>
.nav-box {
  text-align: center;
  background: #ffffff;
  border-top: 1px solid #ebebeb;
}

.content-box {
  background-color: #f3f3f3;
  display: flex;
  justify-content: center;

  .container {
    display: flex;
    justify-content: flex-start;
    margin: 30px 0;

    .toolbox {
      width: 250px;

      .chat-left-box {
        width: 250px !important;
        border-right: 1px solid #cecece;
        background: #E7F8FF;
        border-radius: 10px 0 0 10px;
        display: flex;
        justify-content: space-between;
        flex-direction: column;

        .chat-left-top-box {
          .header-box {
            padding: 24px 16px 10px 16px;

            .left {
              display: flex;
              justify-content: space-between;
              align-items: center;

              .left-title {
                display: flex;
                justify-content: flex-start;
                flex-direction: column;

                .project-name {
                  font-size: 20px;
                  font-weight: bold;
                  color: #333333;
                }

                .project-remark {
                  font-size: 12px;
                  color: #333333;
                }
              }
            }
          }

          .chat-history-list-box {
            height: calc(100vh - 214px);
            overflow-y: auto;

            &::-webkit-scrollbar {
              display: block;
              width: 4px;
              height: 100%;
            }

            &::-webkit-scrollbar-track {
              background: #FFFFFF;
            }

            &::-webkit-scrollbar-thumb {
              background: #1E1F24;
              border-radius: 29px;
              height: 10px;
            }

            padding: 16px;

            .chat-history-item {
              margin-bottom: 10px;
              background-color: #FFFFFF;
              cursor: grab;
              border: 2px solid #FFFFFF;
              border-radius: 10px;
              padding: 10px 14px;
              position: relative;

              &:hover {
                background-color: #f3f3f3;
                border: 2px solid #f3f3f3;

                .chat-delete {
                  opacity: 0.5;
                  transform: translateX(-4px);
                }
              }

              .chat-title {
                width: calc(100% - 15px);
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                font-size: 14px;
                font-weight: bolder;
              }

              .chat-info {
                display: flex;
                justify-content: space-between;
                align-items: center;
                color: #a6a6a6;
                font-size: 12px;
                margin-top: 8px;
              }

              .chat-delete {
                opacity: 0;
                position: absolute;
                top: 0;
                right: 0;
                cursor: pointer;
                transition: all 0.3s ease;
              }
            }

            .is-active {
              border: 2px solid #1d93ab !important;
            }
          }
        }

        .chat-left-bottom-box {
          height: 180px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 16px;

          .setting-icon {
            width: 36px;
            height: 36px;
            box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.05);
            background-color: #FFFFFF;
            border-radius: 10px;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;

            &:hover {
              background-color: #f3f3f3;
            }

            .img {
              width: 16px;
              height: 16px;
            }
          }

          .new-chat {
            padding: 10px;
            display: flex;
            justify-content: flex-start;
            align-items: center;
            box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.05);
            background-color: #FFFFFF;
            border-radius: 10px;
            font-size: 12px;
            cursor: pointer;

            &:hover {
              background-color: #f3f3f3;
            }

            .icon-box {
              display: flex;
              justify-content: center;
              align-items: center;
            }

            .title {
              margin-left: 5px;
              font-size: 12px;
            }
          }
        }
      }
    }

    .project {
      background: #E7F8FF;
      border-radius: 0 10px 10px 0;
      flex: 1 1 auto;

      .project-header {
        .project-filter-box {
          padding: 6px 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;

          .left-box {
            .user-filter {
              display: flex;
              justify-content: flex-start;
              align-items: center;
              padding: 4px 20px;
              border-radius: 20px;
              background: #FFFFFF;

              .me {
                cursor: pointer;
              }

              .all {
                margin-left: 20px;
                cursor: pointer;
              }
            }
          }
        }
      }

      .project-box {
        display: flex;
        justify-content: space-between;
        gap: 16px;

        .project-item-box {
          width: 25%;
          padding: 8px;

          .project-item-status-title {
            font-size: 18px;
            font-weight: bold;
          }

          .project-item-add-task {
            margin-top: 4px;
            display: flex;
            justify-content: flex-start;
            align-items: center;
            background: #FFFFFF;
            border: 1px solid #cecece;
            padding: 4px 8px;
            border-radius: 4px;
            cursor: pointer;

            .plus-icon {
              display: flex;
              justify-content: center;
              align-items: center;
              margin-right: 10px;
            }

            .task-remark {
              font-size: 14px;
            }
          }

          .project-item-task-cards {
            margin-top: 16px;
            height: calc(100vh - 104px);
            overflow-y: auto;

            &::-webkit-scrollbar {
              display: none;
            }

            .task-card {
              border: 1px solid #cecece;
              background: #FFFFFF;
              padding: 8px 8px;
              border-radius: 6px;
              cursor: pointer;
              margin-bottom: 12px;

              .task-card-content {
                .task-card-tmp1 {
                  display: flex;
                  align-items: flex-start;

                  .task-switch-status {
                    width: 30px;
                    flex: 0 0 30px;
                  }

                  .task-text {
                    flex: 1 1 auto;
                    word-break: break-all;
                    font-size: 13px;

                    &:hover {
                      text-decoration: underline;
                      color: #fa5e2e;
                    }
                  }

                  .task-more {
                    width: 30px;
                    flex: 0 0 30px;
                    display: flex;
                    justify-content: flex-end;

                    .icon-box {
                      font-size: 12px;
                      color: #222;
                    }
                  }
                }

                .task-card-tmp2 {
                  margin-top: 10px;

                  .task-process {
                    margin-left: 30px;
                    display: flex;
                    justify-content: space-between;
                    font-size: 11px;
                  }
                }
              }

              .task-line-box {
                padding: 6px 0;

                .task-line {
                  width: 100%;
                  height: 1px;
                  background: #cecece;
                }
              }

              .task-card-footer {
                display: flex;
                justify-content: space-between;
                align-items: center;

                .date-box {
                  display: flex;
                  justify-content: flex-start;
                  align-items: center;
                  font-size: 12px;
                }

                .task-peoples {
                  display: flex;
                  justify-content: flex-start;
                  align-items: center;

                  .avatar-item {
                    margin-left: 4px;

                    .icon-box {
                      font-size: 12px;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

.fz12 {
  font-size: 12px;
}
</style>
    