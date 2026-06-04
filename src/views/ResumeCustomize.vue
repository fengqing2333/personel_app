<script setup>
import { ref } from 'vue'

const currentStep = ref(1)

// Step 1: 输入目标
const companyName = ref('')
const position = ref('')
const jd = ref('')

function goToStep2() {
  currentStep.value = 2
}

// Step 2: 匹配推荐
const entries = ref([
  { id: 1, type: 'work', company: '字节跳动', position: '高级前端工程师', startDate: '2021.03', endDate: '2024.06', match: 92, desc: '负责核心业务前端架构设计，主导内部组件库建设，推动团队采用 Vue 3 + TypeScript 技术栈，优化首屏加载性能提升 40%。', tags: ['Vue 3', 'TypeScript', '组件库', '性能优化'], checked: true },
  { id: 2, type: 'work', company: '阿里巴巴', position: '前端开发工程师', startDate: '2019.07', endDate: '2021.02', match: 78, desc: '参与中后台系统重构，基于 React + Ant Design 实现模块化开发，建立自动化测试体系。', tags: ['React', 'Node.js', '微前端'], checked: false },
  { id: 3, type: 'internship', company: '腾讯科技', position: '前端开发实习生', startDate: '2018.06', endDate: '2018.12', match: 65, desc: '参与腾讯云控制台前端开发，使用 ECharts 实现实时监控大屏。', tags: ['Python', 'Vue 2', 'ECharts'], checked: false },
  { id: 4, type: 'internship', company: '美团', position: 'Web 开发实习生', startDate: '2017.12', endDate: '2018.05', match: 58, desc: '参与商家端后台系统开发，负责订单管理模块维护。', tags: ['jQuery', 'Bootstrap'], checked: false },
  { id: 5, type: 'project', name: 'UI-Verse 组件库', role: '核心维护者', startDate: '2023.01', endDate: '至今', match: 88, desc: '开发面向 Vue 3 的企业级组件库，包含 40+ 组件，GitHub 2k+ stars。', tags: ['Vue 3', 'Rollup', 'Storybook'], checked: true },
  { id: 6, type: 'project', name: '实时协作白板', role: '全栈开发者', startDate: '2022.06', endDate: '2023.01', match: 72, desc: '基于 WebSocket + Canvas 实现多人实时协作白板。', tags: ['WebSocket', 'Canvas', 'WebRTC'], checked: false },
  { id: 7, type: 'education', school: '北京大学', degree: '本科', major: '计算机科学与技术', startDate: '2015.09', endDate: '2019.06', match: 45, desc: 'GPA 3.8/4.0 · 校级优秀毕业生', tags: ['计算机'], checked: true },
  { id: 8, type: 'skill', name: '技能清单', items: ['Vue 3/React', 'TypeScript', 'Node.js', 'Webpack/Vite', 'Docker'], match: 95, checked: true }
])

const checkedCount = computed(() => entries.value.filter(e => e.checked).length)

const selectedEntries = computed(() => entries.value.filter(e => e.checked))

const previewSections = computed(() => {
  const s = []
  const w = selectedEntries.value.filter(e => e.type === 'work')
  if (w.length) s.push({ title: '💼 工作经历', entries: w })
  const i = selectedEntries.value.filter(e => e.type === 'internship')
  if (i.length) s.push({ title: '🔬 实习经历', entries: i })
  const p = selectedEntries.value.filter(e => e.type === 'project')
  if (p.length) s.push({ title: '🚀 项目经验', entries: p })
  const e = selectedEntries.value.filter(e => e.type === 'education')
  if (e.length) s.push({ title: '🎓 教育背景', entries: e })
  const sk = selectedEntries.value.filter(e => e.type === 'skill')
  if (sk.length) s.push({ title: '🏷️ 技能', entries: sk })
  return s
})

function toggleCheck(id) {
  const entry = entries.value.find(e => e.id === id)
  if (entry) entry.checked = !entry.checked
}

function goToStep3() {
  currentStep.value = 3
}

function goToStep1() {
  currentStep.value = 1
}

function goToStep2Back() {
  currentStep.value = 2
}

// Bottom section
const apiKey = ref('')

function handleSave() {
  alert('简历已保存（演示功能，暂无实际后端）')
}

function handleSearch() {
  alert('联网搜索功能（演示占位，未接入实际 API）')
}

const steps = [
  { num: 1, label: '输入目标' },
  { num: 2, label: '匹配推荐' },
  { num: 3, label: '预览' }
]
</script>

<template>
  <div class="customize-page">
    <div class="max-w-3xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold" style="color: #2a2a3a;">简历定制</h1>
        <p class="text-sm mt-1" style="color: #8a92a0;">三步生成匹配岗位的定制简历</p>
      </div>

      <!-- Step Indicator -->
      <div class="flex items-center justify-center gap-4 mb-8">
        <template v-for="(step, idx) in steps" :key="step.num">
          <div class="flex items-center gap-2">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300"
              :style="{
                background: currentStep >= step.num ? '#5a6a8a' : '#d5d8de',
                color: currentStep >= step.num ? '#ffffff' : '#8a92a0'
              }"
            >
              {{ step.num }}
            </div>
            <span
              class="text-sm font-medium transition-all"
              :style="{
                color: currentStep >= step.num ? '#2a2a3a' : '#8a92a0'
              }"
            >
              {{ step.label }}
            </span>
          </div>
          <div
            v-if="idx < steps.length - 1"
            class="w-12 h-px"
            :style="{
              background: currentStep > step.num ? '#5a6a8a' : '#d5d8de'
            }"
          ></div>
        </template>
      </div>

      <!-- Step 1: 输入目标 -->
      <div v-if="currentStep === 1" class="card">
        <h2 class="text-lg font-semibold mb-5" style="color: #2a2a3a;">输入求职目标</h2>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1.5" style="color: #2a2a3a;">公司名称</label>
            <input
              v-model="companyName"
              type="text"
              placeholder="例：字节跳动"
              class="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
              style="background: #eef0f2; border: 1px solid #d5d8de; color: #2a2a3a;"
              @focus="$event.target.style.borderColor = '#5a6a8a'"
              @blur="$event.target.style.borderColor = '#d5d8de'"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1.5" style="color: #2a2a3a;">目标职位</label>
            <input
              v-model="position"
              type="text"
              placeholder="例：高级前端工程师"
              class="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
              style="background: #eef0f2; border: 1px solid #d5d8de; color: #2a2a3a;"
              @focus="$event.target.style.borderColor = '#5a6a8a'"
              @blur="$event.target.style.borderColor = '#d5d8de'"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1.5" style="color: #2a2a3a;">职位描述（JD）</label>
            <textarea
              v-model="jd"
              rows="6"
              placeholder="请粘贴职位描述..."
              class="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all resize-none"
              style="background: #eef0f2; border: 1px solid #d5d8de; color: #2a2a3a;"
              @focus="$event.target.style.borderColor = '#5a6a8a'"
              @blur="$event.target.style.borderColor = '#d5d8de'"
            ></textarea>
          </div>
        </div>

        <div class="flex justify-end mt-6">
          <button
            class="px-6 py-3 rounded-xl text-sm font-medium transition-all"
            style="background: #5a6a8a; color: #fff;"
            @click="goToStep2"
          >
            开始匹配
          </button>
        </div>
      </div>

      <!-- Step 2: 匹配推荐 -->
      <div v-if="currentStep === 2" class="card">
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-lg font-semibold" style="color:#2a2a3a;">匹配推荐</h2>
          <span class="text-xs px-2.5 py-1 rounded-full" style="background:rgba(90,106,138,0.1);color:#5a6a8a;">已选 {{ checkedCount }} / {{ entries.length }}</span>
        </div>

        <div class="space-y-3">
          <div
            v-for="entry in entries"
            :key="entry.id"
            class="flex items-start gap-4 p-4 rounded-xl transition-all cursor-pointer"
            :style="{
              background: entry.checked ? 'rgba(90,106,138,0.08)' : '#ffffff',
              border: entry.checked ? '1px solid #5a6a8a' : '1px solid #d5d8de'
            }"
            @click="toggleCheck(entry.id)"
          >
            <div
              class="w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-all"
              :style="{
                background: entry.checked ? '#5a6a8a' : '#eef0f2',
                border: entry.checked ? '1px solid #5a6a8a' : '1px solid #d5d8de'
              }"
            >
              <span v-if="entry.checked" class="text-white text-xs">&#10003;</span>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-2">
                <div>
                  <span class="text-sm font-semibold" style="color: #2a2a3a;">{{ entry.company }}</span>
                  <span class="text-sm ml-2" style="color: #5a6a8a;">{{ entry.position }}</span>
                </div>
                <div
                  class="shrink-0 px-2.5 py-1 rounded-full text-xs font-bold"
                  :style="{
                    background: entry.match >= 80 ? 'rgba(34,197,94,0.15)' : entry.match >= 60 ? 'rgba(234,179,8,0.15)' : 'rgba(239,68,68,0.1)',
                    color: entry.match >= 80 ? '#16a34a' : entry.match >= 60 ? '#ca8a04' : '#dc2626'
                  }"
                >
                  {{ entry.match }}% 匹配
                </div>
              </div>
              <p class="text-xs mt-1" style="color: #8a92a0;">{{ entry.startDate }} — {{ entry.endDate }}</p>
              <div class="flex gap-2 mt-2">
                <span
                  v-for="tag in entry.tags"
                  :key="tag"
                  class="px-2.5 py-0.5 rounded-full text-xs"
                  style="background: rgba(90,106,138,0.1); color: #5a6a8a;"
                >
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-between mt-6">
          <button
            class="px-5 py-3 rounded-xl text-sm font-medium transition-all"
            style="background: #e4e6ea; color: #5a6a8a;"
            @click="goToStep1"
          >
            上一步
          </button>
          <button
            class="px-5 py-3 rounded-xl text-sm font-medium transition-all"
            style="background: #5a6a8a; color: #fff;"
            @click="goToStep3"
          >
            下一步
          </button>
        </div>
      </div>

      <!-- Step 3: 动态预览 -->
      <div v-if="currentStep === 3" class="card">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold" style="color:#2a2a3a;">简历预览</h2>
          <span class="text-xs" style="color:#8a92a0;">{{ companyName || '目标公司' }} · {{ position || '目标岗位' }}</span>
        </div>
        <div class="rounded-xl p-6" style="background:#fafafa;border:1px solid #d5d8de;">
          <div class="text-center mb-6 pb-6" style="border-bottom:1px solid #d5d8de;">
            <div class="text-lg font-bold" style="color:#2a2a3a;">个人简历</div>
            <div class="text-sm mt-1" style="color:#5a6a8a;">{{ position || '目标岗位' }}</div>
          </div>
          <div v-for="(section, si) in previewSections" :key="si" class="mb-5 pb-5" :style="{ 'border-bottom': si < previewSections.length - 1 ? '1px solid #d5d8de' : 'none' }">
            <div class="text-sm font-semibold mb-3" style="color:#5a6a8a;">{{ section.title }}</div>
            <div v-for="(entry, ei) in section.entries" :key="ei" class="mb-3 pb-3" :style="{ 'border-bottom': ei < section.entries.length - 1 ? '1px dashed #e4e6ea' : 'none' }">
              <div class="flex justify-between items-baseline">
                <span class="text-sm font-semibold" style="color:#2a2a3a;">{{ entry.company || entry.name || entry.school }}</span>
                <span class="text-xs" style="color:#8a92a0;">{{ entry.startDate }} — {{ entry.endDate || '至今' }}</span>
              </div>
              <div class="text-xs mt-0.5" style="color:#5a6a8a;">{{ entry.position || entry.role || entry.degree }}{{ entry.major ? ' · ' + entry.major : '' }}</div>
              <div v-if="entry.desc" class="text-xs mt-1.5 leading-relaxed" style="color:#5a6a8a;">{{ entry.desc }}</div>
              <div v-if="entry.items" class="flex gap-1.5 mt-1.5 flex-wrap">
                <span v-for="item in entry.items" :key="item" class="px-2 py-0.5 rounded text-xs" style="background:rgba(90,106,138,0.08);color:#5a6a8a;">{{ item }}</span>
              </div>
            </div>
          </div>
          <div v-if="previewSections.length === 0" class="text-center py-8 text-sm" style="color:#8a92a0;">
            未选中任何条目，请返回上一步勾选经历
          </div>
        </div>
        <div class="flex justify-between mt-6">
          <button class="px-5 py-3 rounded-xl text-sm font-medium" style="background:#e4e6ea;color:#5a6a8a;" @click="goToStep2Back">上一步</button>
          <button class="px-5 py-3 rounded-xl text-sm font-medium text-white" style="background:#5a6a8a;" @click="handleSave">保存</button>
        </div>
      </div><!-- Bottom Section: AI 增强 -->
      <div class="card mt-6">
        <h2 class="text-sm font-semibold mb-3" style="color: #2a2a3a;">AI 增强</h2>
        <div class="flex items-center gap-3">
          <input
            v-model="apiKey"
            type="text"
            placeholder="输入 API Key（可选）"
            class="flex-1 px-4 py-3 rounded-xl text-sm outline-none transition-all"
            style="background: #eef0f2; border: 1px solid #d5d8de; color: #2a2a3a;"
            @focus="$event.target.style.borderColor = '#5a6a8a'"
            @blur="$event.target.style.borderColor = '#d5d8de'"
          />
          <button
            class="px-5 py-3 rounded-xl text-sm font-medium transition-all"
            style="background: #e4e6ea; color: #5a6a8a;"
            @click="handleSearch"
          >
            联网搜索
          </button>
        </div>
        <p class="text-xs mt-2" style="color: #8a92a0;">
          开启联网搜索可获取公司最新动态和岗位要求，优化简历匹配度
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.customize-page {
  min-height: calc(100vh - 3rem);
  padding: 2rem 1.5rem;
  background: #eef0f2;
}

.card {
  background: #ffffff;
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid #d5d8de;
}

input::placeholder,
textarea::placeholder {
  color: #8a92a0;
}
</style>
