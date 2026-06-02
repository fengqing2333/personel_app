<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  config: {
    type: Object,
    required: true
  },
  secondRate: {
    type: Number,
    required: true
  },
  dailyRate: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['update-config'])

const editing = ref(false)

const editForm = ref({
  monthlySalary: 0,
  dailyHours: 0,
  workDaysPerMonth: 0
})

function startEditing() {
  editForm.value = {
    monthlySalary: props.config.monthlySalary,
    dailyHours: props.config.dailyHours,
    workDaysPerMonth: props.config.workDaysPerMonth
  }
  editing.value = true
}

function saveEditing() {
  emit('update-config', {
    monthlySalary: Number(editForm.value.monthlySalary),
    dailyHours: Number(editForm.value.dailyHours),
    workDaysPerMonth: Number(editForm.value.workDaysPerMonth)
  })
  editing.value = false
}

const hourlyRate = computed(() => {
  if (props.dailyRate <= 0 || props.config.dailyHours <= 0) return 0
  return props.dailyRate / props.config.dailyHours
})
</script>

<template>
  <div class="card">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-sm font-medium" style="color: var(--text-secondary);">薪资设置</h3>
      <button
        v-if="!editing"
        class="edit-btn"
        @click="startEditing"
      >
        编辑
      </button>
    </div>

    <!-- 读取模式 -->
    <div v-if="!editing" class="space-y-3">
      <div class="flex flex-wrap gap-x-6 gap-y-2">
        <span class="text-sm" style="color: var(--text-primary);">
          月薪 <strong>¥{{ Number(config.monthlySalary).toLocaleString() }}</strong>
        </span>
        <span class="text-sm" style="color: var(--text-primary);">
          每日工时 <strong>{{ config.dailyHours }}h</strong>
        </span>
        <span class="text-sm" style="color: var(--text-primary);">
          计薪方式 <strong>{{ config.workDaysPerMonth }}天</strong>
        </span>
        <span class="text-sm" style="color: var(--text-primary);">
          秒薪 <strong>¥{{ secondRate.toFixed(4) }}</strong>
        </span>
      </div>

      <div class="flex flex-wrap gap-x-6 gap-y-2 pt-2 border-t" style="border-color: var(--border);">
        <span class="text-sm" style="color: var(--accent);">
          日薪 ¥{{ dailyRate.toFixed(2) }}
        </span>
        <span class="text-sm" style="color: var(--accent);">
          时薪 ¥{{ hourlyRate.toFixed(2) }}
        </span>
      </div>
    </div>

    <!-- 编辑模式 -->
    <div v-else class="space-y-3">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label class="block text-xs mb-1" style="color: var(--text-secondary);">月薪（元）</label>
          <input
            v-model.number="editForm.monthlySalary"
            type="number"
            min="0"
            class="input-field"
          />
        </div>
        <div>
          <label class="block text-xs mb-1" style="color: var(--text-secondary);">每日工时（h）</label>
          <input
            v-model.number="editForm.dailyHours"
            type="number"
            min="1"
            max="24"
            class="input-field"
          />
        </div>
        <div>
          <label class="block text-xs mb-1" style="color: var(--text-secondary);">计薪天数</label>
          <input
            v-model.number="editForm.workDaysPerMonth"
            type="number"
            min="1"
            max="31"
            class="input-field"
          />
        </div>
      </div>

      <div class="flex justify-end">
        <button class="save-btn" @click="saveEditing">
          保存
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  background-color: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px;
}

.edit-btn {
  background: rgba(0, 194, 255, 0.1);
  border: 1px solid rgba(0, 194, 255, 0.2);
  border-radius: 6px;
  padding: 4px 12px;
  font-size: 12px;
  color: var(--accent);
  cursor: pointer;
  transition: all 0.3s ease;
}

.edit-btn:hover {
  background: rgba(0, 194, 255, 0.2);
}

.save-btn {
  background: var(--accent-gradient);
  border: none;
  border-radius: 6px;
  padding: 6px 20px;
  font-size: 13px;
  color: #fff;
  cursor: pointer;
  transition: opacity 0.3s ease;
}

.save-btn:hover {
  opacity: 0.9;
}

.input-field {
  width: 100%;
  background-color: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 14px;
  color: var(--text-primary);
  outline: none;
  transition: border-color 0.2s ease;
}

.input-field:focus {
  border-color: var(--accent);
}
</style>
