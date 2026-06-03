import { ref, computed } from 'vue'
import { calcSecondRate, calcDailyRate, calcEarnedBySeconds } from '../utils/salaryEngine'
import { getWorkSecondsToday, dateToStr } from '../utils/dateUtils'
import { safeStorage } from '../utils/safeStorage'

const DEFAULT_CONFIG = {
  monthlySalary: 9000,
  dailyHours: 8,
  workDaysPerMonth: 22
}

const config = ref({ ...DEFAULT_CONFIG })
const nowSeconds = ref(new Date())
const nowDate = ref(new Date())
let secondTimer = null
let minuteTimer = null
let timerActive = false

function loadConfigFromStorage() {
  const stored = safeStorage.get('salary-config')
  config.value = stored ? { ...DEFAULT_CONFIG, ...stored } : { ...DEFAULT_CONFIG }
}

function startTimer() {
  if (timerActive) return
  timerActive = true
  secondTimer = setInterval(() => { nowSeconds.value = new Date() }, 1000)
  minuteTimer = setInterval(() => { nowDate.value = new Date() }, 60000)
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', stopTimer)
  }
}

function stopTimer() {
  if (secondTimer !== null) {
    clearInterval(secondTimer)
    secondTimer = null
  }
  if (minuteTimer !== null) {
    clearInterval(minuteTimer)
    minuteTimer = null
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
    getWorkSecondsToday(nowSeconds.value, config.value.dailyHours)
  )
  const todayEarned = computed(() =>
    calcEarnedBySeconds(secondRate.value, todayWorkSeconds.value)
  )
  const todayDate = computed(() => dateToStr(nowSeconds.value))

  function loadConfig() { loadConfigFromStorage() }
  function saveConfig() { safeStorage.set('salary-config', config.value) }
  function resetConfig() { config.value = { ...DEFAULT_CONFIG }; saveConfig() }
  function updateConfig(partial) { config.value = { ...config.value, ...partial }; saveConfig() }

  return {
    config, nowSeconds, nowDate, secondRate, dailyRate,
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
