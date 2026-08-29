<template>
  <div class="min-h-[calc(100vh-80px)]">
    <!-- Hero -->
    <section class="page-banner docs-banner relative overflow-hidden rounded-lg mb-6 px-6 py-10">
      <div class="relative">
        <h1 class="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">📚 文档知识树</h1>
        <p class="text-gray-600 text-sm">全領域の知識を体系化して、33 篇のマークダウン文書を閲覧できます</p>
        <div class="mt-4 flex gap-3 text-sm text-gray-500">
          <span>📂 {{ tree.length }} 个领域</span>
          <span>📄 {{ total }} 篇文档</span>
        </div>
      </div>
    </section>

    <!-- 领域网格（铺满宽度，左侧 Sidebar 已提供目录导航） -->
    <div v-if="!activeDomain" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div v-for="domain in tree" :key="domain.name"
           class="card p-5 cursor-pointer hover:shadow-lg transition-all hover:-translate-y-0.5 relative overflow-hidden"
           style="border-top:3px solid #f472b6"
           @click="activeDomain = domain.name">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="text-3xl">{{ getIcon(domain.name) }}</div>
            <div>
              <h3 class="font-bold text-lg">{{ domain.name }}</h3>
              <p class="text-xs text-gray-500">{{ countFiles(domain) }} 篇文档</p>
            </div>
          </div>
          <span class="text-gray-400">→</span>
        </div>
        <div class="mt-3 flex flex-wrap gap-2">
          <NuxtLink v-for="f in getFirstFiles(domain, 3)" :key="f.slug"
                    :to="`/docs/${f.slug}`"
                    class="text-xs px-2 py-1 bg-gray-100 hover:bg-sakura-100 hover:text-sakura-600 rounded-full transition-colors">
            {{ f.title }}
          </NuxtLink>
          <span v-if="countFiles(domain) > 3" class="text-xs px-2 py-1 text-gray-400">+{{ countFiles(domain) - 3 }}</span>
        </div>
      </div>
    </div>

    <!-- 领域详情视图 -->
    <div v-else>
      <button @click="activeDomain = ''" class="btn-ghost text-sm mb-3">← 返回全部领域</button>
      <div class="card p-5">
        <h2 class="text-xl font-bold flex items-center gap-2 mb-4">
          <span class="text-3xl">{{ getIcon(activeDomain) }}</span> {{ activeDomain }}
          <span class="text-sm text-gray-400 font-normal">({{ currentDomainFiles.length }} 篇)</span>
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <NuxtLink v-for="f in currentDomainFiles" :key="f.slug"
                    :to="`/docs/${f.slug}`"
                    class="block p-3 rounded-lg border border-gray-100 hover:border-pink-200 hover:bg-pink-50/30 transition-all group shadow-sm hover:shadow-md">
            <div class="font-medium group-hover:text-sakura-600 transition-colors">{{ f.title }}</div>
            <div v-if="f.subcategory" class="text-xs text-gray-400 mt-1">📁 {{ f.subcategory }}</div>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const tree = ref<any[]>([])
const total = ref(0)
const loading = ref(true)
const activeDomain = ref('')
const { getIcon } = useDomains()

function countFiles(domain: any): number {
  return domain.children?.length || 0
}

function getFirstFiles(domain: any, n: number) {
  return (domain.children || []).slice(0, n)
}

const currentDomainFiles = computed(() => {
  const d = tree.value.find(t => t.name === activeDomain.value)
  return d?.children || []
})

async function load() {
  loading.value = true
  try {
    const res = await useApi<any>('/api/docs/tree')
    if (res.code === 200) {
      tree.value = res.data.tree || []
      total.value = res.data.total || 0
    }
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>
