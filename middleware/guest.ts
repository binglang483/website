// 访客检查中间件 - 已登录用户访问登录/注册页时跳转首页
export default defineNuxtRouteMiddleware(() => {
  if (import.meta.server) return
  const userStore = useUserStore()
  if (userStore.isLoggedIn) {
    return navigateTo('/')
  }
})
