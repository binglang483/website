/**
 * DELETE /api/comments/[id]
 * 删除评论（作者本人或管理员）
 */
import { getDb } from '~/server/utils/db'
import { getAuthUser } from '~/server/utils/jwt'
import { getParam } from '~/server/utils/params'
import { ok, badRequest, unauthorized, forbidden, notFound } from '~/server/utils/response'

const TABLE_MAP: Record<string, string> = {
  document: 'documents',
  note: 'notes',
  article: 'articles',
}

export default defineEventHandler(async (event) => {
  const auth = getAuthUser(event)
  if (!auth) return unauthorized('请先登录')

  const idStr = getParam(event, 'id', /\/api\/comments\/(\d+)/)
  const id = parseInt(idStr || '')
  if (!id) return badRequest('参数错误')

  const db = getDb()
  const comment = db.prepare('SELECT * FROM comments WHERE id = ?').get(id) as any
  if (!comment) return notFound('评论不存在')

  // 权限：作者本人 或 admin
  if (comment.user_id !== auth.userId && auth.role !== 'admin') {
    return forbidden('无权限删除此评论')
  }

  // 软删除（设置 status=0），同时处理楼中楼的父评论删除
  db.prepare('UPDATE comments SET status = 0 WHERE id = ?').run(id)

  // 减少目标内容的评论数（最小为 0）
  const table = TABLE_MAP[comment.commentable_type]
  if (table) {
    db.prepare(`UPDATE ${table} SET comment_count = MAX(0, comment_count - 1) WHERE id = ?`).run(comment.commentable_id)
  }

  return ok(null, '评论已删除 👌')
})
