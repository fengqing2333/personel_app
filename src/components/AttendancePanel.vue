<script setup>
import { computed } from 'vue'

const props = defineProps({
  year: { type: Number, required: true },
  month: { type: Number, required: true },
  leaveRecords: { type: Array, default: () => [] },
  totalWorkDays: { type: Number, default: 0 },
  dailyRate: { type: Number, default: 0 },
  attendedDays: { type: Number, default: 0 }
})

const emit = defineEmits(['add-leave'])

const CIRCUMFERENCE = 2 * Math.PI * 26

const daysInMonth = computed(() => new Date(props.year, props.month + 1, 0).getDate())

const leaveCount = computed(() => {
  return props.leaveRecords.filter(r => {
    const [y, m] = r.date.split('-').map(Number)
    return y === props.year && m === props.month + 1
  }).length
})

const ratio = computed(() => {
  if (props.totalWorkDays <= 0) return 0
  return Math.min(props.attendedDays / props.totalWorkDays, 1)
})

const dashOffset = computed(() => {
  return CIRCUMFERENCE * (1 - ratio.value)
})

const restDays = computed(() => Math.max(0, daysInMonth.value - props.totalWorkDays))

const remainingDays = computed(() => {
  return Math.max(0, props.totalWorkDays - props.attendedDays - leaveCount.value)
})

const deduction = computed(() => leaveCount.value * props.dailyRate)
</script>

<template>
  <div class="attendance-panel">
    <div class="text-sm font-medium mb-4 text-text-secondary" style="font-family: Georgia, serif;">本月出勤</div>

    <!-- Donut chart -->
    <div class="flex justify-center mb-4">
      <div class="relative" style="width: 80px; height: 80px;">
        <svg width="80" height="80" viewBox="0 0 64 64">
          <circle
            cx="32" cy="32" r="26" fill="none"
            stroke="var(--border)" stroke-width="4"
          />
          <circle
            cx="32" cy="32" r="26" fill="none"
            :style="{ stroke: ratio > 0.5 ? 'var(--accent)' : 'var(--danger)' }"
            stroke-width="4"
            :stroke-dasharray="CIRCUMFERENCE"
            :stroke-dashoffset="dashOffset"
            stroke-linecap="round"
            transform="rotate(-90 32 32)"
          />
        </svg>
        <div class="absolute inset-0 flex items-center justify-center">
          <span class="text-xs font-bold text-text-primary">
            {{ attendedDays }}
            <span class="text-text-secondary">/ {{ totalWorkDays }}天</span>
          </span>
        </div>
      </div>
    </div>

    <!-- 4-grid detail -->
    <div class="grid grid-cols-4 gap-2 mb-4 text-center">
      <div>
        <div class="text-sm font-semibold text-accent">{{ attendedDays }}</div>
        <div class="text-xs text-text-secondary">出勤</div>
      </div>
      <div>
        <div class="text-sm font-semibold text-danger">{{ leaveCount }}</div>
        <div class="text-xs text-text-secondary">请假</div>
      </div>
      <div>
        <div class="text-sm font-semibold text-text-secondary">{{ restDays }}</div>
        <div class="text-xs text-text-secondary">休息</div>
      </div>
      <div>
        <div class="text-sm font-semibold text-text-secondary">{{ remainingDays }}</div>
        <div class="text-xs text-text-secondary">剩余</div>
      </div>
    </div>

    <!-- Quick leave buttons -->
    <div class="flex gap-2 mb-3">
      <button
        class="leave-btn border-accent text-accent"
        @click="emit('add-leave')"
      >+ 年假</button>
      <button
        class="leave-btn border-accent text-accent"
        @click="emit('add-leave')"
      >+ 事假</button>
      <button
        class="leave-btn border-accent text-accent"
        @click="emit('add-leave')"
      >+ 病假</button>
    </div>

    <!-- Deduction display -->
    <div
      class="text-sm"
      :class="deduction > 0 ? 'text-danger' : 'text-text-secondary'"
    >
      扣薪{{ deduction > 0 ? ' -' : ' ' }}¥{{ deduction.toFixed(2) }}
    </div>
  </div>
</template>

<style scoped>
.attendance-panel {
  background-color: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 16px;
}

.leave-btn {
  flex: 1;
  background: none;
  border: 1px solid;
  border-radius: 8px;
  padding: 6px 0;
  font-size: 0.75rem;
  cursor: pointer;
  transition: opacity 0.15s;
}
.leave-btn:hover {
  opacity: 0.7;
}
</style>
