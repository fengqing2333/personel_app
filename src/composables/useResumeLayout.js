/**
 * useResumeLayout — 简历布局配置管理（模块级单例）
 *
 * 管理简历的布局模式、区块可见性、主题和发光效果。
 * 通过 deep watch 自动持久化到 localStorage。
 *
 * 单例模式：所有组件共享同一份布局配置。
 */

import { computed, reactive, readonly, watch } from 'vue'
import { safeStorage } from '../utils/safeStorage'
import { RESUME_THEMES } from '../data/resumeThemes'

const STORAGE_KEY = 'resume-layout'

const DEFAULT_LAYOUT = {
  layout: 'single',
  blocks: {
    profile:      { visible: true,  order: 0 },
    experiences:  { visible: true,  order: 1 },
    projects:     { visible: true,  order: 2 },
    skills:       { visible: true,  order: 3 },
    education:    { visible: true,  order: 4 },
    certificates: { visible: true,  order: 5 },
    awards:       { visible: true,  order: 6 },
    activities:   { visible: false, order: 7 },
  },
  themeId: 'linear-cool',
  glowEnabled: false,
}

// --- Module-level state (singleton) ---

let _instance = null
let _watcherStop = null

const state = reactive(structuredClone(DEFAULT_LAYOUT))

/**
 * Deep merge stored data onto defaults for backward compatibility.
 * If a new block is added to DEFAULT_LAYOUT in a future version,
 * old stored data won't override it — blocks are merged key-by-key.
 */
function mergeLayout(defaults, stored) {
  const result = structuredClone(defaults)
  if (!stored) return result

  for (const key of Object.keys(stored)) {
    if (key === 'blocks' && typeof stored.blocks === 'object' && !Array.isArray(stored.blocks)) {
      for (const blockId of Object.keys(stored.blocks)) {
        if (result.blocks[blockId]) {
          result.blocks[blockId] = { ...result.blocks[blockId], ...stored.blocks[blockId] }
        } else {
          result.blocks[blockId] = stored.blocks[blockId]
        }
      }
    } else {
      result[key] = stored[key]
    }
  }
  return result
}

function initialize() {
  const stored = safeStorage.get(STORAGE_KEY)
  if (stored) {
    Object.assign(state, mergeLayout(DEFAULT_LAYOUT, stored))
  }

  // Persist on every change via deep watch
  _watcherStop = watch(
    state,
    (newVal) => {
      safeStorage.set(STORAGE_KEY, newVal)
    },
    { deep: true }
  )
}

// --- Singleton accessor ---

export function useResumeLayout() {
  if (!_instance) {
    initialize()

    const readonlyState = readonly(state)

    /** Blocks that are visible, sorted by order ascending */
    const orderedVisibleBlocks = computed(() => {
      return Object.entries(state.blocks)
        .filter(([_, block]) => block.visible)
        .map(([id, block]) => ({ id, ...block }))
        .sort((a, b) => a.order - b.order)
    })

    /** CSS custom properties from the current theme */
    const themeVars = computed(() => {
      const theme = RESUME_THEMES[state.themeId]
      return theme ? theme.vars : {}
    })

    function toggleBlock(blockId) {
      const block = state.blocks[blockId]
      if (block) {
        block.visible = !block.visible
      }
    }

    function setLayout(layout) {
      state.layout = layout
    }

    function setTheme(themeId) {
      if (RESUME_THEMES[themeId]) {
        state.themeId = themeId
      }
      // Invalid themeId is silently ignored
    }

    function toggleGlow() {
      state.glowEnabled = !state.glowEnabled
    }

    function resetLayout() {
      Object.assign(state, structuredClone(DEFAULT_LAYOUT))
    }

    _instance = {
      state: readonlyState,
      orderedVisibleBlocks,
      themeVars,
      toggleBlock,
      setLayout,
      setTheme,
      toggleGlow,
      resetLayout,
    }
  }
  return _instance
}

/**
 * Test cleanup: stop watcher, reset singleton, clear storage.
 * Imported by test files via named export.
 */
export function __resetForTests() {
  if (_watcherStop) {
    _watcherStop()
    _watcherStop = null
  }
  _instance = null
  Object.assign(state, structuredClone(DEFAULT_LAYOUT))
  safeStorage.remove(STORAGE_KEY)
}
