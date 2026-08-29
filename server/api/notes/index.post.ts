import { nanoid } from 'nanoid'
import { getDb } from '~/server/utils/db'
import { getAuthUser } from '~/server/utils/jwt'
import { ok, badRequest, unauthorized } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  const auth = getAuthUser(event)
  if (!auth) return unauthorized('请先登录')

  const body = await readBody(event) as {
    title: string; content: string; domain: string; subcategory: string
  }

  if (!body.title?.trim() || !body.content?.trim() || !body.domain || !body.subcategory) {
    return badRequest('请填写完整信息')
  }

  const db = getDb()
  const slug = nanoid(8) + '-' + Date.now().toString(36)
  const result = db.prepare(`
    INSERT INTO notes (slug, title, content, domain, subcategory, author_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(slug, body.title.trim(), body.content, body.domain, body.subcategory, auth.userId)

  return ok({ id: result.lastInsertRowid, slug }, '笔记已保存 📝')
})
