import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ResumeConfigPanel from '../ResumeConfigPanel.vue'
import { useResumeLayout, __resetForTests } from '../../composables/useResumeLayout'
import { safeStorage } from '../../utils/safeStorage'

beforeEach(() => {
  safeStorage.remove('resume-layout')
  __resetForTests()
})

describe('ResumeConfigPanel', () => {
  it('open=false - panel is not rendered', () => {
    const wrapper = mount(ResumeConfigPanel, { props: { open: false } })
    // Panel should not have a visible dialog — check no role="dialog" exists
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
  })

  it('click close button - emits update:open false', async () => {
    const wrapper = mount(ResumeConfigPanel, { props: { open: true } })
    const closeBtn = wrapper.find('button[aria-label="关闭配置面板"]')
    expect(closeBtn.exists()).toBe(true)
    await closeBtn.trigger('click')
    expect(wrapper.emitted()['update:open']).toBeTruthy()
    expect(wrapper.emitted()['update:open'][0]).toEqual([false])
  })

  it('click "双栏" button - useResumeLayout.state.layout becomes two-column', async () => {
    const wrapper = mount(ResumeConfigPanel, { props: { open: true } })
    const layout = useResumeLayout()
    expect(layout.state.layout).toBe('single')
    // Find button with text "双栏"
    const twoColBtn = wrapper.findAll('button').find(b => b.text().includes('双栏'))
    expect(twoColBtn).toBeTruthy()
    await twoColBtn.trigger('click')
    expect(layout.state.layout).toBe('two-column')
  })

  it('toggle profile switch - useResumeLayout.state.blocks.profile.visible flips', async () => {
    const wrapper = mount(ResumeConfigPanel, { props: { open: true } })
    const layout = useResumeLayout()
    const original = layout.state.blocks.profile.visible
    // Find all checkbox toggles
    const toggles = wrapper.findAll('input[type="checkbox"]')
    expect(toggles.length).toBeGreaterThan(0)
    await toggles[0].trigger('change')
    expect(layout.state.blocks.profile.visible).toBe(!original)
  })
})
