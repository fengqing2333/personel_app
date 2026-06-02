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
  <div
    class="min-h-screen"
    :class="{ dark: isDark }"
    style="background-color: var(--bg-primary); color: var(--text-primary);"
  >
    <header
      class="flex items-center justify-between px-6 py-4 border-b"
      style="background-color: var(--bg-secondary); border-color: var(--border);"
    >
      <nav class="flex items-center gap-6">
        <RouterLink
          to="/salary"
          class="text-sm font-medium transition-colors hover:opacity-80"
          style="color: var(--text-secondary);"
          active-class="text-accent"
        >
          工资
        </RouterLink>
        <RouterLink
          to="/management"
          class="text-sm font-medium transition-colors hover:opacity-80"
          style="color: var(--text-secondary);"
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

    <main class="p-6">
      <RouterView />
    </main>

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
