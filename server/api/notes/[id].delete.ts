import { getDb } from '~/server/utils/db'
import { getAuthUser } from '~/server/utils/jwt'
import { getParam } from '~/server/utils/params'
import { ok, badRequest, unauthorized, forbidden, notFound } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  const auth = getAuthUser(event)
  if (!auth) return unauthorized('请先登录')

  const idStr = getParam(event, 'id', /\/api\/notes\/(\d+)/)
  const id = parseInt(idStr || '')
  if (!id) return badRequest('参数错误')

  const db = getDb()
  const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(id) as any
  if (!note) return notFound('笔记不存在')
  if (note.author_id !== auth.userId && auth.role !== 'admin') {
    return forbidden('无权限操作')
  }

  db.prepare('UPDATE notes SET status = 0 WHERE id = ?').run(id)
  return ok(null, '已删除')
})
