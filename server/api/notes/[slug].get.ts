import { getDb } from '~/server/utils/db'
import { getParam } from '~/server/utils/params'
import { ok, badRequest, notFound } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  const slug = getParam(event, 'slug', /\/api\/notes\/([^/?]+)/)
  if (!slug) return badRequest('参数错误')

  const db = getDb()
  const note = db.prepare(`
    SELECT n.*, u.username as author_name, u.nickname as author_nick
    FROM notes n LEFT JOIN users u ON n.author_id = u.id
    WHERE n.slug = ?
  `).get(slug)

  if (!note || (note as any).status !== 1) {
    return notFound('笔记不存在')
  }

  return ok(note)
})
