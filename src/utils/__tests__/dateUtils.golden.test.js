/**
 * 黄金用例（L1）— 日期工具核心判定
 *
 * 范围: 工作日识别 / 法定假 / 调休补班 / 月工作日计数 — 日历与工时基础。
 * 执行: npm run test:golden
 * 要求: < 1 秒完成，依赖项目内置 holidays 数据，不依赖网络/系统时区差异。
 *
 * 派生自 dateUtils.test.js，覆盖四类典型日期 + 月聚合一例。
 */
import { describe, it, expect, beforeAll } from 'vitest'
import holidays from '../../data/holidays.js'
import { loadHolidays, isWorkDay, getMonthWorkDays } from '../dateUtils'

beforeAll(() => {
  loadHolidays(holidays)
})

describe('[GOLDEN] dateUtils 工作日判定', () => {
  it('普通工作日（周二）: isWorkDay = true', () => {
    // 2025-06-03 周二
    expect(isWorkDay(new Date(2025, 5, 3))).toBe(true)
  })

  it('常规周末（周六）: isWorkDay = false', () => {
    // 2025-06-07 周六
    expect(isWorkDay(new Date(2025, 5, 7))).toBe(false)
  })

  it('法定假日（国庆 2025-10-01）: isWorkDay = false', () => {
    expect(isWorkDay(new Date(2025, 9, 1))).toBe(false)
  })

  it('调休补班日（2025-01-26 周日春节补班）: isWorkDay = true', () => {
    expect(isWorkDay(new Date(2025, 0, 26))).toBe(true)
  })

  it('月工作日: 2025 年 6 月共 21 个工作日', () => {
    // 30 天 - 9 个周末日 - 0 个法定假 = 21
    expect(getMonthWorkDays(2025, 5)).toBe(21)
  })
})