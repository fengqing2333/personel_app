<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  entry: {
    type: Object,
    default: null
  },
  type: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['save', 'close'])

const isEdit = ref(false)
const form = ref({})

// Field definitions per type
const fieldDefs = {
  work: [
    { key: 'company', label: '公司', type: 'text', required: true },
    { key: 'position', label: '职位', type: 'text', required: true },
    { key: 'startDate', label: '开始日期', type: 'month', required: true },
    { key: 'endDate', label: '结束日期', type: 'month', required: false },
    { key: 'description', label: '描述', type: 'textarea', required: false },
    { key: 'logo', label: 'Logo URL', type: 'text', required: false },
    { key: 'tags', label: '标签（逗号分隔）', type: 'tags', required: false }
  ],
  internship: [
    { key: 'company', label: '公司', type: 'text', required: true },
    { key: 'position', label: '职位', type: 'text', required: true },
    { key: 'startDate', label: '开始日期', type: 'month', required: true },
    { key: 'endDate', label: '结束日期', type: 'month', required: false },
    { key: 'description', label: '描述', type: 'textarea', required: false },
    { key: 'logo', label: 'Logo URL', type: 'text', required: false },
    { key: 'tags', label: '标签（逗号分隔）', type: 'tags', required: false }
  ],
  project: [
    { key: 'name', label: '项目名称', type: 'text', required: true },
    { key: 'role', label: '角色', type: 'text', required: true },
    { key: 'startDate', label: '开始日期', type: 'month', required: true },
    { key: 'endDate', label: '结束日期', type: 'month', required: false },
    { key: 'description', label: '描述', type: 'textarea', required: false },
    { key: 'technologies', label: '技术栈（逗号分隔）', type: 'tags', required: false },
    { key: 'url', label: '项目链接', type: 'text', required: false },
    { key: 'tags', label: '标签（逗号分隔）', type: 'tags', required: false }
  ],
  education: [
    { key: 'school', label: '学校', type: 'text', required: true },
    { key: 'degree', label: '学位', type: 'text', required: true },
    { key: 'field', label: '专业', type: 'text', required: false },
    { key: 'startDate', label: '开始日期', type: 'month', required: true },
    { key: 'endDate', label: '结束日期', type: 'month', required: false },
    { key: 'description', label: '描述', type: 'textarea', required: false },
    { key: 'logo', label: 'Logo URL', type: 'text', required: false },
    { key: 'tags', label: '标签（逗号分隔）', type: 'tags', required: false }
  ],
  skill: [
    { key: 'skillName', label: '技能名称', type: 'text', required: true },
    { key: 'category', label: '分类', type: 'text', required: false },
    { key: 'proficiency', label: '熟练度 (1-5)', type: 'number', required: false },
    { key: 'tags', label: '标签（逗号分隔）', type: 'tags', required: false }
  ],
  certificate: [
    { key: 'name', label: '证书名称', type: 'text', required: true },
    { key: 'issuer', label: '颁发机构', type: 'text', required: true },
    { key: 'date', label: '获得日期', type: 'month', required: true },
    { key: 'description', label: '描述', type: 'textarea', required: false },
    { key: 'url', label: '证书链接', type: 'text', required: false },
    { key: 'tags', label: '标签（逗号分隔）', type: 'tags', required: false }
  ],
  profile: [
    { key: 'name', label: '姓名', type: 'text', required: true },
    { key: 'title', label: '头衔', type: 'text', required: false },
    { key: 'email', label: '邮箱', type: 'text', required: false },
    { key: 'phone', label: '电话', type: 'text', required: false },
    { key: 'location', label: '所在地', type: 'text', required: false },
    { key: 'summary', label: '个人简介', type: 'textarea', required: false },
    { key: 'avatar', label: '头像 URL', type: 'text', required: false },
    { key: 'tags', label: '标签（逗号分隔）', type: 'tags', required: false }
  ]
}

function initForm() {
  if (props.entry) {
    isEdit.value = true
    form.value = { ...props.entry }
  } else {
    isEdit.value = false
    form.value = {}
  }
}

initForm()

watch(() => props.entry, () => initForm())

function handleSave() {
  const fields = fieldDefs[props.type] || []
  const data = { ...form.value }

  // Convert comma-separated tag/technology strings to arrays
  for (const f of fields) {
    if (f.type === 'tags' && typeof data[f.key] === 'string') {
      data[f.key] = data[f.key].split(',').map(s => s.trim()).filter(Boolean)
    }
  }

  emit('save', data)
}

const typeLabelMap = {
  work: '工作经历',
  internship: '实习经历',
  project: '项目经验',
  education: '教育背景',
  skill: '技能',
  certificate: '证书',
  profile: '个人资料'
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center" @click.self="emit('close')">
      <div class="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
      <div
        class="relative w-full max-w-lg mx-4 rounded-2xl p-6 shadow-xl border max-h-[80vh] overflow-y-auto"
        :style="{
          background: 'var(--resume-card, #e4e6ea)',
          borderColor: 'rgba(90,106,138,0.15)'
        }"
      >
        <h3 class="text-lg font-bold mb-5" style="color: var(--resume-text, #2a2a3a);">
          {{ isEdit ? '编辑' : '新增' }}{{ typeLabelMap[type] || type }}
        </h3>

        <form @submit.prevent="handleSave" class="space-y-4">
          <template v-for="field in (fieldDefs[type] || [])" :key="field.key">
            <!-- Text / month / number input -->
            <div v-if="field.type !== 'textarea' && field.type !== 'tags'">
              <label class="block text-xs font-medium mb-1" style="color: #5a6a8a;">
                {{ field.label }}
                <span v-if="field.required" style="color: #dc5050;">*</span>
              </label>
              <input
                v-model="form[field.key]"
                :type="field.type"
                :required="field.required"
                class="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-colors"
                :style="{
                  background: 'rgba(255,255,255,0.5)',
                  color: 'var(--resume-text, #2a2a3a)',
                  border: '1px solid rgba(90,106,138,0.15)'
                }"
                @focus="$event.target.style.borderColor = '#5a6a8a'"
                @blur="$event.target.style.borderColor = 'rgba(90,106,138,0.15)'"
              />
            </div>

            <!-- Textarea -->
            <div v-if="field.type === 'textarea'">
              <label class="block text-xs font-medium mb-1" style="color: #5a6a8a;">
                {{ field.label }}
              </label>
              <textarea
                v-model="form[field.key]"
                rows="3"
                class="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-colors resize-none"
                :style="{
                  background: 'rgba(255,255,255,0.5)',
                  color: 'var(--resume-text, #2a2a3a)',
                  border: '1px solid rgba(90,106,138,0.15)'
                }"
                @focus="$event.target.style.borderColor = '#5a6a8a'"
                @blur="$event.target.style.borderColor = 'rgba(90,106,138,0.15)'"
              ></textarea>
            </div>

            <!-- Tags input (comma-separated string) -->
            <div v-if="field.type === 'tags'">
              <label class="block text-xs font-medium mb-1" style="color: #5a6a8a;">
                {{ field.label }}
              </label>
              <input
                v-model="form[field.key]"
                type="text"
                class="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-colors"
                :placeholder="'例如: Vue, Node.js, Docker'"
                :style="{
                  background: 'rgba(255,255,255,0.5)',
                  color: 'var(--resume-text, #2a2a3a)',
                  border: '1px solid rgba(90,106,138,0.15)'
                }"
                @focus="$event.target.style.borderColor = '#5a6a8a'"
                @blur="
                  $event.target.style.borderColor = 'rgba(90,106,138,0.15)';
                  if (Array.isArray(form[field.key])) form[field.key] = form[field.key].join(', ');
                "
              />
            </div>
          </template>

          <div class="flex gap-3 pt-2">
            <button
              type="submit"
              class="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-85"
              :style="{
                background: '#5a6a8a',
                color: '#fff'
              }"
            >{{ isEdit ? '保存修改' : '添加' }}</button>
            <button
              type="button"
              class="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-70"
              :style="{
                background: 'rgba(90,106,138,0.1)',
                color: '#5a6a8a'
              }"
              @click="emit('close')"
            >取消</button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
