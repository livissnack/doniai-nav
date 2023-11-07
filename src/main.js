import Vue from 'vue'
import App from './App.vue'
import router from './router'
import Buefy from 'buefy'
import VueClipboard from 'vue-clipboard2'
import '@fortawesome/fontawesome-free/css/all.min.css'

Vue.config.productionTip = false
Vue.use(Buefy)
Vue.use(VueClipboard)
Vue.prototype.bucket_url = 'https://hspxsteel.oss-cn-shenzhen.aliyuncs.com'
Vue.prototype.OBS = "https://minio.doniai.com/doniai/"

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
