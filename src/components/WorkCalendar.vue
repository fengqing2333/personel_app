<script setup>
import { computed } from 'vue'
import { isWorkDay } from '@/utils/dateUtils'

const props = defineProps({
  year: { type: Number, default: () => new Date().getFullYear() },
  month: { type: Number, default: () => new Date().getMonth() },
  leaveRecords: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:year', 'update:month', 'add-leave', 'remove-leave'])

const WEEKDAY_LABELS = ['一', '二', '三', '四', '五', '六', '日']

const monthLabel = computed(() => `${props.year}年${props.month + 1}月`)

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

  // Compute day type for each cell
  for (const week of grid) {
    for (const cell of week) {
      if (!cell.dateStr) {
        cell.type = 'other'
      } else if (props.leaveRecords.some(r => r.date === cell.dateStr)) {
        cell.type = 'leave'
      } else {
        const [y, m, d] = cell.dateStr.split('-').map(Number)
        cell.type = isWorkDay(new Date(y, m - 1, d)) ? 'work' : 'rest'
      }
    }
  }

  return grid
})

function handleDayClick(cell) {
  if (!cell.isCurrent || !cell.dateStr) return
  if (cell.type === 'work') {
    emit('add-leave', cell.dateStr)
  } else if (cell.type === 'leave') {
    emit('remove-leave', cell.dateStr)
  }
}
</script>

<template>
  <div class="work-calendar">
    <!-- Header with month navigation -->
    <div class="flex items-center justify-between mb-3">
      <button
        class="nav-btn"
        style="color: var(--text-secondary);"
        @click="prevMonth"
      >&lsaquo;</button>
      <span class="text-base font-medium">{{ monthLabel }}</span>
      <button
        class="nav-btn"
        style="color: var(--text-secondary);"
        @click="nextMonth"
      >&rsaquo;</button>
    </div>

    <!-- Legend -->
    <div class="flex items-center gap-4 mb-3 text-xs" style="color: var(--text-secondary);">
      <span class="flex items-center gap-1">
        <span class="inline-block w-2 h-2 rounded-full" style="background: var(--accent);"></span>
        工作
      </span>
      <span class="flex items-center gap-1">
        <span class="inline-block w-2 h-2 rounded-full" style="background: var(--danger);"></span>
        请假
      </span>
      <span class="flex items-center gap-1">
        <span class="inline-block w-2 h-2 rounded-full" style="background: var(--text-secondary);"></span>
        休息
      </span>
    </div>

    <!-- Weekday header row -->
    <div class="grid grid-cols-7 mb-1">
      <div
        v-for="label in WEEKDAY_LABELS"
        :key="label"
        class="text-center text-xs py-1 font-medium"
        style="color: var(--text-secondary);"
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
        class="day-cell"
        :class="{
          dimmed: !cell.isCurrent,
          'is-work': cell.type === 'work',
          'is-leave': cell.type === 'leave',
          'is-rest': cell.type === 'rest',
          clickable: cell.isCurrent && (cell.type === 'work' || cell.type === 'leave')
        }"
        @click="handleDayClick(cell)"
      >
        {{ cell.day }}
      </div>
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
  padding: 6px 0;
  font-size: 0.8125rem;
  border-radius: 6px;
  transition: background-color 0.15s, opacity 0.15s;
  color: var(--text-primary);
}
.day-cell.dimmed {
  opacity: 0.3;
}
.day-cell.is-work {
  background-color: rgba(0, 194, 255, 0.1);
  color: var(--accent);
}
.day-cell.is-leave {
  background-color: rgba(251, 113, 133, 0.1);
  color: var(--danger);
}
.day-cell.is-rest {
  color: var(--text-secondary);
}
.day-cell.clickable {
  cursor: pointer;
}
.day-cell.clickable:hover {
  filter: brightness(1.2);
}
</style>
