import { describe, it, expect, beforeEach } from 'vitest'
import { nextTick } from 'vue'
import { safeStorage } from '../../utils/safeStorage'
import { useResumeLayout, __resetForTests } from '../useResumeLayout'

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
  themeId: 'light-cream',
  glowEnabled: false,
}

describe('useResumeLayout', () => {
  beforeEach(() => {
    localStorage.clear()
    __resetForTests()
  })

  it('initialize - no storage returns DEFAULT_LAYOUT', () => {
    const { state } = useResumeLayout()
    expect(state).toEqual(DEFAULT_LAYOUT)
  })

  it('setLayout - persists to localStorage', async () => {
    const { state, setLayout } = useResumeLayout()
    setLayout('two-column')
    expect(state.layout).toBe('two-column')
    await nextTick()
    expect(safeStorage.get('resume-storage-v2').layout.layout).toBe('two-column')
  })

  it('toggleBlock - flips visible field', () => {
    const { state, toggleBlock } = useResumeLayout()
    expect(state.blocks.profile.visible).toBe(true)
    toggleBlock('profile')
    expect(state.blocks.profile.visible).toBe(false)
    toggleBlock('profile')
    expect(state.blocks.profile.visible).toBe(true)
  })

  it('setTheme - valid id updates themeVars', () => {
    const { setTheme, themeVars } = useResumeLayout()
    setTheme('linear-cool')
    expect(themeVars.value['--bg']).toBe('#252630')
  })

  it('setTheme - invalid id is silently ignored', () => {
    const { state, setTheme } = useResumeLayout()
    setTheme('not-exist')
    expect(state.themeId).toBe('light-cream')
  })

  it('orderedVisibleBlocks - returns visible blocks sorted by order ascending', () => {
    const { orderedVisibleBlocks, toggleBlock } = useResumeLayout()
    // Make activities visible to test full ordering
    toggleBlock('activities')
    const blocks = orderedVisibleBlocks.value
    expect(blocks[0].id).toBe('profile')
    expect(blocks[blocks.length - 1].id).toBe('activities')
    expect(blocks.length).toBe(8)
    // Verify sort order
    for (let i = 1; i < blocks.length; i++) {
      expect(blocks[i].order).toBeGreaterThan(blocks[i - 1].order)
    }
  })

  it('resetLayout - returns to DEFAULT_LAYOUT after mutations', () => {
    const { state, setLayout, toggleBlock, resetLayout } = useResumeLayout()
    setLayout('two-column')
    toggleBlock('profile')
    resetLayout()
    expect(state).toEqual(DEFAULT_LAYOUT)
  })

  it('singleton - two calls return same reference', () => {
    const instance1 = useResumeLayout()
    const instance2 = useResumeLayout()
    expect(instance1).toBe(instance2)
  })

  // --- v1.9.0: reorderBlocks ---
  describe('reorderBlocks', () => {
    it('按新顺序更新 block order', () => {
      const { state, reorderBlocks } = useResumeLayout()
      reorderBlocks(['profile', 'education', 'experiences', 'projects', 'skills', 'certificates', 'awards', 'activities'])
      expect(state.blocks.education.order).toBe(1)
      expect(state.blocks.experiences.order).toBe(2)
      expect(state.blocks.profile.order).toBe(0)
    })

    it('orderedVisibleBlocks 反映新顺序', () => {
      const { reorderBlocks, orderedVisibleBlocks } = useResumeLayout()
      reorderBlocks(['profile', 'skills', 'experiences', 'projects', 'education', 'certificates', 'awards', 'activities'])
      const ids = orderedVisibleBlocks.value.map(b => b.id)
      expect(ids[0]).toBe('profile')
      expect(ids[1]).toBe('skills')
      expect(ids[2]).toBe('experiences')
    })

    it('不改变 visible 和其他属性', () => {
      const { state, reorderBlocks } = useResumeLayout()
      const prevVisible = { ...Object.fromEntries(Object.entries(state.blocks).map(([k, v]) => [k, v.visible])) }
      reorderBlocks(['profile', 'education', 'experiences', 'projects', 'skills', 'certificates', 'awards', 'activities'])
      for (const [k, v] of Object.entries(prevVisible)) {
        expect(state.blocks[k].visible).toBe(v)
      }
    })

    it('持久化到 localStorage', async () => {
      const { reorderBlocks } = useResumeLayout()
      reorderBlocks(['profile', 'education', 'experiences', 'projects', 'skills', 'certificates', 'awards', 'activities'])
      await nextTick()
      const stored = safeStorage.get('resume-storage-v2').layout
      expect(stored.blocks.education.order).toBe(1)
      expect(stored.blocks.experiences.order).toBe(2)
    })
  })
})
