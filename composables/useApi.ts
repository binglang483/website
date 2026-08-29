// 全局请求封装（SSR + CSR 双端可用）
// 注意：不能在普通函数内部调用 useUserStore() —— Pinia 只能在 setup/composable 顶层调用

export async function useApi<T = any>(url: string, options: RequestInit = {}): Promise<{ code: number; message: string; data: T }> {
  // CSR 时从 localStorage 读取 token（SSR 时 token 为空）
  let token = ''
  if (import.meta.client) {
    token = localStorage.getItem('token') || ''
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await $fetch<{ code: number; message: string; data: T }>(url, {
    ...options,
    headers,
  })

  return res
}
