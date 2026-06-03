<script setup>
import { ref, computed } from 'vue'
import { useSalary } from '@/composables/useSalary'
import { useLeave } from '@/composables/useLeave'
import { isWorkDay, getMonthWorkDays } from '@/utils/dateUtils'
import WorkCalendar from '@/components/WorkCalendar.vue'
import AttendancePanel from '@/components/AttendancePanel.vue'
import SalarySettings from '@/components/SalarySettings.vue'
import LeaveSelectModal from '@/components/LeaveSelectModal.vue'

const { config, dailyRate, nowDate, secondRate, updateConfig } = useSalary()
const { records, addLeave, removeLeave, getLeaveCount } = useLeave()

const calendarYear = ref(nowDate.value.getFullYear())
const calendarMonth = ref(nowDate.value.getMonth())

const showLeaveModal = ref(false)
const pendingLeaveDate = ref('')
const showQuickLeaveModal = ref(false)

const isLastMonth = computed(() =>
  calendarYear.value < nowDate.value.getFullYear() ||
  (calendarYear.value === nowDate.value.getFullYear() && calendarMonth.value < nowDate.value.getMonth())
)
const isFutureMonth = computed(() =>
  calendarYear.value > nowDate.value.getFullYear() ||
  (calendarYear.value === nowDate.value.getFullYear() && calendarMonth.value > nowDate.value.getMonth())
)
const isCurrentMonth = computed(() =>
  calendarYear.value === nowDate.value.getFullYear() && calendarMonth.value === nowDate.value.getMonth()
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
  for (let d = 1; d <= nowDate.value.getDate(); d++) {
    if (isWorkDay(new Date(nowDate.value.getFullYear(), nowDate.value.getMonth(), d))) count++
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

function handleCalendarAddLeave(dateStr) {
  pendingLeaveDate.value = dateStr
  showLeaveModal.value = true
}

function handleLeaveSelect(type) {
  addLeave(pendingLeaveDate.value, type)
  showLeaveModal.value = false
}

function handleQuickLeaveSelect(type) {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  addLeave(`${y}-${m}-${day}`, type)
  showQuickLeaveModal.value = false
}

function handleQuickAddLeave() {
  showQuickLeaveModal.value = true
}

function handleCalendarRemoveLeave(dateStr) {
  removeLeave(dateStr)
}
</script>

<template>
  <div class="space-y-6">
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
          :attended-days="attendedDays"
          @add-leave="handleQuickAddLeave"
        />
      </div>
    </div>

    <SalarySettings
      :config="config"
      :second-rate="secondRate"
      :daily-rate="dailyRate"
      @update-config="updateConfig"
    />

    <LeaveSelectModal
      v-if="showLeaveModal"
      @select="handleLeaveSelect"
      @close="showLeaveModal = false"
    />
    <LeaveSelectModal
      v-if="showQuickLeaveModal"
      @select="handleQuickLeaveSelect"
      @close="showQuickLeaveModal = false"
    />
  </div>
</template>
