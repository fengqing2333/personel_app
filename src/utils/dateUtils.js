/**
 * 日期工具函数
 *
 * 提供工作日判断、工作秒数计算、月工作日统计等功能。
 * 节假日数据通过 loadHolidays 加载，支持中国法定假日和调休补班逻辑。
 */

/** @type {Map<string, 'holiday'|'workday'>} */
let holidayMap = new Map()

/**
 * 加载节假日数据到内部 Map
 *
 * @param {Record<string, 'holiday'|'workday'>} holidayData
 *   键为 "YYYY-MM-DD" 格式的日期字符串，值为 'holiday' 或 'workday'
 */
export function loadHolidays(holidayData) {
  holidayMap = new Map()
  for (const [dateStr, type] of Object.entries(holidayData)) {
    holidayMap.set(dateStr, type)
  }
}

/**
 * 将 Date 对象格式化为 YYYY-MM-DD 字符串
 *
 * @param {Date} date
 * @returns {string}
 */
export function dateToStr(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * 判断某天是否为工作日
 *
 * 规则：
 * - 调休补班（workday）→ 是工作日（即使周末）
 * - 法定假（holiday）→ 不是工作日
 * - 常规周末（周六/日）→ 不是工作日
 * - 常规工作日 → 是工作日
 *
 * @param {Date} date - 待判断的日期
 * @returns {boolean} 是否为工作日
 */
export function isWorkDay(date) {
  if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production' && holidayMap.size === 0) {
    console.warn('[dateUtils] isWorkDay called but holidayMap is empty. Call loadHolidays() first.')
  }
  const dateStr = dateToStr(date)
  const type = holidayMap.get(dateStr)

  if (type === 'workday') return true
  if (type === 'holiday') return false

  const day = date.getDay()
  return day !== 0 && day !== 6
}

/**
 * 返回日期类型
 *
 * @param {Date} date - 待判断的日期
 * @param {string[]} leaveDateStrs - 请假日期字符串数组 ["YYYY-MM-DD", ...]
 * @returns {'work'|'holiday'|'leave'|'rest'|'makeup'}
 *   work:    普通工作日
 *   holiday: 法定节假日
 *   leave:   已请假
 *   rest:    周末/休息日
 *   makeup:  调休补班
 */
export function getDayType(date, leaveDateStrs = []) {
  const dateStr = dateToStr(date)

  // Check leave first
  if (leaveDateStrs.includes(dateStr)) return 'leave'

  // Check holiday map
  const type = holidayMap.get(dateStr)
  if (type === 'workday') return 'makeup'
  if (type === 'holiday') return 'holiday'

  // Check weekend
  const day = date.getDay()
  if (day === 0 || day === 6) return 'rest'

  return 'work'
}

/**
 * 计算今天从 00:00:00 到现在的工作秒数
 *
 * 如果今天不是工作日，返回 0。
 * 结果不超过 dailyHours * 3600。
 *
 * @param {Date} now - 当前时间
 * @param {number} dailyHours - 每日标准工时
 * @returns {number} 工作秒数
 */
export function getWorkSecondsToday(now, dailyHours) {
  if (!isWorkDay(now)) return 0

  const startOfDay = new Date(now)
  startOfDay.setHours(0, 0, 0, 0)

  const elapsedMs = now - startOfDay
  const elapsedSeconds = Math.floor(elapsedMs / 1000)

  return Math.min(elapsedSeconds, dailyHours * 3600)
}

/**
 * 返回某月的工作日总数
 *
 * @param {number} year - 年份（如 2025）
 * @param {number} month - 月份（0-indexed，0=一月，11=十二月）
 * @returns {number} 工作日数量
 */
export function getMonthWorkDays(year, month) {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  let count = 0

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d)
    if (isWorkDay(date)) count++
  }

  return count
}
