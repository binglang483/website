<template>
  <div class="file-tree">
    <template v-for="node in nodes" :key="node.name + node.type">
      <!-- 目录 -->
      <div v-if="node.type === 'dir'">
        <button
          @click="toggleDir(node.name)"
          class="flex items-center gap-1.5 w-full px-2 py-1 rounded text-xs text-gray-700 hover:bg-gray-100 transition"
        >
          <span class="w-3 text-center text-gray-400 text-[10px]">{{ expandedSet[node.name] ? '▾' : '▸' }}</span>
          <span>📁</span>
          <span class="font-medium">{{ node.name }}</span>
        </button>
        <div v-show="expandedSet[node.name]" class="ml-3">
          <FileTree :nodes="node.children" :activePath="activePath" />
        </div>
      </div>

      <!-- 文件 -->
      <NuxtLink
        v-else
        :to="`/docs/${node.path.replace(/\.md$/,'')}`"
        class="flex items-center gap-1.5 w-full px-2 py-1 rounded text-xs transition truncate"
        :class="isActive(node) ? 'bg-red-50 text-[#dd3333] font-medium' : 'text-gray-600 hover:bg-gray-100'"
      >
        <span class="w-3 text-center text-gray-300">·</span>
        <span class="text-[11px]">📄</span>
        <span class="truncate">{{ node.title }}</span>
      </NuxtLink>
    </template>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  nodes: any[]
  activePath?: string
}>()

// 用 object 代替 Set 保证 reactive
const expandedSet = reactive<Record<string, boolean>>({})

function toggleDir(name: string) {
  expandedSet[name] = !expandedSet[name]
}

function isActive(node: any) {
  const ap = (props.activePath || '').replace(/\.md$/, '')
  const np = (node.path || '').replace(/\.md$/, '')
  return ap === np
}

// 自动展开包含当前文件的父目录
function autoExpand(nodes: any[]): boolean {
  for (const n of nodes) {
    if (n.type === 'dir') {
      if (autoExpand(n.children)) {
        expandedSet[n.name] = true
        return true
      }
    } else if (isActive(n)) {
      return true
    }
  }
  return false
}

watch(() => props.activePath, () => {
  autoExpand(props.nodes)
}, { immediate: true })
</script>
