/**
 * POST /api/categories
 * 新建子分类
 * Body: { domain, name, icon? }
 */
import { getDb } from '~/server/utils/db'
import { getAuthUser } from '~/server/utils/jwt'
import { ok, badRequest, unauthorized } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  const auth = getAuthUser(event)
  if (!auth) return unauthorized('请先登录')

  const body = await readBody(event) as {
    domain: string
    name: string
    icon?: string
  }

  const domain = body.domain?.trim()
  const name = body.name?.trim()
  if (!domain || !name) {
    return badRequest('领域和名称不能为空')
  }
  if (name.length > 20) {
    return badRequest('名称不超过 20 字')
  }

  const db = getDb()
  // 检查重复
  const exists = db.prepare('SELECT id FROM categories WHERE domain = ? AND name = ?').get(domain, name)
  if (exists) return badRequest('该文件夹已存在')

  const result = db.prepare(`
    INSERT INTO categories (domain, name, icon, sort_order)
    VALUES (?, ?, ?, (SELECT COALESCE(MAX(sort_order),0)+1 FROM categories WHERE domain = ?))
  `).run(domain, name, body.icon || '📁', domain)

  return ok({ id: result.lastInsertRowid, name }, '创建成功 ✨')
})
