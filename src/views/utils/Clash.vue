<template>
  <div class="home">
    <div class="nav-box">
      <Navbar :newPage="true" pageTitle="Clash工具助手"/>
    </div>
    <div class="content-box">
      <div class="container">
        <div class="columns">
          <div class="column is-three-quarters">
            <div class="mt-4 play-input">
              <div class="input-box">
                <b-field :message="validClashMsg">
                <b-input class="custom-min-height" @input="handleValidClashMsg" v-model="nodeList" placeholder="请输入节点数据" type="textarea" maxlength="2000" icon-pack="fas"
                         icon-right="times"
                         icon-right-clickable
                         @icon-right-click="clearIconClick"></b-input>
                </b-field>
              </div>
            </div>

            <div class="operate-btn">
              <div class="start-play-btn">
                <b-button type="is-success" :disabled="validClashMsg !== ''" @click="handleParse">解析</b-button>
              </div>
              <div class="btn-box">
                <b-button type="is-danger" :disabled="disableDownload" :loading="loadingDownload" @click="handleDownloadClash">下载Clash</b-button>
              </div>
            </div>

            <div class="parse-content">
              <div class="parse-header">
                <b-icon icon="code" size="is-small" pack="fas"></b-icon>
                <span>YAML 配置预览</span>
              </div>

              <codemirror
                  v-model="parseConfig"
                  :options="cmOptions"
                  ref="myCm"
              ></codemirror>
            </div>
          </div>
          <div class="column">
            <div class="section-box">
              <MediaResource />
            </div>
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
import MediaResource from "@/components/MediaResource.vue"
import { codemirror } from 'vue-codemirror'
import {isEmpty} from "@/utils/helper"
import {getNodeParse} from "@/services/api";

Vue.use(BackTop)
export default {
  name: 'json',
  components: {
    MediaResource,
    Navbar,
    Sidebar,
    Footer,
    codemirror
  },
  data() {
    return {
      validClashMsg: '',
      nodeList: 'vless://06a0a567-4e14-4b19-9bf8-70eccbba1ddb@80.75.218.223:47833?encryption=none&security=reality&flow=xtls-rprx-vision&type=tcp&sni=www.amazon.com&pbk=QWbn09eWFDcBnck72-kcdLMWchaZ9zLGNpUlwz1BGQE&fp=chrome#[自建] 德国 01\n' +
          'hysteria://1.2.3.4:12854?protocol=udp&auth=pekopeko&peer=wechat.com&insecure=1&upmbps=50&downmbps=250&alpn=h3#hysteria\n' +
          'ss://YWVzLTI1Ni1nY206cjROQndqczFxOWRWenJ0cWxNZUpzcDdlWnlDaTY4bEVyVms1dURzbw==@151.242.189.239:33560#[自建] 台湾 01\n' +
          'hysteria2://P%40ssw0rd1234@example.com:443/?protocol=udp&obfs=salamander&obfs-password=obfs_pwd&sni=www.example.com&insecure=0&pinSHA256=BA%3A88%3A45%3A17%3AA1%3A&up=100Mbps&down=200Mbps#MyHysteria',
      parseConfig: '暂无解析数据~',
      disableDownload: true,
      loadingDownload: false,
      cmOptions: {
        tabSize: 2,
        mode: 'text/x-yaml',
        theme: 'base16-light',
        lineNumbers: true,
        readOnly: false,
        lineWrapping: true,
        viewportMargin: Infinity,
        cursorHeight: 0.85,
        autofocus: false,
      }
    }
  },
  created() {

  },
  methods: {
    clearIconClick() {
      this.nodeList = ''
    },
    handleValidClashMsg(value) {
      const val = value.trim();

      if (!val) {
        this.validClashMsg = '节点信息不能为空哦~';
        return;
      }

      const supportedProtocols = ['vmess://', 'vless://', 'hysteria', 'ss://', 'trojan://'];

      const lines = val.split('\n');
      const isValid = lines.some(line =>
          supportedProtocols.some(proto => line.trim().toLowerCase().startsWith(proto))
      );

      if (!isValid) {
        this.validClashMsg = '未能识别有效的节点链接 (支持 vmess/vless/hysteria)~';
      } else {
        this.validClashMsg = '';
      }
    },
    async handleParse() {
      if (isEmpty(this.nodeList)) {
        this.$buefy.snackbar.open({
          message: '节点数据不能为空！',
          type: 'is-danger',
          position: 'is-top',
          actionText: 'Msg'
        })
        return
      }
      const { data } = await getNodeParse(this.nodeList)
      this.parseConfig = data
      if (!isEmpty(data)) {
        this.disableDownload = false
        this.$nextTick(() => {
          if (this.$refs.myCm && this.$refs.myCm.codemirror) {
            this.$refs.myCm.codemirror.refresh()
          }
        })
      }
    },
    async handleDownloadClash() {
      if (!this.parseConfig || this.parseConfig === '暂无解析数据~') {
        return;
      }

      this.loadingDownload = true;
      try {
        const filenamePrefix = this.randomFileName();
        const filename = `${filenamePrefix}.yaml`;

        const blob = new Blob([this.parseConfig], { type: 'text/yaml;charset=utf-8' });
        const objectUrl = URL.createObjectURL(blob);

        const eleLink = document.createElement('a');
        eleLink.style.display = 'none';
        eleLink.href = objectUrl;
        eleLink.download = filename;

        document.body.appendChild(eleLink);
        eleLink.click();

        document.body.removeChild(eleLink);
        URL.revokeObjectURL(objectUrl);

      } catch (error) {
        this.$buefy.snackbar.open({
          message: '下载配置失败！',
          type: 'is-danger',
          position: 'is-top',
          actionText: 'Msg'
        })
      } finally {
        this.loadingDownload = false;
      }
    },
    randomFileName() {
      return Math.random().toString(36).slice(-8)
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

.play-input {
  display: flex;
  justify-content: flex-start;

  .input-box {
    flex: 1;
  }
}

.section-box {
  margin-bottom: 20px;
}

.operate-btn {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end;
  .btn-box {
    display: flex;
    justify-content: flex-start;
    gap: 20px;
  }
}

.parse-content {
  margin-bottom: 40px;
  background: #FFFFFF;
  border-radius: 8px;
  border: 1px solid #e1e1e1;
  overflow: hidden;
  transition: border-color 0.3s;
  &:focus-within {
    border-color: #409EFF;
    box-shadow: 0 0 4px rgba(64, 158, 255, 0.2);
  }
  .parse-header {
    padding: 10px 15px;
    background: #f9f9f9;
    border-bottom: 1px solid #e1e1e1;
    font-size: 0.9rem;
    color: #666;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  // 深度选择器修改 CodeMirror 样式
  ::v-deep(.CodeMirror) {
    max-height: 800px;
    min-height: 600px; // 设定最小高度
    font-family: 'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
    font-size: 14px;
    background: #FFFFFF !important; // 确保背景色统一
    .CodeMirror-cursor {
      border-left: 2px solid #409EFF;
    }
    // 让滚动更平滑
    .CodeMirror-scroll {
      max-height: 800px;
      min-height: 600px;
    }
  }

  // 如果有滚动条，美化一下
  ::v-deep(.CodeMirror-hscrollbar), ::v-deep(.CodeMirror-vscrollbar) {
    &::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    &::-webkit-scrollbar-thumb {
      background-color: #dbdbdb;
      border-radius: 3px;
    }
  }
}

.custom-min-height {
  ::v-deep(.textarea) {
    min-height: 300px;
  }
}

</style>
