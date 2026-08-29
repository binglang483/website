import { nanoid } from 'nanoid'
import { getDb } from '~/server/utils/db'
import { getAuthUser } from '~/server/utils/jwt'

export default defineEventHandler(async (event) => {
  const auth = getAuthUser(event)
  if (!auth) return { code: 401, message: '请先登录', data: null }

  const body = await readBody(event) as {
    title: string; content: string; domain: string; subcategory: string
  }

  if (!body.title?.trim() || !body.content?.trim() || !body.domain || !body.subcategory) {
    return { code: 400, message: '请填写完整信息', data: null }
  }

  const db = getDb()
  const slug = nanoid(8) + '-' + Date.now().toString(36)
  const result = db.prepare(`
    INSERT INTO notes (slug, title, content, domain, subcategory, author_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(slug, body.title.trim(), body.content, body.domain, body.subcategory, auth.userId)

  return { code: 200, message: '笔记已保存 📝', data: { id: result.lastInsertRowid, slug } }
})
