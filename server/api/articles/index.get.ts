import { getDb } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const page = parseInt(query.page as string) || 1
  const size = Math.min(parseInt(query.size as string) || 10, 50)
  const category = query.category as string | undefined
  const domain = query.domain as string | undefined

  const db = getDb()

  let where = "WHERE a.status = 1 AND a.visibility = 'public'"
  const params: any[] = []

  if (category) {
    where += ' AND a.category = ?'
    params.push(category)
  }
  if (domain) {
    where += ' AND a.category = ?'
    params.push(domain)
  }

  const total = (db.prepare(`SELECT COUNT(*) as c FROM articles a ${where}`).get(...params) as any).c
  const rows = db.prepare(`
    SELECT a.*, u.username as author_name, u.nickname as author_nick, u.avatar as author_avatar
    FROM articles a
    LEFT JOIN users u ON a.author_id = u.id
    ${where}
    ORDER BY a.created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, size, (page - 1) * size) as any[]

  return {
    code: 200,
    message: 'ok',
    data: {
      total,
      page,
      size,
      list: rows
    }
  }
})
