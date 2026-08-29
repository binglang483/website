/**
 * POST /api/comments
 * 发表评论（登录用户）
 * Body: { type: 'document'|'note'|'article', targetId: number, content: string, parentId?: number }
 */
import { getDb } from '~/server/utils/db'
import { getAuthUser } from '~/server/utils/jwt'

const ALLOWED_TYPES = ['document', 'note', 'article']

// 类型 → 表名映射（用于更新 comment_count）
const TABLE_MAP: Record<string, string> = {
  document: 'documents',
  note: 'notes',
  article: 'articles',
}

export default defineEventHandler(async (event) => {
  const auth = getAuthUser(event)
  if (!auth) return { code: 401, message: '请先登录后再评论', data: null }

  const body = await readBody(event) as {
    type: string
    targetId: number
    content: string
    parentId?: number
  }

  const type = body.type
  if (!ALLOWED_TYPES.includes(type)) {
    return { code: 400, message: '参数错误: type 必须是 document / note / article', data: null }
  }
  if (!body.targetId || !body.content?.trim()) {
    return { code: 400, message: '评论内容不能为空', data: null }
  }

  const db = getDb()

  // 验证目标内容存在
  const table = TABLE_MAP[type]
  const exists = db.prepare(`SELECT id FROM ${table} WHERE id = ? AND status = 1`).get(body.targetId)
  if (!exists) return { code: 404, message: '目标内容不存在', data: null }

  // 如果是回复，验证父评论存在且属于同一内容
  if (body.parentId) {
    const parent = db.prepare(
      'SELECT id FROM comments WHERE id = ? AND commentable_type = ? AND commentable_id = ? AND status = 1'
    ).get(body.parentId, type, body.targetId)
    if (!parent) return { code: 400, message: '回复的评论不存在', data: null }
  }

  const result = db.prepare(`
    INSERT INTO comments (commentable_type, commentable_id, user_id, parent_id, content)
    VALUES (?, ?, ?, ?, ?)
  `).run(type, body.targetId, auth.userId, body.parentId || null, body.content.trim())

  // 更新目标内容的评论计数
  db.prepare(`UPDATE ${table} SET comment_count = comment_count + 1 WHERE id = ?`).run(body.targetId)

  // 返回刚创建的评论（带用户信息）
  const comment = db.prepare(`
    SELECT
      c.id, c.commentable_type, c.commentable_id,
      c.user_id, c.parent_id, c.content, c.created_at,
      u.username, u.nickname, u.avatar, u.role
    FROM comments c LEFT JOIN users u ON c.user_id = u.id
    WHERE c.id = ?
  `).get(result.lastInsertRowid)

  return { code: 200, message: '评论成功 🌸', data: comment }
})
