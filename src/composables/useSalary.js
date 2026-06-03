import { ref, computed } from 'vue'
import { calcSecondRate, calcDailyRate, calcEarnedBySeconds } from '../utils/salaryEngine'
import { getWorkSecondsToday, dateToStr } from '../utils/dateUtils'

const DEFAULT_CONFIG = {
  monthlySalary: 9000,
  dailyHours: 8,
  workDaysPerMonth: 22
}

const config = ref({ ...DEFAULT_CONFIG })
const now = ref(new Date())
let intervalId = null
let timerActive = false

function loadConfigFromStorage() {
  try {
    const stored = localStorage.getItem('salary-config')
    config.value = stored ? { ...DEFAULT_CONFIG, ...JSON.parse(stored) } : { ...DEFAULT_CONFIG }
  } catch {
    config.value = { ...DEFAULT_CONFIG }
  }
}

function startTimer() {
  if (timerActive) return
  timerActive = true
  intervalId = setInterval(() => { now.value = new Date() }, 1000)
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', stopTimer)
  }
}

function stopTimer() {
  if (intervalId !== null) {
    clearInterval(intervalId)
    intervalId = null
  }
  timerActive = false
  if (typeof window !== 'undefined') {
    window.removeEventListener('beforeunload', stopTimer)
  }
}

let initialized = false

export function useSalary() {
  if (!initialized) {
    initialized = true
    loadConfigFromStorage()
    startTimer()
  }

  const secondRate = computed(() =>
    calcSecondRate(config.value.monthlySalary, config.value.workDaysPerMonth, config.value.dailyHours)
  )
  const dailyRate = computed(() =>
    calcDailyRate(config.value.monthlySalary, config.value.workDaysPerMonth)
  )
  const todayWorkSeconds = computed(() =>
    getWorkSecondsToday(now.value, config.value.dailyHours)
  )
  const todayEarned = computed(() =>
    calcEarnedBySeconds(secondRate.value, todayWorkSeconds.value)
  )
  const todayDate = computed(() => dateToStr(now.value))

  function loadConfig() { loadConfigFromStorage() }
  function saveConfig() { localStorage.setItem('salary-config', JSON.stringify(config.value)) }
  function resetConfig() { config.value = { ...DEFAULT_CONFIG }; saveConfig() }
  function updateConfig(partial) { config.value = { ...config.value, ...partial }; saveConfig() }

  return {
    config, now, secondRate, dailyRate,
    todayWorkSeconds, todayEarned, todayDate,
    loadConfig, saveConfig, resetConfig, updateConfig,
    cleanup: stopTimer
  }
}

/** 测试用：重置所有内部状态 */
export function __resetForTests() {
  stopTimer()
  initialized = false
  config.value = { ...DEFAULT_CONFIG }
}
