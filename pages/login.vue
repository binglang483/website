<template>
  <div class="flex items-center justify-center min-h-[60vh]">
    <div class="w-full max-w-md">
      <div class="card p-8">
        <div class="text-center mb-6">
          <div class="text-3xl mb-2 animate-float">🌸</div>
          <h1 class="text-xl font-bold text-gray-800">欢迎回来</h1>
          <p class="text-sm text-gray-500 mt-1">学びの庭へようこそ</p>
        </div>

        <form @submit.prevent="doLogin" class="space-y-4">
          <div>
            <label class="block text-sm text-gray-600 mb-1">👤 用户名</label>
            <input v-model="form.username" type="text" class="input" placeholder="输入用户名" autocomplete="username" />
          </div>
          <div>
            <label class="block text-sm text-gray-600 mb-1">🔑 密码</label>
            <div class="relative">
              <input v-model="form.password" :type="showPassword ? 'text' : 'password'" class="input pr-10" placeholder="输入密码" autocomplete="current-password" />
              <button type="button" @click="showPassword = !showPassword" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#dd3333] text-base select-none" :title="showPassword ? '隐藏密码' : '显示密码'">
                {{ showPassword ? '🙈' : '👁️' }}
              </button>
            </div>
          </div>

          <div v-if="error" class="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100">
            {{ error }}
          </div>

          <button type="submit" :disabled="submitting" class="w-full h-10 rounded-lg text-white text-sm font-medium disabled:opacity-50 transition" style="background:#dd3333" :hover="{}">
            {{ submitting ? '登录中...' : '✨ 登录' }}
          </button>
        </form>

        <div class="mt-5 text-center text-sm text-gray-500">
          还没有账号？<NuxtLink to="/register" class="text-[#dd3333] hover:underline font-medium">立即注册</NuxtLink>
        </div>

        <div class="mt-4 pt-4 border-t border-gray-100 text-center text-xs text-gray-400">
          💡 默认管理员: admin / admin123
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'guest' })

const userStore = useUserStore()
const route = useRoute()
const form = reactive({ username: '', password: '' })
const submitting = ref(false)
const error = ref('')
const showPassword = ref(false)

async function doLogin() {
  if (!form.username.trim() || !form.password.trim()) {
    error.value = '请填写完整信息'
    return
  }
  submitting.value = true
  error.value = ''
  try {
    const res = await useApi<any>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(form)
    })
    if (res.code === 200) {
      userStore.setLogin(res.data.token, res.data.user)
      const redirect = route.query.redirect as string
      navigateTo(redirect || '/')
    } else {
      error.value = res.message
    }
  } catch (e: any) {
    error.value = '网络错误，请重试'
  } finally {
    submitting.value = false
  }
}
</script>
