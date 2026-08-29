/**
 * GET /api/docs/tree — 从 DB 构建文件树（带作者名）
 */
import { getDb } from '~/server/utils/db'
import { getAuthUser } from '~/server/utils/jwt'

export default defineEventHandler((event) => {
  const db = getDb()
  const auth = getAuthUser(event)

  // 公开文档 + 自己的私有文档（如果登录）
  let where = "WHERE d.status = 1 AND (d.visibility = 'public'"
  const params: any[] = []
  if (auth) {
    where += ' OR d.author_id = ?'
    params.push(auth.userId)
  }
  where += ')'

  const rows = db.prepare(`
    SELECT d.id, d.slug, d.title, d.domain, d.subcategory, d.visibility,
           u.id as author_id, u.username as author_name, u.nickname as author_nick, u.avatar
    FROM documents d
    LEFT JOIN users u ON d.author_id = u.id
    ${where}
    ORDER BY d.domain, d.subcategory, d.title
  `).all(...params) as any[]

  // 按 domain 分组构建树
  const domainMap = new Map<string, any[]>()
  for (const r of rows) {
    const domain = r.domain
    if (!domainMap.has(domain)) domainMap.set(domain, [])
    domainMap.get(domain)!.push({
      type: 'file',
      title: r.title,
      slug: r.slug,
      path: r.slug,
      visibility: r.visibility,
      author: {
        id: r.author_id,
        name: r.author_nick || r.author_name,
        avatar: r.avatar
      }
    })
  }

  const tree: any[] = []
  // 预定义领域顺序（和首页一致）
  const order = ['安全', '开发', '设计', '理学', '工学', '医学', '交叉新兴', '外语', '经济学', '管理学', '职业技能', '通识']
  for (const domain of order) {
    if (domainMap.has(domain)) {
      tree.push({
        type: 'dir',
        name: domain,
        slug: domain,
        children: domainMap.get(domain)!
      })
    }
  }
  // 其他领域追加
  for (const [name, files] of domainMap) {
    if (!order.includes(name)) {
      tree.push({ type: 'dir', name, slug: name, children: files })
    }
  }

  return { code: 200, data: { tree, total: rows.length } }
})
