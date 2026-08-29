<template>
  <section class="hero-washi relative overflow-hidden rounded-lg mb-6">
    <div class="hero-base-gradient absolute inset-0" style="z-index:1"></div>

    <div
      v-for="(src, i) in displayWalls"
      :key="src + i"
      class="absolute inset-0 flex items-center justify-center"
      :style="{ opacity: currentIndex === i ? 1 : 0, zIndex: currentIndex === i ? 2 : 0, transition: 'opacity 1.5s ease-in-out' }"
    >
      <div class="hero-img" :style="{ backgroundImage: 'url(' + src + ')', opacity: settings.wallpapers.opacity ?? 0.45 }"></div>
    </div>

    <div class="hero-bottom-mask absolute inset-0" style="z-index:3"></div>
    <div class="hero-side-mask absolute inset-0" style="z-index:4"></div>
    <div id="hero-sakura" class="absolute inset-0 overflow-hidden pointer-events-none" style="z-index:5"></div>

    <div class="relative flex flex-col items-center justify-center px-8 py-20 md:py-24" style="min-height:680px;z-index:10">
      <div class="text-center mb-5">
        <h1 class="text-4xl md:text-5xl font-bold mb-3 text-ink" style="letter-spacing:0.08em">🌸 学びの庭</h1>
        <p class="text-base text-gray-600 tracking-wide">12大領域 · 全学科の知識を記録・共有する</p>
      </div>
      <div class="hero-search-bar w-full max-w-xl flex items-center h-12 px-3 rounded-lg">
        <input v-model="query" type="text" :placeholder="t('hero.search')" class="flex-1 h-full px-3 rounded text-sm text-ink bg-transparent outline-none" @keyup.enter="doSearch" />
        <button @click="doSearch" class="h-9 px-4 rounded text-white text-sm font-medium flex items-center gap-1 btn-accent">{{ t('hero.searchBtn') }}</button>
      </div>
      <div class="mt-4 flex gap-4 text-xs text-gray-500">
        <span>{{ t('hero.stats1') }}</span><span>{{ t('hero.stats2') }}</span><span>{{ t('hero.stats3') }}</span><span>{{ t('hero.stats4') }}</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useSettingsStore } from '~/stores/settings'

const settings = useSettingsStore()
const query = ref('')
const walls = ref<string[]>([])
const currentIndex = ref(0)

// CSR 显示的壁纸
const displayWalls = computed(() => {
  if (settings.wallpapers.selected) return [settings.wallpapers.selected]
  return walls.value
})

// CSR fetch 壁纸（onMounted 执行）
async function loadWalls() {
  try {
    const res = await $fetch<any>('/api/wallpapers')
    if (res?.code === 200 && res.data?.length) walls.value = res.data
  } catch {}
}

let timer: any = null
function startRotate() {
  if (timer) clearInterval(timer)
  if (settings.wallpapers.autoPlay && walls.value.length > 0 && !settings.wallpapers.selected) {
    timer = setInterval(() => {
      if (walls.value.length > 0) currentIndex.value = (currentIndex.value + 1) % walls.value.length
    }, settings.wallpapers.interval)
  }
}
watch(() => settings.wallpapers, () => { startRotate() }, { deep: true })

function doSearch() {
  const q = query.value.trim()
  navigateTo(q ? '/docs?q=' + encodeURIComponent(q) : '/docs')
}

function startSakura() {
  const c = document.getElementById('hero-sakura')
  if (!c) return
  const emojis = ['🌸','🌺','🍃','🌿']
  setInterval(() => {
    if (!settings.animations) return
    const el = document.createElement('div')
    el.className = 'sakura-petal'
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)]
    el.style.left = Math.random() * 100 + '%'
    el.style.fontSize = (12 + Math.random() * 14) + 'px'
    el.style.animationDuration = (6 + Math.random() * 6) + 's'
    c.appendChild(el)
    setTimeout(() => el.remove(), 12000)
  }, 600)
}

onMounted(() => {
  settings.applyTheme()
  loadWalls().then(() => startRotate())
  startSakura()
})
</script>

<style scoped>
.hero-washi { background: #faf8f5; }
.hero-img {
  width: 100%; height: 100%;
  background-size: cover; background-position: center center;
  background-repeat: no-repeat;
}
</style>