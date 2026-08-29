/**
 * GET /api/categories?domain=安全
 * 列出某领域下的所有子分类（加上计数）
 */
import { getDb } from '~/server/utils/db'
import { ok } from '~/server/utils/response'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const domain = (query.domain as string) || ''
  if (!domain) {
    return { code: 400, message: '需要 domain 参数', data: [] }
  }

  const db = getDb()
  const rows = db.prepare(`
    SELECT c.id, c.name, c.icon, c.sort_order,
      (SELECT COUNT(*) FROM notes n WHERE n.domain = c.domain AND n.subcategory = c.name) AS note_count
    FROM categories c
    WHERE c.domain = ?
    ORDER BY c.sort_order ASC, c.id ASC
  `).all(domain)

  return ok(rows)
})
