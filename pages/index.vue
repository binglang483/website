<template>
  <div class="space-y-6">
    <!-- ========== Hero Banner ========== -->
    <HeroBanner />

    <!-- ========== 文档引导 ========== -->
    <section class="card p-5 relative overflow-hidden">
      <div class="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-30" style="background:linear-gradient(135deg,#f472b6,#a855f7)"></div>
      <div class="relative flex items-center justify-between">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="text-xl">📖</span>
            <span class="text-lg font-bold text-gray-800">在线文档站</span>
          </div>
          <p class="text-sm text-gray-500">33+ 技术文档 · 文件树导航 · 覆盖多领域</p>
        </div>
        <NuxtLink to="/docs" class="flex items-center gap-2 h-10 px-5 rounded-lg text-sm text-white font-medium transition hover:opacity-90" style="background:linear-gradient(135deg,#f472b6,#a855f7)">
          立即进入 →
        </NuxtLink>
      </div>
    </section>

    <!-- ========== 笔记引导 ========== -->
    <section class="card p-5 relative overflow-hidden">
      <div class="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-30" style="background:linear-gradient(135deg,#60a5fa,#6366f1)"></div>
      <div class="relative flex items-center justify-between">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="text-xl">📓</span>
            <span class="text-lg font-bold text-gray-800">学习笔记</span>
          </div>
          <p class="text-sm text-gray-500">快速记录 · 随手标记 · 灵感备忘</p>
        </div>
        <NuxtLink to="/notes" class="flex items-center gap-2 h-10 px-5 rounded-lg text-sm text-white font-medium transition hover:opacity-90" style="background:linear-gradient(135deg,#60a5fa,#6366f1)">
          立即进入 →
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import HeroBanner from '~/components/HeroBanner.vue'
</script>
