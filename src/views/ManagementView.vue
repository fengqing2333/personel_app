<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSalary } from '@/composables/useSalary'
import { useLeave } from '@/composables/useLeave'
import { loadHolidays, isWorkDay, getMonthWorkDays } from '@/utils/dateUtils'
import holidays from '@/data/holidays'
import WorkCalendar from '@/components/WorkCalendar.vue'
import AttendancePanel from '@/components/AttendancePanel.vue'

onMounted(() => {
  loadHolidays(holidays)
})

const { config, dailyRate, now } = useSalary()
const { records, addLeave, removeLeave, getLeaveCount } = useLeave()

const calendarYear = ref(now.value.getFullYear())
const calendarMonth = ref(now.value.getMonth())

const isLastMonth = computed(() =>
  calendarYear.value < now.value.getFullYear() ||
  (calendarYear.value === now.value.getFullYear() && calendarMonth.value < now.value.getMonth())
)
const isFutureMonth = computed(() =>
  calendarYear.value > now.value.getFullYear() ||
  (calendarYear.value === now.value.getFullYear() && calendarMonth.value > now.value.getMonth())
)
const isCurrentMonth = computed(() =>
  calendarYear.value === now.value.getFullYear() && calendarMonth.value === now.value.getMonth()
)

const daysInMonth = computed(() =>
  new Date(calendarYear.value, calendarMonth.value + 1, 0).getDate()
)
const totalWorkDays = computed(() =>
  getMonthWorkDays(calendarYear.value, calendarMonth.value)
)

const leaveCount = computed(() =>
  getLeaveCount(calendarYear.value, calendarMonth.value + 1)
)

const passedWorkDays = computed(() => {
  if (isLastMonth.value) return totalWorkDays.value
  if (isFutureMonth.value) return 0
  let count = 0
  for (let d = 1; d <= now.value.getDate(); d++) {
    if (isWorkDay(new Date(now.value.getFullYear(), now.value.getMonth(), d))) count++
  }
  return count
})

const attendedDays = computed(() =>
  Math.max(0, passedWorkDays.value - leaveCount.value)
)

const remainingDays = computed(() =>
  Math.max(0, totalWorkDays.value - passedWorkDays.value)
)

const deduction = computed(() =>
  leaveCount.value * dailyRate.value
)

const monthlyEarnedVal = computed(() =>
  Math.max(0, attendedDays.value * dailyRate.value)
)

function handleCalendarAddLeave(dateStr) {
  const input = window.prompt('请假类型：\n1 = 年假\n2 = 事假\n3 = 病假', '2')
  if (input === null) return
  const trimmed = input.trim()
  const typeMap = { '1': 'annual', '2': 'personal', '3': 'sick' }
  if (typeMap[trimmed]) {
    addLeave(dateStr, typeMap[trimmed])
  }
}

function handleQuickAddLeave(type) {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  addLeave(`${y}-${m}-${day}`, type)
}

function handleCalendarRemoveLeave(dateStr) {
  removeLeave(dateStr)
}
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
    <div class="lg:col-span-3">
      <WorkCalendar
        :year="calendarYear"
        :month="calendarMonth"
        :leave-records="records"
        @update:year="calendarYear = $event"
        @update:month="calendarMonth = $event"
        @add-leave="handleCalendarAddLeave"
        @remove-leave="handleCalendarRemoveLeave"
      />
    </div>
    <div class="lg:col-span-2">
      <AttendancePanel
        :year="calendarYear"
        :month="calendarMonth"
        :leave-records="records"
        :total-work-days="totalWorkDays"
        :daily-rate="dailyRate"
        :monthly-earned="monthlyEarnedVal"
        @add-leave="handleQuickAddLeave"
      />
    </div>
  </div>
</template>
