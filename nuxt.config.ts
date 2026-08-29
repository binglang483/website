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
    jwtSecret: process.env.JWT_SECRET || 'manabi-no-niwa-secret-key-change-in-production',
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

  compatibilityDate: '2025-01-01',
})
