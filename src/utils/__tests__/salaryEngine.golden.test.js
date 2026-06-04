/**
 * 黄金用例（L1）— 薪资引擎核心计算
 *
 * 范围: 秒薪/日薪/已赚金额/扣薪 — 全应用所有数字的源头，必须永远绿。
 * 执行: npm run test:golden
 * 要求: < 1 秒完成，无外部依赖，无随机/时间敏感逻辑。
 *
 * 派生自 salaryEngine.test.js，只保留正向核心 + 边界 0 值。
 */
import { describe, it, expect } from 'vitest'
import {
  calcSecondRate,
  calcDailyRate,
  calcEarnedBySeconds,
  calcLeaveDeduction
} from '../salaryEngine'

describe('[GOLDEN] salaryEngine 核心计算', () => {
  it('秒薪: 月薪 9000 / 22 工作日 / 8 小时 ≈ 0.0142 元/秒', () => {
    expect(calcSecondRate(9000, 22, 8)).toBeCloseTo(0.0142, 2)
  })

  it('秒薪: 任一参数为 0 时返回 0', () => {
    expect(calcSecondRate(0, 22, 8)).toBe(0)
    expect(calcSecondRate(9000, 0, 8)).toBe(0)
    expect(calcSecondRate(9000, 22, 0)).toBe(0)
  })

  it('日薪: 月薪 9000 / 22 工作日 ≈ 409.09 元/天', () => {
    expect(calcDailyRate(9000, 22)).toBeCloseTo(409.09, 2)
  })

  it('日薪: 工作日为 0 时返回 0', () => {
    expect(calcDailyRate(9000, 0)).toBe(0)
  })

  it('已赚金额: 秒薪 0.0142 × 36000 秒 ≈ 511.2 元', () => {
    expect(calcEarnedBySeconds(0.0142, 36000)).toBeCloseTo(511.2, 1)
  })

  it('扣薪: 日薪 409.09 × 2 天 ≈ 818.18 元', () => {
    expect(calcLeaveDeduction(409.09, 2)).toBeCloseTo(818.18, 2)
  })
})