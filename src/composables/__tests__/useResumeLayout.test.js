import { describe, it, expect, beforeEach } from 'vitest'
import { nextTick } from 'vue'
import { safeStorage } from '../../utils/safeStorage'
import { useResumeLayout, __resetForTests } from '../useResumeLayout'

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

describe('useResumeLayout', () => {
  beforeEach(() => {
    safeStorage.remove(STORAGE_KEY)
    __resetForTests()
  })

  it('initialize - no storage returns DEFAULT_LAYOUT', () => {
    const { state } = useResumeLayout()
    expect(state.value).toEqual(DEFAULT_LAYOUT)
  })

  it('setLayout - persists to localStorage', async () => {
    const { state, setLayout } = useResumeLayout()
    setLayout('two-column')
    expect(state.value.layout).toBe('two-column')
    await nextTick()
    expect(safeStorage.get(STORAGE_KEY).layout).toBe('two-column')
  })

  it('toggleBlock - flips visible field', () => {
    const { state, toggleBlock } = useResumeLayout()
    expect(state.value.blocks.profile.visible).toBe(true)
    toggleBlock('profile')
    expect(state.value.blocks.profile.visible).toBe(false)
    toggleBlock('profile')
    expect(state.value.blocks.profile.visible).toBe(true)
  })

  it('setTheme - valid id updates themeVars', () => {
    const { setTheme, themeVars } = useResumeLayout()
    setTheme('linear-cool')
    expect(themeVars.value['--bg']).toBe('#252630')
  })

  it('setTheme - invalid id is silently ignored', () => {
    const { state, setTheme } = useResumeLayout()
    setTheme('not-exist')
    expect(state.value.themeId).toBe('linear-cool')
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
    expect(state.value).toEqual(DEFAULT_LAYOUT)
  })

  it('singleton - two calls return same reference', () => {
    const instance1 = useResumeLayout()
    const instance2 = useResumeLayout()
    expect(instance1).toBe(instance2)
  })
})
