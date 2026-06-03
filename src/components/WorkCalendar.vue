<script setup>
import { computed } from 'vue'
import { isWorkDay, getDayType, getMonthWorkDays, dateToStr } from '@/utils/dateUtils'

const props = defineProps({
  year: { type: Number, default: () => new Date().getFullYear() },
  month: { type: Number, default: () => new Date().getMonth() },
  leaveRecords: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:year', 'update:month', 'add-leave', 'remove-leave'])

const WEEKDAY_LABELS = ['一', '二', '三', '四', '五', '六', '日']

const monthLabel = computed(() => `${props.year}年${props.month + 1}月`)

const today = new Date()
const todayStr = dateToStr(today)

const leaveDateStrs = computed(() => props.leaveRecords.map(r => r.date))

function prevMonth() {
  if (props.month === 0) {
    emit('update:year', props.year - 1)
    emit('update:month', 11)
  } else {
    emit('update:month', props.month - 1)
  }
}

function nextMonth() {
  if (props.month === 11) {
    emit('update:year', props.year + 1)
    emit('update:month', 0)
  } else {
    emit('update:month', props.month + 1)
  }
}

function formatDateStr(year, month, day) {
  const m = String(month + 1).padStart(2, '0')
  const d = String(day).padStart(2, '0')
  return `${year}-${m}-${d}`
}

const weeks = computed(() => {
  const { year: y, month: m } = props
  const firstDayOfWeek = new Date(y, m, 1).getDay()
  const daysInMonth = new Date(y, m + 1, 0).getDate()
  const prevMonthDays = new Date(y, m, 0).getDate()
  const startCol = (firstDayOfWeek + 6) % 7

  const grid = []
  let day = 1
  let nextMonthDay = 1

  // First week: trailing days from previous month
  const firstWeek = []
  for (let col = 0; col < startCol; col++) {
    firstWeek.push({ day: prevMonthDays - startCol + col + 1, isCurrent: false })
  }
  for (let col = startCol; col < 7 && day <= daysInMonth; col++) {
    const d = day++
    firstWeek.push({ day: d, isCurrent: true, dateStr: formatDateStr(y, m, d) })
  }
  grid.push(firstWeek)

  // Middle weeks
  while (day <= daysInMonth) {
    const week = []
    for (let col = 0; col < 7 && day <= daysInMonth; col++) {
      const d = day++
      week.push({ day: d, isCurrent: true, dateStr: formatDateStr(y, m, d) })
    }
    grid.push(week)
  }

  // Fill last week with leading days from next month
  const lastWeek = grid[grid.length - 1]
  while (lastWeek.length < 7) {
    lastWeek.push({ day: nextMonthDay++, isCurrent: false })
  }

  // Compute day type and labels for each cell
  const labelMap = { work: '班', holiday: '节', leave: '假', rest: '休', makeup: '班' }
  const subLabelMap = { makeup: '调休' }

  for (const week of grid) {
    for (const cell of week) {
      if (!cell.dateStr) {
        cell.dayType = 'other'
        cell.label = ''
        cell.subLabel = ''
        cell.isToday = false
      } else {
        const [y2, m2, d2] = cell.dateStr.split('-').map(Number)
        const dayType = getDayType(new Date(y2, m2 - 1, d2), leaveDateStrs.value)
        cell.dayType = dayType
        cell.label = labelMap[dayType] || ''
        cell.subLabel = subLabelMap[dayType] || ''
        cell.isToday = cell.dateStr === todayStr
      }
    }
  }

  return grid
})

function handleDayClick(cell) {
  if (!cell.isCurrent || !cell.dateStr) return
  if (cell.dayType === 'work' || cell.dayType === 'makeup') {
    emit('add-leave', cell.dateStr)
  } else if (cell.dayType === 'leave') {
    emit('remove-leave', cell.dateStr)
  }
}

function numberClasses(cell) {
  if (cell.isToday) return 'text-white font-bold'
  if (cell.dayType === 'work' || cell.dayType === 'makeup') return 'text-accent'
  if (cell.dayType === 'leave') return 'text-danger'
  if (cell.dayType === 'holiday') return 'text-[#d4a017]'
  if (cell.dayType === 'rest') return 'text-text-secondary'
  return ''
}

function labelClasses(cell) {
  if (cell.isToday) return 'text-white/90'
  if (cell.dayType === 'work' || cell.dayType === 'makeup') return 'text-accent'
  if (cell.dayType === 'leave') return 'text-danger'
  if (cell.dayType === 'holiday') return 'text-[#d4a017]'
  if (cell.dayType === 'rest') return 'text-text-secondary'
  return ''
}

function subLabelClasses(cell) {
  if (cell.isToday) return 'text-white/70'
  return 'opacity-60'
}

// Summary calculations
const summary = computed(() => {
  const { year: y, month: m } = props
  const daysInMonth = new Date(y, m + 1, 0).getDate()
  let workDays = 0
  let leaveDays = 0
  let restDays = 0

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(y, m, d)
    const type = getDayType(date, leaveDateStrs.value)
    if (type === 'work' || type === 'makeup') {
      workDays++
    } else if (type === 'leave') {
      leaveDays++
    } else if (type === 'rest' || type === 'holiday') {
      restDays++
    }
  }

  return { workDays, leaveDays, restDays, total: daysInMonth }
})
</script>

<template>
  <div class="work-calendar">
    <!-- Header with month navigation -->
    <div class="flex items-center justify-between mb-3">
      <button
        class="nav-btn text-text-secondary"
        @click="prevMonth"
      >&lsaquo;</button>
      <span class="text-base font-medium">{{ monthLabel }}</span>
      <button
        class="nav-btn text-text-secondary"
        @click="nextMonth"
      >&rsaquo;</button>
    </div>

    <!-- Legend -->
    <div class="flex items-center gap-3 mb-3 text-xs text-text-secondary flex-wrap">
      <span class="flex items-center gap-1">
        <span
          class="inline-flex items-center justify-center w-3.5 h-3.5 rounded text-[10px] font-semibold leading-none"
          style="background-color: rgba(0, 194, 255, 0.15); color: var(--accent);"
        >班</span>
        出勤
      </span>
      <span class="flex items-center gap-1">
        <span
          class="inline-flex items-center justify-center w-3.5 h-3.5 rounded text-[10px] font-semibold leading-none"
          style="background-color: rgba(251, 113, 133, 0.15); color: var(--danger);"
        >假</span>
        请假
      </span>
      <span class="flex items-center gap-1">
        <span
          class="inline-flex items-center justify-center w-3.5 h-3.5 rounded text-[10px] font-semibold leading-none"
          style="color: var(--text-secondary);"
        >休</span>
        休息
      </span>
      <span class="flex items-center gap-1">
        <span
          class="inline-flex items-center justify-center w-3.5 h-3.5 rounded text-[10px] font-semibold leading-none"
          style="background-color: rgba(212, 160, 23, 0.15); color: #d4a017;"
        >节</span>
        节日
      </span>
    </div>

    <!-- Weekday header row -->
    <div class="grid grid-cols-7 mb-1">
      <div
        v-for="label in WEEKDAY_LABELS"
        :key="label"
        class="text-center text-xs py-1 font-medium text-text-secondary"
      >
        {{ label }}
      </div>
    </div>

    <!-- Calendar date grid -->
    <div
      v-for="(week, wi) in weeks"
      :key="wi"
      class="grid grid-cols-7"
    >
      <div
        v-for="(cell, ci) in week"
        :key="ci"
        class="day-cell flex flex-col items-center py-1 rounded-lg cursor-default"
        :class="{
          dimmed: !cell.isCurrent,
          'is-today': cell.isToday,
          clickable: cell.isCurrent && (cell.dayType === 'work' || cell.dayType === 'makeup' || cell.dayType === 'leave')
        }"
        @click="handleDayClick(cell)"
      >
        <span
          class="text-base leading-tight"
          :class="numberClasses(cell)"
        >{{ cell.day }}</span>
        <span
          v-if="cell.label"
          class="text-xs mt-[1px] leading-tight font-semibold"
          :class="labelClasses(cell)"
        >{{ cell.label }}</span>
        <span
          v-if="cell.subLabel"
          class="text-[10px] leading-tight"
          :class="subLabelClasses(cell)"
        >{{ cell.subLabel }}</span>
      </div>
    </div>

    <!-- Summary row -->
    <div class="mt-3 pt-3 border-t border-border flex justify-around text-xs text-text-secondary">
      <span>出勤 <strong class="text-accent">{{ summary.workDays }}</strong> 天</span>
      <span>请假 <strong class="text-danger">{{ summary.leaveDays }}</strong> 天</span>
      <span>休息 <strong class="text-text-secondary font-semibold">{{ summary.restDays }}</strong> 天</span>
      <span>共 <strong>{{ summary.total }}</strong> 天</span>
    </div>
  </div>
</template>

<style scoped>
.work-calendar {
  background-color: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px;
}

.nav-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background-color 0.2s;
}
.nav-btn:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.day-cell {
  text-align: center;
  padding: 6px 2px;
  min-height: 46px;
  border-radius: 8px;
  transition: background-color 0.15s, opacity 0.15s;
  color: var(--text-primary);
}
.day-cell.dimmed {
  opacity: 0.3;
}
.day-cell.is-today {
  background: linear-gradient(135deg, #00c2ff, #0066ff);
  color: #fff;
}
.day-cell.clickable {
  cursor: pointer;
}
.day-cell.clickable:hover {
  filter: brightness(1.15);
}
</style>
