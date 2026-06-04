<script setup>
import { onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  todayEarned: {
    type: Number,
    required: true
  },
  secondRate: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['close'])

function enterFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {
      // 浏览器可能阻止全屏请求，静默忽略
    })
  }
}

function exitFullscreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen().catch(() => {
      // 静默忽略
    })
  }
}

function handleKeydown(event) {
  if (event.key === 'Escape' && props.show) {
    emit('close')
  }
}

function handleFullscreenChange() {
  // 用户通过 ESC 退出全屏时同步关闭 overlay
  if (!document.fullscreenElement && props.show) {
    emit('close')
  }
}

function handleClose() {
  exitFullscreen()
  emit('close')
}

watch(() => props.show, (val) => {
  if (val) {
    enterFullscreen()
  } else {
    exitFullscreen()
  }
})

onMounted(() => {
  if (props.show) {
    enterFullscreen()
  }
  document.addEventListener('keydown', handleKeydown)
  document.addEventListener('fullscreenchange', handleFullscreenChange)
})

onUnmounted(() => {
  exitFullscreen()
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
})
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="fullscreen-overlay">
      <button class="close-btn" @click="handleClose">
        退出
      </button>

      <div class="overlay-content">
        <div class="salary-label">今日实时工资</div>
        <div class="salary-number">¥{{ todayEarned.toFixed(2) }}</div>
        <div class="salary-rate">+¥{{ secondRate.toFixed(4) }}/秒</div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.fullscreen-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  background-color: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.close-btn {
  position: absolute;
  top: 24px;
  right: 24px;
  background: rgba(0, 194, 255, 0.1);
  border: 1px solid rgba(0, 194, 255, 0.2);
  border-radius: 8px;
  padding: 8px 20px;
  font-size: 14px;
  color: var(--accent);
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 1;
}

.close-btn:hover {
  background: rgba(0, 194, 255, 0.2);
}

.overlay-content {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.salary-label {
  font-size: 1.25rem;
  color: var(--text-secondary);
  letter-spacing: 2px;
}

.salary-number {
  font-size: clamp(3rem, 15vw, 8rem);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: 4px;
  color: var(--text-primary);
  line-height: 1.1;
}

.salary-rate {
  font-size: 1.5rem;
  color: var(--accent);
  margin-top: 12px;
}
</style>
