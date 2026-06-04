<script setup>
import { computed } from 'vue'

const props = defineProps({
  entries: { type: Array, required: true },
  type: { type: String, required: true }
})

const emit = defineEmits(['edit', 'delete'])

const gradients = [
  'linear-gradient(135deg, #5a6a8a, #7a8aaa)',
  'linear-gradient(135deg, #6a7a9a, #8a9aba)',
  'linear-gradient(135deg, #4a5a7a, #6a7a9a)',
  'linear-gradient(135deg, #7a8aaa, #9aaaca)',
  'linear-gradient(135deg, #5a7a9a, #8a9aba)'
]

function getGradient(index) {
  return gradients[index % gradients.length]
}

function getInitials(entry) {
  const name = entry.company || entry.school || entry.name || ''
  return name.slice(0, 2).toUpperCase() || '?'
}

const sortedEntries = computed(() => {
  return [...props.entries].sort((a, b) => {
    const da = a.endDate || a.startDate || ''
    const db = b.endDate || b.startDate || ''
    return db.localeCompare(da)
  })
})

const typeLabels = {
  work: '工作经历',
  internship: '实习经历',
  project: '项目',
  education: '教育背景',
  skill: '技能',
  certificate: '证书',
  profile: '个人简介'
}

function formatDate(d) {
  if (!d) return '至今'
  const parts = d.split('-')
  if (parts.length === 3) {
    return `${parts[0]}.${parts[1]}`
  }
  return d
}
</script>

<template>
  <div class="timeline-section">
    <h3 class="section-label">{{ typeLabels[type] }}</h3>

    <div v-if="sortedEntries.length === 0" class="empty-state">
      暂无数据
    </div>

    <div v-for="(entry, idx) in sortedEntries" :key="entry.id" class="timeline-entry">
      <!-- Logo circle -->
      <div class="entry-logo" :style="{ background: getGradient(idx) }">
        <span class="entry-logo-text">{{ getInitials(entry) }}</span>
      </div>

      <!-- Content -->
      <div class="entry-content">
        <div class="entry-header">
          <div class="entry-title-row">
            <span class="entry-primary">
              {{ entry.company || entry.school || entry.name }}
            </span>
            <span class="entry-secondary">
              {{ entry.position || entry.degree || entry.role }}
            </span>
          </div>
          <div class="entry-dates">
            {{ formatDate(entry.startDate) }} — {{ formatDate(entry.endDate) }}
          </div>
        </div>

        <p v-if="entry.description" class="entry-desc">{{ entry.description }}</p>
        <p v-if="entry.content" class="entry-desc">{{ entry.content }}</p>
        <p v-if="entry.gpa" class="entry-desc">GPA: {{ entry.gpa }}</p>
        <p v-if="entry.issuer" class="entry-desc">{{ entry.issuer }}</p>

        <!-- Tags -->
        <div v-if="entry.tags && entry.tags.length" class="tags-row">
          <span v-for="tag in entry.tags" :key="tag" class="tag-pill">{{ tag }}</span>
        </div>

        <!-- Tech -->
        <div v-if="entry.tech && entry.tech.length" class="tags-row">
          <span v-for="t in entry.tech" :key="t" class="tag-pill">{{ t }}</span>
        </div>

        <!-- Highlights -->
        <ul v-if="entry.highlights && entry.highlights.length" class="highlights-list">
          <li v-for="(h, i) in entry.highlights" :key="i">{{ h }}</li>
        </ul>

        <!-- URL -->
        <a v-if="entry.url" :href="entry.url" target="_blank" class="entry-url" rel="noopener noreferrer">{{ entry.url }}</a>

        <!-- Actions -->
        <div class="entry-actions">
          <button class="action-btn edit-btn" @click="emit('edit', entry)">编辑</button>
          <button class="action-btn delete-btn" @click="emit('delete', entry.id)">删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.timeline-section {
  margin-bottom: 48px;
}

.section-label {
  font-family: Georgia, serif;
  font-size: 14px;
  font-weight: 700;
  color: #5a6a8a;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin: 0 0 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #d5d8de;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #8a92a0;
  font-size: 14px;
  font-style: italic;
}

.timeline-entry {
  display: flex;
  gap: 20px;
  padding: 20px 0;
  border-bottom: 1px solid #d5d8de;
}

.timeline-entry:last-child {
  border-bottom: none;
}

.entry-logo {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.entry-logo-text {
  font-family: Georgia, serif;
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  line-height: 1;
}

.entry-content {
  flex: 1;
  min-width: 0;
}

.entry-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.entry-title-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.entry-primary {
  font-family: Georgia, serif;
  font-size: 18px;
  font-weight: 700;
  color: #2a2a3a;
  line-height: 1.3;
}

.entry-secondary {
  font-size: 13px;
  font-style: italic;
  color: #5a6a8a;
}

.entry-dates {
  font-size: 12px;
  color: #8a92a0;
  white-space: nowrap;
  flex-shrink: 0;
  margin-top: 4px;
}

.entry-desc {
  font-size: 13px;
  color: #2a2a3a;
  line-height: 1.6;
  margin: 8px 0 0;
}

.tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

.tag-pill {
  display: inline-block;
  padding: 2px 10px;
  font-size: 11px;
  color: #5a6a8a;
  border: 1px solid #d5d8de;
  border-radius: 12px;
  background: #eef0f2;
}

.highlights-list {
  margin: 8px 0 0;
  padding-left: 20px;
}

.highlights-list li {
  font-size: 13px;
  color: #2a2a3a;
  line-height: 1.6;
  margin-bottom: 4px;
}

.entry-url {
  display: inline-block;
  margin-top: 8px;
  font-size: 12px;
  color: #5a6a8a;
  text-decoration: underline;
  word-break: break-all;
}

.entry-url:hover {
  color: #3a4a6a;
}

.entry-actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.action-btn {
  padding: 4px 12px;
  font-size: 11px;
  border-radius: 6px;
  border: 1px solid #d5d8de;
  background: #eef0f2;
  color: #5a6a8a;
  cursor: pointer;
  transition: all 0.15s;
}

.edit-btn:hover {
  background: #5a6a8a;
  color: #fff;
  border-color: #5a6a8a;
}

.delete-btn:hover {
  background: #c0392b;
  color: #fff;
  border-color: #c0392b;
}
</style>
