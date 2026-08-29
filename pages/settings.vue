<template>
  <div class="page-container max-w-4xl mx-auto py-8 px-4">
    <h1 class="text-2xl font-bold mb-2 text-ink">⚙️ 设置</h1>
    <p class="text-sm text-gray-500 mb-8">定制你的学习空间体验</p>

    <!-- 主题 -->
    <div class="card p-5 mb-4">
      <div class="flex items-center gap-2 mb-3">🎨 <span class="font-semibold text-ink">主题</span></div>
      <div class="flex gap-3">
        <button v-for="opt in themeOptions" :key="opt.v"
          @click="settings.setTheme(opt.v)"
          class="px-4 py-2 rounded text-sm transition"
          :class="settings.theme === opt.v ? 'bg-[#c0392b] text-white shadow' : 'bg-[#f4f1ea] text-gray-700 hover:bg-[#eceae4]'"
        >{{ opt.label }}</button>
      </div>
    </div>

    <!-- 壁纸 -->
    <div class="card p-5 mb-4">
      <div class="flex items-center gap-2 mb-4">🖼️ <span class="font-semibold text-ink">壁纸</span></div>

      <div class="flex items-center gap-4 mb-4">
        <label class="flex items-center gap-2 text-sm">
          <input type="checkbox" :checked="settings.wallpapers.autoPlay" @change="onWallAutoChange" />
          自动轮播
        </label>
        <label class="flex items-center gap-2 text-sm">
          切换间隔:
          <select :value="settings.wallpapers.interval" @change="onWallIntervalChange" class="border rounded px-2 py-1 text-sm bg-white">
            <option :value="3000">3秒</option>
            <option :value="5000">5秒</option>
            <option :value="6000">6秒</option>
            <option :value="10000">10秒</option>
          </select>
        </label>
        <button @click="refresh" class="text-xs px-3 py-1 rounded bg-[#f4f1ea] hover:bg-[#eceae4]">刷新壁纸列表</button>
      </div>

      <div class="flex items-center gap-3 mb-3">
        <label class="text-sm text-gray-600 w-24">壁纸透明度</label>
        <input type="range" min="0.1" max="1" step="0.05" v-model.number="settings.wallpapers.opacity" class="flex-1 accent-[#dd3333]" />
        <span class="text-xs text-gray-500 w-10 text-right">{{ Math.round(settings.wallpapers.opacity * 100) }}%</span>
      </div>

      <div class="text-xs text-gray-500 mb-2">
        当前壁纸:
        <span v-if="settings.wallpapers.selected">{{ settings.wallpapers.selected.split('/').pop() }}</span>
        <span v-else class="italic">未选择（使用轮播）</span>
        <button v-if="settings.wallpapers.selected" @click="settings.setWallSettings({ selected: null })" class="ml-2 text-[#c0392b] hover:underline">清除选择（恢复轮播）</button>
      </div>

      <div v-if="loading" class="text-center py-6 text-gray-400 text-sm">加载中...</div>
      <div v-else-if="wallList.length === 0" class="text-center py-6 text-gray-400 text-sm">暂无壁纸</div>
      <div v-else class="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
        <div v-for="w in displayedWalls" :key="w"
          @click="settings.setWallSettings({ selected: w })"
          class="relative aspect-video rounded overflow-hidden cursor-pointer border-2 transition"
          :class="settings.wallpapers.selected === w ? 'border-[#c0392b] shadow-md' : 'border-transparent hover:border-gray-300'"
        >
          <img :src="w" class="w-full h-full object-cover" loading="lazy" />
          <div v-if="settings.wallpapers.selected === w" class="absolute inset-0 flex items-center justify-center bg-black/30 text-white text-lg">✓</div>
        </div>
        <div v-if="hasMoreWalls" class="text-center mt-3 mb-2">
          <button @click="wallPage++" class="text-xs px-4 py-1.5 rounded bg-[#f4f1ea] hover:bg-[#eceae4] border">加载更多壁纸（还剩 {{ wallList.length - displayedWalls.length }} 张）</button>
        </div>
      </div>
    </div>

    <!-- 其他 -->
    <div class="card p-5 mb-4">
      <div class="flex items-center gap-2 mb-3">⚙️ <span class="font-semibold text-ink">其他</span></div>
      <div class="flex items-center gap-4 mb-4">
        <label class="flex items-center gap-2 text-sm">
          字体大小:
          <select :value="settings.fontSize" @change="onFontSizeChange" class="border rounded px-2 py-1 text-sm bg-white">
            <option value="sm">小</option><option value="md">中</option><option value="lg">大</option>
          </select>
        </label>
        <label class="flex items-center gap-2 text-sm">
          <input type="checkbox" :checked="settings.animations" @change="onAnimChange" />
          动画效果
        </label>
      </div>
      <div class="flex gap-2 flex-wrap">
        <button @click="exportNotes" class="px-3 py-1.5 rounded text-sm bg-[#f4f1ea] hover:bg-[#eceae4] border">导出我的笔记</button>
        <label class="px-3 py-1.5 rounded text-sm bg-[#f4f1ea] hover:bg-[#eceae4] border cursor-pointer">
          导入笔记
          <input type="file" accept=".json" class="hidden" @change="onImportFile" />
        </label>
        <button @click="doReset" class="px-3 py-1.5 rounded text-sm text-[#c0392b] hover:bg-red-50 border border-red-200 ml-auto">重置所有设置</button>
      </div>
    </div>

    <!-- 测试翻译预览 -->
    <div class="card p-5">
      <div class="text-xs text-gray-400 mb-2">当前语言 · {{ settings.lang }} · 预览：</div>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
        <div><span class="text-gray-400">nav.home</span> → {{ t('nav.home') }}</div>
        <div><span class="text-gray-400">nav.docs</span> → {{ t('nav.docs') }}</div>
        <div><span class="text-gray-400">hero.title</span> → {{ t('hero.title') }}</div>
        <div><span class="text-gray-400">docs.title</span> → {{ t('docs.title') }}</div>
        <div><span class="text-gray-400">notes.title</span> → {{ t('notes.title') }}</div>
        <div><span class="text-gray-400">tools.title</span> → {{ t('tools.title') }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSettingsStore } from '~/stores/settings'

const settings = useSettingsStore()

const themeOptions = [
  { v: 'washi' as const, label: '和纸（默认）' },
  { v: 'light' as const, label: '浅色' },
  { v: 'dark' as const, label: '深色' },
]
const langOptions = [
  { v: 'zh' as const, label: '🇨🇳 中文' },
  { v: 'en' as const, label: '🇺🇸 English' },
  { v: 'ja' as const, label: '🇯🇵 日本語' },
]

const wallList = ref<string[]>([])
const wallPage = ref(1)
const WALL_PAGE_SIZE = 16
const displayedWalls = computed(() => wallList.value.slice(0, wallPage.value * WALL_PAGE_SIZE))
const hasMoreWalls = computed(() => displayedWalls.value.length < wallList.value.length)
const loading = ref(false)
async function refresh() {
  loading.value = true
  try {
    const res = await useApi<any>('/api/wallpapers')
    if (res.code === 200) wallList.value = res.data
  } finally { loading.value = false }
}
onMounted(refresh)

function onWallAutoChange(e: Event) {
  settings.setWallSettings({ autoPlay: (e.target as HTMLInputElement).checked })
}
function onWallIntervalChange(e: Event) {
  settings.setWallSettings({ interval: parseInt((e.target as HTMLSelectElement).value) })
}
function onFontSizeChange(e: Event) {
  settings.setFontSize((e.target as HTMLSelectElement).value as any)
}
function onAnimChange(e: Event) {
  settings.setAnimations((e.target as HTMLInputElement).checked)
}
function onImportFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  alert('已加载 ' + file.name + '，导入逻辑需后端支持')
}

function exportNotes() {
  useApi<any>('/api/notes/mine').then(res => {
    if (res.code === 200) {
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = 'notes-' + Date.now() + '.json'; a.click()
      URL.revokeObjectURL(url)
    }
  })
}
function doReset() {
  if (confirm('确定要重置所有设置吗？')) {
    localStorage.removeItem('gaku-no-niwa-settings')
    location.reload()
  }
}
</script>
