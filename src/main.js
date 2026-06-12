import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { finishPageProgress } from '@/utils/pageProgress'
import { bindOrugaApp } from '@/plugins/oruga'
import { installIcons } from '@/plugins/icons'
import { installNotify } from '@/utils/notify'
import { installDialog } from '@/utils/dialog'
import { installCopyText } from '@/utils/copyText'
import BackTop from '@/components/BackTop.vue'

const app = createApp(App)

app.component('back-top', BackTop)
app.component('BackTop', BackTop)

installIcons(app)
bindOrugaApp(app)
installNotify(app)
installDialog(app)
installCopyText(app)

app.config.globalProperties.OBS = import.meta.env.VITE_OSS_CDN
app.config.globalProperties.$OPENLINK = (url) => {
  const a = document.createElement('a')
  a.setAttribute('href', url)
  a.setAttribute('target', '_blank')
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

app.use(router)
app.mount('#app')
router.isReady().then(() => {
  finishPageProgress()
})
