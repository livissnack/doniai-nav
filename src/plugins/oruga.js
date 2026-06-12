import OrugaIconAdapter from '@/components/OrugaIconAdapter.vue'

let vueApp = null
let installPromise = null

export function bindOrugaApp(app) {
  vueApp = app
}

/**
 * 按需加载 Oruga（应用层配置，非 vite.config.js）。
 * 只注册下方列出的组件插件，不用 OrugaComponentPlugins 全量包。
 * 新增 o-* 组件时，在此补充对应 Plugin 的 import。
 * @see https://oruga-ui.com/documentation/
 */
export function ensureOruga() {
  if (!vueApp) return Promise.resolve()
  if (installPromise) return installPromise

  installPromise = (async () => {
    const [
      {
        createOruga,
        Button,
        Field,
        Input,
        Select,
        Switch,
        Radio,
        Checkbox,
        Dropdown,
        Slider,
        Icon,
        Carousel,
        Tooltip,
        Collapse,
        Tag,
        Taginput,
        Datepicker,
        Upload,
      },
      { bulmaConfig },
    ] = await Promise.all([
      import('@oruga-ui/oruga-next'),
      import('@oruga-ui/theme-bulma'),
    ])

    await import('@oruga-ui/theme-bulma/style.css')

    const oruga = createOruga(
      {
        ...bulmaConfig,
        iconComponent: OrugaIconAdapter,
      },
      [
      Button,
      Field,
      Input,
      Select,
      Switch,
      Radio,
      Checkbox,
      Dropdown,
      Slider,
      Icon,
      Carousel,
      Tooltip,
      Collapse,
      Tag,
      Taginput,
      Datepicker,
      Upload,
      ],
    )
    vueApp.use(oruga)
  })()

  return installPromise
}
