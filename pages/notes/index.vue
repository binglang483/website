<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold flex items-center gap-2 text-gray-800">
          <span>📓</span> 学习笔记
        </h1>
        <p class="text-sm text-gray-500 mt-1">快速记录 · 随手标记 · 灵感备忘</p>
      </div>
      <NuxtLink v-if="userStore.isLoggedIn" to="/notes/new" class="btn-primary">✍️ 写笔记</NuxtLink>
    </div>

    <!-- 领域筛选 -->
    <div class="card p-3 mb-6">
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="cat in categories"
          :key="cat"
          @click="currentCat = cat; loadNotes()"
          :class="`px-3 py-1.5 rounded text-sm transition ${currentCat === cat ? 'text-white' : 'text-gray-600 hover:bg-gray-100'}`"
          :style="currentCat === cat ? {background:'#dd3333'} : {}"
        >
          {{ cat === '' ? '全部' : getIcon(cat) + ' ' + cat }}
        </button>
      </div>
    </div>

    <!-- 笔记列表 -->
    <div v-if="loading" class="card p-8 text-center text-gray-400 text-sm">加载中...</div>

    <div v-else-if="notes.length" class="space-y-3">
      <NuxtLink
        v-for="n in notes"
        :key="n.id"
        :to="`/notes/${n.slug}`"
        class="card card-hover p-4 block"
      >
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0" :style="{background: getBgColor(n.domain)}">
            {{ getIcon(n.domain) }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1 flex-wrap">
              <span v-if="n.domain" class="text-xs px-1.5 py-0.5 rounded" style="background:#fff1f1;color:#dd3333">{{ n.domain }}</span>
              <span v-if="n.subcategory" class="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">{{ n.subcategory }}</span>
            </div>
            <h3 class="font-medium text-gray-800 group-hover:text-[#dd3333] line-clamp-1 mb-1">{{ n.title }}</h3>
            <div class="text-xs text-gray-400">
              👤 {{ n.author_nick || n.author_name || '匿名' }}
              <span class="mx-1">·</span>
              {{ formatDate(n.created_at) }}
            </div>
          </div>
        </div>
      </NuxtLink>
    </div>

    <div v-else class="card p-12 text-center text-gray-400 text-sm">
      <p class="text-4xl mb-3">📭</p>
      <p class="mb-4">还没有笔记呢~</p>
      <NuxtLink v-if="userStore.isLoggedIn" to="/notes/new" class="btn-primary">写第一篇笔记</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const userStore = useUserStore()
const { domainNames, getIcon, getBgColor } = useDomains()
const notes = ref<any[]>([])
const loading = ref(true)
const currentCat = ref('')
// 筛选列表加个「全部」前缀
const categories = ['', ...domainNames]

async function loadNotes() {
  loading.value = true
  try {
    const url = currentCat.value ? `/api/notes?page=1&size=30&domain=${encodeURIComponent(currentCat.value)}` : '/api/notes?page=1&size=30'
    const res = await useApi<any>(url)
    if (res.code === 200) notes.value = res.data.list
  } finally {
    loading.value = false
  }
}

onMounted(loadNotes)

function formatDate(d: string) { return d?.replace('T', ' ').slice(0, 16) || '' }
// 使用 useDomains 提供的函数，不再重复定义
</script>
