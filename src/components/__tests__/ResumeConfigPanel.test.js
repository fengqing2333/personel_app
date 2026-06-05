import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ResumeConfigPanel from '../ResumeConfigPanel.vue'
import { useResumeLayout, __resetForTests } from '../../composables/useResumeLayout'
import { safeStorage } from '../../utils/safeStorage'

beforeEach(() => {
  safeStorage.remove('resume-layout')
  __resetForTests()
  // Clean up any Teleport content left in body
  document.body.querySelectorAll('[role="dialog"]').forEach(el => el.remove())
})

describe('ResumeConfigPanel', () => {
  it('open=false - panel is not rendered', () => {
    const wrapper = mount(ResumeConfigPanel, {
      props: { open: false },
      attachTo: document.body,
    })
    expect(document.body.querySelector('[role="dialog"]')).toBeNull()
    wrapper.unmount()
  })

  it('click close button - emits update:open false', async () => {
    const wrapper = mount(ResumeConfigPanel, {
      props: { open: true },
      attachTo: document.body,
    })
    const closeBtn = document.body.querySelector('button[aria-label="关闭配置面板"]')
    expect(closeBtn).toBeTruthy()
    await closeBtn.click()
    expect(wrapper.emitted()['update:open']).toBeTruthy()
    expect(wrapper.emitted()['update:open'][0]).toEqual([false])
    wrapper.unmount()
  })

  it('click "双栏" button - useResumeLayout.state.layout becomes two-column', async () => {
    const wrapper = mount(ResumeConfigPanel, {
      props: { open: true },
      attachTo: document.body,
    })
    const layout = useResumeLayout()
    expect(layout.state.layout).toBe('single')
    const allBtns = document.body.querySelectorAll('button')
    const twoColBtn = Array.from(allBtns).find(b => b.textContent.includes('双栏'))
    expect(twoColBtn).toBeTruthy()
    await twoColBtn.click()
    expect(layout.state.layout).toBe('two-column')
    wrapper.unmount()
  })

  it('toggle profile switch - useResumeLayout.state.blocks.profile.visible flips', async () => {
    const wrapper = mount(ResumeConfigPanel, {
      props: { open: true },
      attachTo: document.body,
    })
    const layout = useResumeLayout()
    const original = layout.state.blocks.profile.visible
    const toggles = document.body.querySelectorAll('input[type="checkbox"]')
    expect(toggles.length).toBeGreaterThan(0)
    await toggles[0].click()
    expect(layout.state.blocks.profile.visible).toBe(!original)
    wrapper.unmount()
  })
})
