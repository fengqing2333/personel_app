<script setup>
import { ref, computed } from 'vue'
import { useResume } from '@/composables/useResume'
import ResumeTimeline from '@/components/ResumeTimeline.vue'
import ResumeForm from '@/components/ResumeForm.vue'

const { entries, getByType, add, update, remove } = useResume()

const activeType = ref('work')
const showForm = ref(false)
const editingEntry = ref(null)

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

function handleAdd() {
  editingEntry.value = null
  showForm.value = true
}

function handleEdit(entry) {
  editingEntry.value = entry
  showForm.value = true
}

function handleDelete(entry) {
  if (window.confirm('确定删除此条目？')) {
    remove(entry.id)
  }
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
</script>

<template>
  <!-- Smoky blue vintage theme -->
  <div class="flex gap-6 min-h-[calc(100vh-3rem)]" style="background: #eef0f2;">
    <!-- Left sidebar: 220px -->
    <aside
      class="w-[220px] shrink-0 rounded-xl p-4"
      style="background: #e4e6ea;"
    >
      <div class="flex items-center gap-2 mb-6 px-2">
        <span class="text-lg">📄</span>
        <span class="text-sm font-bold tracking-wide" style="color: #2a2a3a;">简历管理</span>
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
            background: activeType === opt.key ? 'rgba(90,106,138,0.15)' : 'transparent',
            color: activeType === opt.key ? '#2a2a3a' : '#5a6a8a'
          }"
          @click="activeType = opt.key"
        >
          <span>{{ opt.icon }}</span>
          {{ opt.label }}
        </button>
      </nav>

      <div class="mt-6 px-2">
        <p class="text-xs" style="color: #7a8aaa;">
          共 {{ entries.length }} 条记录
        </p>
      </div>
    </aside>

    <!-- Main timeline area -->
    <div class="flex-1 min-w-0">
      <!-- Header bar -->
      <div class="flex items-center justify-between mb-5">
        <div>
          <h2 class="text-lg font-bold" style="color: #2a2a3a;">
            {{ typeOptions.find(o => o.key === activeType)?.label || activeType }}
          </h2>
          <p class="text-xs mt-0.5" style="color: #7a8aaa;">
            {{ filteredEntries.length }} 条记录
          </p>
        </div>
        <button
          class="px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-85"
          style="background: #5a6a8a; color: #fff;"
          @click="handleAdd"
        >+ 添加</button>
      </div>

      <!-- Empty state -->
      <div
        v-if="filteredEntries.length === 0"
        class="flex flex-col items-center justify-center py-20 rounded-xl"
        style="background: #e4e6ea;"
      >
        <span class="text-4xl mb-3">📭</span>
        <p class="text-sm font-medium" style="color: #5a6a8a;">暂无记录</p>
        <p class="text-xs mt-1" style="color: #7a8aaa;">点击上方按钮添加</p>
      </div>

      <!-- Timeline -->
      <ResumeTimeline
        v-else
        :entries="filteredEntries"
        :type="activeType"
        @edit="handleEdit"
        @delete="handleDelete"
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
