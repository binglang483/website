<template>
  <section class="relative overflow-hidden rounded-lg shadow-card mb-6" style="height:340px;background:linear-gradient(135deg,#667eea 0%,#764ba2 50%,#f093fb 100%)">
    <!-- 壁纸背景（两层做淡入淡出） -->
    <div
      v-for="(src, i) in wallpapers"
      :key="src"
      class="absolute inset-0 hero-bg"
      :style="{
        backgroundImage: `url('${src}')`,
        opacity: currentIndex === i ? 1 : 0,
        zIndex: currentIndex === i ? 1 : 0,
        transition: 'opacity 1.2s ease-in-out'
      }"
    ></div>
    <!-- 渐变兜底（图片加载前可见） -->
    <div class="absolute inset-0" style="background:linear-gradient(135deg,rgba(102,126,234,0.3) 0%,rgba(118,75,162,0.3) 50%,rgba(240,147,251,0.3) 100%);z-index:2"></div>

    <!-- 深色蒙版 -->
    <div class="absolute inset-0 hero-overlay" style="z-index:5"></div>

    <!-- 樱花飘落 -->
    <div id="hero-sakura" class="absolute inset-0 overflow-hidden pointer-events-none" style="z-index:6"></div>

    <!-- 内容 -->
    <div class="relative h-full flex flex-col items-center justify-center text-white px-8" style="z-index:10">
      <h1 class="text-3xl md:text-4xl font-bold mb-2 drop-shadow-lg">🌸 学びの庭</h1>
      <p class="text-white/90 mb-5 drop-shadow">12大領域 · 全学科の知識を記録・共有する</p>

      <!-- 中央搜索框 -->
      <div class="glass shadow-glass w-full max-w-xl flex items-center h-12 px-2">
        <input
          v-model="query"
          type="text"
          placeholder="搜索 博客文章 / 知识库 内容..."
          class="flex-1 h-full px-3 rounded-lg text-sm text-gray-800 bg-transparent outline-none placeholder:text-gray-500"
          @keyup.enter="doSearch"
        />
        <button
          @click="doSearch"
          class="h-10 px-5 rounded-lg text-white text-sm font-medium flex items-center gap-1"
          style="background:#dd3333"
        >
          🔎 搜索
        </button>
      </div>

      <!-- 快速入口 -->
      <div class="flex flex-wrap justify-center gap-3 mt-5">
        <NuxtLink to="/blog" class="h-9 px-4 rounded-lg bg-white/25 backdrop-blur border border-white/40 text-sm hover:bg-white/35 transition">📖 浏览博客</NuxtLink>
        <NuxtLink to="/knowledge" class="h-9 px-4 rounded-lg bg-white/25 backdrop-blur border border-white/40 text-sm hover:bg-white/35 transition">📚 知识库</NuxtLink>
        <NuxtLink v-if="!userStore.isLoggedIn" to="/register" class="h-9 px-4 rounded-lg text-white text-sm font-medium shadow" style="background:linear-gradient(135deg,#f472b6,#a855f7)">✨ 加入我们</NuxtLink>
        <NuxtLink v-else to="/blog/create" class="h-9 px-4 rounded-lg text-white text-sm font-medium shadow" style="background:linear-gradient(135deg,#f472b6,#a855f7)">✍️ 写文章</NuxtLink>
      </div>
    </div>

    <!-- 壁纸指示器 -->
    <div class="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5" style="z-index:10">
      <button
        v-for="(_, i) in wallpapers"
        :key="i"
        @click="currentIndex = i"
        class="h-1.5 rounded-full transition-all"
        :class="currentIndex === i ? 'w-6 bg-white' : 'w-3 bg-white/40 hover:bg-white/60'"
      ></button>
    </div>
  </section>
</template>

<script setup lang="ts">
const userStore = useUserStore()
const route = useRoute()
const query = ref((route.query.q as string) || '')

// 动漫壁纸列表
const wallpapers = [
  '/wallpapers/1.jpg',
  '/wallpapers/2.jpg',
  '/wallpapers/3.jpg',
  '/wallpapers/4.jpg',
  '/wallpapers/5.jpg',
  '/wallpapers/6.jpg',
]

const currentIndex = ref(0)

// 自动轮换
let timer: any
onMounted(() => {
  timer = setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % wallpapers.length
  }, 5000)
  createSakura()
})
onUnmounted(() => {
  clearInterval(timer)
})

function doSearch() {
  if (query.value.trim()) {
    navigateTo(`/blog?q=${encodeURIComponent(query.value.trim())}`)
  }
}

function createSakura() {
  const container = document.getElementById('hero-sakura')
  if (!container) return
  const petals = ['🌸', '🌺', '💮']
  for (let i = 0; i < 8; i++) {
    const p = document.createElement('div')
    p.className = 'absolute pointer-events-none text-white/70'
    p.textContent = petals[Math.floor(Math.random() * petals.length)]
    p.style.left = Math.random() * 100 + '%'
    p.style.top = Math.random() * 100 + '%'
    p.style.fontSize = (12 + Math.random() * 10) + 'px'
    p.style.animation = `hero-sakura-${i} ${6 + Math.random() * 6}s linear infinite`
    p.style.animationDelay = Math.random() * 5 + 's'
    // 注入 keyframes
    const keyframes = document.createElement('style')
    keyframes.textContent = `
      @keyframes hero-sakura-${i} {
        0% { transform: translate(0,0) rotate(0deg); opacity: 0; }
        10% { opacity: 0.8; }
        100% { transform: translate(${Math.random()*40-20}px, 350px) rotate(${Math.random()*360}deg); opacity: 0; }
      }
    `
    document.head.appendChild(keyframes)
    container.appendChild(p)
  }
}
</script>
