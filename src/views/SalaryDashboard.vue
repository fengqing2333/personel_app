<script setup>
import { computed } from 'vue'
import { useSalary } from '@/composables/useSalary'
import { useLeave } from '@/composables/useLeave'
import { isWorkDay, getMonthWorkDays } from '@/utils/dateUtils'
import { calcLeaveDeduction } from '@/utils/salaryEngine'
import LiveCounter from '@/components/LiveCounter.vue'
import StatsCards from '@/components/StatsCards.vue'
import WeeklyChart from '@/components/WeeklyChart.vue'
import SalarySettings from '@/components/SalarySettings.vue'

const { config, secondRate, dailyRate, todayEarned, now, updateConfig } = useSalary()
const { totalLeaveDaysThisMonth } = useLeave()

const currentYear = computed(() => now.value.getFullYear())
const currentMonth = computed(() => now.value.getMonth() + 1) // 1-indexed

/** Count work days passed in the current month (from 1st to today inclusive) */
const passedWorkDays = computed(() => {
  const y = currentYear.value
  const m = currentMonth.value
  const todayDate = now.value.getDate()
  let count = 0
  for (let d = 1; d <= todayDate; d++) {
    if (isWorkDay(new Date(y, m - 1, d))) count++
  }
  return count
})

/** Count remaining work days in the current month (after today) */
const remainingWorkDays = computed(() => {
  const total = getMonthWorkDays(currentYear.value, currentMonth.value - 1)
  return Math.max(0, total - passedWorkDays.value)
})

/** Monthly earned so far (net of leave deduction) */
const monthlyEarned = computed(() => {
  const gross = passedWorkDays.value * dailyRate.value
  const deduction = calcLeaveDeduction(dailyRate.value, totalLeaveDaysThisMonth.value)
  return Math.max(0, gross - deduction)
})

/** Year-to-date earned income */
const yearlyEarned = computed(() => {
  const y = currentYear.value
  const m = currentMonth.value
  let total = 0
  // Past months this year
  for (let monthIdx = 0; monthIdx < m - 1; monthIdx++) {
    total += getMonthWorkDays(y, monthIdx) * dailyRate.value
  }
  // Current month (partial)
  total += monthlyEarned.value
  return total
})

/** Progress toward monthly target as a percentage */
const progressPercent = computed(() => {
  if (config.value.monthlySalary <= 0) return 0
  return (monthlyEarned.value / config.value.monthlySalary) * 100
})

/** Year-to-date passed work days */
const yearlyPassedWorkDays = computed(() => {
  const y = currentYear.value
  const m = currentMonth.value
  const todayDate = now.value.getDate()
  let total = 0
  for (let monthIdx = 0; monthIdx < m - 1; monthIdx++) {
    total += getMonthWorkDays(y, monthIdx)
  }
  for (let d = 1; d <= todayDate; d++) {
    if (isWorkDay(new Date(y, m - 1, d))) total++
  }
  return total
})
</script>

<template>
  <div class="space-y-6">
    <LiveCounter
      :today-earned="todayEarned"
      :second-rate="secondRate"
    />

    <StatsCards
      :monthly-earned="monthlyEarned"
      :monthly-target="config.monthlySalary"
      :yearly-earned="yearlyEarned"
      :progress-percent="progressPercent"
      :remaining-work-days="remainingWorkDays"
      :passed-work-days="yearlyPassedWorkDays"
    />

    <WeeklyChart
      :today-earned="todayEarned"
      :second-rate="secondRate"
      :daily-hours="config.dailyHours"
    />

    <SalarySettings
      :config="config"
      :second-rate="secondRate"
      :daily-rate="dailyRate"
      @update-config="updateConfig"
    />
  </div>
</template>
