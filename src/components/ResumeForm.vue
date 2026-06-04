<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  show: { type: Boolean, required: true },
  type: { type: String, required: true },
  editEntry: { type: Object, default: null }
})

const emit = defineEmits(['save', 'close'])

const form = ref({})

const typeLabel = {
  work: '工作经历',
  internship: '实习经历',
  project: '项目',
  education: '教育背景',
  skill: '技能',
  certificate: '证书',
  profile: '个人简介'
}

const typeLabels = {
  work: '工作经历',
  internship: '实习经历',
  project: '项目',
  education: '教育背景',
  skill: '技能',
  certificate: '证书',
  profile: '个人简介'
}

function resetForm() {
  const defaults = {
    work: { company: '', position: '', startDate: '', endDate: '', description: '', highlights: [], tags: [] },
    internship: { company: '', position: '', startDate: '', endDate: '', description: '', highlights: [], tags: [] },
    project: { name: '', role: '', startDate: '', endDate: '', description: '', tech: [], url: '' },
    education: { school: '', degree: '', major: '', startDate: '', endDate: '', gpa: '' },
    skill: { name: '', level: 3, category: '' },
    certificate: { name: '', issuer: '', date: '', description: '' },
    profile: { title: '', content: '' }
  }
  form.value = props.editEntry
    ? { ...defaults[props.type], ...props.editEntry }
    : { ...defaults[props.type] }
}

watch(() => props.show, (val) => {
  if (val) resetForm()
})

function handleSave() {
  emit('save', { ...form.value })
}

function addHighlight() {
  if (!form.value.highlights) form.value.highlights = []
  form.value.highlights.push('')
}

function removeHighlight(i) {
  form.value.highlights.splice(i, 1)
}

function addTag() {
  if (!form.value.tags) form.value.tags = []
  form.value.tags.push('')
}

function removeTag(i) {
  form.value.tags.splice(i, 1)
}

function addTech() {
  if (!form.value.tech) form.value.tech = []
  form.value.tech.push('')
}

function removeTech(i) {
  form.value.tech.splice(i, 1)
}
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="modal-overlay" @click.self="emit('close')">
      <div class="modal-panel">
        <div class="modal-header">
          <h2>{{ editEntry ? '编辑' : '添加' }}{{ typeLabels[type] }}</h2>
          <button class="close-btn" @click="emit('close')">&times;</button>
        </div>

        <div class="modal-body">
          <!-- Work / Internship fields -->
          <template v-if="type === 'work' || type === 'internship'">
            <label>公司名称</label>
            <input v-model="form.company" placeholder="公司名称" />

            <label>职位</label>
            <input v-model="form.position" placeholder="职位" />

            <label>开始日期</label>
            <input v-model="form.startDate" type="date" />

            <label>结束日期</label>
            <input v-model="form.endDate" type="date" />

            <label>描述</label>
            <textarea v-model="form.description" placeholder="工作描述" rows="3"></textarea>

            <label>亮点</label>
            <div v-for="(h, i) in (form.highlights || [])" :key="i" class="array-row">
              <input v-model="form.highlights[i]" placeholder="亮点" />
              <button class="btn-remove" @click="removeHighlight(i)">-</button>
            </div>
            <button class="btn-add" @click="addHighlight">+ 添加亮点</button>

            <label>标签</label>
            <div v-for="(t, i) in (form.tags || [])" :key="i" class="array-row">
              <input v-model="form.tags[i]" placeholder="标签" />
              <button class="btn-remove" @click="removeTag(i)">-</button>
            </div>
            <button class="btn-add" @click="addTag">+ 添加标签</button>
          </template>

          <!-- Project fields -->
          <template v-if="type === 'project'">
            <label>项目名称</label>
            <input v-model="form.name" placeholder="项目名称" />

            <label>角色</label>
            <input v-model="form.role" placeholder="角色" />

            <label>开始日期</label>
            <input v-model="form.startDate" type="date" />

            <label>结束日期</label>
            <input v-model="form.endDate" type="date" />

            <label>描述</label>
            <textarea v-model="form.description" placeholder="项目描述" rows="3"></textarea>

            <label>技术栈</label>
            <div v-for="(t, i) in (form.tech || [])" :key="i" class="array-row">
              <input v-model="form.tech[i]" placeholder="技术" />
              <button class="btn-remove" @click="removeTech(i)">-</button>
            </div>
            <button class="btn-add" @click="addTech">+ 添加技术</button>

            <label>链接</label>
            <input v-model="form.url" placeholder="https://..." />
          </template>

          <!-- Education fields -->
          <template v-if="type === 'education'">
            <label>学校</label>
            <input v-model="form.school" placeholder="学校名称" />

            <label>学位</label>
            <input v-model="form.degree" placeholder="学位" />

            <label>专业</label>
            <input v-model="form.major" placeholder="专业" />

            <label>开始日期</label>
            <input v-model="form.startDate" type="date" />

            <label>结束日期</label>
            <input v-model="form.endDate" type="date" />

            <label>GPA</label>
            <input v-model="form.gpa" placeholder="GPA" />
          </template>

          <!-- Skill fields -->
          <template v-if="type === 'skill'">
            <label>技能名称</label>
            <input v-model="form.name" placeholder="技能名称" />

            <label>熟练度 (1-5)</label>
            <div class="level-row">
              <span v-for="n in 5" :key="n" class="level-dot" :class="{ active: form.level >= n }" @click="form.level = n">{{ n }}</span>
            </div>

            <label>分类</label>
            <input v-model="form.category" placeholder="分类（如：前端、后端、工具）" />
          </template>

          <!-- Certificate fields -->
          <template v-if="type === 'certificate'">
            <label>证书名称</label>
            <input v-model="form.name" placeholder="证书名称" />

            <label>颁发机构</label>
            <input v-model="form.issuer" placeholder="颁发机构" />

            <label>日期</label>
            <input v-model="form.date" type="date" />

            <label>描述</label>
            <textarea v-model="form.description" placeholder="证书描述" rows="3"></textarea>
          </template>

          <!-- Profile fields -->
          <template v-if="type === 'profile'">
            <label>标题</label>
            <input v-model="form.title" placeholder="标题" />

            <label>内容</label>
            <textarea v-model="form.content" placeholder="个人简介内容" rows="6"></textarea>
          </template>
        </div>

        <div class="modal-footer">
          <button class="btn-cancel" @click="emit('close')">取消</button>
          <button class="btn-save" @click="handleSave">保存</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-panel {
  background: #eef0f2;
  border-radius: 16px;
  width: 560px;
  max-width: 90vw;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0,0,0,0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 28px 16px;
  border-bottom: 1px solid #d5d8de;
}

.modal-header h2 {
  font-family: Georgia, serif;
  font-size: 18px;
  color: #2a2a3a;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #8a92a0;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.close-btn:hover { color: #2a2a3a; }

.modal-body {
  padding: 20px 28px;
  overflow-y: auto;
  flex: 1;
}

.modal-body label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #5a6a8a;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-top: 16px;
  margin-bottom: 6px;
}

.modal-body label:first-child { margin-top: 0; }

.modal-body input,
.modal-body textarea {
  width: 100%;
  padding: 8px 12px;
  font-size: 14px;
  color: #2a2a3a;
  background: #e4e6ea;
  border: 1px solid #d5d8de;
  border-radius: 8px;
  outline: none;
  box-sizing: border-box;
  font-family: inherit;
}

.modal-body input:focus,
.modal-body textarea:focus {
  border-color: #5a6a8a;
  background: #eef0f2;
}

.modal-body textarea {
  resize: vertical;
  min-height: 60px;
}

.array-row {
  display: flex;
  gap: 8px;
  margin-bottom: 6px;
}

.array-row input { flex: 1; }

.btn-remove {
  width: 30px;
  height: 30px;
  border: 1px solid #d5d8de;
  background: #e4e6ea;
  color: #8a92a0;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  flex-shrink: 0;
}

.btn-remove:hover {
  background: #f0d0d0;
  color: #c0392b;
  border-color: #c0392b;
}

.btn-add {
  background: none;
  border: 1px dashed #d5d8de;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 12px;
  color: #5a6a8a;
  cursor: pointer;
  margin-top: 4px;
}

.btn-add:hover {
  border-color: #5a6a8a;
  background: rgba(90,106,138,0.08);
}

.level-row {
  display: flex;
  gap: 8px;
}

.level-dot {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #e4e6ea;
  border: 1px solid #d5d8de;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: #8a92a0;
  cursor: pointer;
  transition: all 0.2s;
}

.level-dot.active {
  background: #5a6a8a;
  color: #fff;
  border-color: #5a6a8a;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 28px 24px;
  border-top: 1px solid #d5d8de;
}

.btn-cancel, .btn-save {
  padding: 8px 24px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  border: 1px solid #d5d8de;
}

.btn-cancel {
  background: #e4e6ea;
  color: #2a2a3a;
}

.btn-cancel:hover { background: #d5d8de; }

.btn-save {
  background: #5a6a8a;
  color: #fff;
  border-color: #5a6a8a;
}

.btn-save:hover {
  background: #4a5a7a;
}
</style>
