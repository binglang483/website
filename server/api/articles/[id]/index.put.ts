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

  const body = await readBody(event) as Partial<{ title: string; content: string; category: string; visibility: string; status: number }>

  const updates: string[] = []
  const params: any[] = []
  if (body.title !== undefined) { updates.push('title = ?'); params.push(body.title) }
  if (body.content !== undefined) {
    updates.push('content = ?'); params.push(body.content)
    updates.push('excerpt = ?'); params.push(body.content.replace(/[#*`>\-_]/g, '').slice(0, 200))
  }
  if (body.category !== undefined) { updates.push('category = ?'); params.push(body.category) }
  if (body.visibility !== undefined) { updates.push('visibility = ?'); params.push(body.visibility) }
  if (body.status !== undefined) { updates.push('status = ?'); params.push(body.status) }
  updates.push("updated_at = datetime('now','localtime')")

  if (updates.length > 1) {
    params.push(id)
    db.prepare(`UPDATE articles SET ${updates.join(', ')} WHERE id = ?`).run(...params)
  }

  return { code: 200, message: '更新成功', data: null }
})
