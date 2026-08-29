/**
 * GET /api/docs/[...path] — 从 DB 读取文档内容（带权限校验 + 作者信息 + 浏览计数）
 */
import { getDb } from '~/server/utils/db'
import { getAuthUser } from '~/server/utils/jwt'
import { getParam } from '~/server/utils/params'

function resolveSlug(encodedPath: string): string {
  const segments = encodedPath.split('/').filter(Boolean)
  const decoded = segments.map(s => decodeURIComponent(s))
  return decoded.join('/')
}

export default defineEventHandler(async (event) => {
  const db = getDb()
  const auth = getAuthUser(event)

  const encodedPath = getParam(event, 'path') || ''
  const slug = resolveSlug(encodedPath)

  if (!slug) {
    // 默认显示第一个公开文档
    const first = db.prepare("SELECT slug FROM documents WHERE status = 1 AND visibility = 'public' ORDER BY view_count DESC LIMIT 1").get() as any
    if (first) {
      return { code: 302, redirect: `/docs/${first.slug}` }
    }
    return { code: 404, message: '暂无文档' }
  }

  // 查文档
  const doc = db.prepare(`
    SELECT d.*, u.username as author_name, u.nickname as author_nick, u.avatar as author_avatar, u.bio as author_bio, u.role as author_role
    FROM documents d
    LEFT JOIN users u ON d.author_id = u.id
    WHERE d.slug = ? AND d.status = 1
  `).get(slug) as any

  if (!doc) return { code: 404, message: '文档不存在' }

  // 权限校验
  if (doc.visibility === 'private') {
    if (!auth) return { code: 401, message: '请先登录' }
    if (doc.author_id !== auth.userId && auth.role !== 'admin') {
      return { code: 403, message: '这是私密文档，无权限访问' }
    }
  }

  // 浏览计数（不重复算自己作者或管理员的？简单点每次都加）
  db.prepare('UPDATE documents SET view_count = view_count + 1 WHERE id = ?').run(doc.id)
  doc.view_count++

  // 作者信息
  doc.author = {
    id: doc.author_id,
    name: doc.author_nick || doc.author_name,
    username: doc.author_name,
    avatar: doc.author_avatar,
    bio: doc.author_bio,
    role: doc.author_role
  }

  // 判断当前用户能否编辑/改权限
  doc.canEdit = !!(auth && (auth.userId === doc.author_id || auth.role === 'admin'))

  // 清掉不应该暴露的字段
  delete doc.author_id
  delete doc.author_name
  delete doc.author_nick
  delete doc.author_avatar
  delete doc.author_bio
  delete doc.author_role

  return { code: 200, data: doc }
})
