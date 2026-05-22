<template>
  <div class="cover-page">
    <div class="nav-box">
      <Navbar :newPage="true" :newUrl="`/utils/cover`" pageTitle="封面生成器" />
    </div>

    <div class="cover-main">
      <header class="cover-header">
        <h1>封面生成器</h1>
        <p>自定义文案与配色，一键导出高清 PNG 封面</p>
      </header>

      <div class="cover-layout">
        <aside class="cover-panel">
          <section class="form-section">
            <h3>尺寸模板</h3>
            <div class="preset-grid">
              <button
                v-for="p in presets"
                :key="p.id"
                type="button"
                class="preset-btn"
                :class="{ 'is-active': presetId === p.id }"
                @click="applyPreset(p)"
              >
                <span class="preset-name">{{ p.name }}</span>
                <span class="preset-size">{{ p.width }} × {{ p.height }}</span>
              </button>
            </div>
          </section>

          <section class="form-section">
            <h3>文案内容</h3>
            <b-field label="主标题">
              <b-input v-model="form.title" maxlength="40" placeholder="输入封面标题" />
            </b-field>
            <b-field label="副标题">
              <b-input v-model="form.subtitle" maxlength="60" placeholder="可选副标题" />
            </b-field>
            <b-field label="标签">
              <b-input v-model="form.tag" maxlength="16" placeholder="如：技术 · 分享" />
            </b-field>
          </section>

          <section class="form-section">
            <h3>背景</h3>
            <b-field label="背景类型">
              <b-radio v-model="form.bgMode" native-value="gradient">渐变</b-radio>
              <b-radio v-model="form.bgMode" native-value="solid">纯色</b-radio>
              <b-radio v-model="form.bgMode" native-value="image">图片</b-radio>
            </b-field>

            <template v-if="form.bgMode === 'gradient'">
              <b-field label="渐变方案">
                <div class="gradient-picks">
                  <button
                    v-for="g in gradients"
                    :key="g.id"
                    type="button"
                    class="gradient-swatch"
                    :class="{ 'is-active': form.gradientId === g.id }"
                    :style="{ background: gradientStyle(g.id) }"
                    :title="g.name"
                    @click="form.gradientId = g.id"
                  />
                </div>
              </b-field>
              <b-field label="渐变角度">
                <b-slider v-model="form.gradientAngle" :min="0" :max="360" :step="15" />
              </b-field>
            </template>

            <template v-if="form.bgMode === 'solid'">
              <b-field label="背景色">
                <b-input v-model="form.bgColor" type="color" />
              </b-field>
            </template>

            <template v-if="form.bgMode === 'image'">
              <b-field label="上传图片">
                <div class="upload-row">
                  <button type="button" class="btn-outline" @click="$refs.fileInput.click()">
                    <i class="fas fa-image"></i> 选择图片
                  </button>
                  <button
                    v-if="bgImageUrl"
                    type="button"
                    class="btn-text"
                    @click="clearBgImage"
                  >
                    清除
                  </button>
                </div>
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  class="hidden-input"
                  @change="onImageSelect"
                />
              </b-field>
              <b-field label="遮罩浓度">
                <b-slider v-model="form.overlay" :min="0" :max="0.85" :step="0.05" />
              </b-field>
            </template>
          </section>

          <section class="form-section">
            <h3>文字样式</h3>
            <b-field label="文字颜色">
              <b-input v-model="form.textColor" type="color" />
            </b-field>
            <b-field label="主标题字号">
              <b-slider v-model="form.titleSize" :min="24" :max="96" :step="2" />
            </b-field>
            <b-field label="副标题字号">
              <b-slider v-model="form.subtitleSize" :min="14" :max="48" :step="2" />
            </b-field>
            <b-field label="对齐">
              <b-radio v-model="form.textAlign" native-value="center">居中</b-radio>
              <b-radio v-model="form.textAlign" native-value="left">居左</b-radio>
            </b-field>
          </section>

          <div class="form-actions">
            <button type="button" class="btn-primary" :disabled="exporting" @click="downloadCover">
              <i class="fas fa-download"></i>
              {{ exporting ? '导出中…' : '下载 PNG' }}
            </button>
            <button type="button" class="btn-outline" @click="resetForm">重置</button>
          </div>
        </aside>

        <main class="preview-panel">
          <div class="preview-toolbar">
            <span>{{ canvasWidth }} × {{ canvasHeight }} px</span>
            <span class="preview-scale-label">预览比例 {{ previewScale }}%</span>
          </div>
          <div class="preview-stage" ref="previewStage">
            <canvas
              ref="coverCanvas"
              class="cover-canvas"
              :style="previewCanvasStyle"
            />
          </div>
        </main>
      </div>
    </div>

    <div class="backtop">
      <back-top color="#409EFF" :size="1.1" :slow="10" />
    </div>
    <div id="footer">
      <Footer />
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import Navbar from '@/components/Navbar.vue'
import BackTop from '@mlqt/vue-back-top'
import Footer from '@/components/Footer.vue'
import {
  drawCover,
  COVER_PRESETS,
  COVER_GRADIENTS,
} from '@/utils/coverCanvas'

Vue.use(BackTop)

const DEFAULT_FORM = () => ({
  title: 'Doniai 导航',
  subtitle: '简洁 · 优雅 · 高效的个人导航',
  tag: '封面工具',
  bgMode: 'gradient',
  gradientId: 'brand',
  gradientAngle: 135,
  bgColor: '#20bc56',
  textColor: '#ffffff',
  titleSize: 48,
  subtitleSize: 22,
  textAlign: 'center',
  overlay: 0.45,
})

const GRADIENT_CSS = {
  brand: 'linear-gradient(135deg, #22c65b, #15b982)',
  sunset: 'linear-gradient(135deg, #ff6b6b, #feca57)',
  ocean: 'linear-gradient(135deg, #4facfe, #00f2fe)',
  purple: 'linear-gradient(135deg, #c850c0, #4158d0)',
  forest: 'linear-gradient(135deg, #11998e, #38ef7d)',
  night: 'linear-gradient(135deg, #0f2027, #2c5364)',
  warm: 'linear-gradient(135deg, #ff9a9e, #fecfef)',
}

export default {
  name: 'Cover',
  components: {
    Navbar,
    Footer,
  },
  data() {
    const preset = COVER_PRESETS[0]
    return {
      presets: COVER_PRESETS,
      gradients: COVER_GRADIENTS,
      presetId: preset.id,
      canvasWidth: preset.width,
      canvasHeight: preset.height,
      form: DEFAULT_FORM(),
      bgImageUrl: null,
      previewScale: 50,
      exporting: false,
      redrawTimer: null,
    }
  },
  computed: {
    previewCanvasStyle() {
      const w = Math.round((this.canvasWidth * this.previewScale) / 100)
      const h = Math.round((this.canvasHeight * this.previewScale) / 100)
      return {
        width: `${w}px`,
        height: `${h}px`,
      }
    },
  },
  watch: {
    form: {
      handler() {
        this.scheduleRedraw()
      },
      deep: true,
    },
    canvasWidth() {
      this.scheduleRedraw()
    },
    canvasHeight() {
      this.scheduleRedraw()
    },
    bgImageUrl() {
      this.scheduleRedraw()
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.updatePreviewScale()
      this.redraw()
    })
    window.addEventListener('resize', this.updatePreviewScale)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.updatePreviewScale)
    if (this.redrawTimer) clearTimeout(this.redrawTimer)
    if (this.bgImageUrl) URL.revokeObjectURL(this.bgImageUrl)
  },
  methods: {
    gradientStyle(id) {
      return GRADIENT_CSS[id] || GRADIENT_CSS.brand
    },
    applyPreset(p) {
      this.presetId = p.id
      this.canvasWidth = p.width
      this.canvasHeight = p.height
      const titleSize = Math.round(Math.min(p.width, p.height) * 0.07)
      this.form.titleSize = Math.max(28, Math.min(72, titleSize))
      this.form.subtitleSize = Math.round(this.form.titleSize * 0.45)
      this.$nextTick(this.updatePreviewScale)
    },
    updatePreviewScale() {
      const stage = this.$refs.previewStage
      if (!stage) return
      const maxW = stage.clientWidth - 32
      const maxH = Math.min(640, window.innerHeight * 0.55)
      const scaleW = (maxW / this.canvasWidth) * 100
      const scaleH = (maxH / this.canvasHeight) * 100
      this.previewScale = Math.min(100, Math.max(20, Math.floor(Math.min(scaleW, scaleH))))
    },
    scheduleRedraw() {
      if (this.redrawTimer) clearTimeout(this.redrawTimer)
      this.redrawTimer = setTimeout(() => this.redraw(), 80)
    },
    async redraw() {
      const canvas = this.$refs.coverCanvas
      if (!canvas) return
      try {
        await drawCover(canvas, {
          width: this.canvasWidth,
          height: this.canvasHeight,
          ...this.form,
          bgImage: this.form.bgMode === 'image' ? this.bgImageUrl : null,
        })
      } catch (e) {
        console.error('cover draw failed', e)
      }
    },
    onImageSelect(e) {
      const file = e.target.files && e.target.files[0]
      if (!file) return
      if (this.bgImageUrl) URL.revokeObjectURL(this.bgImageUrl)
      this.bgImageUrl = URL.createObjectURL(file)
      this.form.bgMode = 'image'
      e.target.value = ''
    },
    clearBgImage() {
      if (this.bgImageUrl) URL.revokeObjectURL(this.bgImageUrl)
      this.bgImageUrl = null
      this.form.bgMode = 'gradient'
    },
    async downloadCover() {
      const canvas = this.$refs.coverCanvas
      if (!canvas) return
      this.exporting = true
      try {
        await this.redraw()
        const link = document.createElement('a')
        const name = (this.form.title || 'cover').replace(/[\\/:*?"<>|]/g, '_').slice(0, 20)
        link.download = `${name}-${this.canvasWidth}x${this.canvasHeight}.png`
        link.href = canvas.toDataURL('image/png', 1.0)
        link.click()
        this.$buefy.snackbar.open({
          message: '封面已导出',
          type: 'is-success',
          position: 'is-bottom-right',
          duration: 2500,
        })
      } catch (e) {
        this.$buefy.snackbar.open({
          message: '导出失败，请重试',
          type: 'is-danger',
          position: 'is-bottom-right',
          duration: 3000,
        })
      } finally {
        this.exporting = false
      }
    },
    resetForm() {
      this.clearBgImage()
      this.form = DEFAULT_FORM()
      this.applyPreset(this.presets[0])
    },
  },
}
</script>

<style lang="less" scoped>
.cover-page {
  min-height: 100vh;
  background: #f0f2f5;
}

.nav-box {
  background: #fff;
  border-bottom: 1px solid #e8ecea;
  margin-bottom: 0;
}

.cover-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 16px 48px;
}

.cover-header {
  text-align: center;
  margin-bottom: 24px;

  h1 {
    margin: 0 0 8px;
    font-size: 26px;
    font-weight: 700;
    color: #1f2937;
  }

  p {
    margin: 0;
    font-size: 14px;
    color: #6b7280;
  }
}

.cover-layout {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.cover-panel {
  flex: 0 0 360px;
  max-width: 100%;
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(15, 23, 42, 0.06);
  max-height: calc(100vh - 180px);
  overflow-y: auto;
}

.form-section {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;

  &:last-of-type {
    border-bottom: none;
  }

  h3 {
    margin: 0 0 12px;
    font-size: 14px;
    font-weight: 700;
    color: #374151;
  }
}

.preset-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preset-btn {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fafafa;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;

  &.is-active {
    border-color: #20bc56;
    background: #ecfdf3;
  }

  .preset-name {
    font-size: 14px;
    font-weight: 600;
    color: #1f2937;
  }

  .preset-size {
    font-size: 12px;
    color: #9ca3af;
    margin-top: 2px;
  }
}

.gradient-picks {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.gradient-swatch {
  width: 36px;
  height: 36px;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  padding: 0;

  &.is-active {
    border-color: #20bc56;
    box-shadow: 0 0 0 2px #ecfdf3;
  }
}

.upload-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.hidden-input {
  display: none;
}

.form-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 8px;
}

.btn-primary,
.btn-outline {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 40px;
  padding: 0 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.btn-primary {
  border: none;
  background: linear-gradient(135deg, #22c65b, #20bc56);
  color: #fff;

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #2dd36f, #22c65b);
  }
}

.btn-outline {
  border: 1px solid #d1d5db;
  background: #fff;
  color: #374151;

  &:hover {
    border-color: #20bc56;
    color: #20bc56;
  }
}

.btn-text {
  border: none;
  background: none;
  color: #6b7280;
  font-size: 13px;
  cursor: pointer;

  &:hover {
    color: #ef4444;
  }
}

.preview-panel {
  flex: 1;
  min-width: 0;
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(15, 23, 42, 0.06);
}

.preview-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 13px;
  color: #6b7280;
}

.preview-stage {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 320px;
  padding: 24px;
  background: repeating-conic-gradient(#e5e7eb 0% 25%, #f9fafb 0% 50%) 50% / 16px 16px;
  border-radius: 8px;
  overflow: auto;
}

.cover-canvas {
  display: block;
  box-shadow: 0 8px 28px rgba(15, 23, 42, 0.18);
  border-radius: 4px;
}

@media screen and (max-width: 900px) {
  .cover-layout {
    flex-direction: column;
  }

  .cover-panel {
    flex: none;
    width: 100%;
    max-height: none;
  }

  .preview-stage {
    min-height: 240px;
  }
}
</style>
