const CompressionWebpackPlugin = require('compression-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin
const productionGzipExtensions = /\.(js|css|json|txt|html|ico|svg)(\?.*)?$/i

module.exports = {
  productionSourceMap: false,
  configureWebpack: config => {
    const plugins = []
    plugins.push(
      new CompressionWebpackPlugin({
        filename: '[path][base].gz',
        algorithm: 'gzip',
        test: productionGzipExtensions,
        threshold: 10240,
        minRatio: 0.8
      })
    )
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
    //打包分析插件
    config.plugin('webpack-report').use(BundleAnalyzerPlugin, [
      {
        analyzerMode: 'disabled'
        // analyzerMode: 'static'
      }
    ])

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
        '//webapi.amap.com/maps?v=1.4.15&key=045d06aff28968d4ade448d96aef901b' //高德API接口授权
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
