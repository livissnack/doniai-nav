import Vue from 'vue'
import App from './App.vue'
import router from './router'
import Buefy from 'buefy'
import VueClipboard from 'vue-clipboard2'
import '@fortawesome/fontawesome-free/css/all.min.css'

Vue.config.productionTip = false
Vue.use(Buefy)
Vue.use(VueClipboard)
Vue.prototype.OBS = process.env.VUE_APP_OSS_CDN

Vue.prototype.$OPENLINK = (url) => {
  let a = document.createElement("a")
  a.setAttribute("href", url)
  a.setAttribute("target", "_blank")
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
