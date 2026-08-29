<template>
  <div class="space-y-4">
    <!-- 站点统计 -->
    <div class="card p-4">
      <div class="flex items-center gap-2 mb-3">
        <span class="text-base">📊</span>
        <h3 class="font-semibold text-gray-800 text-sm">社区数据</h3>
      </div>
      <div class="grid grid-cols-2 gap-2">
        <div class="text-center py-2.5 rounded-lg bg-gray-50 hover:bg-red-50 transition cursor-default">
          <div class="text-lg font-bold" style="color:#dd3333">{{ stats.documents || 0 }}</div>
          <div class="text-xs text-gray-500">文档</div>
        </div>
        <div class="text-center py-2.5 rounded-lg bg-gray-50 hover:bg-blue-50 transition cursor-default">
          <div class="text-lg font-bold text-blue-500">{{ stats.notes || 0 }}</div>
          <div class="text-xs text-gray-500">笔记</div>
        </div>
        <div class="text-center py-2.5 rounded-lg bg-gray-50 hover:bg-green-50 transition cursor-default">
          <div class="text-lg font-bold text-green-500">{{ stats.users || 0 }}</div>
          <div class="text-xs text-gray-500">用户</div>
        </div>
        <div class="text-center py-2.5 rounded-lg bg-gray-50 hover:bg-orange-50 transition cursor-default">
          <div class="text-lg font-bold text-orange-500">{{ stats.total_views || 0 }}</div>
          <div class="text-xs text-gray-500">总阅读</div>
        </div>
      </div>
    </div>

    <!-- 热门文档 -->
    <div class="card p-4">
      <div class="flex items-center gap-2 mb-3">
        <span class="text-base">🔥</span>
        <h3 class="font-semibold text-gray-800 text-sm">热门文档</h3>
      </div>
      <ul v-if="hotDocs.length" class="space-y-1">
        <li v-for="(d, i) in hotDocs" :key="d.id">
          <NuxtLink :to="`/docs/${d.slug}`" class="flex items-start gap-2 py-1 group">
            <span :class="`flex-shrink-0 w-5 h-5 rounded text-xs flex items-center justify-center font-bold ${i < 3 ? 'text-white' : 'bg-gray-100 text-gray-500'}`" :style="i<3 ? {background:'#dd3333'} : {}">{{ i + 1 }}</span>
            <span class="text-sm text-gray-700 group-hover:text-[#dd3333] line-clamp-1">{{ d.title }}</span>
          </NuxtLink>
        </li>
      </ul>
      <p v-else class="text-xs text-gray-400 text-center py-2">暂无数据</p>
    </div>

    <!-- 活跃用户 -->
    <div class="card p-4">
      <div class="flex items-center gap-2 mb-3">
        <span class="text-base">⭐</span>
        <h3 class="font-semibold text-gray-800 text-sm">活跃用户</h3>
      </div>
      <ul v-if="topUsers.length" class="space-y-2">
        <li v-for="u in topUsers" :key="u.id" class="flex items-center gap-2 text-sm">
          <NuxtLink :to="`/user/${u.id}`" class="w-7 h-7 rounded-lg bg-gradient-to-br from-sakura-400 to-purple-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 hover:ring-2 ring-sakura-300 transition">
            {{ (u.nickname || u.username)?.[0] }}
          </NuxtLink>
          <NuxtLink :to="`/user/${u.id}`" class="flex-1 min-w-0 text-gray-700 truncate hover:text-[#dd3333]">{{ u.nickname || u.username }}</NuxtLink>
          <span class="text-xs text-[#dd3333] font-medium">{{ u.doc_count }}篇</span>
        </li>
      </ul>
      <p v-else class="text-xs text-gray-400 text-center py-2">暂无数据</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const stats = ref<Record<string, number>>({})
const hotDocs = ref<any[]>([])
const topUsers = ref<any[]>([])

onMounted(async () => {
  try {
    const res = await useApi('/api/stats')
    if (res.code === 200) {
      stats.value = res.data.stats
      hotDocs.value = res.data.hotDocs || []
      topUsers.value = res.data.topContributors || []
    }
  } catch {}
})
</script>
