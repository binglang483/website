/**
 * GET /api/comments?type=document|note|article&id=123
 * 获取某篇内容的评论列表（扁平结构，前端按 parent_id 组装树）
 */
import { getDb } from '~/server/utils/db'
import { ok, badRequest } from '~/server/utils/response'

const ALLOWED_TYPES = ['document', 'note', 'article']

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const type = (query.type as string) || ''
  const id = parseInt((query.id as string) || '')

  if (!ALLOWED_TYPES.includes(type) || !id) {
    return badRequest('需要 type 和 id 参数')
  }

  const db = getDb()
  const rows = db.prepare(`
    SELECT
      c.id, c.commentable_type, c.commentable_id,
      c.user_id, c.parent_id, c.content, c.created_at,
      u.username, u.nickname, u.avatar, u.role
    FROM comments c
    LEFT JOIN users u ON c.user_id = u.id
    WHERE c.commentable_type = ? AND c.commentable_id = ? AND c.status = 1
    ORDER BY c.created_at ASC
  `).all(type, id) as any[]

  // 扁平化返回，前端组装嵌套
  return ok(rows)
})

