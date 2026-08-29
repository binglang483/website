<template>
  <div class="space-y-6">
    <!-- 用户信息卡片 -->
    <div class="card p-6">
      <div class="flex items-center gap-4">
        <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-sakura-400 to-anime-purple text-white flex items-center justify-center text-2xl font-bold">
          {{ userStore.user?.nickname?.[0] || userStore.user?.username?.[0] || 'U' }}
        </div>
        <div>
          <h1 class="text-xl font-bold">{{ userStore.user?.nickname || userStore.user?.username }}</h1>
          <p class="text-sm text-gray-500 mt-0.5">@{{ userStore.user?.username }} <span v-if="userStore.isAdmin" class="tag-anime ml-1">管理员</span></p>
          <p class="text-xs text-gray-400 mt-1">{{ userStore.user?.bio || '这个用户很神秘，什么都没有留下~' }}</p>
        </div>
      </div>
    </div>

    <!-- Tab 切换 -->
    <div class="flex gap-2 border-b border-sakura-100">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        @click="currentTab = tab.key"
        :class="`px-4 py-2 text-sm font-medium border-b-2 transition -mb-px ${currentTab === tab.key ? 'border-sakura-500 text-sakura-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`"
      >{{ tab.label }}</button>
    </div>

    <!-- 内容区 -->
    <div v-if="currentTab === 'articles'">
      <div v-if="articles.length" class="space-y-3">
        <NuxtLink
          v-for="a in articles"
          :key="a.id"
          :to="`/blog/${a.slug}`"
          class="card-hover p-4 flex items-center justify-between"
        >
          <div class="flex-1 min-w-0">
            <h4 class="font-medium text-gray-800">{{ a.title }}</h4>
            <p class="text-xs text-gray-500 mt-1">📅 {{ formatDate(a.created_at) }} · 👁️ {{ a.view_count }} · 💬 {{ a.comment_count }}</p>
          </div>
          <span v-if="a.status === 0" class="tag bg-gray-100 text-gray-500">已删除</span>
        </NuxtLink>
      </div>
      <p v-else class="card p-10 text-center text-gray-400">还没有写过文章</p>
    </div>

    <div v-else-if="currentTab === 'notes'">
      <div v-if="notes.length" class="space-y-3">
        <NuxtLink
          v-for="n in notes"
          :key="n.id"
          :to="`/notes/${n.slug}`"
          class="card-hover p-4"
        >
          <h4 class="font-medium text-gray-800">{{ n.title }}</h4>
          <p class="text-xs text-gray-500 mt-1">
            <span class="tag-sakura mr-1">{{ n.domain }}</span>
            <span class="tag-anime mr-1">{{ n.subcategory }}</span>
            📅 {{ formatDate(n.created_at) }}
          </p>
        </NuxtLink>
      </div>
      <p v-else class="card p-10 text-center text-gray-400">还没有写过笔记</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const tabs = [
  { key: 'articles', label: '📝 我的文章' },
  { key: 'notes', label: '📚 我的笔记' },
]
const currentTab = ref('articles')

const articles = ref<any[]>([])
const notes = ref<any[]>([])

onMounted(async () => {
  try {
    // 暂时复用列表接口，未来可以加 /api/user/mine
    const [ar, nr] = await Promise.all([
      useApi<any>('/api/articles?size=100'),
      useApi<any>('/api/notes?size=100')
    ])
    if (ar.code === 200) articles.value = ar.data.list.filter((a: any) => a.author_id === userStore.user?.id)
    if (nr.code === 200) notes.value = nr.data.list.filter((n: any) => n.author_id === userStore.user?.id)
  } catch {}
})

function formatDate(d: string) { return d?.replace('T', ' ').slice(0, 16) || '' }
</script>
