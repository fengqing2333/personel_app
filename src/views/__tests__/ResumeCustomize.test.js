import { describe, it, expect } from 'vitest'

describe('ResumeCustomize', () => {
  it('应该能够正常挂载且 computed 计算属性可用', async () => {
    const mod = await import('@/views/ResumeCustomize.vue')
    const { mount } = await import('@vue/test-utils')

    let wrapper
    try {
      wrapper = mount(mod.default)
    } catch (e) {
      expect.fail(`挂载失败（可能是 computed 未导入）: ${e.message}`)
    }

    expect(wrapper.exists()).toBe(true)
    // Step 1 默认渲染
    expect(wrapper.text()).toContain('输入求职目标')
  })

  it('切换到 Step 2 时 checkedCount computed 可正确求值', async () => {
    const mod = await import('@/views/ResumeCustomize.vue')
    const { mount } = await import('@vue/test-utils')

    const wrapper = mount(mod.default)
    // 触发 goToStep2：点击 "开始匹配"
    const buttons = wrapper.findAll('button')
    const startBtn = buttons.find(b => b.text().includes('开始匹配'))
    expect(startBtn).toBeTruthy()
    await startBtn.trigger('click')

    // entries 中默认 4 条 checked: id=1,5,7,8 共 4/8
    expect(wrapper.text()).toContain('已选 4 / 8')
  })
})