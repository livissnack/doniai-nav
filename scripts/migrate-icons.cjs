const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..', 'src')

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name)
    if (fs.statSync(p).isDirectory()) walk(p, out)
    else if (p.endsWith('.vue')) out.push(p)
  }
  return out
}

function packFromClass(packClass) {
  if (packClass.includes('fab')) return 'brands'
  if (packClass.includes('far')) return 'regular'
  return 'solid'
}

function migrateContent(content) {
  let next = content

  next = next.replace(
    /<i\s+class="(fa[bst]?|fa)\s+(fa-[^"\s]+)([^"]*)"\s*([^>]*)><\/i>/g,
    (_, pack, icon, extraClass, attrs) => {
      const spin = extraClass.includes('fa-spin') || attrs.includes('fa-spin')
      const packVal = packFromClass(pack)
      const spinAttr = spin ? ' spin' : ''
      const packAttr = packVal === 'solid' ? '' : ` pack="${packVal}"`
      const cls = extraClass.trim().replace(/\s*fa-spin\s*/g, ' ').trim()
      const classAttr = cls ? ` class="${cls}"` : ''
      return `<AppIcon name="${icon.replace(/^fa-/, '')}"${packAttr}${spinAttr}${classAttr} ${attrs.trim()} />`
    },
  )

  next = next.replace(
    /<i\s+:class="\['(fa[bst]?|fa)',\s*([^?]+)\?\s*'(fa-[^']+)'\s*:\s*'(fa-[^']+)'\]"\s*([^>]*)><\/i>/g,
    (_, pack, cond, a, b, attrs) => {
      const packVal = packFromClass(pack)
      const packAttr = packVal === 'solid' ? '' : ` pack="${packVal}"`
      return `<AppIcon :name="${cond} ? '${a.replace(/^fa-/, '')}' : '${b.replace(/^fa-/, '')}'"${packAttr} ${attrs.trim()} />`
    },
  )

  next = next.replace(
    /<i\s+class="(fa[bst]?|fa)"\s+:class="([^"]+)"\s*([^>]*)><\/i>/g,
    (_, pack, expr, attrs) => {
      const packVal = packFromClass(pack)
      const packAttr = packVal === 'solid' ? '' : ` pack="${packVal}"`
      return `<AppIcon :name="String(${expr}).replace(/^fa-/, '')"${packAttr} ${attrs.trim()} />`
    },
  )

  next = next.replace(
    /<i\s+:class="([^"]+)"\s*([^>]*)><\/i>/g,
    (match, expr, attrs) => {
      if (match.includes('AppIcon')) return match
      if (!expr.includes('fa-') && !expr.includes('fas') && !expr.includes('fab') && !expr.includes('far')) {
        return match
      }
      return `<AppIcon :icon-class="${expr}" ${attrs.trim()} />`
    },
  )

  next = next.replace(/icon:\s*'(fa-[^']+)'/g, (_, icon) => `icon: '${icon.replace(/^fa-/, '')}'`)
  next = next.replace(/icon:\s*'(fas|far|fab)\s+fa-([^']+)'/g, (_, pack, icon) => {
    const p = packFromClass(pack)
    return p === 'solid' ? `icon: '${icon}'` : `icon: '${icon}', iconPack: '${p}'`
  })
  next = next.replace(/return\s+'fas\s+fa-([^']+)'/g, "return '$1'")
  next = next.replace(/return\s+'fa-([^']+)'/g, "return '$1'")

  return next
}

const files = walk(root)
let changed = 0
for (const file of files) {
  const before = fs.readFileSync(file, 'utf8')
  const after = migrateContent(before)
  if (after !== before) {
    fs.writeFileSync(file, after)
    changed++
    console.log('updated', path.relative(root, file))
  }
}
console.log(`done, ${changed} files`)
