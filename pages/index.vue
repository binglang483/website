<template>
  <div class="space-y-6">
    <HeroBanner />

    <!-- ========== 三卡快捷入口 ========== -->
    <div class="grid md:grid-cols-3 gap-4">
      <NuxtLink to="/docs" class="card p-5 relative overflow-hidden block group transition-all hover:-translate-y-0.5 hover:shadow-lg">
        <div class="absolute -right-8 -top-8 w-28 h-28 rounded-full opacity-30 group-hover:opacity-40 transition" style="background:linear-gradient(135deg,#f472b6,#a855f7)"></div>
        <div class="relative"><div class="text-3xl mb-2">📖</div><h3 class="font-bold text-gray-800 mb-1">在线文档站</h3><p class="text-xs text-gray-500 mb-3">33+ 技术文档 · 文件树导航</p><span class="text-xs font-medium text-[#dd3333] group-hover:underline">立即浏览 →</span></div>
      </NuxtLink>
      <NuxtLink to="/notes" class="card p-5 relative overflow-hidden block group transition-all hover:-translate-y-0.5 hover:shadow-lg">
        <div class="absolute -right-8 -top-8 w-28 h-28 rounded-full opacity-30 group-hover:opacity-40 transition" style="background:linear-gradient(135deg,#60a5fa,#6366f1)"></div>
        <div class="relative"><div class="text-3xl mb-2">📓</div><h3 class="font-bold text-gray-800 mb-1">学习笔记</h3><p class="text-xs text-gray-500 mb-3">随手记 · 自定义文件夹</p><span class="text-xs font-medium text-[#dd3333] group-hover:underline">快速记录 →</span></div>
      </NuxtLink>
      <NuxtLink to="/tools" class="card p-5 relative overflow-hidden block group transition-all hover:-translate-y-0.5 hover:shadow-lg">
        <div class="absolute -right-8 -top-8 w-28 h-28 rounded-full opacity-30 group-hover:opacity-40 transition" style="background:linear-gradient(135deg,#34d399,#06b6d4)"></div>
        <div class="relative"><div class="text-3xl mb-2">🛠️</div><h3 class="font-bold text-gray-800 mb-1">工具箱</h3><p class="text-xs text-gray-500 mb-3">40+ 精选工具 · 效率神器</p><span class="text-xs font-medium text-[#dd3333] group-hover:underline">打开宝箱 →</span></div>
      </NuxtLink>
    </div>

    <!-- ========== 站点数据看板 ========== -->
    <div class="card p-5">
      <h2 class="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2"><span>📊</span> 站点数据</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div class="stat-card stat-pink text-center p-4 rounded-lg">
          <div class="text-2xl font-bold text-[#ec4899]">{{ stats?.data?.stats?.documents ?? 33 }}</div>
          <div class="text-xs text-gray-500 mt-1">📄 文档</div>
        </div>
        <div class="stat-card stat-blue text-center p-4 rounded-lg">
          <div class="text-2xl font-bold text-[#3b82f6]">{{ stats?.data?.stats?.notes ?? 0 }}</div>
          <div class="text-xs text-gray-500 mt-1">📓 笔记</div>
        </div>
        <div class="stat-card stat-green text-center p-4 rounded-lg">
          <div class="text-2xl font-bold text-[#10b981]">{{ toolCount }}</div>
          <div class="text-xs text-gray-500 mt-1">🛠️ 工具</div>
        </div>
        <div class="stat-card stat-yellow text-center p-4 rounded-lg">
          <div class="text-2xl font-bold text-[#eab308]">{{ stats?.data?.stats?.total_views ?? 0 }}</div>
          <div class="text-xs text-gray-500 mt-1">👁️ 总阅读</div>
        </div>
      </div>
    </div>

    <!-- ========== 热门文档 Top 5 ========== -->
    <div class="card p-5">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-sm font-bold text-gray-700 flex items-center gap-2"><span>🔥</span> 热门文档</h2>
        <NuxtLink to="/docs" class="text-xs text-[#dd3333] hover:underline">查看全部 →</NuxtLink>
      </div>
      <div class="space-y-2">
        <NuxtLink v-for="(d, i) in hotDocs" :key="d.id" :to="'/docs/' + d.slug.replace(/^\/+/, '')"
          class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition group block">
          <span class="w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0"
            :style="{ background: i === 0 ? '#fef3c7' : i < 3 ? '#f1f5f9' : '#f8fafc', color: i === 0 ? '#d97706' : '#64748b' }">{{ i + 1 }}</span>
          <span class="text-sm text-gray-700 group-hover:text-[#dd3333] truncate flex-1">{{ decodeURIComponent(d.title) }}</span>
          <span class="text-xs text-gray-400">👁️ {{ d.view_count }}</span>
        </NuxtLink>
      </div>
    </div>

    <!-- ========== 工具分类快选 ========== -->
    <div class="card p-5">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-sm font-bold text-gray-700 flex items-center gap-2"><span>⚡</span> 工具分类</h2>
        <NuxtLink to="/tools" class="text-xs text-[#dd3333] hover:underline">全部工具 →</NuxtLink>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
        <NuxtLink v-for="cat in toolCats" :key="cat.id" to="/tools" @click.prevent="filterTools(cat.id)"
          class="text-center p-4 rounded-lg border border-gray-100 hover:border-pink-200 hover:shadow-md transition cursor-pointer group">
          <div class="text-3xl mb-2 group-hover:scale-110 transition-transform">{{ cat.icon }}</div>
          <div class="text-sm font-medium text-gray-700 group-hover:text-[#dd3333]">{{ cat.name }}</div>
          <div class="text-xs text-gray-400 mt-1">{{ cat.count }} 个</div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import HeroBanner from '~/components/HeroBanner.vue'

// 站点统计
const stats = ref<any>(null)
const hotDocs = ref<any[]>([])
const toolCount = ref(25)

// 工具分类（硬编码，和 tools/index.vue 保持一致）
const toolCats = [
  { id: 'dev', icon: '💻', name: '开发辅助', count: 6 },
  { id: 'design', icon: '🎨', name: '设计创意', count: 6 },
  { id: 'productivity', icon: '⚡', name: '效率神器', count: 5 },
  { id: 'ai', icon: '🤖', name: 'AI 助手', count: 5 },
  { id: 'util', icon: '🧰', name: '实用杂项', count: 4 },
]

function filterTools(catId: string) {
  navigateTo('/tools?cat=' + catId)
}

onMounted(async () => {
  try {
    stats.value = await $fetch<any>('/api/stats')
    hotDocs.value = stats.value?.data?.hotDocs || []
    toolCount.value = toolCats.reduce((s, c) => s + c.count, 0)
  } catch {}
})
</script>