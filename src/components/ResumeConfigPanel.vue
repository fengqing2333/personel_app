<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useResumeLayout } from '../composables/useResumeLayout'
import { RESUME_THEMES } from '../data/resumeThemes'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:open'])

const { state, toggleBlock, setLayout, setTheme, resetLayout } = useResumeLayout()

const BLOCK_LABELS = {
  profile: '关于我',
  experiences: '工作经历',
  projects: '项目',
  skills: '技能',
  education: '教育',
  certificates: '证书',
  awards: '奖项',
  activities: '活动',
}

function onOverlayClick(e) {
  if (e.target === e.currentTarget) {
    emit('update:open', false)
  }
}

function onKeydown(e) {
  if (e.key === 'Escape' && props.open) {
    emit('update:open', false)
  }
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      role="dialog"
      class="config-overlay"
      @click="onOverlayClick"
    >
    <div class="config-panel">
      <header class="config-header">
        <h2 class="config-title">简历配置</h2>
        <button
          class="close-btn"
          aria-label="关闭配置面板"
          @click="emit('update:open', false)"
        >
          ✕
        </button>
      </header>

      <!-- 布局 -->
      <section class="config-section">
        <h3 class="section-title">布局</h3>
        <div class="btn-group">
          <button
            class="layout-btn"
            :class="{ active: state.layout === 'single' }"
            @click="setLayout('single')"
          >
            单栏
          </button>
          <button
            class="layout-btn"
            :class="{ active: state.layout === 'two-column' }"
            @click="setLayout('two-column')"
          >
            双栏
          </button>
        </div>
      </section>

      <!-- 区块 -->
      <section class="config-section">
        <h3 class="section-title">区块</h3>
        <div class="blocks-list">
          <div
            v-for="(block, id) in state.blocks"
            :key="id"
            class="block-row"
          >
            <span class="block-label">{{ BLOCK_LABELS[id] }}</span>
            <input
              type="checkbox"
              class="toggle-switch"
              :checked="block.visible"
              @change="toggleBlock(id)"
            />
          </div>
        </div>
      </section>

      <!-- 主题 -->
      <section class="config-section">
        <h3 class="section-title">主题</h3>
        <div class="theme-list">
          <button
            v-for="(theme, id) in RESUME_THEMES"
            :key="id"
            class="theme-btn"
            :class="{ active: state.themeId === id }"
            @click="setTheme(id)"
          >
            <span
              class="theme-dot"
              :style="{ background: theme.vars['--accent'] }"
            ></span>
            {{ theme.name }}
          </button>
        </div>
      </section>

      <!-- 重置 -->
      <button class="reset-btn" @click="resetLayout">重置</button>
    </div>
  </div>
</Teleport>
</template>

<style scoped>
.config-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: flex-end;
}

.config-panel {
  width: 20rem;
  height: 100%;
  background: var(--bg-soft);
  color: var(--text);
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

.config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.config-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: var(--muted);
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.25rem;
  line-height: 1;
}

.close-btn:hover {
  color: var(--text);
}

.config-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.section-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--muted);
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.btn-group {
  display: flex;
  gap: 0.5rem;
}

.layout-btn {
  flex: 1;
  padding: 0.5rem 1rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  background: var(--card);
  color: var(--text);
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.layout-btn.active {
  border-color: var(--accent);
  color: var(--accent);
}

.layout-btn:hover:not(.active) {
  border-color: var(--muted);
}

.blocks-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.block-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.375rem 0;
}

.block-label {
  font-size: 0.875rem;
}

.toggle-switch {
  appearance: none;
  width: 36px;
  height: 20px;
  border-radius: 10px;
  background: var(--border);
  cursor: pointer;
  position: relative;
  transition: background 0.2s;
}

.toggle-switch::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.2s;
}

.toggle-switch:checked {
  background: var(--accent);
}

.toggle-switch:checked::after {
  transform: translateX(16px);
}

.theme-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.theme-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  background: var(--card);
  color: var(--text);
  cursor: pointer;
  font-size: 0.875rem;
  text-align: left;
  transition: all 0.2s;
}

.theme-btn.active {
  border-color: var(--accent);
}

.theme-btn:hover:not(.active) {
  border-color: var(--muted);
}

.theme-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.reset-btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
  margin-top: auto;
}

.reset-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}
</style>
