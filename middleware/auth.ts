// 登录检查中间件 - SSR 安全
export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return // SSR 时跳过
  const userStore = useUserStore()
  if (!userStore.isLoggedIn) {
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }
})
