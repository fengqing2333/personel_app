<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { useTheme } from '@/composables/useTheme'
import { useSalary } from '@/composables/useSalary'
import { useLeave } from '@/composables/useLeave'
import { loadHolidays } from '@/utils/dateUtils'
import holidays from '@/data/holidays'
import ThemeToggle from '@/components/ThemeToggle.vue'
import FullscreenOverlay from '@/components/FullscreenOverlay.vue'

const { isDark, toggleTheme } = useTheme()
const { todayEarned, secondRate } = useSalary()
const { loadRecords } = useLeave()

const showFullscreen = ref(false)

onMounted(() => {
  loadHolidays(holidays)
  loadRecords()
})
</script>

<template>
  <div class="min-h-screen" style="background: linear-gradient(160deg, #f0f8fe 0%, #faf5f0 40%, #f5faee 100%); color: var(--text-primary); position: relative;">
    <!-- Top decorative bar -->
    <div style="position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, #00c2ff, #0066ff, #667eea); z-index: 10; pointer-events: none;"></div>

    <!-- Background glow -->
    <div style="position: fixed; top: 80px; left: 10%; width: 300px; height: 300px; background: radial-gradient(circle, rgba(0,194,255,0.04), transparent 70%); pointer-events: none; z-index: 0;"></div>

    <header
      class="flex items-center justify-between px-6 py-4 border-b bg-bg-secondary border-border"
    >
      <nav class="flex items-center gap-6">
        <RouterLink
          to="/salary"
          class="text-sm font-medium transition-colors hover:opacity-80 text-text-secondary"
          active-class="text-accent"
        >
          工资
        </RouterLink>
        <RouterLink
          to="/management"
          class="text-sm font-medium transition-colors hover:opacity-80 text-text-secondary"
          active-class="text-accent"
        >
          管理
        </RouterLink>
      </nav>
      <div class="flex items-center gap-4">
        <ThemeToggle
          :is-dark="isDark"
          @toggle="toggleTheme"
        />
      </div>
    </header>

    <main class="p-6" style="position: relative; z-index: 1;">
      <RouterView />
    </main>

    <!-- Bottom decorative bar -->
    <div style="position: fixed; bottom: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #ffc107, #fb7185, #a277ff); opacity: 0.3; pointer-events: none; z-index: 10;"></div>

    <!-- 全屏沉浸浮动按钮 -->
    <button
      class="fullscreen-btn"
      @click="showFullscreen = true"
    >
      全屏沉浸
    </button>

    <FullscreenOverlay
      :show="showFullscreen"
      :today-earned="todayEarned"
      :second-rate="secondRate"
      @close="showFullscreen = false"
    />
  </div>
</template>

<style scoped>
.text-accent {
  color: var(--accent);
}

.fullscreen-btn {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 100;
  background: var(--accent-gradient);
  border: none;
  border-radius: 12px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 194, 255, 0.3);
  transition: opacity 0.3s ease, transform 0.2s ease;
}

.fullscreen-btn:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}
</style>
