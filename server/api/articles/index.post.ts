import { nanoid } from 'nanoid'
import { getDb } from '~/server/utils/db'
import { getAuthUser } from '~/server/utils/jwt'

export default defineEventHandler(async (event) => {
  const auth = getAuthUser(event)
  if (!auth) {
    return { code: 401, message: '请先登录', data: null }
  }

  const body = await readBody(event) as { title: string; content: string; category?: string; visibility?: string }

  if (!body.title?.trim() || !body.content?.trim()) {
    return { code: 400, message: '标题和内容不能为空', data: null }
  }

  const db = getDb()
  const slug = nanoid(8) + '-' + Date.now().toString(36)
  const excerpt = body.content.replace(/[#*`>\-_]/g, '').slice(0, 200)

  const result = db.prepare(`
    INSERT INTO articles (slug, title, content, excerpt, author_id, category, visibility)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(slug, body.title.trim(), body.content, excerpt, auth.userId, body.category || null, body.visibility || 'public')

  return {
    code: 200,
    message: '发布成功 ✨',
    data: { id: result.lastInsertRowid, slug }
  }
})
