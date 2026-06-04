<script setup>
import { ref, onMounted } from 'vue'
import { RouterView, RouterLink, useRoute } from 'vue-router'
import { useTheme } from '@/composables/useTheme'
import { useSalary } from '@/composables/useSalary'
import { useLeave } from '@/composables/useLeave'
import { loadHolidays } from '@/utils/dateUtils'
import holidays from '@/data/holidays'
import FullscreenOverlay from '@/components/FullscreenOverlay.vue'

const route = useRoute()
const { isDark, toggleTheme } = useTheme()
const { todayEarned, secondRate } = useSalary()
const { loadRecords } = useLeave()
const showFullscreen = ref(false)

onMounted(() => {
  loadHolidays(holidays)
  loadRecords()
})

const navItems = [
  { path: '/', icon: '🏠', label: '概览' },
  { path: '/salary', icon: '💰', label: '工资' },
  { path: '/management', icon: '📅', label: '管理' },
  { path: '/resume', icon: '📄', label: '简历' },
]
</script>

<template>
  <div class="flex min-h-screen" :class="{ dark: isDark }" style="background: var(--bg-primary);">
    <!-- Sidebar -->
    <aside class="flex flex-col w-[220px] shrink-0" style="background: linear-gradient(180deg, #1a0e2e, #2a1a3e);">
      <div class="px-6 pt-8 pb-8">
        <div class="text-sm font-semibold tracking-[2px]" style="color: rgba(255,255,255,0.5);">PORTAL</div>
      </div>
      <nav class="flex flex-col gap-1 px-3">
        <RouterLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all"
          :class="route.path === item.path
            ? 'bg-white/10 text-white font-medium'
            : 'text-white/35 hover:text-white/60'"
        >
          <span>{{ item.icon }}</span>
          {{ item.label }}
        </RouterLink>
      </nav>
      <div class="mt-auto px-6 pb-6">
        <button @click="toggleTheme" class="text-xs" style="color: rgba(255,255,255,0.3);">
          {{ isDark ? '☀️ 亮色' : '🌙 暗色' }}
        </button>
      </div>
    </aside>

    <!-- Main content area -->
    <main class="flex-1 overflow-auto" style="position: relative; z-index: 1;">
      <!-- Top decorative bar -->
      <div style="position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, #5a6a8a, #4a5a7a, #6a7a9a); z-index: 10; pointer-events: none;"></div>

      <!-- Background glow -->
      <div style="position: fixed; top: 80px; left: 10%; width: 300px; height: 300px; background: radial-gradient(circle, rgba(90,106,138,0.06), transparent 70%); pointer-events: none; z-index: 0;"></div>

      <div class="p-6">
        <RouterView />
      </div>

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
    </main>
  </div>
</template>

<style scoped>
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
  box-shadow: 0 4px 16px rgba(90, 106, 138, 0.3);
  transition: opacity 0.3s ease, transform 0.2s ease;
}

.fullscreen-btn:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}
</style>
