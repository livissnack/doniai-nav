/**
 * Prefetch / cache Univer module graphs so open can overlap with file download.
 * Logs stage timings under `[univer-perf]` for diagnosis.
 */

const cache = {
  sheet: null,
  doc: null,
  slide: null,
}

export function logUniverPerf(label, ms, extra) {
  const msg = `[univer-perf] ${label}: ${Math.round(ms)}ms`
  if (extra !== undefined) console.info(msg, extra)
  else console.info(msg)
}

export function prefetchUniver(mode) {
  if (mode === 'doc') return loadDocModules()
  if (mode === 'slide') return loadSlideModules()
  return loadSheetModules()
}

export function loadSheetModules() {
  if (!cache.sheet) {
    const t0 = performance.now()
    cache.sheet = Promise.all([
      import('@univerjs/presets'),
      import('@univerjs/preset-sheets-core'),
      import('@univerjs/preset-sheets-core/locales/zh-CN'),
      import('@univerjs/preset-sheets-core/lib/index.css'),
    ]).then((mods) => {
      logUniverPerf('import sheet modules', performance.now() - t0)
      return {
        createUniver: mods[0].createUniver,
        LocaleType: mods[0].LocaleType,
        mergeLocales: mods[0].mergeLocales,
        UniverSheetsCorePreset: mods[1].UniverSheetsCorePreset,
        localeMod: mods[2].default || mods[2],
      }
    })
  }
  return cache.sheet
}

export function loadDocModules() {
  if (!cache.doc) {
    const t0 = performance.now()
    cache.doc = Promise.all([
      import('@univerjs/presets'),
      import('@univerjs/preset-docs-core'),
      import('@univerjs/preset-docs-core/locales/zh-CN'),
      import('@univerjs/preset-docs-core/lib/index.css'),
    ]).then((mods) => {
      logUniverPerf('import doc modules', performance.now() - t0)
      return {
        createUniver: mods[0].createUniver,
        LocaleType: mods[0].LocaleType,
        mergeLocales: mods[0].mergeLocales,
        UniverDocsCorePreset: mods[1].UniverDocsCorePreset,
        localeMod: mods[2].default || mods[2],
      }
    })
  }
  return cache.doc
}

export function loadSlideModules() {
  if (!cache.slide) {
    const t0 = performance.now()
    cache.slide = Promise.all([
      import('@univerjs/presets'),
      import('@univerjs/engine-render'),
      import('@univerjs/engine-formula'),
      import('@univerjs/ui'),
      import('@univerjs/ui/locale/zh-CN'),
      import('@univerjs/design/locale/zh-CN'),
      import('@univerjs/docs'),
      import('@univerjs/docs-ui'),
      import('@univerjs/docs-ui/locale/zh-CN'),
      import('@univerjs/drawing'),
      import('@univerjs/slides'),
      import('@univerjs/slides-ui'),
      import('@univerjs/slides-ui/locale/zh-CN'),
      import('@univerjs/design/lib/index.css'),
      import('@univerjs/ui/lib/index.css'),
      import('@univerjs/docs-ui/lib/index.css'),
      import('@univerjs/slides-ui/lib/index.css'),
    ]).then((mods) => {
      logUniverPerf('import slide modules', performance.now() - t0)
      return {
        createUniver: mods[0].createUniver,
        LocaleType: mods[0].LocaleType,
        UniverInstanceType: mods[0].UniverInstanceType,
        mergeLocales: mods[0].mergeLocales,
        UniverRenderEnginePlugin: mods[1].UniverRenderEnginePlugin,
        UniverFormulaEnginePlugin: mods[2].UniverFormulaEnginePlugin,
        UniverUIPlugin: mods[3].UniverUIPlugin,
        uiLocale: mods[4].default || mods[4],
        designLocale: mods[5].default || mods[5],
        UniverDocsPlugin: mods[6].UniverDocsPlugin,
        UniverDocsUIPlugin: mods[7].UniverDocsUIPlugin,
        docsUiLocale: mods[8].default || mods[8],
        UniverDrawingPlugin: mods[9].UniverDrawingPlugin,
        UniverSlidesPlugin: mods[10].UniverSlidesPlugin,
        UniverSlidesUIPlugin: mods[11].UniverSlidesUIPlugin,
        slidesLocale: mods[12].default || mods[12],
      }
    })
  }
  return cache.slide
}
