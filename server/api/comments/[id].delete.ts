/**
 * DELETE /api/comments/[id]
 * 删除评论（作者本人或管理员）
 */
import { getDb } from '~/server/utils/db'
import { getAuthUser } from '~/server/utils/jwt'
import { getParam } from '~/server/utils/params'

const TABLE_MAP: Record<string, string> = {
  document: 'documents',
  note: 'notes',
  article: 'articles',
}

export default defineEventHandler(async (event) => {
  const auth = getAuthUser(event)
  if (!auth) return { code: 401, message: '请先登录', data: null }

  const idStr = getParam(event, 'id', /\/api\/comments\/(\d+)/)
  const id = parseInt(idStr || '')
  if (!id) return { code: 400, message: '参数错误', data: null }

  const db = getDb()
  const comment = db.prepare('SELECT * FROM comments WHERE id = ?').get(id) as any
  if (!comment) return { code: 404, message: '评论不存在', data: null }

  // 权限：作者本人 或 admin
  if (comment.user_id !== auth.userId && auth.role !== 'admin') {
    return { code: 403, message: '无权限删除此评论', data: null }
  }

  // 软删除（设置 status=0），同时处理楼中楼的父评论删除
  db.prepare('UPDATE comments SET status = 0 WHERE id = ?').run(id)

  // 减少目标内容的评论数（最小为 0）
  const table = TABLE_MAP[comment.commentable_type]
  if (table) {
    db.prepare(`UPDATE ${table} SET comment_count = MAX(0, comment_count - 1) WHERE id = ?`).run(comment.commentable_id)
  }

  return { code: 200, message: '评论已删除 👌', data: null }
})
