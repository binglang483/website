import { getDb } from '~/server/utils/db'
import { getParam } from '~/server/utils/params'

export default defineEventHandler(async (event) => {
  const slug = getParam(event, 'slug', /\/api\/notes\/([^/?]+)/)
  if (!slug) return { code: 400, message: '参数错误', data: null }

  const db = getDb()
  const note = db.prepare(`
    SELECT n.*, u.username as author_name, u.nickname as author_nick
    FROM notes n LEFT JOIN users u ON n.author_id = u.id
    WHERE n.slug = ?
  `).get(slug)

  if (!note || (note as any).status !== 1) {
    return { code: 404, message: '笔记不存在', data: null }
  }

  return { code: 200, message: 'ok', data: note }
})
