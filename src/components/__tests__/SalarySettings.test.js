import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SalarySettings from '@/components/SalarySettings.vue'

describe('SalarySettings', () => {
  const defaultProps = {
    config: { monthlySalary: 9000, dailyHours: 8, workDaysPerMonth: 22 },
    secondRate: 0.0142,
    dailyRate: 409.09
  }

  it('renders salary config in read mode', () => {
    const wrapper = mount(SalarySettings, { props: defaultProps })
    expect(wrapper.text()).toContain('9,000')
    expect(wrapper.text()).toContain('8h')
    expect(wrapper.text()).toContain('22天')
  })

  it('switches to edit mode on click edit button', async () => {
    const wrapper = mount(SalarySettings, { props: defaultProps })
    await wrapper.find('button').trigger('click')
    expect(wrapper.find('input').exists()).toBe(true)
  })

  it('emits update-config on save', async () => {
    const wrapper = mount(SalarySettings, { props: defaultProps })
    await wrapper.find('button').trigger('click')
    const inputs = wrapper.findAll('input')
    await inputs[0].setValue(10000)
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('update-config')).toBeTruthy()
    expect(wrapper.emitted('update-config')[0][0].monthlySalary).toBe(10000)
  })
})
