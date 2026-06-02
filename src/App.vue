<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { useTheme } from '@/composables/useTheme'
import ThemeToggle from '@/components/ThemeToggle.vue'

const { isDark, toggleTheme } = useTheme()
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
  </div>
</template>

<style scoped>
.text-accent {
  color: var(--accent);
}
</style>
