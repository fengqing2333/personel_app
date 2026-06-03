import { describe, it, expect } from 'vitest'
// @golden: 核心计算 - 秒薪/日薪/扣薪计算，所有功能的基础
import { calcSecondRate, calcDailyRate, calcEarnedBySeconds, calcLeaveDeduction } from '../salaryEngine'

describe('calcSecondRate', () => {
  it('calculates per-second rate from monthly salary', () => {
    // 秒薪 = 月薪 / 月计薪天数 / 每日工时 / 3600
    // 9000 / 22 / 8 / 3600 ≈ 0.0142
    const result = calcSecondRate(9000, 22, 8)
    expect(result).toBeCloseTo(0.0142, 2)
  })

  it('returns 0 when monthly salary is 0', () => {
    expect(calcSecondRate(0, 22, 8)).toBe(0)
  })

  it('returns 0 when work days is 0', () => {
    expect(calcSecondRate(9000, 0, 8)).toBe(0)
  })

  it('returns 0 when daily hours is 0', () => {
    expect(calcSecondRate(9000, 22, 0)).toBe(0)
  })

  it('returns 0 when any parameter is negative', () => {
    expect(calcSecondRate(-100, 22, 8)).toBe(0)
  })
})

describe('calcDailyRate', () => {
  it('calculates daily rate from monthly salary', () => {
    // 日薪 = 月薪 / 月计薪天数
    // 9000 / 22 ≈ 409.09
    const result = calcDailyRate(9000, 22)
    expect(result).toBeCloseTo(409.09, 2)
  })

  it('returns 0 when monthly salary is 0', () => {
    expect(calcDailyRate(0, 22)).toBe(0)
  })

  it('returns 0 when work days is 0', () => {
    expect(calcDailyRate(9000, 0)).toBe(0)
  })
})

describe('calcEarnedBySeconds', () => {
  it('calculates earned amount from second rate and seconds', () => {
    // 已赚金额 = 秒薪 * 秒数
    // Using the second rate from the calcSecondRate example:
    // 0.0142045 * 36000 ≈ 511.36
    const result = calcEarnedBySeconds(0.0142, 36000)
    expect(result).toBeCloseTo(511.2, 1)
  })

  it('returns 0 when second rate is 0', () => {
    expect(calcEarnedBySeconds(0, 36000)).toBe(0)
  })

  it('returns 0 when seconds is 0', () => {
    expect(calcEarnedBySeconds(0.0142, 0)).toBe(0)
  })
})

describe('calcLeaveDeduction', () => {
  it('calculates leave deduction from daily rate and days', () => {
    // 扣薪 = 日薪 * 天数
    // 409.09 * 2 ≈ 818.18
    const result = calcLeaveDeduction(409.09, 2)
    expect(result).toBeCloseTo(818.18, 2)
  })

  it('returns 0 when daily rate is 0', () => {
    expect(calcLeaveDeduction(0, 2)).toBe(0)
  })

  it('returns 0 when days is 0', () => {
    expect(calcLeaveDeduction(409.09, 0)).toBe(0)
  })
})
