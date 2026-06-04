<script setup>
import { computed } from 'vue'
import { isWorkDay } from '../utils/dateUtils'

const props = defineProps({
  todayEarned: { type: Number, required: true },
  secondRate: { type: Number, required: true },
  dailyHours: { type: Number, required: true }
})

const DAY_LABELS = ['一', '二', '三', '四', '五', '六', '日']

const maxDailyEarnings = computed(() => props.secondRate * props.dailyHours * 3600)

const weekDays = computed(() => {
  const now = new Date()
  const dayOfWeek = now.getDay()

  // Monday of current week (at midnight)
  const monday = new Date(now)
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
  monday.setHours(0, 0, 0, 0)

  // Today at midnight
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  // Monday-Friday index of today (0=Mon, 4=Fri), defaults to -1 for weekends
  const todayMonFriIndex = (dayOfWeek >= 1 && dayOfWeek <= 5) ? dayOfWeek - 1 : -1

  const maxDaily = maxDailyEarnings.value

  const days = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday)
    date.setDate(monday.getDate() + i)

    const dayOfWeekNum = date.getDay()
    const isToday = date.getTime() === todayStart.getTime()
    const workday = isWorkDay(date)
    const isWeekend = dayOfWeekNum === 0 || dayOfWeekNum === 6

    // Calculate earnings
    let earnings = 0
    if (workday && date.getTime() <= todayStart.getTime()) {
      if (isToday) {
        earnings = props.todayEarned
      } else {
        earnings = maxDaily
      }
    }

    // Opacity for Mon-Fri
    let opacity = 0.2
    const monFriIndex = dayOfWeekNum >= 1 && dayOfWeekNum <= 5 ? dayOfWeekNum - 1 : -1

    if (monFriIndex >= 0 && todayMonFriIndex >= 0) {
      if (monFriIndex === todayMonFriIndex) {
        opacity = 1.0
      } else if (monFriIndex < todayMonFriIndex) {
        // Past days in current work week: gradient from 0.4 at Monday
        const distance = todayMonFriIndex - monFriIndex
        opacity = Math.max(0.4, 1.0 - distance * 0.15)
      } else {
        // Future days in current work week
        opacity = 0.2
      }
    } else if (monFriIndex >= 0 && todayMonFriIndex < 0) {
      // Today is weekend, all Mon-Fri are in the past
      opacity = 1.0 - (4 - monFriIndex) * 0.15
    }

    days.push({
      label: DAY_LABELS[i],
      earnings,
      isToday,
      isWeekend,
      isWorkday: workday,
      opacity,
      heightPercent: maxDaily > 0 ? Math.min(earnings / maxDaily * 100, 100) : 0
    })
  }

  return days
})

const totalWeeklyEarned = computed(() =>
  weekDays.value.reduce((sum, d) => sum + d.earnings, 0)
)
</script>

<template>
  <div class="weekly-chart">
    <div class="flex justify-between items-center mb-3">
      <span class="text-xs font-medium text-text-secondary" style="font-family: Georgia, serif;">本周</span>
      <span class="text-xs text-text-secondary">
        累计: ¥{{ totalWeeklyEarned.toFixed(0) }}
      </span>
    </div>
    <div class="flex items-end justify-between gap-1" style="height: 120px;">
      <div
        v-for="(day, index) in weekDays"
        :key="index"
        class="flex flex-col items-center flex-1 self-stretch"
      >
        <div class="flex-1 w-full flex items-end justify-center">
          <div
            v-if="day.isWeekend"
            class="weekend-placeholder"
          ></div>
          <div
            v-else
            class="bar"
            :style="{
              height: Math.max(day.heightPercent, 4) + '%',
              opacity: day.opacity
            }"
          ></div>
        </div>
        <span
          class="text-xs pt-1"
          :class="day.isToday ? 'text-accent' : 'text-text-secondary'"
        >
          {{ day.label }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.weekly-chart {
  background-color: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 16px;
}
.bar {
  width: 100%;
  max-width: 28px;
  border-radius: 4px 4px 0 0;
  background: var(--accent);
  transition: height 0.3s ease;
  min-height: 2px;
}
.weekend-placeholder {
  width: 100%;
  max-width: 28px;
  height: 40px;
  border: 1px dashed var(--border);
  border-radius: 4px;
}
</style>
