<template>
  <div class="card p-8 max-w-2xl mx-auto">
    <h1 class="text-3xl font-bold gradient-text mb-6 text-center">🌸 学びの庭について</h1>

    <div class="markdown-body">
      <h2>是什么？</h2>
      <p>二次元风格的个人知识记录与分享平台。涵盖 12 大领域，从安全攻防到诗词歌赋，都可以在这里留下你的学习痕迹。</p>

      <h2>技术栈</h2>
      <ul>
        <li><strong>前端</strong>：Nuxt 3 + Vue 3 + TailwindCSS + Pinia</li>
        <li><strong>后端</strong>：Nitro（Nuxt 内置全栈引擎）</li>
        <li><strong>数据库</strong>：SQLite（better-sqlite3）</li>
        <li><strong>认证</strong>：JWT（jsonwebtoken）</li>
      </ul>

      <h2>特色</h2>
      <ul>
        <li>🌸 粉紫渐变 + 樱花飘落的二次元 UI</li>
        <li>📝 Markdown 实时预览编辑</li>
        <li>📚 动态文件树 · 作者追踪 · 公开/私密切换</li>
        <li>📓 笔记系统 · 快速记录灵感</li>
        <li>⚡ 全栈 TypeScript，SSR 友好</li>
      </ul>

      <h2>快速开始</h2>
      <pre><code># 安装依赖
npm install

# 开发模式
npm run dev

# 生产构建
npm run build
npm run preview</code></pre>

      <h2>默认账号</h2>
      <ul>
        <li>管理员：<code>admin</code> / <code>admin123</code></li>
        <li>自己注册一个普通账号也能完整体验 ✨</li>
      </ul>
    </div>
  </div>
</template>
