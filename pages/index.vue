<template>
  <div class="space-y-6">
    <!-- ========== Hero Banner ========== -->
    <HeroBanner />

    <!-- ========== 在线文档站入口（醒目引导） ========== -->
    <section class="card p-5 relative overflow-hidden">
      <div class="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-30" style="background:linear-gradient(135deg,#f472b6,#a855f7)"></div>
      <div class="relative flex items-center justify-between">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="text-xl">📖</span>
            <span class="text-lg font-bold text-gray-800">在线文档站</span>
            <span class="text-xs px-1.5 py-0.5 rounded text-white" style="background:#dd3333">NEW</span>
          </div>
          <p class="text-sm text-gray-500">33+ 技术文档 · 文件树导航 · 标题锚点跳转 · 覆盖 12 大领域</p>
        </div>
        <NuxtLink to="/docs" class="flex items-center gap-2 h-10 px-5 rounded-lg text-sm text-white font-medium transition hover:opacity-90" style="background:linear-gradient(135deg,#f472b6,#a855f7)">
          立即进入 →
        </NuxtLink>
      </div>
      <!-- 快速跳转按钮 -->
      <div class="relative mt-4 flex flex-wrap gap-2">
        <NuxtLink v-for="d in domainList" :key="'doc-'+d.name" :to="`/docs/${encodeURIComponent(d.name)}`" class="text-xs px-2.5 py-1 rounded-full border border-gray-200 text-gray-600 hover:border-[#dd3333] hover:text-[#dd3333] transition">
          {{ d.icon }} {{ d.name }}
        </NuxtLink>
      </div>
    </section>

    <!-- ========== 12 大领域 ========== -->
    <section>
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-bold flex items-center gap-2 text-gray-800">
          <span class="w-1 h-5 rounded-full" style="background:#dd3333"></span>
          🗂️ 知识领域
        </h2>
        <NuxtLink to="/knowledge" class="text-xs text-gray-500 hover:text-[#dd3333]">查看全部 →</NuxtLink>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        <NuxtLink
          v-for="(d, i) in domainList"
          :key="d.name"
          :to="`/knowledge/${encodeURIComponent(d.name)}`"
          class="card card-hover p-4 flex flex-col items-center gap-2 text-center group"
        >
          <div
            class="w-11 h-11 rounded-lg flex items-center justify-center text-2xl transition-transform group-hover:scale-110"
            :style="{ background: d.bg }"
          >
            {{ d.icon }}
          </div>
          <div>
            <div class="text-sm font-medium text-gray-800">{{ d.name }}</div>
            <div class="text-xs text-gray-400 mt-0.5">{{ d.count }} 子分类</div>
          </div>
        </NuxtLink>
      </div>
    </section>

    <!-- ========== 最新文章 ========== -->
    <section>
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-bold flex items-center gap-2 text-gray-800">
          <span class="w-1 h-5 rounded-full" style="background:linear-gradient(180deg,#f472b6,#a855f7)"></span>
          📝 最新文章
        </h2>
        <NuxtLink to="/blog" class="text-xs text-gray-500 hover:text-[#dd3333]">查看全部 →</NuxtLink>
      </div>

      <div v-if="loading" class="card p-8 text-center text-gray-400 text-sm">加载中...</div>

      <div v-else-if="articles.length" class="space-y-3">
        <NuxtLink
          v-for="a in articles"
          :key="a.id"
          :to="`/blog/${a.slug}`"
          class="card card-hover p-4 block"
        >
          <div class="flex items-start gap-3">
            <div
              class="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
              :style="{ background: getDomainBg(a.category) }"
            >
              {{ getDomainIcon(a.category) }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span v-if="a.category" class="text-xs px-1.5 py-0.5 rounded" style="background:#fff1f1;color:#dd3333">{{ a.category }}</span>
                <h3 class="font-medium text-gray-800 group-hover:text-[#dd3333] line-clamp-1">{{ a.title }}</h3>
              </div>
              <p class="text-sm text-gray-500 line-clamp-2 mb-2">{{ a.excerpt }}</p>
              <div class="flex items-center gap-3 text-xs text-gray-400">
                <span>👤 {{ a.author_nick || a.author_name }}</span>
                <span>{{ formatDate(a.created_at) }}</span>
                <span v-if="a.view_count">👁️ {{ a.view_count }}</span>
                <span v-if="a.comment_count">💬 {{ a.comment_count }}</span>
              </div>
            </div>
          </div>
        </NuxtLink>
      </div>

      <div v-else class="card p-8 text-center text-gray-400 text-sm">
        <p class="text-2xl mb-2">🌸</p>
        还没有文章，快去写第一篇吧！
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import HeroBanner from '~/components/HeroBanner.vue'

const articles = ref<any[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await useApi<any>('/api/articles?page=1&size=6')
    if (res.code === 200) articles.value = res.data.list
  } finally {
    loading.value = false
  }
})

function formatDate(d: string) {
  if (!d) return ''
  return d.replace('T', ' ').slice(0, 16)
}

const domainList = [
  { name: '安全', icon: '🔒', count: 8, bg: '#fff1f1' },
  { name: '开发', icon: '💻', count: 8, bg: '#e8f4ff' },
  { name: '设计', icon: '🎨', count: 6, bg: '#f3e8ff' },
  { name: '理学', icon: '🔬', count: 10, bg: '#ecfdf5' },
  { name: '工学', icon: '⚙️', count: 10, bg: '#fff7ed' },
  { name: '医学', icon: '🏥', count: 9, bg: '#fdf2f8' },
  { name: '交叉新兴', icon: '🧬', count: 7, bg: '#eef2ff' },
  { name: '外语', icon: '🌐', count: 6, bg: '#ecfeff' },
  { name: '经济学', icon: '💰', count: 7, bg: '#fefce8' },
  { name: '管理学', icon: '📊', count: 3, bg: '#f0fdfa' },
  { name: '职业技能', icon: '💼', count: 8, bg: '#f9fafb' },
  { name: '通识', icon: '📚', count: 3, bg: '#fffbeb' },
]

const domainIconMap: Record<string, string> = Object.fromEntries(domainList.map(d => [d.name, d.icon]))
function getDomainIcon(c?: string) { return c ? domainIconMap[c] || '📄' : '📄' }
function getDomainBg(c?: string) {
  const d = domainList.find(x => x.name === c)
  return d?.bg || '#f3f4f6'
}
</script>
