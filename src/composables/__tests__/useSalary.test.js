import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { useSalary, __resetForTests } from '../useSalary'

const DEFAULT_CONFIG = {
  monthlySalary: 9000,
  dailyHours: 8,
  workDaysPerMonth: 22
}

describe('useSalary', () => {
  let salary

  beforeEach(() => {
    localStorage.clear()
    __resetForTests()
    salary = useSalary()
    salary.loadConfig()
  })

  afterEach(() => {
    salary.cleanup()
  })

  describe('config management', () => {
    it('uses default config when localStorage is empty', () => {
      expect(salary.config.value).toEqual(DEFAULT_CONFIG)
    })

    it('loads config from localStorage', () => {
      localStorage.setItem('salary-config', JSON.stringify({ monthlySalary: 5000 }))
      salary.loadConfig()
      expect(salary.config.value.monthlySalary).toBe(5000)
      expect(salary.config.value.dailyHours).toBe(8)
      expect(salary.config.value.workDaysPerMonth).toBe(22)
    })

    it('saves config to localStorage', () => {
      salary.config.value.monthlySalary = 12000
      salary.saveConfig()
      const stored = JSON.parse(localStorage.getItem('salary-config'))
      expect(stored.monthlySalary).toBe(12000)
    })

    it('resets config to defaults', () => {
      salary.updateConfig({ monthlySalary: 50000 })
      salary.resetConfig()
      expect(salary.config.value).toEqual(DEFAULT_CONFIG)
    })

    it('updates config by merging partial', () => {
      salary.updateConfig({ dailyHours: 6 })
      expect(salary.config.value.monthlySalary).toBe(9000)
      expect(salary.config.value.dailyHours).toBe(6)
      expect(salary.config.value.workDaysPerMonth).toBe(22)
    })

    it('persists updated config to localStorage', () => {
      salary.updateConfig({ monthlySalary: 9999 })
      const stored = JSON.parse(localStorage.getItem('salary-config'))
      expect(stored.monthlySalary).toBe(9999)
    })
  })

  describe('computed values', () => {
    it('computes secondRate', () => {
      // 9000 / 22 / 8 / 3600 ≈ 0.0142
      expect(salary.secondRate.value).toBeCloseTo(0.0142, 2)
    })

    it('computes dailyRate', () => {
      // 9000 / 22 ≈ 409.09
      expect(salary.dailyRate.value).toBeCloseTo(409.09, 2)
    })

    it('computes todayDate in YYYY-MM-DD format', () => {
      const expected = new Date()
      const y = expected.getFullYear()
      const m = String(expected.getMonth() + 1).padStart(2, '0')
      const d = String(expected.getDate()).padStart(2, '0')
      expect(salary.todayDate.value).toBe(`${y}-${m}-${d}`)
    })
  })
})
