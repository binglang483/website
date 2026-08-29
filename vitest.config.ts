/**
 * vitest 配置：覆盖 server/utils + server/migrations + server/seed
 * 客户端组件测试需要 happy-dom，服务端纯逻辑不需要
 */
import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    testTimeout: 10_000,
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname),
    },
  },
})
