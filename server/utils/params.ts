// Nitro 路由参数获取工具
// getRouterParam 在某些场景下可能返回 undefined，用正则 fallback
export function getParam(event: any, name: string, pathPattern?: RegExp): string | undefined {
  // 先尝试标准方式
  let val: string | undefined
  try {
    val = getRouterParam(event, name)
  } catch {}
  if (val) return val

  // 再尝试 context.params
  val = (event?.context as any)?.params?.[name]
  if (val) return val

  // 最后尝试从 URL 路径正则提取
  if (pathPattern) {
    const path = event?.path || ''
    const match = path.match(pathPattern)
    if (match) return match[1]
  }

  // 默认：尝试在路径中找最后一段
  const path = event?.path || ''
  const segments = path.split('/').filter(Boolean)
  if (segments.length > 0) {
    const last = segments[segments.length - 1]
    // 如果最后一段不是已知的固定路径段，就当作参数返回
    const knownSegments = ['api', 'auth', 'articles', 'comments', 'categories', 'notes', 'user', 'me', 'list', 'create']
    if (!knownSegments.includes(last)) return last
  }

  return undefined
}
