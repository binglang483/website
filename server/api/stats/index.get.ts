import { getDb } from '~/server/utils/db'
import { ok } from '~/server/utils/response'

export default defineEventHandler(async () => {
  const db = getDb()

  const stats = {
    users: (db.prepare('SELECT COUNT(*) as c FROM users WHERE status = 1').get() as any).c,
    documents: (db.prepare('SELECT COUNT(*) as c FROM documents WHERE status = 1 AND visibility = ?').get('public') as any).c,
    notes: (db.prepare('SELECT COUNT(*) as c FROM notes WHERE status = 1').get() as any).c,
    total_views: (db.prepare('SELECT COALESCE(SUM(view_count),0) as c FROM documents WHERE status = 1').get() as any).c,
  }

  const hotDocs = db.prepare(`
    SELECT d.id, d.slug, d.title, d.view_count
    FROM documents d WHERE d.status = 1 AND d.visibility = 'public'
    ORDER BY d.view_count DESC LIMIT 5
  `).all()

  const topContributors = db.prepare(`
    SELECT u.id, u.username, u.nickname, u.avatar, COUNT(d.id) as doc_count
    FROM users u LEFT JOIN documents d ON d.author_id = u.id AND d.status = 1
    WHERE u.status = 1
    GROUP BY u.id ORDER BY doc_count DESC LIMIT 5
  `).all()

  return ok({ stats, hotDocs, topContributors })
})
