<template>
  <div>
    <NuxtLink to="/" class="text-sm text-gray-500 hover:text-[#dd3333] mb-4 inline-block">← 返回首页</NuxtLink>

    <div v-if="loading" class="card p-12 text-center text-gray-400 text-sm">加载中...</div>

    <template v-else-if="user">
      <!-- ========== 用户头部 Banner ========== -->
      <div class="card p-6 mb-5 relative overflow-hidden">
        <div class="absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-20"
             :style="{ background: 'linear-gradient(135deg,#f472b6,#a855f7)' }"></div>
        <div class="relative flex items-start gap-4">
          <!-- 头像 -->
          <div class="w-16 h-16 rounded-xl bg-gradient-to-br from-sakura-400 to-purple-500 text-white flex items-center justify-center text-2xl font-bold flex-shrink-0">
            {{ (user.nickname || user.username || '?')[0] }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap mb-1">
              <h1 class="text-xl font-bold text-gray-900">{{ user.nickname || user.username }}</h1>
              <span v-if="user.role === 'admin'" class="text-[10px] px-2 py-0.5 rounded text-white" style="background:#dd3333">管理员</span>
              <span v-if="user.isSelf" class="text-[10px] px-2 py-0.5 rounded border border-gray-200 text-gray-500">我自己</span>
            </div>
            <p v-if="user.username" class="text-xs text-gray-400 mb-1">@{{ user.username }}</p>
            <p v-if="user.bio" class="text-sm text-gray-600 line-clamp-2">{{ user.bio }}</p>
            <p v-if="!user.bio" class="text-xs text-gray-400">这个人很神秘，什么也没留下~</p>
          </div>
        </div>

        <!-- 统计卡片 -->
        <div class="relative mt-5 grid grid-cols-3 gap-3">
          <div class="p-3 rounded-lg bg-gray-50 text-center">
            <div class="text-lg font-bold text-gray-900">{{ stats.total || 0 }}</div>
            <div class="text-xs text-gray-400 mt-0.5">文档总数</div>
          </div>
          <div class="p-3 rounded-lg bg-gray-50 text-center">
            <div class="text-lg font-bold text-[#dd3333]">{{ stats.public_count || 0 }}</div>
            <div class="text-xs text-gray-400 mt-0.5">公开文档</div>
          </div>
          <div class="p-3 rounded-lg bg-gray-50 text-center">
            <div class="text-lg font-bold text-purple-600">{{ stats.total_views || 0 }}</div>
            <div class="text-xs text-gray-400 mt-0.5">总阅读量</div>
          </div>
        </div>
      </div>

      <!-- ========== 他的文档列表 ========== -->
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-base font-bold text-gray-800 flex items-center gap-2">
          <span class="w-1 h-4 rounded-full" style="background:#dd3333"></span>
          发布的文档 <span class="text-xs text-gray-400 font-normal">({{ docs.length }})</span>
        </h2>
      </div>

      <div v-if="docs.length" class="space-y-3">
        <NuxtLink
          v-for="d in docs"
          :key="d.id"
          :to="`/docs/${encodeURI(d.slug)}`"
          class="card card-hover p-4 block"
        >
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                 :style="{ background: getDomainBg(d.domain) }">📄</div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1 flex-wrap">
                <span class="text-xs px-1.5 py-0.5 rounded" style="background:#fff1f1;color:#dd3333">{{ d.domain }}</span>
                <span v-if="d.subcategory && d.subcategory !== d.title" class="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">{{ d.subcategory }}</span>
                <span v-if="d.visibility === 'private'" class="text-[10px] px-1.5 py-0.5 rounded bg-yellow-50 text-yellow-600 border border-yellow-200">🔒 私密</span>
              </div>
              <h3 class="font-semibold text-gray-900 group-hover:text-[#dd3333] truncate mb-1">{{ d.title }}</h3>
              <div class="text-xs text-gray-400">
                📅 {{ formatDate(d.created_at) }}
                <span class="mx-1">·</span>
                👁️ {{ d.view_count || 0 }} 阅读
              </div>
            </div>
          </div>
        </NuxtLink>
      </div>

      <div v-else class="card p-12 text-center">
        <p class="text-4xl mb-2">📭</p>
        <p class="text-gray-400 text-sm">还没有发布任何文档</p>
      </div>
    </template>

    <div v-else class="card p-12 text-center">
      <p class="text-4xl mb-2">😢</p>
      <p class="text-gray-400 text-sm">用户不存在</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const user = ref<any>(null)
const docs = ref<any[]>([])
const stats = ref({ total: 0, public_count: 0, total_views: 0 })
const loading = ref(true)

const bgMap: Record<string, string> = {
  '安全': '#fff1f1', '开发': '#e8f4ff', '设计': '#f3e8ff', '理学': '#ecfdf5',
  '工学': '#fff7ed', '医学': '#fdf2f8', '交叉新兴': '#eef2ff', '外语': '#ecfeff',
  '经济学': '#fefce8', '管理学': '#f0fdfa', '职业技能': '#f9fafb', '通识': '#fffbeb'
}
function getDomainBg(d: string) { return bgMap[d] || '#f3f4f6' }

onMounted(async () => {
  const id = route.params.id as string
  try {
    const res = await useApi<any>(`/api/user/${id}`)
    if (res.code === 200) {
      user.value = res.data.user
      docs.value = res.data.docs
      stats.value = res.data.stats
    }
  } finally {
    loading.value = false
  }
})

function formatDate(d: string) { return d?.replace('T', ' ').slice(0, 16) || '' }
</script>
