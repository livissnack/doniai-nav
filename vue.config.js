module.exports = {
  productionSourceMap: false,
  chainWebpack: config => {
    config.module
      .rule('images')
      .use('image-webpack-loader')
      .loader('image-webpack-loader')
      .options({
        bypassOnDebug: true
      })
      .end()
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
