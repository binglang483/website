import { defineStore } from 'pinia'

interface User {
  id: number
  username: string
  nickname: string
  avatar: string | null
  bio: string | null
  role: string
}

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null as User | null,
    token: ''
  }),

  getters: {
    isLoggedIn: (s) => !!s.token,
    isAdmin: (s) => s.user?.role === 'admin',
  },

  actions: {
    init() {
      if (import.meta.server) return
      try {
        const token = localStorage.getItem('token') || ''
        const userStr = localStorage.getItem('user')
        if (token) this.token = token
        if (userStr) this.user = JSON.parse(userStr)
      } catch {}
    },

    setLogin(token: string, user: User) {
      this.token = token
      this.user = user
      try {
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
      } catch {}
    },

    logout() {
      this.token = ''
      this.user = null
      try {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      } catch {}
      navigateTo('/')
    }
  }
})
