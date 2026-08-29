import bcrypt from 'bcryptjs'
import { getDb } from '~/server/utils/db'
import { signToken } from '~/server/utils/jwt'

export default defineEventHandler(async (event) => {
  const body = await readBody(event) as { username: string; password: string }

  if (!body.username?.trim() || !body.password?.trim()) {
    return { code: 400, message: '请输入用户名和密码', data: null }
  }

  const db = getDb()
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(body.username) as any

  if (!user || !bcrypt.compareSync(body.password, user.password)) {
    return { code: 401, message: '用户名或密码错误', data: null }
  }

  if (user.status !== 1) {
    return { code: 403, message: '账号已被禁用', data: null }
  }

  const token = signToken({ userId: user.id, username: user.username, role: user.role })

  return {
    code: 200,
    message: '登录成功 ✨',
    data: {
      token,
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        avatar: user.avatar,
        bio: user.bio,
        role: user.role
      }
    }
  }
})
