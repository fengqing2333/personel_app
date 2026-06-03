/**
 * useTheme — 主题切换管理
 *
 * 管理暗色/亮色主题状态，持久化到 localStorage。
 * isDark = true 表示暗色模式。
 * CSS class "dark" 应在 App.vue 的根元素上应用。
 */

import { ref, watch } from 'vue'
import { safeStorage } from '../utils/safeStorage'

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
    const stored = safeStorage.get(STORAGE_KEY)
    if (stored !== null) {
      isDark.value = stored
    }
    // Apply to html element
    if (isDark.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
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

  // 自动持久化并同步 dark class 到 html 元素
  watch(isDark, (val) => {
    safeStorage.set(STORAGE_KEY, val)
    if (val) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  })

  return {
    isDark,
    toggleTheme
  }
}
