import { getDb } from '~/server/utils/db'
import { getAuthUser } from '~/server/utils/jwt'

export default defineEventHandler(async (event) => {
  const auth = getAuthUser(event)
  if (!auth) return { code: 401, message: '请先登录', data: null }

  const body = await readBody(event) as { articleId: number; content: string; parentId?: number }
  if (!body.articleId || !body.content?.trim()) {
    return { code: 400, message: '评论内容不能为空', data: null }
  }

  const db = getDb()
  const result = db.prepare(`
    INSERT INTO comments (article_id, user_id, parent_id, content)
    VALUES (?, ?, ?, ?)
  `).run(body.articleId, auth.userId, body.parentId || null, body.content.trim())

  db.prepare('UPDATE articles SET comment_count = comment_count + 1 WHERE id = ?').run(body.articleId)

  const comment = db.prepare(`
    SELECT c.*, u.username, u.nickname, u.avatar
    FROM comments c LEFT JOIN users u ON c.user_id = u.id
    WHERE c.id = ?
  `).get(result.lastInsertRowid)

  return { code: 200, message: '评论成功 🌸', data: comment }
})
