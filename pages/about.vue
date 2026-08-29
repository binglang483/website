<template>
  <div class="space-y-4">
    <div class="card p-8">
      <h1 class="text-3xl font-bold mb-2 text-center">🌸 关于学びの庭</h1>
      <p class="text-center text-sm text-gray-500 mb-8">版本 1.0.0 · 构建 2026-08-29</p>

      <div class="grid md:grid-cols-2 gap-6">
        <div>
          <h2 class="text-lg font-bold mb-3 flex items-center gap-2"><span class="text-xl">📖</span> 是什么？</h2>
          <p class="text-sm text-gray-600 leading-relaxed mb-3">
            学びの庭（Gaku no Niwa）是一个以知识记录为核心的个人学习空间。
            涵盖 12 大领域、33+ 技术文档，让零散的知识点系统化，让每一次学习都有迹可循。
          </p>
          <p class="text-sm text-gray-600 leading-relaxed">
            面向所有对知识有追求的人 — 学生、开发者、设计师、终身学习者，都欢迎。
          </p>
        </div>

        <div>
          <h2 class="text-lg font-bold mb-3 flex items-center gap-2"><span class="text-xl">⚡</span> 核心特性</h2>
          <ul class="text-sm text-gray-600 space-y-2">
            <li class="flex gap-2">🌸 粉紫渐变 + 樱花飘落的和风 UI</li>
            <li class="flex gap-2">📝 Markdown 实时渲染编辑</li>
            <li class="flex gap-2">📚 文件树导航 · 作者追踪 · 公开/私密切换</li>
            <li class="flex gap-2">📓 笔记系统 · 自定义文件夹 · 快速记录灵感</li>
            <li class="flex gap-2">🛠️ 40+ 精选工具分享</li>
            <li class="flex gap-2">⚙️ 主题/语言/壁纸自由定制</li>
          </ul>
        </div>

        <div>
          <h2 class="text-lg font-bold mb-3 flex items-center gap-2"><span class="text-xl">🛠️</span> 技术栈</h2>
          <ul class="text-sm text-gray-600 space-y-2">
            <li><strong>前端</strong>：Nuxt 3 + Vue 3 + TailwindCSS + Pinia</li>
            <li><strong>后端</strong>：Nitro（Nuxt 内置全栈引擎）</li>
            <li><strong>数据库</strong>：SQLite（better-sqlite3）</li>
            <li><strong>认证</strong>：JWT（jsonwebtoken）</li>
          </ul>
        </div>

        <div>
          <h2 class="text-lg font-bold mb-3 flex items-center gap-2"><span class="text-xl">🚀</span> 快速开始</h2>
          <pre class="bg-gray-900 text-green-300 text-xs p-3 rounded overflow-x-auto"><code># 安装依赖
npm install

# 开发模式 http://localhost:3000
npm run dev

# 生产构建
npm run build && npm run preview</code></pre>
        </div>
      </div>

      <div class="mt-8 pt-6 border-t border-gray-100">
        <h2 class="text-lg font-bold mb-3 flex items-center gap-2"><span class="text-xl">🔑</span> 默认账号</h2>
        <div class="flex gap-4 flex-wrap">
          <div class="bg-gray-50 rounded-lg p-3 text-sm">
            <div class="text-gray-500 text-xs mb-1">管理员</div>
            <div><code class="bg-gray-200 px-1 rounded">admin</code> / <code class="bg-gray-200 px-1 rounded">admin123</code></div>
          </div>
          <div class="bg-gray-50 rounded-lg p-3 text-sm">
            <div class="text-gray-500 text-xs mb-1">普通用户</div>
            <div>任意邮箱 <span class="text-xs text-gray-400">/register 注册</span></div>
          </div>
        </div>
      </div>
    </div>

    <div class="card p-6">
      <h2 class="text-base font-bold mb-3 flex items-center gap-2"><span>📮</span> 反馈与贡献</h2>
      <p class="text-xs text-gray-500">有 bug 或建议？欢迎开 issue 或 PR。一起让学びの庭更好 🌱</p>
    </div>
  </div>
</template>
