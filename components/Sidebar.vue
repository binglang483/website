<template>
  <div class="sidebar-washi">
    <div class="flex items-center gap-2 mb-3 px-1">
      <span class="text-base">📁</span>
      <h3 class="font-semibold text-sm tracking-wider" style="color:#3a3a3a">文档目录</h3>
    </div>

    <div v-if="loading" class="text-xs text-gray-400 text-center py-4">加载中...</div>
    <div v-else-if="tree.length">
      <FileTree :nodes="tree" :activePath="activePath" />
    </div>
    <div v-else class="text-xs text-gray-400 text-center py-4">暂无文档</div>

    <div class="washi-divider my-3"></div>

    <div class="space-y-0.5">
      <NuxtLink to="/notes" class="flex items-center gap-2 px-2 py-1.5 rounded-sm text-xs text-gray-600 hover:bg-[#fce4ec] hover:text-[#c0392b] transition">
        <span>📓</span><span>我的笔记</span>
      </NuxtLink>
      <NuxtLink to="/about" class="flex items-center gap-2 px-2 py-1.5 rounded-sm text-xs text-gray-600 hover:bg-[#e8eaf6] hover:text-indigo-600 transition">
        <span>💡</span><span>关于本站</span>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
import { useApi } from '~/composables/useApi'

const tree = ref<any[]>([])
const loading = ref(true)
const activePath = computed(() => {
  const raw = (route.params.path as string[]) || []
  const arr = Array.isArray(raw) ? raw : raw.split('/').filter(Boolean)
  return arr.map(s => decodeURIComponent(s)).join('/')
})

async function load() {
  loading.value = true
  try {
    const res = await useApi<any>('/api/docs/tree')
    if (res.code === 200) tree.value = res.data.tree || []
  } finally { loading.value = false }
}

onMounted(load)
</script>

<style scoped>
.sidebar-washi {
  background: #ffffff;
  border: 1px solid #eceae4;
  border-radius: 4px;
  padding: 1rem;
  height: fit-content;
}
</style>