/**
 * 种子数据：从 public/docs/**.md 导入 documents 表
 * 新增：用 fs_seed_meta 表记录每个文件的 mtime，只有变更的文件才重导
 *       （首次全量导入，之后只在文件变化时 upsert）
 */
import Database from 'better-sqlite3'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

let _seededOnce = false

export function seedDocumentsFromFilesystem(db: Database.Database) {
  if (_seededOnce) return
  _seededOnce = true

  const docsDir = findDocsDir()
  if (!docsDir) {
    console.warn('[seedDocuments] 未找到 public/docs 目录，跳过文档导入')
    return
  }

  const mdFiles: string[] = []
  walkMdFiles(docsDir, mdFiles)
  if (mdFiles.length === 0) return

  const metaMap = new Map<string, number>()
  try {
    const rows = db.prepare('SELECT path, mtime FROM fs_seed_meta').all() as { path: string; mtime: number }[]
    for (const r of rows) metaMap.set(r.path, r.mtime)
  } catch {}

  const upsertDoc = db.prepare(`
    INSERT INTO documents (slug, title, content, domain, subcategory, author_id, visibility)
    VALUES (@slug, @title, @content, @domain, @subcategory, 1, 'public')
    ON CONFLICT(slug) DO UPDATE SET
      title = excluded.title,
      content = excluded.content,
      domain = excluded.domain,
      subcategory = excluded.subcategory,
      updated_at = datetime('now','localtime')
  `)
  const upsertMeta = db.prepare(`
    INSERT INTO fs_seed_meta (path, mtime, updated_at)
    VALUES (?, ?, datetime('now','localtime'))
    ON CONFLICT(path) DO UPDATE SET mtime = excluded.mtime, updated_at = excluded.updated_at
  `)

  let inserted = 0
  let updated = 0
  let skipped = 0

  const tx = db.transaction((files: string[]) => {
    for (const file of files) {
      const stat = fs.statSync(file)
      const mtime = stat.mtimeMs
      const relPath = path.relative(docsDir, file).replace(/\\/g, '/')

      if (metaMap.has(relPath) && metaMap.get(relPath) === mtime) {
        skipped++
        continue
      }

      const parts = relPath.replace(/\.md$/i, '').split('/')
      const domain = parts[0] || ''
      const subcategory = parts.length >= 3 ? parts.slice(1, -1).join('/') : ''
      const slugTitle = parts[parts.length - 1] || '未命名'
      const slug = relPath.replace(/\.md$/i, '').replace(/\\/g, '/')

      let content = ''
      try { content = fs.readFileSync(file, 'utf-8') } catch { continue }

      const firstHeading = content.match(/^\s*#\s+(.+)$/m)
      const title = (firstHeading?.[1] || slugTitle).trim()
      const body = firstHeading ? content.replace(firstHeading[0], '').trim() : content

      const existed = db.prepare('SELECT id FROM documents WHERE slug = ?').get(slug)
      upsertDoc.run({ slug, title, content: body, domain, subcategory, author_id: 1 })
      upsertMeta.run(relPath, mtime)
      if (existed) updated++; else inserted++
    }
  })

  tx(mdFiles)
  if (inserted + updated > 0) {
    console.log(`[seedDocuments] ${mdFiles.length} 文件 → 新增 ${inserted}，更新 ${updated}，跳过(未变) ${skipped}`)
  }
}

/** 向上遍历查找 public/docs 目录 */
function findDocsDir(): string | null {
  const dirname = import.meta.dirname || path.dirname(fileURLToPath(import.meta.url))

  const starts = [
    dirname,
    path.join(dirname, '..'),
    path.join(dirname, '..', '..'),
    path.join(dirname, '..', '..', '..'),
    path.join(dirname, '..', '..', '..', '..'),
  ]

  for (const start of starts) {
    const root = path.resolve(start)
    let cur = root
    for (let i = 0; i < 6; i++) {
      const candidate = path.join(cur, 'public', 'docs')
      if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
        return candidate
      }
      const parent = path.dirname(cur)
      if (parent === cur) break
      cur = parent
    }
  }
  return null
}

/** 递归收集所有 .md 文件 */
function walkMdFiles(dir: string, out: string[]) {
  let entries: fs.Dirent[]
  try { entries = fs.readdirSync(dir, { withFileTypes: true }) } catch { return }
  for (const e of entries) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) walkMdFiles(full, out)
    else if (e.isFile() && /\.md$/i.test(e.name)) out.push(full)
  }
}
