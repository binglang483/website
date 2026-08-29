import { getDb } from '~/server/utils/db'
import { getAuthUser } from '~/server/utils/jwt'
import { ok, unauthorized } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  const auth = getAuthUser(event)
  if (!auth) {
    return unauthorized('未登录')
  }

  const db = getDb()
  const user = db.prepare('SELECT id, username, nickname, avatar, bio, role, email, created_at FROM users WHERE id = ?').get(auth.userId)

  return ok(user)
})
