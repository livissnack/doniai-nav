<template>
  <div class="home">
    <div class="nav-box">
      <Navbar :newPage="true" :newUrl="`/utils/docker`" pageTitle="Docker镜像加速监控"></Navbar>
    </div>

    <div class="content-box">
      <div class="container">
        <div class="columns">
          <div class="column bg-white is-three-quarters">
            <table class="table is-fullwidth">
              <thead>
                <tr>
                  <th>当前状态</th>
                  <th><abbr title="站点名称">站点名称</abbr></th>
                  <th><abbr title="URL">URL</abbr></th>
                  <th><abbr title="标签">标签</abbr></th>
                  <th><abbr title="Lost">最后监测时间</abbr></th>
                </tr>
              </thead>
              <tbody>
              <tr v-for="(item, index) in list" :key="index">
                <th>
                  <span class="status-indicator" :class="{ 'status-online': item.status, 'status-offline': !item.status }"></span>
                </th>
                <td>{{ item.title }}</td>
                <td class="url-txt" @dblclick="handleCopyText(item.url)" title="双击复制">{{ item.url }}</td>
                <td class="tag-box">
                  <span class="tag" :class="tag.color" v-for="(tag, key) in item.coloredTags" :key="key">{{ tag.name }}</span>
                </td>
                <td class="time-txt">{{ item.lastTime }}</td>
              </tr>
              </tbody>
            </table>

            <div class="is-fullwidth">
              <div class="title-box">
                <div class="title">
                  创建或编辑 Docker 配置文件：
                </div>
              </div>

              <pre class="code-block"><code>
                sudo mkdir -p /etc/docker
                sudo tee /etc/docker/daemon.json <<-'EOF'
                {
                  "registry-mirrors": [
                    "https://docker.1ms.run",
                    "https://docker.1panel.live",
                    "https://dockerproxy.net",
                    "https://hub.fast360.xyz",
                    "https://image.cloudlayer.icu",
                    "https://docker-registry.nmqu.com",
                    "https://hub.amingg.com",
                    "https://docker.amingg.com",
                    "https://docker.hlmirror.com",
                    "https://hub4.nat.tf"
                  ]
                }
                EOF
              </code></pre>
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
import dayjs from 'dayjs'

Vue.use(BackTop)
export default {
  name: 'docker',
  components: {
    Navbar,
    Sidebar,
    Footer
  },
  data() {
    return {
      list: [
        {
          status: true,
          title: '自建镜像仓库',
          url: 'https://docker.livissnack.com',
          tags: ['WG', 'Nginx'],
        },
        {
          status: true,
          title: '腾讯云镜像仓库',
          url: 'https://mirror.ccs.tencentyun.com',
          tags: ['腾讯云', '仅限腾讯云内网'],
        },
        {
          status: false,
          title: '毫秒镜像（免费版）',
          url: 'https://docker.1ms.run',
          tags: ['木雷坞', 'CloudFlare'],
        },
        {
          status: true,
          title: '1Panel',
          url: 'https://docker.1panel.live',
          tags: ['1Panel', 'CloudFlare'],
        },
        {
          status: true,
          title: '轩辕镜像（免费版）',
          url: 'https://docker.xuanyuan.me',
          tags: ['轩辕镜像', 'CloudFlare'],
        },
        {
          status: true,
          title: 'Fast360',
          url: 'https://hub.fast360.xyz',
          tags: ['Fast360', 'Nginx'],
        },
        {
          status: true,
          title: '奶昔论坛',
          url: 'https://docker-registry.nmqu.com',
          tags: ['奶昔论坛', 'CloudFlare'],
        },
        {
          status: true,
          title: 'mxjia',
          url: 'https://proxy.vvvv.ee',
          tags: ['NodeSeek大佬', 'Nginx'],
        },
      ].map(item => {
        return {
          ...item,
          coloredTags: item.tags.map(tag => ({
            name: tag,
            color: this.getRandomColor(),
          })),
          lastTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
        }
      }),
    }
  },
  methods: {
    getRandomColor() {
      let colors = ['is-black', 'is-dark', 'is-light', 'is-primary', 'is-link', 'is-info', 'is-success', 'is-warning', 'is-danger']
      return colors[Math.floor(Math.random() * colors.length)]
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

.tag-box {
  display: flex;
  justify-content: flex-start;
  gap: 4px;
}

.bg-white {
  margin-top: 12px;
  background-color: #FFFFFF;
  margin-bottom: 200px;
}

.url-txt {
  cursor: pointer;
  &:hover {
    text-decoration: underline;
    color: #409EFF;
  }
}


.status-indicator {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 8px;

  &.status-online {
    background-color: #4CAF50;
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7);
    animation: pulse-online 2s infinite;
  }

  &.status-offline {
    background-color: #F44336;
    box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.7);
    animation: pulse-offline 2s infinite;
  }
}

@keyframes pulse-online {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7);
  }

  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px rgba(76, 175, 80, 0);
  }

  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
  }
}

@keyframes pulse-offline {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.7);
  }

  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px rgba(244, 67, 54, 0);
  }

  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(244, 67, 54, 0);
  }
}

.title-box {
  margin-bottom: 16px;
  .title {
    font-size: 16px;
    color: #000000;
  }
}

.code-block {
  padding-left: 0;
  padding-right: 0;
  background-color: rgba(30, 34, 42, 1);
  code {
    color: #FFFFFF;
  }
}

.time-txt {
  font-size: 14px;
}
</style>