/**
 * 工资计算引擎 - 纯函数
 *
 * 所有函数均为纯函数，不依赖外部状态，便于测试。
 */

/**
 * 计算秒薪
 * 秒薪 = 月薪 / 月计薪天数 / 每日工时 / 3600
 *
 * @param {number} monthlySalary - 月薪
 * @param {number} workDaysPerMonth - 月计薪天数
 * @param {number} dailyHours - 每日工时
 * @returns {number} 每秒薪资（元）
 */
export function calcSecondRate(monthlySalary, workDaysPerMonth, dailyHours) {
  if (monthlySalary <= 0 || workDaysPerMonth <= 0 || dailyHours <= 0) {
    return 0
  }
  return monthlySalary / workDaysPerMonth / dailyHours / 3600
}

/**
 * 计算日薪
 * 日薪 = 月薪 / 月计薪天数
 *
 * @param {number} monthlySalary - 月薪
 * @param {number} workDaysPerMonth - 月计薪天数
 * @returns {number} 日薪（元）
 */
export function calcDailyRate(monthlySalary, workDaysPerMonth) {
  if (monthlySalary <= 0 || workDaysPerMonth <= 0) {
    return 0
  }
  return monthlySalary / workDaysPerMonth
}

/**
 * 计算已赚金额
 * 已赚金额 = 秒薪 * 秒数
 *
 * @param {number} secondRate - 秒薪
 * @param {number} seconds - 经过的秒数
 * @returns {number} 已赚金额（元）
 */
export function calcEarnedBySeconds(secondRate, seconds) {
  if (secondRate <= 0 || seconds <= 0) {
    return 0
  }
  return secondRate * seconds
}

/**
 * 计算请假扣薪
 * 扣薪 = 日薪 * 天数
 *
 * @param {number} dailyRate - 日薪
 * @param {number} days - 请假天数
 * @returns {number} 扣薪金额（元）
 */
export function calcLeaveDeduction(dailyRate, days) {
  if (dailyRate <= 0 || days <= 0) {
    return 0
  }
  return dailyRate * days
}
