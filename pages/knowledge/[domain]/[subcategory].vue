<template>
  <div>
    <NuxtLink :to="`/knowledge/${encodeURIComponent(domain)}`" class="text-sm text-sakura-600 hover:underline mb-4 inline-block">← 返回 {{ domain }}</NuxtLink>

    <div class="card p-6 mb-6 bg-gradient-to-r from-sakura-50 to-purple-50">
      <div class="flex items-center gap-3">
        <span class="text-3xl">📂</span>
        <div>
          <h1 class="text-xl font-bold">{{ domain }} / {{ subcategory }}</h1>
          <p class="text-sm text-gray-500 mt-1">笔记列表 ({{ notes.length }})</p>
        </div>
      </div>
    </div>

    <NuxtLink v-if="userStore.isLoggedIn" to="/notes/new" class="btn-primary mb-4">➕ 新建笔记</NuxtLink>

    <div v-if="loading" class="card p-8 text-center text-gray-400">加载中... 🌸</div>

    <div v-else-if="notes.length" class="grid gap-3">
      <NuxtLink
        v-for="n in notes"
        :key="n.id"
        :to="`/notes/${n.slug}`"
        class="card-hover p-5 block"
      >
        <div class="flex items-start gap-3">
          <span class="text-2xl flex-shrink-0">📄</span>
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-gray-800 mb-1">{{ n.title }}</h3>
            <div class="flex items-center gap-2 text-xs text-gray-500">
              <span>👤 {{ n.author_nick || n.author_name }}</span>
              <span>📅 {{ formatDate(n.created_at) }}</span>
            </div>
          </div>
        </div>
      </NuxtLink>
    </div>

    <div v-else class="card p-10 text-center text-gray-400">
      <p class="text-5xl mb-3">📭</p>
      <p>这个子分类下还没有笔记</p>
      <NuxtLink v-if="userStore.isLoggedIn" to="/notes/new" class="btn-primary mt-4">创建第一篇笔记</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const userStore = useUserStore()
const domain = decodeURIComponent(route.params.domain as string)
const subcategory = decodeURIComponent(route.params.subcategory as string)

const notes = ref<any[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await useApi<any>(`/api/notes?domain=${encodeURIComponent(domain)}&subcategory=${encodeURIComponent(subcategory)}&size=50`)
    if (res.code === 200) notes.value = res.data.list
  } finally {
    loading.value = false
  }
})

function formatDate(d: string) { return d?.replace('T', ' ').slice(0, 16) || '' }
</script>
