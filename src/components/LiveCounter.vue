<script setup>
defineProps({
  todayEarned: { type: Number, required: true },
  secondRate: { type: Number, required: true }
})
</script>

<template>
  <div class="text-center">
    <div class="flex justify-center items-center gap-2 mb-2">
      <span style="color: var(--text-secondary);" class="text-sm">今日实时工资</span>
      <span class="live-badge">LIVE</span>
    </div>
    <div class="salary-number">¥{{ todayEarned.toFixed(2) }}</div>
    <div class="text-sm mt-1" style="color: var(--accent);">+¥{{ secondRate.toFixed(4) }}/秒</div>
  </div>
</template>

<style scoped>
.salary-number {
  font-size: 3.25rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: 2px;
  color: #fff;
}
.live-badge {
  background: rgba(0, 194, 255, 0.1);
  border: 1px solid rgba(0, 194, 255, 0.2);
  border-radius: 20px;
  padding: 2px 10px;
  font-size: 10px;
  color: #00c2ff;
  display: flex;
  align-items: center;
  gap: 4px;
}
.live-badge::before {
  content: '';
  width: 5px;
  height: 5px;
  background: #00c2ff;
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
</style>
