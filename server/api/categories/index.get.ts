import { getDb } from '~/server/utils/db'

// 获取所有分类（12大领域 + 子分类）
export default defineEventHandler(async () => {
  const db = getDb()
  const categories = db.prepare('SELECT * FROM categories ORDER BY domain, sort_order').all() as any[]

  const grouped: Record<string, any[]> = {}
  for (const c of categories) {
    if (!grouped[c.domain]) grouped[c.domain] = []
    grouped[c.domain].push({ name: c.name, icon: c.icon, id: c.id })
  }

  return { code: 200, message: 'ok', data: grouped }
})
