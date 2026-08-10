import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import JSZip from 'jszip'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const distDir = path.join(root, 'dist')
const zipPath = path.join(root, 'dist.zip')

function walk(dir, base = dir) {
  const entries = []
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name)
    const rel = path.relative(base, full).split(path.sep).join('/')
    if (fs.statSync(full).isDirectory()) {
      entries.push(...walk(full, base))
    } else {
      entries.push({ full, rel })
    }
  }
  return entries
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

if (!fs.existsSync(distDir)) {
  console.error('dist/ 不存在，请先执行 vite build')
  process.exit(1)
}

const files = walk(distDir)
if (!files.length) {
  console.error('dist/ 为空，跳过打包')
  process.exit(1)
}

const zip = new JSZip()
for (const { full, rel } of files) {
  zip.file(rel, fs.readFileSync(full))
}

const buffer = await zip.generateAsync({
  type: 'nodebuffer',
  compression: 'DEFLATE',
  compressionOptions: { level: 6 },
})

fs.writeFileSync(zipPath, buffer)
console.log(`✓ dist.zip 已生成（${files.length} 个文件，${formatSize(buffer.length)}）→ ${zipPath}`)
