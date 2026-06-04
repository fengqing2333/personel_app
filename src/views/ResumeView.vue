<script setup>
import { ref, computed } from 'vue'
import { useResume } from '@/composables/useResume'
import ResumeTimeline from '@/components/ResumeTimeline.vue'
import ResumeForm from '@/components/ResumeForm.vue'

const {
  data, stats, allEntries,
  addEntry, updateEntry, removeEntry, getAll
} = useResume()

const showForm = ref(false)
const formType = ref('work')
const editEntry = ref(null)

const typeLabels = {
  work: '工作经历',
  internship: '实习经历',
  project: '项目',
  education: '教育背景',
  skill: '技能',
  certificate: '证书',
  profile: '个人简介'
}

const orderedTypes = ['work', 'internship', 'project', 'education', 'skill', 'certificate', 'profile']

const totalEntries = computed(() => {
  return orderedTypes.reduce((sum, t) => sum + (stats.value[t] || 0), 0)
})

function openAdd(type) {
  formType.value = type
  editEntry.value = null
  showForm.value = true
}

function openEdit(type, entry) {
  formType.value = type
  editEntry.value = { ...entry }
  showForm.value = true
}

function handleSave(formData) {
  if (editEntry.value) {
    updateEntry(formType.value, editEntry.value.id, formData)
  } else {
    addEntry(formType.value, formData)
  }
  showForm.value = false
  editEntry.value = null
}

function handleDelete(type, id) {
  removeEntry(type, id)
}

function getAllByType(type) {
  return getAll(type)
}
</script>

<template>
  <div class="resume-layout">
    <!-- Left sidebar -->
    <aside class="resume-sidebar">
      <!-- Logo circle -->
      <div class="sidebar-logo">
        <span class="sidebar-logo-text">P</span>
      </div>

      <h1 class="sidebar-name">个人简历</h1>
      <p class="sidebar-title">Personal Portal</p>

      <div class="sidebar-divider"></div>

      <!-- Stats -->
      <div class="sidebar-stats">
        <div v-for="t in orderedTypes" :key="t" class="stat-row">
          <span class="stat-label">{{ typeLabels[t] }}</span>
          <span class="stat-count">{{ stats[t] || 0 }}</span>
        </div>
        <div class="stat-row total-row">
          <span class="stat-label">总计</span>
          <span class="stat-count">{{ totalEntries }}</span>
        </div>
      </div>

      <div class="sidebar-divider"></div>

      <!-- Quick add buttons -->
      <div class="sidebar-actions">
        <button
          v-for="t in orderedTypes"
          :key="t"
          class="sidebar-add-btn"
          @click="openAdd(t)"
        >
          + {{ typeLabels[t] }}
        </button>
      </div>
    </aside>

    <!-- Main timeline area -->
    <main class="resume-main">
      <div class="resume-header">
        <h2 class="resume-title">职业时间线</h2>
        <p class="resume-subtitle">Personal Career Timeline</p>
      </div>

      <div v-if="totalEntries === 0" class="empty-state">
        <div class="empty-icon">&#128203;</div>
        <p>尚无简历数据</p>
        <p class="empty-hint">点击左侧按钮添加你的经历</p>
      </div>

      <div v-for="t in orderedTypes" :key="t" class="timeline-wrapper">
        <ResumeTimeline
          :entries="getAllByType(t)"
          :type="t"
          @edit="(entry) => openEdit(t, entry)"
          @delete="(id) => handleDelete(t, id)"
        />
      </div>
    </main>

    <!-- Form modal -->
    <ResumeForm
      :show="showForm"
      :type="formType"
      :edit-entry="editEntry"
      @save="handleSave"
      @close="showForm = false"
    />
  </div>
</template>

<style scoped>
.resume-layout {
  display: flex;
  min-height: calc(100vh - 48px);
  gap: 0;
  background: #eef0f2;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Sidebar */
.resume-sidebar {
  width: 220px;
  flex-shrink: 0;
  padding: 48px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: sticky;
  top: 0;
  align-self: flex-start;
  max-height: calc(100vh - 48px);
  overflow-y: auto;
}

.sidebar-logo {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  background: #5a6a8a;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  flex-shrink: 0;
}

.sidebar-logo-text {
  font-family: Georgia, serif;
  font-size: 36px;
  font-weight: 700;
  color: #fff;
  line-height: 1;
}

.sidebar-name {
  font-family: Georgia, serif;
  font-size: 22px;
  font-weight: 700;
  color: #2a2a3a;
  margin: 0;
  text-align: center;
  line-height: 1.3;
}

.sidebar-title {
  font-size: 11px;
  color: #8a92a0;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin: 6px 0 0;
}

.sidebar-divider {
  width: 60%;
  height: 1px;
  background: #d5d8de;
  margin: 24px 0;
}

.sidebar-stats {
  width: 100%;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 12px;
}

.stat-label {
  color: #5a6a8a;
}

.stat-count {
  color: #2a2a3a;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.total-row {
  border-top: 1px solid #d5d8de;
  margin-top: 4px;
  padding-top: 10px;
}

.sidebar-actions {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sidebar-add-btn {
  width: 100%;
  padding: 6px 12px;
  font-size: 11px;
  text-align: left;
  background: none;
  border: 1px dashed #d5d8de;
  border-radius: 6px;
  color: #5a6a8a;
  cursor: pointer;
  transition: all 0.15s;
}

.sidebar-add-btn:hover {
  background: #e4e6ea;
  border-color: #5a6a8a;
  border-style: solid;
}

/* Main area */
.resume-main {
  flex: 1;
  padding: 48px;
  background: #eef0f2;
  max-width: 900px;
}

.resume-header {
  margin-bottom: 40px;
}

.resume-title {
  font-family: Georgia, serif;
  font-size: 28px;
  font-weight: 700;
  color: #2a2a3a;
  margin: 0;
}

.resume-subtitle {
  font-size: 12px;
  color: #8a92a0;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin: 6px 0 0;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #8a92a0;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state p {
  font-size: 16px;
  margin: 4px 0;
}

.empty-hint {
  font-size: 13px !important;
  color: #8a92a0;
  font-style: italic;
}

.timeline-wrapper {
  background: #e4e6ea;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
}

.timeline-wrapper:last-child {
  margin-bottom: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .resume-layout {
    flex-direction: column;
  }

  .resume-sidebar {
    width: 100%;
    position: static;
    max-height: none;
    padding: 32px 24px;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    gap: 12px;
  }

  .sidebar-logo { margin-bottom: 0; }
  .sidebar-name, .sidebar-title { display: none; }
  .sidebar-divider { display: none; }
  .sidebar-stats { display: none; }

  .sidebar-actions {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
  }

  .sidebar-add-btn {
    width: auto;
  }

  .resume-main {
    padding: 24px 16px;
  }

  .timeline-wrapper {
    padding: 16px;
  }
}
</style>
