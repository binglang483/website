<template>
  <section class="hero-washi relative overflow-hidden rounded-lg mb-6">
    <div class="absolute inset-0" style="background:linear-gradient(135deg,#fce4ec 0%,#e8eaf6 50%,#e8f5e9 100%);z-index:1"></div>

    <div
      v-for="(src, i) in displayWalls"
      :key="src + i"
      class="absolute inset-0 flex items-center justify-center"
      :style="{ opacity: currentIndex === i ? 1 : 0, zIndex: currentIndex === i ? 2 : 0, transition: 'opacity 1.5s ease-in-out' }"
    >
      <div class="hero-img" :style="{ backgroundImage: 'url(' + src + ')', opacity: settings.wallpapers.opacity ?? 0.45 }"></div>
    </div>

    <div class="absolute inset-0" style="background:linear-gradient(180deg,rgba(250,248,245,0) 0%,rgba(250,248,245,0.55) 70%,rgba(250,248,245,0.95) 100%);z-index:3"></div>
    <div class="absolute inset-0" style="background:linear-gradient(90deg,rgba(250,248,245,0.35) 0%,transparent 30%,transparent 70%,rgba(250,248,245,0.45) 100%);z-index:4"></div>
    <div id="hero-sakura" class="absolute inset-0 overflow-hidden pointer-events-none" style="z-index:5"></div>

    <div class="relative flex flex-col items-center justify-center px-8 py-20 md:py-24" style="min-height:680px;z-index:10">
      <div class="text-center mb-5">
        <h1 class="text-4xl md:text-5xl font-bold mb-3" style="color:#3a3a3a;letter-spacing:0.08em">{{ t('hero.title') }}</h1>
        <p class="text-base text-gray-600 tracking-wide">{{ t('hero.sub') }}</p>
      </div>
      <div class="w-full max-w-xl flex items-center h-12 px-3 rounded-lg" style="background:rgba(255,255,255,0.88);backdrop-filter:blur(8px);border:1px solid rgba(0,0,0,0.08)">
        <input v-model="query" type="text" :placeholder="t('hero.search')" class="flex-1 h-full px-3 rounded text-sm text-gray-800 bg-transparent outline-none placeholder:text-gray-400" @keyup.enter="doSearch" />
        <button @click="doSearch" class="h-9 px-4 rounded text-white text-sm font-medium flex items-center gap-1" style="background:#c0392b">{{ t('hero.searchBtn') }}</button>
      </div>
      <div class="mt-4 flex gap-4 text-xs text-gray-500">
        <span>{{ t('hero.stats1') }}</span><span>{{ t('hero.stats2') }}</span><span>{{ t('hero.stats3') }}</span><span>{{ t('hero.stats4') }}</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from '~/composables/useI18n'
import { useSettingsStore } from '~/stores/settings'

const settings = useSettingsStore()
const { t } = useI18n()
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