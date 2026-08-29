import { getDb } from '~/server/utils/db'

export default defineEventHandler(async () => {
  const db = getDb()

  const stats = {
    users: (db.prepare('SELECT COUNT(*) as c FROM users WHERE status = 1').get() as any).c,
    articles: (db.prepare('SELECT COUNT(*) as c FROM articles WHERE status = 1').get() as any).c,
    notes: (db.prepare('SELECT COUNT(*) as c FROM notes WHERE status = 1').get() as any).c,
    comments: (db.prepare('SELECT COUNT(*) as c FROM comments WHERE status = 1').get() as any).c,
    todayArticles: (db.prepare("SELECT COUNT(*) as c FROM articles WHERE status = 1 AND date(created_at) = date('now','localtime')").get() as any).c,
    todayComments: (db.prepare("SELECT COUNT(*) as c FROM comments WHERE status = 1 AND date(created_at) = date('now','localtime')").get() as any).c,
  }

  const recentArticles = db.prepare(`
    SELECT a.id, a.slug, a.title, a.created_at, u.nickname as author
    FROM articles a LEFT JOIN users u ON a.author_id = u.id
    WHERE a.status = 1 ORDER BY a.created_at DESC LIMIT 5
  `).all()

  const hotArticles = db.prepare(`
    SELECT a.id, a.slug, a.title, a.view_count, a.comment_count
    FROM articles a WHERE a.status = 1 AND a.visibility = 'public'
    ORDER BY a.view_count DESC, a.comment_count DESC LIMIT 5
  `).all()

  const topContributors = db.prepare(`
    SELECT u.id, u.username, u.nickname, u.avatar, COUNT(a.id) as article_count
    FROM users u LEFT JOIN articles a ON a.author_id = u.id AND a.status = 1
    WHERE u.status = 1
    GROUP BY u.id ORDER BY article_count DESC LIMIT 5
  `).all()

  return { code: 200, message: 'ok', data: { stats, recentArticles, hotArticles, topContributors } }
})
