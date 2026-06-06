<script setup>
import { ref, computed } from 'vue'
import { getLogoStyle } from '../data/resumeLogos.js'
import ResumeSectionHeader from './ResumeSectionHeader.vue'
import InlineEdit from './InlineEdit.vue'

const props = defineProps({
  label: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: ''
  },
  items: {
    type: Array,
    default: () => []
  },
  itemType: {
    type: String,
    default: 'experience'
  },
  collapsible: {
    type: Boolean,
    default: false
  },
  editable: {
    type: Boolean,
    default: true
  },
  hideable: {
    type: Boolean,
    default: false
  },
  hidden: {
    type: Boolean,
    default: false
  },
  draggable: {
    type: Boolean,
    default: false
  },
  resettable: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update', 'toggle-visible', 'drag-start', 'keymove', 'reset-order'])

const expanded = ref(false)

const displayItems = computed(() => {
  if (!props.collapsible || expanded.value) return props.items
  return props.items.slice(0, 3)
})

const hasMore = computed(() => {
  return props.collapsible && props.items.length > 3
})

const collapsibleLabel = computed(() => {
  return expanded.value ? '收起' : `展开全部 (${props.items.length})`
})

function emitUpdate(id, field, value) {
  emit('update', { id, field, value })
}

function emitAchievementUpdate(itemId, idx, value, achievements) {
  // 用新 value 覆盖第 idx 个成就,整体作为 achievements 字段更新
  const next = achievements.slice()
  next[idx] = value
  emit('update', { id: itemId, field: 'achievements', value: next })
}
</script>

<template>
  <section>
    <ResumeSectionHeader
      v-if="label && title"
      :label="label"
      :title="title"
      :hideable="hideable"
      :hidden="hidden"
      :draggable="draggable"
      :resettable="resettable"
      @toggle-visible="emit('toggle-visible')"
      @drag-start="emit('drag-start')"
      @keymove="emit('keymove', $event)"
      @reset-order="emit('reset-order')"
    />

    <div
      v-if="items.length === 0"
      class="text-sm"
      style="color: var(--muted); padding-left: 3rem;"
    >
      暂无{{ title }}
    </div>

    <div v-else class="timeline-axis">
      <div
        v-for="(item, index) in displayItems"
        :key="item.id"
        class="timeline-item"
      >
        <!-- Marker dot -->
        <div class="timeline-marker" />

        <!-- Logo -->
        <div
          class="timeline-logo"
          :style="{
            background: getLogoStyle(item.company || item.school || '').bg,
            color: getLogoStyle(item.company || item.school || '').fg
          }"
        >
          {{ getLogoStyle(item.company || item.school || '').char }}
        </div>

        <!-- Content -->
        <div class="timeline-content">
          <div class="flex items-start justify-between gap-4">
            <div>
              <h3 class="timeline-company">
                <InlineEdit
                  v-if="editable"
                  :model-value="itemType === 'education' ? (item.school || '') : (item.company || '')"
                  :placeholder="itemType === 'education' ? '学校名称' : '公司名称'"
                  :aria-label="itemType === 'education' ? '编辑学校名称' : '编辑公司名称'"
                  @update:model-value="emitUpdate(item.id, itemType === 'education' ? 'school' : 'company', $event)"
                />
                <template v-else>{{ itemType === 'education' ? item.school : item.company }}</template>
                <span v-if="item.type === 'internship'" class="internship-badge">实习</span>
              </h3>
              <p class="timeline-role">
                <InlineEdit
                  v-if="editable"
                  :model-value="itemType === 'education' ? (item.degree || '') : (item.position || '')"
                  :placeholder="itemType === 'education' ? '学位 / 专业' : '职位'"
                  :aria-label="itemType === 'education' ? '编辑学位' : '编辑职位'"
                  @update:model-value="emitUpdate(item.id, itemType === 'education' ? 'degree' : 'position', $event)"
                />
                <template v-else>{{ itemType === 'education' ? item.degree : item.position }}</template>
              </p>
            </div>
            <span
              v-if="item.startDate"
              class="timeline-date"
            >
              {{ item.startDate }}<template v-if="item.endDate"> — {{ item.endDate }}</template>
              <template v-else> — 至今</template>
            </span>
          </div>

          <ul
            v-if="item.achievements && item.achievements.length"
            class="timeline-achievements"
          >
            <li
              v-for="(ach, i) in item.achievements"
              :key="i"
              class="timeline-bullet"
            >
              <InlineEdit
                v-if="editable"
                multiline
                :model-value="ach"
                placeholder="一条成就"
                :aria-label="`编辑成就 ${i + 1}`"
                @update:model-value="emitAchievementUpdate(item.id, i, $event, item.achievements)"
              />
              <template v-else>{{ ach }}</template>
            </li>
          </ul>

          <p
            v-else
            class="text-sm leading-relaxed"
            style="color: var(--muted)"
          >
            <InlineEdit
              v-if="editable"
              multiline
              :model-value="item.description || ''"
              placeholder="一段描述"
              aria-label="编辑描述"
              @update:model-value="emitUpdate(item.id, 'description', $event)"
            />
            <template v-else>{{ item.description }}</template>
          </p>
        </div>
      </div>

      <!-- Expand/collapse button -->
      <button
        v-if="hasMore"
        type="button"
        class="timeline-expand-btn"
        @click="expanded = !expanded"
      >
        {{ collapsibleLabel }}
      </button>
    </div>
  </section>
</template>

<style scoped>
.timeline-axis {
  position: relative;
  border-left: 1px solid var(--border);
  padding-left: 3rem;
}

.timeline-item {
  position: relative;
  padding-bottom: 2.5rem;
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.timeline-item:last-child {
  padding-bottom: 0;
}

.timeline-marker {
  position: absolute;
  left: calc(-3rem - 11px);
  top: 4px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 3px solid var(--bg);
  background: var(--accent);
  z-index: 1;
}

.timeline-logo {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
  margin-top: 2px;
}

.timeline-content {
  flex: 1;
  min-width: 0;
}

.timeline-company {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 0.125rem;
}

.timeline-role {
  font-size: 0.875rem;
  color: var(--accent);
  margin: 0;
}

.timeline-date {
  font-size: 12px;
  color: var(--muted);
  white-space: nowrap;
  flex-shrink: 0;
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
  background: var(--bg-soft);
}

.timeline-achievements {
  list-style: none;
  padding: 0;
  margin: 0.75rem 0 0;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.timeline-bullet {
  position: relative;
  padding-left: 1rem;
  font-size: 13px;
  line-height: 1.6;
  color: var(--muted);
}

.timeline-bullet::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--accent);
  font-weight: 700;
}

.internship-badge {
  display: inline-block;
  padding: 1px 6px;
  font-size: 11px;
  font-weight: 500;
  color: var(--accent);
  background: color-mix(in srgb, var(--accent) 15%, transparent);
  border-radius: 3px;
  margin-left: 6px;
  vertical-align: middle;
}

.timeline-expand-btn {
  background: none;
  border: none;
  color: var(--accent-soft);
  font-size: 13px;
  cursor: pointer;
  padding: 0.5rem 0;
  transition: color 0.15s;
  margin-top: 0;
}

.timeline-expand-btn:hover {
  color: var(--accent);
}
</style>
