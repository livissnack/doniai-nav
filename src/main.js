import Vue from 'vue'
import App from './App.vue'
import router from './router'
import Buefy from 'buefy'

Vue.config.productionTip = false
Vue.use(Buefy)
Vue.prototype.bucket_url = 'https://hspxsteel.oss-cn-shenzhen.aliyuncs.com'

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
