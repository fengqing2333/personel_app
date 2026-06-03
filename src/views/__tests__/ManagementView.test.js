import { describe, it, expect } from 'vitest'
// @golden: 组件渲染 - 管理页组件正常挂载，无明显渲染错误

describe('ManagementView', () => {
  it('应该能够正常渲染，不抛出错误', async () => {
    const mod = await import('@/views/ManagementView.vue')
    const { mount } = await import('@vue/test-utils')

    let wrapper
    try {
      wrapper = mount(mod.default)
    } catch (e) {
      expect.fail(`挂载失败: ${e.message}`)
    }

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.text()).toContain('本月出勤')
    expect(wrapper.text()).toContain('薪资设置')
  })
})
