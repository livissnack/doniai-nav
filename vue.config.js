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
    const cdn = {
      css: [
        '//fastly.jsdelivr.net/npm/@fortawesome/fontawesome-free@5.14.0/css/all.min.css',
        '//fastly.jsdelivr.net/npm/buefy@0.8.15/dist/buefy.min.css'
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
    port: process.env.VUE_APP_WEB_PORT,
    proxy: {
      '/api': {
        target: `${process.env.VUE_APP_API_URL}`,
        changeOrigin: true,
        ws: true,
        pathRewrite: {
          '^/api': '/'
        }
      }
    }
  }
}
