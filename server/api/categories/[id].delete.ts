/**
 * DELETE /api/categories/[id]
 * 删除文件夹（文件夹内笔记会被移到同领域的"其他"文件夹）
 */
import { getDb } from '~/server/utils/db'
import { getAuthUser } from '~/server/utils/jwt'
import { getParam } from '~/server/utils/params'
import { ok, badRequest, forbidden, notFound } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  const auth = getAuthUser(event)
  if (!auth || auth.role !== 'admin') {
    return forbidden('仅管理员可删除')
  }

  const idStr = getParam(event, 'id', /\/api\/categories\/(\d+)/)
  const id = parseInt(idStr || '')
  if (!id) return badRequest('参数错误')

  const db = getDb()
  const existing = db.prepare('SELECT * FROM categories WHERE id = ?').get(id) as any
  if (!existing) return notFound('文件夹不存在')

  // 检查是否有笔记
  const noteCount = db.prepare(
    'SELECT COUNT(*) as c FROM notes WHERE domain = ? AND subcategory = ?'
  ).get(existing.domain, existing.name) as { c: number }

  if (noteCount.c > 0) {
    return { code: 400, message: `该文件夹有 ${noteCount.c} 条笔记，请先转移`, data: null }
  }

  db.prepare('DELETE FROM categories WHERE id = ?').run(id)
  return ok(null, '删除成功 👌')
})
