<template>
  <div class="univer-office-viewer">
    <div v-if="loading" class="univer-loading">
      <AppIcon name="spinner" spin />
      <span>{{ loadingText }}</span>
    </div>
    <div v-show="!loading" ref="host" class="univer-host" />
  </div>
</template>

<script>
import { arrayBufferToUniverData } from '@/utils/univerWorkbook'
import { arrayBufferToDocumentData, textToDocumentData } from '@/utils/univerDoc'
import { arrayBufferToSlideData, createBlankSlideData } from '@/utils/univerSlide'
import {
  loadSheetModules,
  loadDocModules,
  loadSlideModules,
  logUniverPerf,
} from '@/utils/univerLoad'

export default {
  name: 'UniverOfficeViewer',
  props: {
    /** sheet | doc | slide */
    mode: { type: String, default: 'sheet' },
    buffer: { type: [ArrayBuffer, Uint8Array], default: null },
    fileName: { type: String, default: '' },
  },
  data() {
    return { loading: true }
  },
  computed: {
    loadingText() {
      if (this.mode === 'doc') return '正在加载文档编辑器…'
      if (this.mode === 'slide') return '正在加载演示文稿编辑器…'
      return '正在加载表格编辑器…'
    },
  },
  mounted() {
    this.initUniver()
  },
  beforeUnmount() {
    this.disposeUniver()
  },
  methods: {
    disposeUniver() {
      try {
        this._univerAPI?.dispose?.()
      } catch {
        /* ignore */
      }
      try {
        this._univer?.dispose?.()
      } catch {
        /* ignore */
      }
      this._univerAPI = null
      this._univer = null
      this._slideUnit = null
    },
    async initUniver() {
      const total0 = performance.now()
      this.loading = true
      this.disposeUniver()
      try {
        await this.$nextTick()
        const host = this.$refs.host
        if (!host) return

        if (this.mode === 'doc') {
          await this.initDoc(host)
        } else if (this.mode === 'slide') {
          await this.initSlide(host)
        } else {
          await this.initSheet(host)
        }
        logUniverPerf(`open ${this.mode} total`, performance.now() - total0, this.fileName)
      } catch (e) {
        console.error(e)
        this.$emit('error', e)
      } finally {
        this.loading = false
      }
    },
    async initSheet(host) {
      // Overlap: download already done; convert while JS modules parse
      const convertP = this.buffer
        ? (async () => {
            const t0 = performance.now()
            const converted = await arrayBufferToUniverData(this.buffer, this.fileName)
            logUniverPerf('convert workbook', performance.now() - t0)
            return converted.data
          })()
        : Promise.resolve(null)

      const mods = await loadSheetModules()
      const tCreate = performance.now()
      const { univer, univerAPI } = mods.createUniver({
        locale: mods.LocaleType.ZH_CN,
        locales: {
          [mods.LocaleType.ZH_CN]: mods.mergeLocales(mods.localeMod),
        },
        presets: [mods.UniverSheetsCorePreset({ container: host })],
      })
      this._univer = univer
      this._univerAPI = univerAPI
      const data = await convertP
      univerAPI.createWorkbook(data || {})
      logUniverPerf('create workbook UI', performance.now() - tCreate)
    },
    async initDoc(host) {
      const convertP = this.buffer
        ? (async () => {
            const t0 = performance.now()
            const data = await arrayBufferToDocumentData(this.buffer, this.fileName)
            logUniverPerf('convert docx→text', performance.now() - t0)
            return data
          })()
        : Promise.resolve(textToDocumentData('', this.fileName || '未命名文档'))

      const mods = await loadDocModules()
      const tCreate = performance.now()
      const { univer, univerAPI } = mods.createUniver({
        locale: mods.LocaleType.ZH_CN,
        locales: {
          [mods.LocaleType.ZH_CN]: mods.mergeLocales(mods.localeMod),
        },
        presets: [mods.UniverDocsCorePreset({ container: host })],
      })
      this._univer = univer
      this._univerAPI = univerAPI
      const data = await convertP
      univerAPI.createUniverDoc(data)
      logUniverPerf('create doc UI', performance.now() - tCreate)
    },
    async initSlide(host) {
      const convertP = this.buffer
        ? (async () => {
            const t0 = performance.now()
            try {
              const data = await arrayBufferToSlideData(this.buffer, this.fileName)
              logUniverPerf('convert pptx→text', performance.now() - t0)
              return data
            } catch (e) {
              console.warn('pptx parse failed, open blank', e)
              logUniverPerf('convert pptx failed→blank', performance.now() - t0)
              return createBlankSlideData(this.fileName || '演示文稿')
            }
          })()
        : Promise.resolve(createBlankSlideData(this.fileName || '演示文稿'))

      const mods = await loadSlideModules()
      const tCreate = performance.now()
      const { univer, univerAPI } = mods.createUniver({
        locale: mods.LocaleType.ZH_CN,
        locales: {
          [mods.LocaleType.ZH_CN]: mods.mergeLocales(
            mods.designLocale,
            mods.uiLocale,
            mods.docsUiLocale,
            mods.slidesLocale,
          ),
        },
        presets: [],
        plugins: [
          mods.UniverDrawingPlugin,
          mods.UniverRenderEnginePlugin,
          mods.UniverFormulaEnginePlugin,
          [mods.UniverUIPlugin, { container: host, ribbonType: 'simple' }],
          mods.UniverDocsPlugin,
          mods.UniverDocsUIPlugin,
          mods.UniverSlidesPlugin,
          mods.UniverSlidesUIPlugin,
        ],
      })
      this._univer = univer
      this._univerAPI = univerAPI
      const data = await convertP
      this._slideUnit = univer.createUnit(mods.UniverInstanceType.UNIVER_SLIDE, data)
      logUniverPerf('create slide UI', performance.now() - tCreate)
    },
    getSnapshot() {
      if (this.mode === 'doc') {
        return this._univerAPI?.getActiveDocument?.()?.getSnapshot?.() || null
      }
      if (this.mode === 'slide') {
        try {
          return this._slideUnit?.getSnapshot?.() || null
        } catch {
          return null
        }
      }
      return this._univerAPI?.getActiveWorkbook?.()?.getSnapshot?.() || null
    },
  },
}
</script>

<style lang="less" scoped>
.univer-office-viewer {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 420px;
  background: #fff;
}

.univer-host {
  width: 100%;
  height: 100%;
  min-height: 420px;
}

.univer-loading {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: #fff;
  color: #64748b;
  font-size: 13px;

  :deep(.app-icon) {
    font-size: 22px;
    color: #20bc56;
  }
}
</style>
