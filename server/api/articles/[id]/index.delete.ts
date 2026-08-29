import { getDb } from '~/server/utils/db'
import { getAuthUser } from '~/server/utils/jwt'
import { getParam } from '~/server/utils/params'

export default defineEventHandler(async (event) => {
  const auth = getAuthUser(event)
  if (!auth) return { code: 401, message: '请先登录', data: null }

  const idStr = getParam(event, 'id', /\/api\/articles\/(\d+)/)
  const id = parseInt(idStr || '')
  if (!id) return { code: 400, message: '参数错误', data: null }

  const db = getDb()
  const article = db.prepare('SELECT * FROM articles WHERE id = ?').get(id) as any
  if (!article) return { code: 404, message: '文章不存在', data: null }
  if (article.author_id !== auth.userId && auth.role !== 'admin') {
    return { code: 403, message: '无权限操作', data: null }
  }

  db.prepare('UPDATE articles SET status = 0 WHERE id = ?').run(id)
  return { code: 200, message: '已删除', data: null }
})
