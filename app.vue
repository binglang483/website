<template>
  <div class="min-h-screen">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
// 初始化 Pinia
const userStore = useUserStore()
onMounted(() => {
  userStore.init()
})
</script>
