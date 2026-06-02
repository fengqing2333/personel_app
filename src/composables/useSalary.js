/**
 * useSalary — 共享薪资状态（单例模式）
 *
 * 模块级共享状态，所有调用 useSalary() 的组件共享同一份 config/now ref。
 * 秒级定时器在首次调用时启动，页面关闭时自动清理。
 */

import { ref, computed } from 'vue'
import { calcSecondRate, calcDailyRate, calcEarnedBySeconds } from '../utils/salaryEngine'
import { getWorkSecondsToday } from '../utils/dateUtils'

const DEFAULT_CONFIG = {
  monthlySalary: 9000,
  dailyHours: 8,
  workDaysPerMonth: 22
}

/** @type {import('vue').Ref<{monthlySalary: number, dailyHours: number, workDaysPerMonth: number}>} */
const config = ref({ ...DEFAULT_CONFIG })

/** @type {import('vue').Ref<Date>} */
const now = ref(new Date())

let intervalId = null
let timerActive = false

/**
 * 截断 Date 至 "YYYY-MM-DD" 字符串
 * @param {Date} date
 * @returns {string}
 */
function dateToStr(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * 从 localStorage 读取配置并合并到 config ref
 */
function loadConfigFromStorage() {
  try {
    const stored = localStorage.getItem('salary-config')
    if (stored) {
      config.value = { ...DEFAULT_CONFIG, ...JSON.parse(stored) }
    } else {
      config.value = { ...DEFAULT_CONFIG }
    }
  } catch {
    config.value = { ...DEFAULT_CONFIG }
  }
}

/**
 * 启动秒级定时器（仅首次生效）
 */
function startTimer() {
  if (timerActive) return
  timerActive = true
  intervalId = setInterval(() => {
    now.value = new Date()
  }, 1000)
  window.addEventListener('beforeunload', stopTimer)
}

/**
 * 停止秒级定时器
 */
function stopTimer() {
  if (intervalId !== null) {
    clearInterval(intervalId)
    intervalId = null
  }
  timerActive = false
  window.removeEventListener('beforeunload', stopTimer)
}

let initialized = false

/**
 * useSalary — 共享薪资状态
 *
 * @returns {{
 *   config: import('vue').Ref<{monthlySalary: number, dailyHours: number, workDaysPerMonth: number}>,
 *   now: import('vue').Ref<Date>,
 *   secondRate: import('vue').ComputedRef<number>,
 *   dailyRate: import('vue').ComputedRef<number>,
 *   todayWorkSeconds: import('vue').ComputedRef<number>,
 *   todayEarned: import('vue').ComputedRef<number>,
 *   todayDate: import('vue').ComputedRef<string>,
 *   loadConfig: () => void,
 *   saveConfig: () => void,
 *   resetConfig: () => void,
 *   updateConfig: (partial: Partial<{monthlySalary: number, dailyHours: number, workDaysPerMonth: number}>) => void,
 *   cleanup: () => void
 * }}
 */
export function useSalary() {
  // 首次调用时初始化
  if (!initialized) {
    initialized = true
    loadConfigFromStorage()
    startTimer()
  }

  /** 秒薪（元） */
  const secondRate = computed(() =>
    calcSecondRate(config.value.monthlySalary, config.value.workDaysPerMonth, config.value.dailyHours)
  )

  /** 日薪（元） */
  const dailyRate = computed(() =>
    calcDailyRate(config.value.monthlySalary, config.value.workDaysPerMonth)
  )

  /** 今日已过工作秒数 */
  const todayWorkSeconds = computed(() =>
    getWorkSecondsToday(now.value, config.value.dailyHours)
  )

  /** 今日已赚金额 */
  const todayEarned = computed(() =>
    calcEarnedBySeconds(secondRate.value, todayWorkSeconds.value)
  )

  /** 今天日期 "YYYY-MM-DD" */
  const todayDate = computed(() => dateToStr(now.value))

  /**
   * 从 localStorage 重新加载配置
   */
  function loadConfig() {
    loadConfigFromStorage()
  }

  /**
   * 将当前配置持久化到 localStorage
   */
  function saveConfig() {
    localStorage.setItem('salary-config', JSON.stringify(config.value))
  }

  /**
   * 重置为默认配置并持久化
   */
  function resetConfig() {
    config.value = { ...DEFAULT_CONFIG }
    saveConfig()
  }

  /**
   * 合并部分配置并持久化
   * @param {Partial<{monthlySalary: number, dailyHours: number, workDaysPerMonth: number}>} partial
   */
  function updateConfig(partial) {
    config.value = { ...config.value, ...partial }
    saveConfig()
  }

  return {
    config,
    now,
    secondRate,
    dailyRate,
    todayWorkSeconds,
    todayEarned,
    todayDate,
    loadConfig,
    saveConfig,
    resetConfig,
    updateConfig,
    cleanup: stopTimer
  }
}
