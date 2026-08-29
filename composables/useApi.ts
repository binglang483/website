/**
 * 全局请求封装（SSR + CSR 双端可用）
 * - CSR: 从 localStorage 读取 token
 * - SSR: 从 event 的 cookie 或 Authorization header 读取（如果请求被代理）
 *        纯 SSR 直连 API 时 token 为空是正常的（需要登录保护的页面用 middleware 阻止）
 *
 * 关于 SSR 鉴权:
 *   本项目的 useApi 只在 CSR 调用（middleware 已经在客户端拦截了未登录访问），
 *   SSR 渲染时不会有需要鉴权的请求。所以 SSR 下 token 为空是合理的。
 */

export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export async function useApi<T = any>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  // CSR: 从 localStorage 读取 token
  // SSR: 无 token（middleware 已在客户端拦截）
  let token = ''
  if (import.meta.client) {
    try {
      token = localStorage.getItem('token') || ''
    } catch {
      token = ''
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // 统一错误处理
  try {
    const res = await $fetch<ApiResponse<T>>(url, {
      ...options,
      headers,
    })
    return res
  } catch (e: any) {
    // 如果 $fetch 抛出的是标准的 HTTP 错误，尝试提取响应体
    if (e?.response?._data) {
      return e.response._data as ApiResponse<T>
    }
    // 网络错误等
    return {
      code: e?.response?.status || 500,
      message: e?.message || '网络请求失败',
      data: null as unknown as T,
    }
  }
}

/**
 * 便捷的 GET 请求
 */
export function useApiGet<T = any>(url: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
  let fullUrl = url
  if (params) {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '') as [string, string][]
    ).toString()
    if (qs) fullUrl += (url.includes('?') ? '&' : '?') + qs
  }
  return useApi<T>(fullUrl)
}

/**
 * 便捷的 POST 请求
 */
export function useApiPost<T = any>(url: string, body: any): Promise<ApiResponse<T>> {
  return useApi<T>(url, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
