/**
 * useLeave — 请假管理（模块级单例）
 *
 * records 定义在模块作用域，所有组件共享同一份数据。
 * 首次调用时从 localStorage 加载，后续调用复用。
 */

import { ref, computed } from 'vue'
import { calcLeaveDeduction } from '../utils/salaryEngine'
import { safeStorage } from '../utils/safeStorage'

const STORAGE_KEY = 'leave-records'

/** @type {import('vue').Ref<Array<{date: string, type: 'annual'|'personal'|'sick'}>>} */
const records = ref([])

let initialized = false

function loadRecords() {
  records.value = safeStorage.get(STORAGE_KEY, [])
}

function saveRecords() {
  safeStorage.set(STORAGE_KEY, records.value)
}

/** 测试用：重置所有内部状态 */
export function __resetForTests() {
  initialized = false
  records.value = []
  safeStorage.remove(STORAGE_KEY)
}

export function useLeave() {
  if (!initialized) {
    initialized = true
    loadRecords()
  }

  function addLeave(dateStr, type) {
    records.value.push({ date: dateStr, type })
    saveRecords()
  }

  function removeLeave(dateStr) {
    records.value = records.value.filter(r => r.date !== dateStr)
    saveRecords()
  }

  function getLeaveCount(year, month) {
    return records.value.filter(r => {
      const [y, m] = r.date.split('-').map(Number)
      return y === year && m === month
    }).length
  }

  function hasLeave(dateStr) {
    return records.value.some(r => r.date === dateStr)
  }

  function getLeaveByDate(dateStr) {
    return records.value.find(r => r.date === dateStr) || null
  }

  function getLeaveDeduction(dailyRate) {
    return calcLeaveDeduction(dailyRate, totalLeaveDaysThisMonth.value)
  }

  const totalLeaveDaysThisMonth = computed(() => {
    const now = new Date()
    return getLeaveCount(now.getFullYear(), now.getMonth() + 1)
  })

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
