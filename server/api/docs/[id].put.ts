/**
 * PUT /api/docs/[id] — 编辑文档（作者本人或 admin）
 * PATCH visibility 字段也通过这个
 */
import { getDb } from '~/server/utils/db'
import { getAuthUser } from '~/server/utils/jwt'
import { getParam } from '~/server/utils/params'

export default defineEventHandler(async (event) => {
  const auth = getAuthUser(event)
  if (!auth) return { code: 401, message: '请先登录', data: null }

  const idStr = getParam(event, 'id', /\/api\/docs\/(\d+)/)
  const id = parseInt(idStr || '')
  if (!id) return { code: 400, message: '参数错误', data: null }

  const db = getDb()
  const doc = db.prepare('SELECT * FROM documents WHERE id = ?').get(id) as any
  if (!doc) return { code: 404, message: '文档不存在', data: null }
  if (doc.author_id !== auth.userId && auth.role !== 'admin') {
    return { code: 403, message: '无权限操作', data: null }
  }

  const body = await readBody(event) as Partial<{
    title: string; content: string; domain: string; subcategory: string;
    visibility: 'public' | 'private'; slug: string
  }>

  const updates: string[] = []
  const params: any[] = []

  if (body.title !== undefined) { updates.push('title = ?'); params.push(body.title.trim()) }
  if (body.content !== undefined) { updates.push('content = ?'); params.push(body.content) }
  if (body.domain !== undefined) { updates.push('domain = ?'); params.push(body.domain) }
  if (body.subcategory !== undefined) { updates.push('subcategory = ?'); params.push(body.subcategory) }
  if (body.visibility !== undefined && ['public', 'private'].includes(body.visibility)) {
    updates.push('visibility = ?'); params.push(body.visibility)
  }
  if (body.slug !== undefined) { updates.push('slug = ?'); params.push(body.slug) }

  if (updates.length > 0) {
    updates.push("updated_at = datetime('now','localtime')")
    params.push(id)
    db.prepare(`UPDATE documents SET ${updates.join(', ')} WHERE id = ?`).run(...params)
  }

  return { code: 200, message: '更新成功', data: null }
})
