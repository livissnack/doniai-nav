/** 为所有 @font-face 注入 font-display: swap，避免 FOIT 并满足 PageSpeed 建议 */
export function createFontDisplayPlugin(display = 'swap') {
  return {
    postcssPlugin: 'font-display-swap',
    AtRule: {
      'font-face'(atRule) {
        const hasDisplay = atRule.nodes?.some(
          (node) => node.type === 'decl' && node.prop === 'font-display',
        )
        if (!hasDisplay) {
          atRule.append({ prop: 'font-display', value: display })
        }
      },
    },
  }
}

createFontDisplayPlugin.postcss = true
