import AppIcon from '@/components/AppIcon.vue'
import OrugaIconAdapter from '@/components/OrugaIconAdapter.vue'
import { setupIconify } from '@/icons/setup'

export function installIcons(app) {
  setupIconify()
  app.component('AppIcon', AppIcon)
  app.component('OrugaIconAdapter', OrugaIconAdapter)
}
