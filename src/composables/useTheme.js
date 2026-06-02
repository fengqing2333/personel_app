/**
 * useTheme — 主题切换管理
 *
 * 管理暗色/亮色主题状态，持久化到 localStorage。
 * isDark = true 表示暗色模式。
 * CSS class "dark" 应在 App.vue 的根元素上应用。
 */

import { ref, watch } from 'vue'

const STORAGE_KEY = 'theme'

/**
 * useTheme
 *
 * @returns {{
 *   isDark: import('vue').Ref<boolean>,
 *   toggleTheme: () => void
 * }}
 */
export function useTheme() {
  /** 暗色模式标记 */
  const isDark = ref(false)

  /**
   * 从 localStorage 初始化主题状态
   */
  function initialize() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored !== null) {
        isDark.value = JSON.parse(stored)
      }
    } catch {
      isDark.value = false
    }
  }

  /**
   * 切换暗色/亮色主题
   */
  function toggleTheme() {
    isDark.value = !isDark.value
  }

  // 初始化时读取已保存的主题
  initialize()

  // 自动持久化到 localStorage
  watch(isDark, (val) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
  })

  return {
    isDark,
    toggleTheme
  }
}
