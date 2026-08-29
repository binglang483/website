<template>
  <div class="flex items-center justify-center min-h-[60vh]">
    <div class="w-full max-w-md">
      <div class="card p-8">
        <div class="text-center mb-6">
          <div class="text-3xl mb-2">✨</div>
          <h1 class="text-xl font-bold gradient-text">学びの庭へ参加</h1>
          <p class="text-sm text-gray-500 mt-1">开启你的知识记录之旅</p>
        </div>

        <form @submit.prevent="doRegister" class="space-y-4">
          <div>
            <label class="block text-sm text-gray-600 mb-1">👤 用户名</label>
            <input v-model="form.username" type="text" class="input" placeholder="2-20 个字符" />
          </div>
          <div>
            <label class="block text-sm text-gray-600 mb-1">🪪 昵称（可选）</label>
            <input v-model="form.nickname" type="text" class="input" placeholder="显示给别人看的名字" />
          </div>
          <div>
            <label class="block text-sm text-gray-600 mb-1">📧 邮箱（可选）</label>
            <input v-model="form.email" type="email" class="input" placeholder="example@email.com" />
          </div>
          <div>
            <label class="block text-sm text-gray-600 mb-1">🔑 密码</label>
            <div class="relative">
              <input v-model="form.password" :type="showPassword ? 'text' : 'password'" class="input pr-10" placeholder="至少 6 位" />
              <button type="button" @click="showPassword = !showPassword" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#dd3333] text-base select-none" :title="showPassword ? '隐藏密码' : '显示密码'">
                {{ showPassword ? '🙈' : '👁️' }}
              </button>
            </div>
          </div>

          <div v-if="error" class="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100">
            {{ error }}
          </div>

          <button type="submit" :disabled="submitting" class="btn-primary w-full py-2.5 disabled:opacity-50">
            {{ submitting ? '注册中...' : '🌸 创建账号' }}
          </button>
        </form>

        <div class="mt-6 text-center text-sm text-gray-500">
          已有账号？<NuxtLink to="/login" class="text-[#dd3333] hover:underline font-medium">去登录</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'guest' })

const userStore = useUserStore()
const route = useRoute()
const form = reactive({ username: '', nickname: '', email: '', password: '' })
const submitting = ref(false)
const error = ref('')
const showPassword = ref(false)

async function doRegister() {
  if (!form.username.trim() || !form.password.trim()) {
    error.value = '请填写用户名和密码'
    return
  }
  if (form.username.length < 2) { error.value = '用户名至少 2 位'; return }
  if (form.password.length < 6) { error.value = '密码至少 6 位'; return }

  submitting.value = true
  error.value = ''
  try {
    const res = await useApi<any>('/api/auth/register', {
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
