const CompressionWebpackPlugin = require('compression-webpack-plugin')
const productionGzipExtensions = /\.(js|css|json|txt|html|ico|svg)(\?.*)?$/i

module.exports = {
  productionSourceMap: false,
  configureWebpack: config => {
    const plugins = []
    plugins.push(
      new CompressionWebpackPlugin({
        filename: '[path].gz[query]',
        algorithm: 'gzip',
        test: productionGzipExtensions,
        threshold: 10240,
        minRatio: 0.8
      })
    )
    config.externals = {
      vue: 'Vue',
      buefy: 'Buefy',
      'vue-router': 'VueRouter',
      axios: 'axios'
    }
    config.plugins = [...config.plugins, ...plugins]
  },
  chainWebpack: config => {
    config.module
      .rule('images')
      .use('image-webpack-loader')
      .loader('image-webpack-loader')
      .options({
        mozjpeg: { progressive: true, quality: 65 },
        optipng: { enabled: false },
        pngquant: { quality: [0.65, 0.9], speed: 4 },
        gifsicle: { interlaced: false }
      })
    const cdn = {
      css: ['//cdn.jsdelivr.net/npm/buefy@0.8.15/dist/buefy.min.css'],
      js: [
        '//cdn.jsdelivr.net/npm/vue@2.6.11/dist/vue.min.js',
        '//cdn.jsdelivr.net/npm/vue-router@3.3.4/dist/vue-router.min.js',
        '//cdn.jsdelivr.net/npm/axios@0.19.2/dist/axios.min.js',
        '//cdn.jsdelivr.net/npm/buefy@0.8.15/dist/buefy.min.js',
        '//webapi.amap.com/maps?v=1.4.15&key=045d06aff28968d4ade448d96aef901b' //高德API接口授权
      ]
    }

    // 如果使用多页面打包，使用vue inspect --plugins查看html是否在结果数组中
    config.plugin('html').tap(args => {
      // html中添加cdn
      args[0].cdn = cdn
      return args
    })
  }
  // devServer: {
  //   port: 8097,
  //   proxy: {
  //     '/api': {
  //       target: 'https://hi.doniai.com/',
  //       changeOrigin: true,
  //       ws: true,
  //       pathRewrite: {
  //         '^/api': '/'
  //       }
  //     }
  //   }
  // }
}
