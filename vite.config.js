import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { createPurgeCssPlugin } from './purgecss.config.js'
import { createFontDisplayPlugin } from './postcss-font-display.js'

function resolveHmr(env, port) {
  if (env.VITE_HMR_DISABLE === '1' || env.VITE_HMR_DISABLE === 'true') {
    return false
  }

  const host = env.VITE_HMR_HOST || env.VITE_DEV_HOST
  const clientPort = Number(env.VITE_HMR_CLIENT_PORT || port)

  if (host) {
    return {
      protocol: 'ws',
      host,
      port,
      clientPort,
    }
  }

  return {
    port,
    clientPort,
  }
}

function createApiProxy(proxyTarget, serviceToken) {
  const entry = {
    target: proxyTarget,
    changeOrigin: true,
    ws: true,
    rewrite: (p) => p.replace(/^\/api/, ''),
  }

  // 预览/开发走 vite 代理时，为无 Authorization 的请求补上服务 Bearer（与线上一致）
  if (serviceToken) {
    entry.configure = (proxy) => {
      proxy.on('proxyReq', (proxyReq) => {
        if (!proxyReq.getHeader('authorization')) {
          proxyReq.setHeader('Authorization', `Bearer ${serviceToken}`)
        }
      })
    }
  }

  return { '/api': entry }
}

/** 将 node_modules 拆成独立 chunk，避免单个 vendor 超过 500KB */
function resolveManualChunk(id) {
  if (!id.includes('node_modules')) return

  const rules = [
    [/[/\\]@iconify[/\\]/, 'iconify'],
    [/[/\\]chart\.js[/\\]/, 'chartjs'],
    [/[/\\]highlight\.js[/\\]/, 'hljs'],
    [/[/\\]@oruga-ui[/\\]/, 'oruga'],
    [/[/\\]vue-router[/\\]/, 'vue-vendor'],
    [/[/\\]@vue[/\\]/, 'vue-vendor'],
    [/[/\\]vue[/\\]dist[/\\]/, 'vue-vendor'],
    [/codemirror|@codemirror|@lezer|@marijn|vue-codemirror/, 'codemirror'],
    [/[/\\]epubjs[/\\]/, 'epubjs'],
    [/[/\\]jszip[/\\]/, 'jszip'],
    [/[/\\]mammoth[/\\]|@xmldom[/\\]/, 'mammoth'],
    [/[/\\]xlsx[/\\]/, 'xlsx'],
    [/[/\\]hls\.js[/\\]/, 'hls'],
    [/[/\\]flv\.js[/\\]/, 'flv'],
    [/[/\\]html2canvas[/\\]/, 'html2canvas'],
    [/[/\\]html-to-image[/\\]/, 'html-to-image'],
    [/[/\\]aplayer[/\\]/, 'aplayer'],
    [/[/\\]marked[/\\]/, 'marked'],
    [/json-formatter-js/, 'json-formatter'],
    [/[/\\]js-yaml[/\\]/, 'js-yaml'],
    [/solarlunar/, 'solarlunar'],
    [/number2chinesenumber/, 'n2cn'],
    [/[/\\]platform[/\\]/, 'platform'],
    [/file-saver/, 'file-saver'],
    [/fetch-jsonp/, 'fetch-jsonp'],
  ]

  for (const [pattern, name] of rules) {
    if (pattern.test(id)) return name
  }

  return 'vendor-misc'
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const port = Number(env.VITE_WEB_PORT || 1343)
  const previewPort = Number(env.VITE_PREVIEW_PORT || 4173)
  const proxyTarget = env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:3001'
  const serviceToken = env.VITE_SECRET_KEY || env.VUE_APP_SECRET_KEY || ''
  const apiProxy = createApiProxy(proxyTarget, serviceToken)
  const hmrHost = env.VITE_HMR_HOST || env.VITE_DEV_HOST
  const hmr = resolveHmr(env, port)

  return {
    envPrefix: ['VITE_', 'VUE_APP_'],
    plugins: [
      vue({
        template: {
          compilerOptions: {
            isCustomElement: (tag) => tag === 'widget-qrcode',
          },
        },
      }),
    ],
    optimizeDeps: {
      include: [
        'vue',
        'vue-router',
        '@oruga-ui/oruga-next',
        '@oruga-ui/theme-bulma',
      ],
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    css: {
      postcss: {
        plugins:
          mode === 'production'
            ? [createPurgeCssPlugin(), createFontDisplayPlugin()]
            : [createFontDisplayPlugin()],
      },
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
        },
      },
    },
    server: {
      host: '0.0.0.0',
      port,
      strictPort: false,
      // 局域网 / WSL 访问时让资源与 HMR 使用浏览器中的同源地址
      origin: hmrHost ? `http://${hmrHost}:${port}` : undefined,
      warmup: {
        clientFiles: [
          './src/main.js',
          './src/App.vue',
          './src/views/Home.vue',
        ],
      },
      hmr,
      watch: {
        usePolling:
          env.VITE_USE_POLLING === '1' ||
          env.VITE_USE_POLLING === 'true' ||
          !!env.VITE_HMR_HOST,
      },
      proxy: apiProxy,
    },
    preview: {
      host: '0.0.0.0',
      port: previewPort,
      strictPort: false,
      proxy: apiProxy,
    },
    build: {
      target: 'es2020',
      sourcemap: false,
      cssCodeSplit: true,
      // chart.js 约 200KB，仅在成绩/贷款/点名等页懒加载
      chunkSizeWarningLimit: 1100,
      rollupOptions: {
        output: {
          manualChunks: resolveManualChunk,
        },
      },
    },
  }
})
