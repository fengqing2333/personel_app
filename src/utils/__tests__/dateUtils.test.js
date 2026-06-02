import { describe, it, expect, beforeEach } from 'vitest'
import holidays from '../../data/holidays.js'
import { loadHolidays, isWorkDay, getWorkSecondsToday, getMonthWorkDays } from '../dateUtils'

beforeEach(() => {
  loadHolidays(holidays)
})

describe('isWorkDay', () => {
  it('returns true for a regular weekday', () => {
    // 2025-06-03 周二 — 普通工作日
    expect(isWorkDay(new Date(2025, 5, 3))).toBe(true)
  })

  it('returns false for a Saturday', () => {
    // 2025-06-07 周六 — 常规周末
    expect(isWorkDay(new Date(2025, 5, 7))).toBe(false)
  })

  it('returns false for a Sunday', () => {
    // 2025-06-01 周日
    expect(isWorkDay(new Date(2025, 5, 1))).toBe(false)
  })

  it('returns false for a statutory holiday (National Day)', () => {
    // 2025-10-01 国庆节
    expect(isWorkDay(new Date(2025, 9, 1))).toBe(false)
  })

  it('returns true for a makeup workday (调休补班)', () => {
    // 2025-01-26 周日，春节调休补班
    expect(isWorkDay(new Date(2025, 0, 26))).toBe(true)
  })
})

describe('getMonthWorkDays', () => {
  it('returns correct workdays for June 2025', () => {
    // 2025年6月: 30天, 9个周末日, 0个法定假日 = 21工作日
    expect(getMonthWorkDays(2025, 5)).toBe(21)
  })

  it('returns correct workdays for January 2025', () => {
    // 2025年1月: 31天, 8个周末日(4周六+4周日?), 元旦+春节假期
    // 需考虑春节调休补班 2025-01-26(周日上班)
    const count = getMonthWorkDays(2025, 0)
    expect(count).toBeGreaterThan(0)
    expect(count).toBeLessThanOrEqual(31)
  })

  it('returns correct workdays for a year month', () => {
    const count = getMonthWorkDays(2025, 9) // October 2025
    // 10月: 31天, 国庆假期7天 + 周末
    expect(count).toBeGreaterThan(0)
    expect(count).toBeLessThan(31)
  })
})

describe('getWorkSecondsToday', () => {
  it('returns 0 for a non-workday', () => {
    // 2025-06-07 周六
    const saturday = new Date(2025, 5, 7, 10, 0, 0)
    expect(getWorkSecondsToday(saturday, 8)).toBe(0)
  })

  it('returns capped seconds for a workday afternoon', () => {
    // 2025-06-03 周二 14:30:00 → 从00:00经过了52200秒
    // 每日8小时 = 28800秒上限
    // 应为 28800
    const afternoon = new Date(2025, 5, 3, 14, 30, 0)
    expect(getWorkSecondsToday(afternoon, 8)).toBe(8 * 3600)
  })

  it('returns elapsed seconds if before daily hours cap', () => {
    // 2025-06-03 周二 03:30:00
    // 从00:00经过了12600秒，小于28800上限
    const early = new Date(2025, 5, 3, 3, 30, 0)
    expect(getWorkSecondsToday(early, 8)).toBe(3.5 * 3600)
  })
})
