<template>
  <div class="card p-4">
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <span class="text-base">📁</span>
        <h3 class="font-semibold text-gray-800 text-sm">文档目录</h3>
      </div>
      <NuxtLink v-if="userStore.isLoggedIn" to="/docs" class="text-xs px-2 py-0.5 rounded bg-[#dd3333] text-white hover:bg-red-600 transition">+ 新建</NuxtLink>
    </div>

    <!-- 动态文件树 -->
    <div v-if="loading" class="text-xs text-gray-400 text-center py-4">加载中...</div>
    <div v-else-if="tree.length">
      <FileTree :nodes="tree" :activePath="activePath" />
    </div>
    <div v-else class="text-xs text-gray-400 text-center py-4">暂无文档</div>

    <!-- 底部快速链接 -->
    <div class="mt-4 pt-3 border-t border-gray-100 space-y-0.5">
      <NuxtLink to="/notes" class="flex items-center gap-2 px-3 py-1.5 rounded text-xs text-gray-600 hover:bg-gray-50 hover:text-[#dd3333] transition">
        <span>📓</span><span>我的笔记</span>
      </NuxtLink>
      <NuxtLink to="/about" class="flex items-center gap-2 px-3 py-1.5 rounded text-xs text-gray-600 hover:bg-gray-50 hover:text-[#dd3333] transition">
        <span>💡</span><span>关于本站</span>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const userStore = useUserStore()
const tree = ref<any[]>([])
const loading = ref(true)

const activePath = computed(() => {
  const path = (route.params.path as string[])?.join('/') || ''
  return `documents/${path}`
})

async function loadTree() {
  loading.value = true
  try {
    const res = await useApi<any>('/api/docs/tree')
    if (res.code === 200) tree.value = res.data.tree
  } finally {
    loading.value = false
  }
}

onMounted(loadTree)
watch(() => route.fullPath, loadTree)
</script>
