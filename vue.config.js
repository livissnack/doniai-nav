module.exports = {
  productionSourceMap: false,
  configureWebpack: config => {
    const plugins = []
    config.externals = {
      vue: 'Vue',
      buefy: 'Buefy',
      '@fortawesome/fontawesome-free': 'Fontawesome',
      'vue-router': 'VueRouter',
      axios: 'axios'
    }
    config.plugins = [...config.plugins, ...plugins]
  },
  chainWebpack: config => {
    config.plugin('prefetch').tap((options) => {
      options[0].fileBlacklist = options[0].fileBlacklist || []
      options[0].fileBlacklist.push(
        /panel-music/,
        /echarts/,
        /epubjs/,
        /tldraw/,
        /json-formatter/
      )
      return options
    })
    const cdn = {
      css: [
        '//fastly.jsdelivr.net/npm/@fortawesome/fontawesome-free@5.14.0/css/all.min.css',
        '//fastly.jsdelivr.net/npm/buefy@0.8.15/dist/buefy.min.css',
        '//fastly.jsdelivr.net/npm/codemirror@5.65.12/lib/codemirror.css',
        '//fastly.jsdelivr.net/npm/codemirror@5.65.12/theme/base16-light.css'
      ],
      image: [
          // '//epg.112114.xyz/bingimg',
      ],
      js: [
        '//fastly.jsdelivr.net/npm/vue@2.6.11/dist/vue.min.js',
        '//fastly.jsdelivr.net/npm/vue-router@3.3.4/dist/vue-router.min.js',
        '//fastly.jsdelivr.net/npm/axios@0.21.2/dist/axios.min.js',
        '//fastly.jsdelivr.net/npm/buefy@0.8.15/dist/buefy.min.js',
        '//fastly.jsdelivr.net/npm/widget-qrcode@1.0.4/dist/widget-qrcode.min.js',
        '//fastly.jsdelivr.net/npm/codemirror@5.65.12/lib/codemirror.js',
        '//fastly.jsdelivr.net/npm/codemirror@5.65.12/mode/yaml/yaml.js',
        '//fastly.jsdelivr.net/npm/vue-codemirror@4.0.6/dist/vue-codemirror.js'
      ]
    }

    // 如果使用多页面打包，使用vue inspect --plugins查看html是否在结果数组中
    config.plugin('html').tap(args => {
      // html中添加cdn
      args[0].cdn = cdn
      return args
    })
  },
  devServer: {
    port: process.env.VUE_APP_WEB_PORT || 1343,
    host: '0.0.0.0',
    disableHostCheck: true,
    proxy: {
      // 开发时前端走同源 /api，由 devServer 转发到 Rust API，避免 CORS
      '/api': {
        target: process.env.VUE_APP_API_PROXY_TARGET || 'http://127.0.0.1:3001',
        changeOrigin: true,
        ws: true,
        pathRewrite: {
          '^/api': '',
        },
      },
    },
  },
}
