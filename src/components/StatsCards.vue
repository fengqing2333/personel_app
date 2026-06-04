<script setup>
defineProps({
  monthlyEarned: { type: Number, required: true },
  monthlyTarget: { type: Number, required: true },
  yearlyEarned: { type: Number, required: true },
  progressPercent: { type: Number, required: true },
  remainingWorkDays: { type: Number, required: true },
  passedWorkDays: { type: Number, required: true }
})
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <!-- 本月已赚 -->
    <div class="card">
      <div class="text-xs mb-2 text-text-secondary">本月已赚</div>
      <div class="stat-value">¥{{ Math.round(monthlyEarned).toLocaleString() }}</div>
      <div class="progress-bar mt-3">
        <div
          class="progress-fill"
          :style="{ width: Math.min(progressPercent, 100) + '%' }"
        ></div>
      </div>
      <div class="text-xs mt-1 text-accent">{{ progressPercent.toFixed(1) }}%</div>
    </div>

    <!-- 本月目标 -->
    <div class="card">
      <div class="text-xs mb-2 text-text-secondary">本月目标</div>
      <div class="stat-value">¥{{ Math.round(monthlyTarget).toLocaleString() }}</div>
      <div class="text-xs mt-2 text-text-secondary">剩余 {{ remainingWorkDays }} 个工作日</div>
    </div>

    <!-- 年度累计 -->
    <div class="card">
      <div class="text-xs mb-2 text-text-secondary">年度累计</div>
      <div class="stat-value">¥{{ Math.round(yearlyEarned).toLocaleString() }}</div>
      <div class="text-xs mt-2 text-text-secondary">已过 {{ passedWorkDays }} 个工作日</div>
    </div>
  </div>
</template>

<style scoped>
.card {
  background-color: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 16px;
}
.stat-value {
  font-size: 1.5rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  color: var(--text-primary);
}
.progress-bar {
  width: 100%;
  height: 4px;
  background-color: var(--border);
  border-radius: 2px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: var(--accent);
  border-radius: 2px;
  transition: width 0.5s ease;
}
</style>
