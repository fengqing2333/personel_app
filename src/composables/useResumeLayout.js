/**
 * useResumeLayout — 简历布局配置管理（模块级单例）
 *
 * 管理简历的布局模式、区块可见性、主题和发光效果。
 * v1.6.0: 数据读写委托到 storageEngine，保留 reactive + deep watch 自动持久化。
 *
 * 单例模式：所有组件共享同一份布局配置。
 */

import { computed, reactive, readonly, watch } from 'vue'
import { engine } from '../storage/storageEngine'
import { RESUME_THEMES, DEFAULT_THEME_ID } from '../data/resumeThemes'

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
  themeId: DEFAULT_THEME_ID,
  glowEnabled: false,
}

// --- Module-level state (singleton) ---

let _instance = null
let _watcherStop = null

const state = reactive(structuredClone(DEFAULT_LAYOUT))

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
  // Ensure engine is initialized first (entries etc.)
  engine.init()

  const stored = engine.getLayout()
  if (stored) {
    Object.assign(state, mergeLayout(DEFAULT_LAYOUT, stored))
  }

  _watcherStop = watch(
    state,
    (newVal) => {
      engine.setLayout(newVal)
    },
    { deep: true }
  )
}

// --- Singleton accessor ---

export function useResumeLayout() {
  if (!_instance) {
    initialize()

    const readonlyState = readonly(state)

    const orderedVisibleBlocks = computed(() => {
      return Object.entries(state.blocks)
        .filter(([, block]) => block.visible)
        .map(([id, block]) => ({ id, ...block }))
        .sort((a, b) => a.order - b.order)
    })

    const themeVars = computed(() => {
      const theme = RESUME_THEMES[state.themeId] || RESUME_THEMES[DEFAULT_THEME_ID]
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
    }

    function toggleGlow() {
      state.glowEnabled = !state.glowEnabled
    }

    function reorderBlocks(orderedIds) {
      orderedIds.forEach((id, index) => {
        if (state.blocks[id]) {
          state.blocks[id].order = index
        }
      })
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
      reorderBlocks,
      resetLayout,
    }
  }
  return _instance
}

export function __resetForTests() {
  if (_watcherStop) {
    _watcherStop()
    _watcherStop = null
  }
  _instance = null
  Object.assign(state, structuredClone(DEFAULT_LAYOUT))
  engine.__reset()
}
