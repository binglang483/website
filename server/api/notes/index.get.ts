import { nanoid } from 'nanoid'
import { getDb } from '~/server/utils/db'
import { ok, badRequest } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const page = Math.max(parseInt(query.page as string) || 1, 1)
  const size = Math.min(Math.max(parseInt(query.size as string) || 20, 1), 50)
  const domain = query.domain as string | undefined
  const subcategory = query.subcategory as string | undefined

  const db = getDb()

  // 安全的动态 WHERE 构建（字段名白名单）
  const whitelist: Record<string, string> = { domain: 'n.domain', subcategory: 'n.subcategory' }
  const conds: string[] = ['n.status = 1']
  const params: any[] = []
  for (const [key, col] of Object.entries(whitelist)) {
    const v = query[key] as string | undefined
    if (v) { conds.push(`${col} = ?`); params.push(v) }
  }
  const where = 'WHERE ' + conds.join(' AND ')

  const total = (db.prepare(`SELECT COUNT(*) as c FROM notes n ${where}`).get(...params) as any).c
  const list = db.prepare(`
    SELECT n.*, u.username as author_name, u.nickname as author_nick
    FROM notes n LEFT JOIN users u ON n.author_id = u.id
    ${where}
    ORDER BY n.created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, size, (page - 1) * size)

  return ok({ total, page, size, list })
})
