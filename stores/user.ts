/**
 * 用户状态管理 (Pinia Setup Store 风格)
 * 相比 Options API 风格，Setup Store 更接近 Vue 3 Composition API，支持 computed 链式调用
 */
import { defineStore } from 'pinia'

export interface User {
  id: number
  username: string
  nickname: string
  avatar: string | null
  bio: string | null
  role: string
}

export const useUserStore = defineStore('user', () => {
  // ========== State ==========
  const user = ref<User | null>(null)
  const token = ref('')

  // ========== Getters ==========
  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  // ========== Actions ==========

  /** 从 localStorage 恢复登录状态（仅客户端） */
  function init() {
    if (import.meta.server) return
    try {
      const savedToken = localStorage.getItem('token') || ''
      const savedUserStr = localStorage.getItem('user')
      if (savedToken) token.value = savedToken
      if (savedUserStr) user.value = JSON.parse(savedUserStr)
    } catch {
      // localStorage 不可用时静默跳过
    }
  }

  /** 保存登录信息 */
  function setLogin(newToken: string, newUser: User) {
    token.value = newToken
    user.value = newUser
    try {
      localStorage.setItem('token', newToken)
      localStorage.setItem('user', JSON.stringify(newUser))
    } catch {
      // ignore
    }
  }

  /** 更新本地用户信息 */
  function updateUser(patch: Partial<User>) {
    if (!user.value) return
    user.value = { ...user.value, ...patch }
    try {
      localStorage.setItem('user', JSON.stringify(user.value))
    } catch {
      // ignore
    }
  }

  /** 退出登录 */
  function logout() {
    token.value = ''
    user.value = null
    try {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    } catch {
      // ignore
    }
    // 使用 navigateTo 跳转到首页（Nuxt 自动导入）
    if (import.meta.client) {
      navigateTo('/')
    }
  }

  return {
    // State
    user,
    token,
    // Getters
    isLoggedIn,
    isAdmin,
    // Actions
    init,
    setLogin,
    updateUser,
    logout,
  }
})
