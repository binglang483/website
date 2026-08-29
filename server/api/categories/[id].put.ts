/**
 * PUT /api/categories/[id]
 * 重命名/改图标
 * Body: { name?, icon? }
 */
import { getDb } from '~/server/utils/db'
import { getAuthUser } from '~/server/utils/jwt'
import { getParam } from '~/server/utils/params'
import { ok, badRequest, unauthorized, notFound } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  const auth = getAuthUser(event)
  if (!auth) return unauthorized('请先登录')

  const idStr = getParam(event, 'id', /\/api\/categories\/(\d+)/)
  const id = parseInt(idStr || '')
  if (!id) return badRequest('参数错误')

  const body = await readBody(event) as { name?: string; icon?: string }
  const db = getDb()
  const existing = db.prepare('SELECT * FROM categories WHERE id = ?').get(id) as any
  if (!existing) return notFound('文件夹不存在')

  const newName = body.name?.trim()
  if (newName && newName !== existing.name) {
    // 重命名时同步更新 notes 的 subcategory
    db.prepare('UPDATE notes SET subcategory = ? WHERE domain = ? AND subcategory = ?')
      .run(newName, existing.domain, existing.name)
    db.prepare('UPDATE categories SET name = ? WHERE id = ?').run(newName, id)
  }
  if (body.icon !== undefined) {
    db.prepare('UPDATE categories SET icon = ? WHERE id = ?').run(body.icon, id)
  }

  return ok(null, '更新成功 👌')
})
