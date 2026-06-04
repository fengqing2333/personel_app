// 测试配置必须从 'vitest/config' 导入 defineConfig
// 原因: v1.3.1-vitest-infra-fix 升级 vite 至 8 后,
// 来自 'vite' 的 defineConfig 类型不再包含 test 字段。
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  test: {
    environment: 'jsdom',
    globals: true
  }
})