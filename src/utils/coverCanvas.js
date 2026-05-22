const GRADIENTS = {
  sunset: ['#ff6b6b', '#feca57'],
  ocean: ['#4facfe', '#00f2fe'],
  purple: ['#c850c0', '#4158d0'],
  forest: ['#11998e', '#38ef7d'],
  night: ['#0f2027', '#203a43', '#2c5364'],
  warm: ['#ff9a9e', '#fecfef'],
  brand: ['#22c65b', '#15b982'],
}

function parseGradient(id) {
  const colors = GRADIENTS[id] || GRADIENTS.brand
  return colors
}

function wrapLines(ctx, text, maxWidth) {
  if (!text) return []
  const chars = String(text).split('')
  const lines = []
  let line = ''

  chars.forEach((ch) => {
    const test = line + ch
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = ch
    } else {
      line = test
    }
  })
  if (line) lines.push(line)
  return lines
}

function drawGradientBg(ctx, width, height, gradientId, angleDeg) {
  const colors = parseGradient(gradientId)
  const rad = ((angleDeg - 90) * Math.PI) / 180
  const x1 = width / 2 - (Math.cos(rad) * width) / 2
  const y1 = height / 2 - (Math.sin(rad) * height) / 2
  const x2 = width / 2 + (Math.cos(rad) * width) / 2
  const y2 = height / 2 + (Math.sin(rad) * height) / 2
  const g = ctx.createLinearGradient(x1, y1, x2, y2)
  colors.forEach((c, i) => g.addColorStop(i / (colors.length - 1 || 1), c))
  ctx.fillStyle = g
  ctx.fillRect(0, 0, width, height)
}

function drawOverlay(ctx, width, height, opacity) {
  if (opacity <= 0) return
  const g = ctx.createLinearGradient(0, height * 0.35, 0, height)
  g.addColorStop(0, `rgba(0,0,0,${opacity * 0.1})`)
  g.addColorStop(1, `rgba(0,0,0,${opacity})`)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, width, height)
}

/**
 * @param {HTMLCanvasElement} canvas
 * @param {object} opts
 */
export async function drawCover(canvas, opts) {
  const {
    width,
    height,
    title = '',
    subtitle = '',
    tag = '',
    gradientId = 'brand',
    gradientAngle = 135,
    bgColor = '#20bc56',
    bgMode = 'gradient',
    textColor = '#ffffff',
    titleSize = 48,
    subtitleSize = 24,
    textAlign = 'center',
    bgImage = null,
    overlay = 0.45,
    fontFamily = '"Microsoft YaHei", "PingFang SC", sans-serif',
  } = opts

  const ctx = canvas.getContext('2d')
  canvas.width = width
  canvas.height = height
  ctx.clearRect(0, 0, width, height)

  if (bgMode === 'solid') {
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, width, height)
  } else if (bgMode === 'gradient') {
    drawGradientBg(ctx, width, height, gradientId, gradientAngle)
  }

  if (bgImage) {
    await new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        const scale = Math.max(width / img.width, height / img.height)
        const sw = img.width * scale
        const sh = img.height * scale
        const sx = (width - sw) / 2
        const sy = (height - sh) / 2
        ctx.drawImage(img, sx, sy, sw, sh)
        drawOverlay(ctx, width, height, overlay)
        resolve()
      }
      img.onerror = reject
      img.src = bgImage
    })
  }

  const padX = width * 0.08
  const maxTextWidth = width - padX * 2
  let y = height * (textAlign === 'center' ? 0.42 : 0.72)

  ctx.textAlign = textAlign
  ctx.textBaseline = 'middle'
  ctx.fillStyle = textColor

  if (tag) {
    ctx.font = `500 ${Math.round(subtitleSize * 0.85)}px ${fontFamily}`
    const tagPad = 12
    const tw = ctx.measureText(tag).width + tagPad * 2
    let tx = width / 2
    if (textAlign === 'left') tx = padX + tw / 2
    if (textAlign === 'right') tx = width - padX - tw / 2
    const th = subtitleSize * 1.4
    const ty = y - titleSize * 0.9
    ctx.fillStyle = 'rgba(255,255,255,0.22)'
    roundRect(ctx, tx - tw / 2, ty - th / 2, tw, th, th / 2)
    ctx.fill()
    ctx.fillStyle = textColor
    ctx.fillText(tag, tx, ty)
  }

  ctx.font = `bold ${titleSize}px ${fontFamily}`
  const titleLines = wrapLines(ctx, title, maxTextWidth)
  const titleLineHeight = titleSize * 1.35
  if (textAlign === 'center') {
    y = height * 0.5 - ((titleLines.length - 1) * titleLineHeight) / 2
  }
  titleLines.forEach((line) => {
    let x = width / 2
    if (textAlign === 'left') x = padX
    if (textAlign === 'right') x = width - padX
    ctx.fillText(line, x, y)
    y += titleLineHeight
  })

  if (subtitle) {
    y += subtitleSize * 0.35
    ctx.font = `400 ${subtitleSize}px ${fontFamily}`
    ctx.globalAlpha = 0.92
    const subLines = wrapLines(ctx, subtitle, maxTextWidth)
    subLines.forEach((line) => {
      let x = width / 2
      if (textAlign === 'left') x = padX
      if (textAlign === 'right') x = width - padX
      ctx.fillText(line, x, y)
      y += subtitleSize * 1.4
    })
    ctx.globalAlpha = 1
  }

  ctx.font = `400 ${Math.max(12, subtitleSize * 0.65)}px ${fontFamily}`
  ctx.globalAlpha = 0.5
  ctx.textAlign = 'right'
  ctx.fillText('Doniai Cover', width - padX, height - padX * 0.6)
  ctx.globalAlpha = 1
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

export const COVER_PRESETS = [
  { id: 'wechat', name: '公众号封面', width: 900, height: 383 },
  { id: 'xiaohongshu', name: '小红书 3:4', width: 1242, height: 1660 },
  { id: 'square', name: '正方形', width: 1080, height: 1080 },
  { id: 'video', name: '视频 16:9', width: 1280, height: 720 },
  { id: 'banner', name: '横版 Banner', width: 1920, height: 600 },
]

export const COVER_GRADIENTS = [
  { id: 'brand', name: '品牌绿' },
  { id: 'sunset', name: '日落' },
  { id: 'ocean', name: '海洋' },
  { id: 'purple', name: '紫蓝' },
  { id: 'forest', name: '森林' },
  { id: 'night', name: '深夜' },
  { id: 'warm', name: '暖粉' },
]
