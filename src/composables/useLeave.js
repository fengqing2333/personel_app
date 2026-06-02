/**
 * useLeave — 请假管理
 *
 * 管理请假记录，持久化到 localStorage。
 * 提供按日期增删查、月度统计和扣薪计算功能。
 */

import { ref, computed } from 'vue'
import { calcLeaveDeduction } from '../utils/salaryEngine'

const STORAGE_KEY = 'leave-records'

/**
 * @typedef {{ date: string, type: 'annual'|'personal'|'sick' }} LeaveRecord
 */

/**
 * useLeave
 *
 * @returns {{
 *   records: import('vue').Ref<LeaveRecord[]>,
 *   totalLeaveDaysThisMonth: import('vue').ComputedRef<number>,
 *   loadRecords: () => void,
 *   saveRecords: () => void,
 *   addLeave: (dateStr: string, type: 'annual'|'personal'|'sick') => void,
 *   removeLeave: (dateStr: string) => void,
 *   getLeaveCount: (year: number, month: number) => number,
 *   hasLeave: (dateStr: string) => boolean,
 *   getLeaveByDate: (dateStr: string) => LeaveRecord | null,
 *   getLeaveDeduction: (dailyRate: number) => number
 * }}
 */
export function useLeave() {
  /** 请假记录列表 */
  const records = ref(/** @type {LeaveRecord[]} */ ([]))

  /**
   * 从 localStorage 加载请假记录
   */
  function loadRecords() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        records.value = JSON.parse(stored)
      } else {
        records.value = []
      }
    } catch {
      records.value = []
    }
  }

  /**
   * 将请假记录持久化到 localStorage
   */
  function saveRecords() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records.value))
  }

  /**
   * 添加一条请假记录
   *
   * @param {string} dateStr - "YYYY-MM-DD" 格式日期
   * @param {'annual'|'personal'|'sick'} type - 请假类型
   */
  function addLeave(dateStr, type) {
    records.value.push({ date: dateStr, type })
    saveRecords()
  }

  /**
   * 删除指定日期的请假记录
   *
   * @param {string} dateStr - "YYYY-MM-DD" 格式日期
   */
  function removeLeave(dateStr) {
    records.value = records.value.filter(r => r.date !== dateStr)
    saveRecords()
  }

  /**
   * 统计指定月份的请假天数
   *
   * @param {number} year - 年份（如 2025）
   * @param {number} month - 月份（1-indexed，1=一月，12=十二月）
   * @returns {number} 请假天数
   */
  function getLeaveCount(year, month) {
    return records.value.filter(r => {
      const [y, m] = r.date.split('-').map(Number)
      return y === year && m === month
    }).length
  }

  /**
   * 检查指定日期是否有请假记录
   *
   * @param {string} dateStr - "YYYY-MM-DD" 格式日期
   * @returns {boolean}
   */
  function hasLeave(dateStr) {
    return records.value.some(r => r.date === dateStr)
  }

  /**
   * 获取指定日期的请假记录（无记录时返回 null）
   *
   * @param {string} dateStr - "YYYY-MM-DD" 格式日期
   * @returns {LeaveRecord | null}
   */
  function getLeaveByDate(dateStr) {
    return records.value.find(r => r.date === dateStr) || null
  }

  /**
   * 计算本月请假扣薪
   *
   * 接收 dailyRate 作为参数，避免与 useSalary 产生循环依赖。
   *
   * @param {number} dailyRate - 日薪（元）
   * @returns {number} 扣薪金额（元）
   */
  function getLeaveDeduction(dailyRate) {
    return calcLeaveDeduction(dailyRate, totalLeaveDaysThisMonth.value)
  }

  /** 当月请假总天数 */
  const totalLeaveDaysThisMonth = computed(() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1 // 转为 1-indexed
    return getLeaveCount(year, month)
  })

  // 初始化时加载已保存的记录
  loadRecords()

  return {
    records,
    totalLeaveDaysThisMonth,
    loadRecords,
    saveRecords,
    addLeave,
    removeLeave,
    getLeaveCount,
    hasLeave,
    getLeaveByDate,
    getLeaveDeduction
  }
}
