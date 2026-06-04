<script setup>
import { computed } from 'vue'
import { useSalary } from '@/composables/useSalary'
import { useLeave } from '@/composables/useLeave'
import { isWorkDay, getMonthWorkDays } from '@/utils/dateUtils'
import { calcLeaveDeduction } from '@/utils/salaryEngine'
import { getDailyQuote } from '@/data/quotes'

const { config, dailyRate, todayEarned, nowDate } = useSalary()
const { totalLeaveDaysThisMonth } = useLeave()

const quote = computed(() => getDailyQuote(nowDate.value))

const currentMonth = computed(() => nowDate.value.getMonth() + 1)
const currentYear = computed(() => nowDate.value.getFullYear())

const passedWorkDays = computed(() => {
  const y = currentYear.value
  const m = currentMonth.value
  const todayDate = nowDate.value.getDate()
  let count = 0
  for (let d = 1; d <= todayDate; d++) {
    if (isWorkDay(new Date(y, m - 1, d))) count++
  }
  return count
})

const monthlyEarned = computed(() => {
  const gross = passedWorkDays.value * dailyRate.value
  const deduction = calcLeaveDeduction(dailyRate.value, totalLeaveDaysThisMonth.value)
  return Math.max(0, gross - deduction)
})

const progressPercent = computed(() => {
  if (config.value.monthlySalary <= 0) return 0
  return (monthlyEarned.value / config.value.monthlySalary) * 100
})
</script>

<template>
  <div class="min-h-screen" style="background: #faf6f0;">
    <!-- Daily quote banner -->
    <div class="mx-8 mt-8 p-8 rounded-2xl" style="background: linear-gradient(135deg, rgba(150,100,220,0.04), rgba(200,150,100,0.02)); border: 1px solid rgba(150,100,220,0.1);">
      <div class="text-xs tracking-widest" style="color: #9a8a7a;">DAILY</div>
      <div class="text-xl italic mt-2" style="color: #4a3a2a;">&ldquo;{{ quote.text }}&rdquo;</div>
      <div class="text-sm mt-2" style="color: #9a8a7a;">&mdash; {{ quote.author }}</div>
    </div>

    <!-- Feature cards grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mx-8 mt-6">
      <!-- Salary card -->
      <div class="bg-white rounded-3xl p-8" style="box-shadow: 0 4px 24px rgba(0,0,0,0.04);">
        <div class="flex items-center gap-3 mb-6">
          <span class="text-2xl">💰</span>
          <div>
            <div class="text-sm font-medium" style="color: #3a2a1a;">工资计算器</div>
            <div class="text-xs" style="color: #9a8a7a;">实时收入追踪</div>
          </div>
        </div>
        <div class="mb-2">
          <div class="text-xs" style="color: #9a8a7a;">今日已赚</div>
          <div class="text-3xl font-bold mt-1" style="color: #3a2a1a;">¥{{ todayEarned.toFixed(2) }}</div>
        </div>
        <div class="mt-6">
          <div class="flex justify-between text-xs mb-1" style="color: #9a8a7a;">
            <span>本月进度</span>
            <span>¥{{ monthlyEarned.toFixed(0) }} / ¥{{ config.monthlySalary }}</span>
          </div>
          <div class="h-2 rounded-full" style="background: rgba(150,100,220,0.1);">
            <div class="h-full rounded-full transition-all duration-500" :style="{ width: Math.min(progressPercent, 100) + '%', background: 'linear-gradient(90deg, #a277ff, #667eea)' }"></div>
          </div>
        </div>
      </div>

      <!-- Resume card -->
      <div class="bg-white rounded-3xl p-8" style="box-shadow: 0 4px 24px rgba(0,0,0,0.04);">
        <div class="flex items-center gap-3 mb-6">
          <span class="text-2xl">📄</span>
          <div>
            <div class="text-sm font-medium" style="color: #3a2a1a;">简历管理</div>
            <div class="text-xs" style="color: #9a8a7a;">个人信息与履历</div>
          </div>
        </div>
        <div class="py-6 text-center" style="color: #9a8a7a;">
          <div class="text-4xl mb-3">📋</div>
          <div class="text-sm">简历模块即将上线</div>
          <div class="text-xs mt-1">你可在此编辑个人信息、工作经历和技能</div>
        </div>
        <div class="flex gap-3 mt-4">
          <button class="flex-1 py-2.5 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90" style="background: linear-gradient(135deg, #667eea, #a277ff);">
            编辑简历
          </button>
          <button class="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all" style="color: #667eea; border: 1px solid rgba(102,126,234,0.3); background: rgba(102,126,234,0.04);">
            导出 PDF
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
