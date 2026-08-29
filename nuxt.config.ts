export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
  ],

  css: ['~/assets/css/main.css'],

  nitro: {
    devProxy: {},
  },

  runtimeConfig: {
    // ⚠️ 生产环境必须通过环境变量覆盖 JWT_SECRET！
    // 默认值仅用于开发测试，绝不能在生产环境使用
    jwtSecret: process.env.JWT_SECRET || 'dev-only-secret-change-in-production-' + Date.now(),
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
})
