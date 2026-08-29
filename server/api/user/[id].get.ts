/**
 * GET /api/user/[id] — 用户主页信息 + 他的公开文档
 */
import { getDb } from '~/server/utils/db'
import { getAuthUser } from '~/server/utils/jwt'
import { getParam } from '~/server/utils/params'

export default defineEventHandler((event) => {
  const db = getDb()
  const auth = getAuthUser(event)

  const idStr = getParam(event, 'id', /\/api\/user\/(\d+)/)
  const id = parseInt(idStr || '')
  if (!id) return { code: 400, message: '参数错误' }

  const user = db.prepare(`
    SELECT id, username, nickname, avatar, bio, role, created_at
    FROM users WHERE id = ? AND status = 1
  `).get(id) as any

  if (!user) return { code: 404, message: '用户不存在' }

  // 文档列表：默认只返回公开的；如果访问者是本人或 admin，包含私密
  let docWhere = "WHERE d.status = 1 AND d.author_id = ? AND d.visibility = 'public'"
  const params: any[] = [id]
  if (auth && (auth.userId === id || auth.role === 'admin')) {
    docWhere = 'WHERE d.status = 1 AND d.author_id = ?'
    params.pop()
    params.push(id)
  }

  const docs = db.prepare(`
    SELECT d.id, d.slug, d.title, d.domain, d.subcategory, d.visibility, d.view_count, d.created_at, d.updated_at
    FROM documents d
    ${docWhere}
    ORDER BY d.created_at DESC
    LIMIT 50
  `).all(...params) as any[]

  const stats = db.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN visibility = 'public' THEN 1 ELSE 0 END) as public_count,
      SUM(view_count) as total_views
    FROM documents WHERE author_id = ? AND status = 1
  `).get(id) as any

  return {
    code: 200,
    data: {
      user,
      docs,
      stats,
      isSelf: !!(auth && auth.userId === id),
      isAdmin: !!(auth && auth.role === 'admin')
    }
  }
})
