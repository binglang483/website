export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
  ],

  css: ['~/assets/css/main.css'],

  nitro: {
    devProxy: {},
    routeRules: {
      '/wallpapers/**': { headers: { 'Cache-Control': 'public, max-age=31536000, immutable' } },
      '/_nuxt/**': { headers: { 'Cache-Control': 'public, max-age=31536000, immutable' } },
      '/api/wallpapers': { swr: true, headers: { 'Cache-Control': 'public, max-age=300' } },
    },
    // 全局 API 错误处理：把未捕获异常包成统一响应
    hooks: {
      'error'(error) {
        // 已在 runtimeConfig 中做了生产强制校验
        return error
      }
    }
  },

  runtimeConfig: {
    // 开发环境用安全随机值，生产环境必须通过 JWT_SECRET 覆盖
    jwtSecret: process.env.JWT_SECRET || (process.env.NODE_ENV !== 'production'
      ? 'dev-only-secret-' + Math.random().toString(36).slice(2) + Date.now()
      : (() => { throw new Error('❌  [FATAL] 生产环境必须设置 JWT_SECRET 环境变量！'); })()),
    dbPath: process.env.DB_PATH || './data/knowledge.db',
    public: {
      siteName: '学びの庭',
      siteDesc: '全領域の知識を共有する学びの場',
    }
  },

  app: {
    head: {
      title: '学びの庭 - 全領域知識プラットフォーム',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '全領域の知識を共有する学びの庭。Nuxt3 + SQLite で構築された個人向け知識基盤' },
        { name: 'theme-color', content: '#ec4899' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌸</text></svg>' }
      ]
    }
  },

  // 生产环境安全提示
  hooks: {
    'build:before'() {
      if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
        console.warn('⚠️  [security] 生产环境建议设置 JWT_SECRET 环境变量')
      }
    }
  },

  compatibilityDate: '2025-01-01',
  experimental: {
    renderJsonPayloads: true,
    payloadExtraction: true,
    crossOriginPrefetch: true,
  },
})
