import bcrypt from 'bcryptjs'
import { getDb } from '~/server/utils/db'
import { signToken } from '~/server/utils/jwt'

export default defineEventHandler(async (event) => {
  const body = await readBody(event) as { username: string; password: string; email?: string; nickname?: string }

  if (!body.username?.trim() || !body.password?.trim()) {
    return { code: 400, message: '用户名和密码不能为空', data: null }
  }
  if (body.username.length < 2 || body.password.length < 6) {
    return { code: 400, message: '用户名至少2位，密码至少6位', data: null }
  }

  const db = getDb()
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(body.username) as any
  if (existing) {
    return { code: 400, message: '用户名已被占用', data: null }
  }

  const hash = bcrypt.hashSync(body.password, 10)
  const result = db.prepare(`
    INSERT INTO users (username, password, email, nickname, role)
    VALUES (?, ?, ?, ?, 'user')
  `).run(body.username, hash, body.email || null, body.nickname || body.username)

  const token = signToken({ userId: result.lastInsertRowid as number, username: body.username })

  return {
    code: 200,
    message: '注册成功 🌸',
    data: {
      token,
      user: {
        id: result.lastInsertRowid,
        username: body.username,
        nickname: body.nickname || body.username,
        avatar: null,
        role: 'user'
      }
    }
  }
})
