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

    <div class="flex gap-5">
      <!-- ========== 左栏：领域 + 文件夹 ========== -->
      <aside class="w-56 flex-shrink-0 space-y-3">
        <!-- 领域切换 -->
        <div class="card p-3">
          <div class="text-xs font-bold text-gray-600 mb-2 px-1 flex items-center gap-1">
            <span>🎓</span> 知识领域
          </div>
          <div class="space-y-1">
            <button
              v-for="d in domainList"
              :key="d.name"
              @click="activeDomain = d.name; activeFolder = ''"
              :class="`w-full text-left text-xs px-2 py-1.5 rounded-md flex items-center gap-2 transition ${
                activeDomain === d.name ? 'bg-red-50 text-[#dd3333] font-medium' : 'text-gray-600 hover:bg-gray-50'
              }`"
            >
              <span>{{ d.icon }}</span>
              <span>{{ d.name }}</span>
            </button>
          </div>
        </div>

        <!-- 文件夹管理 -->
        <CategoryManager
          v-if="activeDomain"
          :domain="activeDomain"
          :selected-folder="activeFolder"
          :uncategorized-count="uncategorizedCount"
          show-actions
          @select="activeFolder = $event; loadNotes()"
          @change="loadNotes"
        />
      </aside>

      <!-- ========== 右栏：笔记列表 ========== -->
      <main class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-4">
          <span class="text-lg">{{ getIcon(activeDomain) }}</span>
          <span class="text-sm font-medium text-gray-700">{{ activeDomain }}</span>
          <span v-if="activeFolder && activeFolder !== '__uncategorized__'" class="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
            / {{ activeFolder }}
          </span>
          <span v-else-if="activeFolder === '__uncategorized__'" class="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
            / 未分类
          </span>
          <span class="text-xs text-gray-400 ml-auto">共 {{ notes.length }} 条</span>
        </div>

        <!-- 加载中 -->
        <div v-if="loading" class="card p-8 text-center text-gray-400 text-sm">加载中...</div>

        <!-- 有笔记：列表视图 -->
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
                  {{ n.author_nick || n.author_name || '匿名' }}
                  <span class="mx-1">·</span>
                  {{ formatDate(n.created_at) }}
                </div>
              </div>
            </div>
          </NuxtLink>
        </div>

        <!-- 空状态：铺满引导 -->
        <div v-else class="card p-10 text-center">
          <div class="text-6xl mb-4">🗒️</div>
          <h3 class="text-xl font-semibold text-gray-700 mb-2">开始记点什么吧</h3>
          <p class="text-sm text-gray-500 mb-6 max-w-md mx-auto">
            在 <span class="text-[#dd3333] font-medium">{{ activeDomain }}</span> 领域下还没有笔记。
            写一段 Markdown，记录你的学习心得、技术笔记或灵感备忘 ✨
          </p>
          <div v-if="userStore.isLoggedIn" class="flex items-center justify-center gap-3">
            <NuxtLink to="/notes/new" class="btn-primary text-base px-6 py-2.5">
              ✍️ 写第一篇笔记
            </NuxtLink>
          </div>
          <div class="mt-6 pt-6 border-t border-gray-100">
            <p class="text-xs text-gray-400 mb-2">💡 写笔记小贴士</p>
            <div class="flex flex-wrap justify-center gap-2 text-xs text-gray-500">
              <span class="px-2 py-1 bg-gray-50 rounded">支持 Markdown</span>
              <span class="px-2 py-1 bg-gray-50 rounded">边写边预览</span>
              <span class="px-2 py-1 bg-gray-50 rounded">自定义文件夹</span>
              <span class="px-2 py-1 bg-gray-50 rounded">跨设备同步</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import CategoryManager from '~/components/CategoryManager.vue'

const userStore = useUserStore()
const { domainList, getIcon, getBgColor } = useDomains()
const notes = ref<any[]>([])
const loading = ref(true)
const activeDomain = ref('安全')
const activeFolder = ref('')

const uncategorizedCount = computed(() => {
  return notes.value.filter(n => !n.subcategory).length
})

async function loadNotes() {
  loading.value = true
  try {
    const params = new URLSearchParams({ page: '1', size: '50', domain: activeDomain.value })
    const res = await useApi<any>(`/api/notes?${params.toString()}`)
    let list = res.data?.list || []
    if (activeFolder.value === '__uncategorized__') {
      list = list.filter((n: any) => !n.subcategory)
    } else if (activeFolder.value) {
      list = list.filter((n: any) => n.subcategory === activeFolder.value)
    }
    notes.value = list
  } finally {
    loading.value = false
  }
}

onMounted(loadNotes)
watch(activeDomain, () => { activeFolder.value = ''; loadNotes() })
watch(activeFolder, loadNotes)

function formatDate(d: string) { return d?.replace('T', ' ').slice(0, 16) || '' }
</script>
