import { getDb } from '~/server/utils/db'
import { getAuthUser } from '~/server/utils/jwt'

export default defineEventHandler(async (event) => {
  const auth = getAuthUser(event)
  if (!auth) {
    return { code: 401, message: '未登录', data: null }
  }

  const db = getDb()
  const user = db.prepare('SELECT id, username, nickname, avatar, bio, role, email, created_at FROM users WHERE id = ?').get(auth.userId)

  return { code: 200, message: 'ok', data: user }
})
