import { getDb } from '~/server/utils/db'
import { getParam } from '~/server/utils/params'

export default defineEventHandler(async (event) => {
  const articleIdStr = getParam(event, 'articleId', /\/api\/comments\/list\/(\d+)/)
  const articleId = parseInt(articleIdStr || '')
  if (!articleId) return { code: 400, message: '参数错误', data: null }

  const db = getDb()
  const comments = db.prepare(`
    SELECT c.*, u.username, u.nickname, u.avatar
    FROM comments c
    LEFT JOIN users u ON c.user_id = u.id
    WHERE c.article_id = ? AND c.status = 1
    ORDER BY c.created_at ASC
  `).all(articleId) as any[]

  return { code: 200, message: 'ok', data: comments }
})
