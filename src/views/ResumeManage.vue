<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useResume } from '@/composables/useResume'
import { useToast } from '@/composables/useToast'
import { useDragSort } from '@/composables/useDragSort'
import ResumeTimeline from '@/components/ResumeTimeline.vue'
import ResumeForm from '@/components/ResumeForm.vue'
import { downloadBackup, importAll } from '@/storage/backup'

const resume = useResume()
const { entries, getByType, add, update, remove, undoRemove, commitRemoval, setManualOrder, clearManualOrder } = resume
const { pushToast } = useToast()

const activeType = ref('work')
const showForm = ref(false)
const editingEntry = ref(null)
const focusedGroup = ref(null)

// 安全获取 route（测试环境可能无 router 插件）
let route = useRoute()
if (!route) {
  route = { query: {} }
}

const typeOptions = [
  { key: 'work', label: '工作经历', icon: '💼' },
  { key: 'internship', label: '实习经历', icon: '📋' },
  { key: 'project', label: '项目经验', icon: '🚀' },
  { key: 'education', label: '教育背景', icon: '🎓' },
  { key: 'skill', label: '技能', icon: '⚡' },
  { key: 'certificate', label: '证书', icon: '🏅' },
  { key: 'profile', label: '个人资料', icon: '👤' }
]

const filteredEntries = computed(() => getByType(activeType.value))

const { draggingId: entryDraggingId, onDragStart: entryOnDragStart, onDragOver: entryOnDragOver, onDrop: entryOnDrop, onKeyMove: entryOnKeyMove } = useDragSort({
  items: filteredEntries,
  onReorder(orderedIds) {
    setManualOrder(activeType.value, orderedIds)
  }
})

function handleAdd() {
  editingEntry.value = null
  showForm.value = true
}

function handleEdit(entry) {
  editingEntry.value = entry
  showForm.value = true
}

/** focus query param → activeType 映射 */
const FOCUS_TO_TYPE = {
  work: 'work',
  education: 'education',
  project: 'project',
  skill: 'skill',
  certificate: 'certificate',
  award: 'certificate',  // 奖项归入证书 tab
  activity: 'certificate', // 活动归入证书 tab
}

/** entry type → 中文名 */
const TYPE_LABELS = {
  work: '工作经历',
  internship: '实习经历',
  project: '项目经验',
  education: '教育背景',
  skill: '技能',
  certificate: '证书',
  profile: '个人资料',
}

function entrySummary(entry) {
  return entry.company || entry.school || entry.name || entry.skillName || ''
}

function handleDelete(entry) {
  const typeLabel = TYPE_LABELS[entry.type] || entry.type
  const summary = entrySummary(entry)
  const label = summary ? `${typeLabel} · ${summary}` : typeLabel
  remove(entry.id)
  pushToast({
    message: `已删除 ${label}`,
    actionLabel: '撤销',
    onAction: () => undoRemove(),
    onAutoCommit: () => commitRemoval(),
  })
}

function handleSave(data) {
  if (editingEntry.value) {
    update(editingEntry.value.id, data)
  } else {
    add(activeType.value, data)
  }
  showForm.value = false
  editingEntry.value = null
}

// --- Import/Export ---
const fileInput = ref(null)

function handleExport() {
  downloadBackup()
  pushToast({ message: '数据已导出为 JSON 文件', type: 'success' })
}

function handleImportClick() {
  fileInput.value?.click()
}

function handleFileChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (event) => {
    const result = importAll(event.target.result)
    if (result.success) {
      pushToast({ message: '数据导入成功，即将刷新页面', type: 'success' })
      setTimeout(() => window.location.reload(), 500)
    } else {
      pushToast({ message: `导入失败: ${result.errors?.join(', ') || '未知错误'}`, type: 'error' })
    }
  }
  reader.readAsText(file)
  e.target.value = ''
}

/** 监听 route.query.focus：切换 activeType + 滚动 + 高亮 */
watch(
  () => route?.query?.focus ?? null,
  (focus) => {
    if (!focus) return
    const targetType = FOCUS_TO_TYPE[focus]
    if (!targetType) return
    activeType.value = targetType
    nextTick(() => {
      focusedGroup.value = focus
      const el = document.querySelector(`[data-focus-group="${focus}"]`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
      setTimeout(() => { focusedGroup.value = null }, 1000)
    })
  },
  { immediate: true }
)
</script>

<template>
  <div class="flex gap-6 min-h-[calc(100vh-3rem)]" style="background: var(--bg-primary);">
    <!-- Left sidebar: 220px -->
    <aside
      class="w-[220px] shrink-0 rounded-xl p-4"
      style="background: var(--bg-secondary);"
    >
      <div class="flex items-center gap-2 mb-6 px-2">
        <span class="text-lg">📄</span>
        <span class="text-sm font-bold tracking-wide" style="color: var(--text-primary);">简历管理</span>
      </div>

      <nav class="flex flex-col gap-1">
        <button
          v-for="opt in typeOptions"
          :key="opt.key"
          class="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-left transition-all"
          :class="activeType === opt.key
            ? 'font-medium shadow-sm'
            : 'hover:opacity-70'"
          :style="{
            background: activeType === opt.key ? 'var(--border)' : 'transparent',
            color: activeType === opt.key ? 'var(--text-primary)' : 'var(--text-secondary)'
          }"
          @click="activeType = opt.key"
        >
          <span>{{ opt.icon }}</span>
          {{ opt.label }}
        </button>
      </nav>

      <div class="mt-6 px-2">
        <p class="text-xs" style="color: var(--text-secondary);">
          共 {{ entries.length }} 条记录
        </p>
      </div>
    </aside>

    <!-- Main timeline area -->
    <div class="flex-1 min-w-0">
      <!-- Header bar -->
      <div class="flex items-center justify-between mb-5">
        <div>
          <h2 class="text-lg font-bold" style="color: var(--text-primary);">
            {{ typeOptions.find(o => o.key === activeType)?.label || activeType }}
          </h2>
          <p class="text-xs mt-0.5" style="color: var(--text-secondary);">
            {{ filteredEntries.length }} 条记录
          </p>
        </div>
        <div class="flex gap-2">
          <button
            class="px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-85"
            style="background: var(--bg-secondary); color: var(--text-secondary); border: 1px solid var(--border);"
            @click="clearManualOrder(activeType)"
            title="重置条目排序为默认（按开始日期降序）"
          >↺ 排序</button>
          <button
            class="px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-85"
            style="background: var(--accent); color: #fff;"
            @click="handleAdd"
          >+ 添加</button>
          <button
            class="px-3 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-85"
            style="background: var(--bg-secondary); color: var(--text-secondary); border: 1px solid var(--border);"
            @click="handleExport"
            title="导出全部简历数据为 JSON 备份文件"
          >📥 导出</button>
          <button
            class="px-3 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-85"
            style="background: var(--bg-secondary); color: var(--text-secondary); border: 1px solid var(--border);"
            @click="handleImportClick"
            title="从 JSON 备份文件导入数据"
          >📤 导入</button>
          <input
            ref="fileInput"
            type="file"
            accept=".json"
            style="display:none"
            @change="handleFileChange"
          />
        </div>
      </div>

      <!-- Empty state -->
      <div
        v-if="filteredEntries.length === 0"
        class="flex flex-col items-center justify-center py-20 rounded-xl"
        style="background: var(--bg-secondary);"
      >
        <span class="text-4xl mb-3">📭</span>
        <p class="text-sm font-medium" style="color: var(--text-secondary);">暂无记录</p>
        <p class="text-xs mt-1" style="color: var(--text-secondary);">点击上方按钮添加</p>
      </div>

      <!-- Timeline -->
      <ResumeTimeline
        v-else
        :entries="filteredEntries"
        :type="activeType"
        :class="{ 'is-focused': focusedGroup === activeType }"
        :data-focus-group="activeType"
        @edit="handleEdit"
        @delete="handleDelete"
        @drag-start="entryOnDragStart"
        @dragover="entryOnDragOver"
        @drop="entryOnDrop"
        @keymove="entryOnKeyMove"
      />
    </div>

    <!-- Form modal -->
    <ResumeForm
      v-if="showForm"
      :entry="editingEntry"
      :type="activeType"
      @save="handleSave"
      @close="showForm = false"
    />
  </div>
</template>

<style scoped>
.is-focused {
  outline: 2px solid var(--accent, #5a6a8a);
  outline-offset: 4px;
  border-radius: 12px;
  transition: outline 0.3s ease;
}
</style>
