<template>
  <NuxtLayout>
    <div class="min-h-[80vh] flex items-center justify-center px-4">
      <div class="text-center max-w-md">
        <div class="text-6xl mb-4 animate-float">{{ error?.statusCode === 404 ? '🔍' : '🌸' }}</div>
        <h1 class="text-4xl font-bold text-gray-800 mb-2">
          {{ error?.statusCode === 404 ? '页面走丢了' : '出了点小问题' }}
        </h1>
        <p class="text-gray-500 mb-2 text-sm">
          {{ error?.statusCode === 404 
            ? '你访问的页面不存在，可能已被删除或移动' 
            : error?.message || '服务器似乎出了点问题' }}
        </p>
        <p v-if="error?.statusCode" class="text-xs text-gray-400 mb-6">错误码: {{ error.statusCode }}</p>
        <div class="flex items-center justify-center gap-3">
          <NuxtLink to="/" class="btn-primary">🏠 返回首页</NuxtLink>
          <button @click="handleError" class="btn-ghost">🔄 重试</button>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
defineProps<{
  error: {
    statusCode: number
    statusMessage?: string
    message?: string
  }
}>()

function handleError() {
  clearError({ redirect: '/' })
}
</script>
