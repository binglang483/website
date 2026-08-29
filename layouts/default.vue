<template>
  <div class="min-h-screen flex flex-col">
    <!-- ========== 顶部导航栏（ACGSQ 毛玻璃风格） ========== -->
    <header class="sticky top-0 z-50 py-3 px-4">
      <div class="max-w-[1600px] mx-auto">
        <div class="glass shadow-glass h-14 flex items-center gap-3 px-4">
          <!-- Logo -->
          <NuxtLink to="/" class="flex items-center gap-2 group">
            <span class="text-2xl animate-float">🌸</span>
            <span class="text-lg font-bold gradient-text tracking-wide">学びの庭</span>
          </NuxtLink>

          <!-- 主导航 -->
          <nav class="hidden md:flex items-center gap-1 ml-2">
            <NuxtLink to="/" class="nav-link" active-class="nav-link-active">🏠 首页</NuxtLink>
            <NuxtLink to="/docs" class="nav-link" active-class="nav-link-active">📖 文档</NuxtLink>
            <NuxtLink to="/notes" class="nav-link" active-class="nav-link-active">📓 笔记</NuxtLink>
            <NuxtLink to="/tools" class="nav-link" active-class="nav-link-active">🛠️ 工具</NuxtLink>
            <NuxtLink to="/about" class="nav-link" active-class="nav-link-active">📘 关于</NuxtLink>
<NuxtLink to="/settings" class="nav-link" active-class="nav-link-active">⚙️ 设置</NuxtLink>
          
<!-- theme + lang -->
<div class="flex items-center gap-1 ml-auto">
  <button @click="toggleTheme" title="Theme" class="p-2 rounded hover:bg-[#f4f1ea] transition theme-toggle">
    <span v-if="settings.isWashi">🎨</span>
    <span v-else-if="settings.isDark">🌙</span>
    <span v-else>☀️</span>
  </button>
</div>
</nav>

          <div class="flex-1"></div>

          <!-- 搜索框 -->
          <div class="hidden md:flex items-center gap-2">
            <div class="relative flex items-center">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="搜索文档..."
                class="w-52 h-9 px-4 pl-9 rounded-lg border border-gray-200 text-sm bg-white outline-none focus:border-[#dd3333] transition"
                @keyup.enter="doSearch"
              />
              <span class="absolute left-3 text-gray-400 text-sm">🔍</span>
            </div>
            <button @click="doSearch" class="h-9 w-9 rounded-lg flex items-center justify-center text-white text-sm" style="background:#dd3333">
              🔎
            </button>
          </div>

          <!-- 用户区 -->
          <div class="flex items-center gap-2 ml-2">
            <template v-if="userStore.isLoggedIn">
              <NuxtLink to="/notes/new" class="h-9 px-3 rounded-lg flex items-center gap-1 text-xs text-white" style="background:linear-gradient(135deg,#f472b6,#a855f7)">✍️ 写笔记</NuxtLink>
              <div class="relative group">
                <button class="w-9 h-9 rounded-lg bg-gradient-to-br from-sakura-400 to-purple-500 text-white flex items-center justify-center text-sm font-medium hover:ring-2 ring-sakura-300 transition">
                  {{ userStore.user?.nickname?.[0] || userStore.user?.username?.[0] || 'U' }}
                </button>
                <div class="absolute right-0 top-full mt-2 w-44 bg-white rounded-lg shadow-card border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <div class="px-3 py-1.5 text-sm text-gray-500 truncate border-b border-gray-100">{{ userStore.user?.nickname || userStore.user?.username }}</div>
                  <NuxtLink to="/user" class="block px-3 py-1.5 text-sm hover:bg-gray-50">👤 个人中心</NuxtLink>
                  <button @click="userStore.logout()" class="block w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 text-red-500">🚪 退出登录</button>
                </div>
              </div>
            </template>
            <template v-else>
              <NuxtLink to="/login" class="h-9 px-3 rounded-lg flex items-center text-xs text-gray-600 hover:bg-gray-100 transition">登录</NuxtLink>
              <NuxtLink to="/register" class="h-9 px-3 rounded-lg flex items-center text-xs text-white" style="background:#dd3333">注册 ✨</NuxtLink>
            </template>
          </div>
        </div>
      </div>
    </header>

    <!-- ========== 主体布局（按路由决定栏数） ========== -->
    <main class="flex-1 page-container">
      <div class="flex gap-6 max-w-[1600px] mx-auto">
        <!-- 左侧：知识文档目录（仅 /docs 路由显示） -->
        <aside v-if="showSidebar" class="hidden lg:block w-64 flex-shrink-0 sticky top-24 self-start max-h-[calc(100vh-7rem)] overflow-y-auto">
          <Sidebar />
        </aside>

        <!-- 中间主内容区 -->
        <div class="flex-1 min-w-0">
          <slot />
        </div>

        <!-- 右侧：社区数据（首页或 /docs 路由显示） -->
        <aside v-if="showRightPanel" class="hidden xl:block w-72 flex-shrink-0 sticky top-24 self-start max-h-[calc(100vh-7rem)] overflow-y-auto">
          <RightPanel />
        </aside>
      </div>
    </main>

    <!-- ========== 底部 ========== -->
    <footer class="mt-auto py-5 text-center text-sm text-gray-400">
      <p>🌸 学びの庭 · Made with 💖 | Nuxt 3 + SQLite</p>
    </footer>

    <!-- Toast 容器（全局提示） -->
    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const userStore = useUserStore()
const searchQuery = ref('')

// 左侧知识文档目录：仅 /docs 路由显示
const showSidebar = computed(() => route.path.startsWith('/docs'))

// 右侧社区面板：首页 /docs 路由显示
const showRightPanel = computed(() => {
  return route.path === '/' || route.path.startsWith('/docs')
})

function doSearch() {
  if (searchQuery.value.trim()) {
    navigateTo(`/docs?q=${encodeURIComponent(searchQuery.value.trim())}`)
  }
}

import { useSettingsStore } from '~/stores/settings';

const settings = useSettingsStore();
function toggleTheme() {
  const cycle = { washi: "light", light: "dark", dark: "washi" };
  settings.setTheme(cycle[settings.theme]);
}
onMounted(() => settings.applyTheme());
</script>

<style scoped>
.nav-link {
  @apply px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:text-[#dd3333] hover:bg-white transition-colors;
}
.nav-link-active {
  @apply text-[#dd3333] bg-white font-medium;
}
</style>
