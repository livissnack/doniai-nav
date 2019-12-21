import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Buefy from 'buefy'
import 'buefy/dist/buefy.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import BackTop from '@mlqt/vue-back-top'

Vue.config.productionTip = false
Vue.use(Buefy)
Vue.use(BackTop)
Vue.prototype.bucket_url = 'https://hspxsteel.oss-cn-shenzhen.aliyuncs.com'

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
