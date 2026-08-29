/**
 * 请求日志中间件
 * 输出 method / path / status / duration(ms) / ip
 */
import { defineEventHandler, getMethod, getRequestHeader, getRequestURL } from 'h3'

export default defineEventHandler((event) => {
  const start = Date.now()
  const url = getRequestURL(event)

  if (url.pathname.startsWith('/__nuxt') || url.pathname.startsWith('/favicon')
      || url.pathname.endsWith('.map') || url.pathname.includes('@vite/client')) {
    return
  }

  event.node.res.once('finish', () => {
    const duration = Date.now() - start
    const status = event.node.res.statusCode
    const method = getMethod(event)
    const color = status >= 500 ? '\x1b[31m' : status >= 400 ? '\x1b[33m' : '\x1b[32m'
    const reset = '\x1b[0m'
    const dim = '\x1b[2m'
    const ip = getRequestHeader(event, 'x-forwarded-for')?.split(',')[0]
      || event.node.req.socket?.remoteAddress || '-'

    console.log(
      `${dim}[req]${reset} ${color}${status}${reset} ${dim}${method}${reset} ${url.pathname} ${dim}${duration}ms${reset} ${dim}ip:${ip}${reset}`
    )
  })
})
