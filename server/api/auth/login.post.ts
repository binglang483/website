import bcrypt from 'bcryptjs'
import { getDb } from '~/server/utils/db'
import { signToken } from '~/server/utils/jwt'
import { badRequest, unauthorized, forbidden } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  const body = await readBody(event) as { username: string; password: string }

  if (!body.username?.trim() || !body.password?.trim()) {
    return badRequest('请输入用户名和密码')
  }

  const db = getDb()
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(body.username) as any

  if (!user || !bcrypt.compareSync(body.password, user.password)) {
    return unauthorized('用户名或密码错误')
  }

  if (user.status !== 1) {
    return forbidden('账号已被禁用')
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
