/**
 * DELETE /api/docs/[id] — 软删除文档
 */
import { getDb } from '~/server/utils/db'
import { getAuthUser } from '~/server/utils/jwt'
import { getParam } from '~/server/utils/params'
import { ok, badRequest, unauthorized, forbidden, notFound } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  const auth = getAuthUser(event)
  if (!auth) return unauthorized('请先登录')

  const idStr = getParam(event, 'id', /\/api\/docs\/(\d+)/)
  const id = parseInt(idStr || '')
  if (!id) return badRequest('参数错误')

  const db = getDb()
  const doc = db.prepare('SELECT * FROM documents WHERE id = ?').get(id) as any
  if (!doc) return notFound('文档不存在')
  if (doc.author_id !== auth.userId && auth.role !== 'admin') {
    return forbidden('无权限操作')
  }

  db.prepare('UPDATE documents SET status = 0 WHERE id = ?').run(id)
  return ok(null, '已删除')
})
