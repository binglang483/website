import { nanoid } from 'nanoid'
import { getDb } from '~/server/utils/db'
import { getAuthUser } from '~/server/utils/jwt'

export default defineEventHandler(async (event) => {
  const auth = getAuthUser(event)
  if (!auth) return { code: 401, message: '请先登录', data: null }

  const query = getQuery(event)
  const page = parseInt(query.page as string) || 1
  const size = Math.min(parseInt(query.size as string) || 20, 50)
  const domain = query.domain as string | undefined
  const subcategory = query.subcategory as string | undefined

  const db = getDb()

  let where = 'WHERE n.status = 1'
  const params: any[] = []
  if (domain) { where += ' AND n.domain = ?'; params.push(domain) }
  if (subcategory) { where += ' AND n.subcategory = ?'; params.push(subcategory) }

  const total = (db.prepare(`SELECT COUNT(*) as c FROM notes n ${where}`).get(...params) as any).c
  const list = db.prepare(`
    SELECT n.*, u.username as author_name, u.nickname as author_nick
    FROM notes n LEFT JOIN users u ON n.author_id = u.id
    ${where}
    ORDER BY n.created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, size, (page - 1) * size)

  return { code: 200, message: 'ok', data: { total, page, size, list } }
})
