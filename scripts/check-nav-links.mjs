import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const navDir = path.join(__dirname, '../src/services/nav')

const LOCAL_ROUTES = new Set([
  '/',
  '/login',
  '/register',
  '/admin',
  '/json',
  '/score',
  '/rollcall',
  '/player',
  '/xiami',
  '/pc-book',
  '/h5-book',
  '/foreign',
  '/utils/software',
  '/utils/color',
  '/utils/docker',
  '/utils/design-card',
  '/utils/design-btn',
  '/utils/iptv',
  '/utils/clash',
  '/utils/password',
  '/utils/base64',
  '/utils/loan-rate',
  '/utils/cover',
  '/utils/qrcode',
  '/utils/monitor',
  '/docs',
])

const PRIVATE_HOST_RE = /^(https?:\/\/)?(localhost|127\.|192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/i

function isPrivateUrl(href) {
  return href.startsWith('/') || PRIVATE_HOST_RE.test(href)
}

function localRouteOk(href) {
  const base = href.split('?')[0].split('#')[0]
  if (LOCAL_ROUTES.has(base)) return true
  if (/^\/utils\/software\/[^/]+$/.test(base)) return true
  if (/^\/docs\/s\/[^/]+$/.test(base)) return true
  return false
}

async function probeUrl(url, timeoutMs = 12000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    let res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DoniaiNavLinkCheck/1.0)',
        Accept: 'text/html,application/xhtml+xml,*/*',
      },
    })
    if (res.status === 405 || res.status === 403) {
      res = await fetch(url, {
        method: 'HEAD',
        redirect: 'follow',
        signal: controller.signal,
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DoniaiNavLinkCheck/1.0)' },
      })
    }
    return { ok: res.status >= 200 && res.status < 400, status: res.status, error: null }
  } catch (err) {
    return { ok: false, status: 0, error: err.name === 'AbortError' ? 'timeout' : String(err.message || err) }
  } finally {
    clearTimeout(timer)
  }
}

function collectLinks() {
  const files = fs.readdirSync(navDir).filter((f) => f.endsWith('.json'))
  const entries = []
  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(navDir, file), 'utf8'))
    for (const cat of data) {
      for (const item of cat.items || []) {
        entries.push({
          file,
          category: cat.title,
          name: item.name,
          href: item.href,
        })
      }
    }
  }
  return entries
}

async function main() {
  const entries = collectLinks()
  const results = { alive: [], dead: [], private: [], local: [] }

  for (const entry of entries) {
    const { href } = entry
    if (href.startsWith('/')) {
      const ok = localRouteOk(href)
      ;(ok ? results.local : results.dead).push({ ...entry, reason: ok ? 'route ok' : 'unknown route' })
      continue
    }
    if (isPrivateUrl(href)) {
      results.private.push({ ...entry, reason: 'private/intranet — skipped' })
      continue
    }
    const probe = await probeUrl(href)
    if (probe.ok) {
      results.alive.push({ ...entry, status: probe.status })
    } else {
      results.dead.push({ ...entry, status: probe.status, reason: probe.error || `HTTP ${probe.status}` })
    }
    process.stdout.write('.')
  }

  console.log('\n\n=== DEAD / INVALID ===')
  for (const r of results.dead) {
    console.log(`[${r.file}] ${r.category} / ${r.name}`)
    console.log(`  ${r.href}`)
    console.log(`  -> ${r.reason}${r.status ? ` (${r.status})` : ''}`)
  }

  console.log('\n=== PRIVATE (not probed) ===')
  for (const r of results.private) {
    console.log(`[${r.file}] ${r.name} -> ${r.href}`)
  }

  console.log(`\nSummary: alive=${results.alive.length}, dead=${results.dead.length}, local=${results.local.length}, private=${results.private.length}, total=${entries.length}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
