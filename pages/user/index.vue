<template>
  <div>
    <!-- ========== 个人信息卡 ========== -->
    <div class="card p-6 mb-5 relative overflow-hidden">
      <div class="absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-20"
           style="background:linear-gradient(135deg,#f472b6,#a855f7)"></div>
      <div class="relative flex items-start gap-4">
        <!-- 头像 -->
        <div class="w-16 h-16 rounded-xl bg-gradient-to-br from-sakura-400 to-purple-500 text-white flex items-center justify-center text-2xl font-bold flex-shrink-0">
          {{ (userStore.user?.nickname || userStore.user?.username || '?')[0] }}
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap mb-1">
            <h1 class="text-xl font-bold text-gray-900">{{ userStore.user?.nickname || userStore.user?.username }}</h1>
            <span v-if="userStore.isAdmin" class="text-[10px] px-2 py-0.5 rounded text-white" style="background:#dd3333">管理员</span>
          </div>
          <p class="text-xs text-gray-400 mb-1">@{{ userStore.user?.username }}</p>
          <p class="text-sm text-gray-500">{{ userStore.user?.bio || '还没填写个人简介~' }}</p>
        </div>
      </div>
    </div>

    <!-- ========== 快捷入口 ========== -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
      <NuxtLink to="/notes/new" class="card p-4 text-center hover:shadow-card transition group">
        <div class="text-2xl mb-1">✍️</div>
        <div class="text-sm font-medium text-gray-700 group-hover:text-[#dd3333]">写笔记</div>
      </NuxtLink>
      <NuxtLink to="/notes" class="card p-4 text-center hover:shadow-card transition group">
        <div class="text-2xl mb-1">📓</div>
        <div class="text-sm font-medium text-gray-700 group-hover:text-[#dd3333]">我的笔记</div>
      </NuxtLink>
      <NuxtLink to="/docs" class="card p-4 text-center hover:shadow-card transition group">
        <div class="text-2xl mb-1">📖</div>
        <div class="text-sm font-medium text-gray-700 group-hover:text-[#dd3333]">浏览文档</div>
      </NuxtLink>
      <button @click="logout" class="card p-4 text-center hover:shadow-card transition group">
        <div class="text-2xl mb-1">🚪</div>
        <div class="text-sm font-medium text-gray-700 group-hover:text-red-500">退出登录</div>
      </button>
    </div>

    <!-- ========== 我的笔记 ========== -->
    <div class="card p-5">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-base font-bold text-gray-800 flex items-center gap-2">
          <span class="w-1 h-4 rounded-full" style="background:#dd3333"></span>
          最近笔记
        </h2>
        <NuxtLink to="/notes" class="text-xs text-gray-400 hover:text-[#dd3333]">查看全部 →</NuxtLink>
      </div>

      <div v-if="loading" class="text-center text-gray-400 text-sm py-6">加载中...</div>

      <div v-else-if="notes.length" class="space-y-2">
        <NuxtLink
          v-for="n in notes.slice(0, 5)"
          :key="n.id"
          :to="`/notes/${n.slug}`"
          class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition"
        >
          <div class="w-8 h-8 rounded flex items-center justify-center text-sm flex-shrink-0" :style="{background: getBgColor(n.domain)}">
            {{ getIcon(n.domain) }}
          </div>
          <div class="flex-1 min-w-0">
            <h4 class="text-sm text-gray-800 truncate">{{ n.title }}</h4>
            <p class="text-xs text-gray-400">{{ formatDate(n.created_at) }}</p>
          </div>
        </NuxtLink>
      </div>

      <div v-else class="text-center text-gray-400 text-sm py-6">
        <p class="text-3xl mb-2">📭</p>
        <p>还没有笔记</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const userStore = useUserStore()
const { getIcon, getBgColor } = useDomains()
const toast = useToast()
const notes = ref<any[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await useApi<any>('/api/notes?page=1&size=30')
    if (res.code === 200) {
      // 只显示自己的笔记
      const myId = userStore.user?.id
      notes.value = (res.data.list || []).filter((n: any) => n.author_id === myId)
    }
  } finally {
    loading.value = false
  }
})

function logout() {
  userStore.logout()
  toast.success('已退出登录')
}

function formatDate(d: string) { return d?.replace('T', ' ').slice(0, 16) || '' }
</script>
