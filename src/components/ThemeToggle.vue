<script setup>
defineProps({
  isDark: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['toggle'])

function handleClick() {
  emit('toggle')
}
</script>

<template>
  <button
    class="theme-toggle"
    :title="isDark ? '切换亮色模式' : '切换暗色模式'"
    @click="handleClick"
  >
    <span class="theme-icon">{{ isDark ? '☀️' : '🌙' }}</span>
    <span class="theme-label" style="color: var(--text-secondary);">
      {{ isDark ? '亮色' : '暗色' }}
    </span>
  </button>
</template>

<style scoped>
.theme-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(0, 194, 255, 0.1);
  border: 1px solid rgba(0, 194, 255, 0.2);
  border-radius: 20px;
  padding: 6px 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.theme-toggle:hover {
  background: rgba(0, 194, 255, 0.2);
}

.theme-icon {
  font-size: 16px;
  line-height: 1;
  transition: transform 0.3s ease;
}

.theme-toggle:hover .theme-icon {
  transform: scale(1.15);
}

.theme-label {
  font-size: 12px;
}
</style>
