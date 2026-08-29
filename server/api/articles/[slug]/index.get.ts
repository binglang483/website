import { getDb } from '~/server/utils/db'
import { getAuthUser } from '~/server/utils/jwt'
import { getParam } from '~/server/utils/params'

export default defineEventHandler(async (event) => {
  const slug = getParam(event, 'slug', /\/api\/articles\/([^/?]+)/)
  if (!slug) {
    return { code: 400, message: '缺少参数', data: null }
  }

  const db = getDb()
  const article = db.prepare(`
    SELECT a.*, u.username as author_name, u.nickname as author_nick, u.avatar as author_avatar
    FROM articles a
    LEFT JOIN users u ON a.author_id = u.id
    WHERE a.slug = ?
  `).get(slug) as any

  if (!article || article.status !== 1) {
    return { code: 404, message: '文章不存在', data: null }
  }

  // 可见性检查
  const auth = getAuthUser(event)
  if (article.visibility === 'private') {
    if (!auth || auth.userId !== article.author_id) {
      return { code: 403, message: '仅限作者可见', data: null }
    }
  }

  // 增加浏览量
  db.prepare('UPDATE articles SET view_count = view_count + 1 WHERE id = ?').run(article.id)

  return { code: 200, message: 'ok', data: article }
})
