import { defineEventHandler, getMethod, getRequestHeader, getRequestURL, setResponseStatus } from 'h3'

/**
 * 轻量速率限制中间件（内存滑动窗口）
 * 按 IP + endpoint 限流，适合单机场景
 */
interface RateBucket { count: number; resetAt: number }
interface RateRule {
  path: string
  window: number
  max: number
}

const buckets = new Map<string, RateBucket>()

setInterval(() => {
  const now = Date.now()
  for (const [k, v] of buckets) if (v.resetAt < now) buckets.delete(k)
}, 60_000).unref?.()

const rules: RateRule[] = [
  { path: '/api/auth/login',    window: 60_000, max: 10 },
  { path: '/api/auth/register', window: 300_000, max: 3 },
  { path: '/api/comments',      window: 60_000, max: 15 },
]

export default defineEventHandler((event) => {
  const url = getRequestURL(event)
  const path = url.pathname
  const method = getMethod(event)

  if (method === 'GET') return

  const rule = rules.find(r => path.startsWith(r.path))
  if (!rule) return

  const ip = getRequestHeader(event, 'x-forwarded-for')?.split(',')[0].trim()
    || getRequestHeader(event, 'x-real-ip')
    || event.node.req.socket?.remoteAddress
    || 'unknown'

  const key = `${ip}:${path}`
  const now = Date.now()
  const bucket = buckets.get(key)

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + rule.window })
    return
  }

  bucket.count++
  if (bucket.count > rule.max) {
    setResponseStatus(event, 429)
    const retry = Math.ceil((bucket.resetAt - now) / 1000)
    return {
      code: 429,
      message: `请求过于频繁，请 ${retry} 秒后再试`,
      data: null,
    }
  }
})
