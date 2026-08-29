import jwt from 'jsonwebtoken'

export function signToken(payload: { userId: number; username: string; role?: string }): string {
  const config = useRuntimeConfig()
  return jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' })
}

export function verifyToken(token: string): any | null {
  try {
    const config = useRuntimeConfig()
    return jwt.verify(token, config.jwtSecret)
  } catch {
    return null
  }
}

export function getAuthUser(event: any): { userId: number; username: string; role: string } | null {
  const auth = getHeader(event, 'Authorization') as string | undefined
  if (!auth?.startsWith('Bearer ')) return null
  const token = auth.slice(7)
  return verifyToken(token)
}
