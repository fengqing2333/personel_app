<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useResume } from '../composables/useResume'
import { useResumeLayout } from '../composables/useResumeLayout'
import { useMediaQuery } from '../composables/useMediaQuery'
import { useDragSort } from '../composables/useDragSort'
import ResumeHero from '../components/ResumeHero.vue'
import ResumeBlockProfile from '../components/ResumeBlockProfile.vue'
import ResumeBlockTimeline from '../components/ResumeBlockTimeline.vue'
import ResumeBlockProjects from '../components/ResumeBlockProjects.vue'
import ResumeBlockSkills from '../components/ResumeBlockSkills.vue'
import ResumeBlockList from '../components/ResumeBlockList.vue'
import ResumeBlockEducationCerts from '../components/ResumeBlockEducationCerts.vue'
import ResumeBlockEmptyState from '../components/ResumeBlockEmptyState.vue'
import ResumeConfigPanel from '../components/ResumeConfigPanel.vue'
import ResumeDivider from '../components/ResumeDivider.vue'

const resume = useResume()
const layout = useResumeLayout()
const router = useRouter()
const configOpen = ref(false)
const isWide = useMediaQuery('(min-width: 1200px)')

const { draggingId: blockDraggingId, onDragStart: blockOnDragStart, onDragOver: blockOnDragOver, onDrop: blockOnDrop, onKeyMove: blockOnKeyMove } = useDragSort({
  items: layout.orderedVisibleBlocks,
  onReorder(orderedIds) {
    layout.reorderBlocks(orderedIds)
  }
})

const blockComponents = computed(() => {
  const isSingle = layout.state.layout === 'single'
  return {
    profile: ResumeBlockProfile,
    experiences: ResumeBlockTimeline,
    education: isSingle ? ResumeBlockEducationCerts : ResumeBlockTimeline,
    projects: ResumeBlockProjects,
    skills: ResumeBlockSkills,
    certificates: isSingle ? null : ResumeBlockList,
    awards: ResumeBlockList,
    activities: ResumeBlockList,
  }
})

const personalInfo = computed(() => {
  const profile = resume.getByType('profile')[0]
  if (!profile) return { name: '', title: '', bio: '', email: '', phone: '', location: '', github: '', website: '', avatar: '' }
  return {
    name: profile.name || '',
    title: profile.title || '',
    bio: profile.summary || '',
    email: profile.email || '',
    phone: profile.phone || '',
    location: profile.location || '',
    github: profile.github || '',
    website: profile.website || '',
    avatar: profile.avatar || '',
  }
})

const accentColor = computed(() => {
  return layout.themeVars.value['--accent'] || '#7c8aff'
})

/** Hero 字段名 → resume profile entry 字段名(bio 映射回 summary) */
const HERO_FIELD_MAP = {
  bio: 'summary',
}

function onHeroUpdate({ field, value }) {
  const profile = resume.getByType('profile')[0]
  if (!profile)return
  const realField = HERO_FIELD_MAP[field] || field
  resume.update(profile.id, { [realField]: value })
}

/** Block 视图字段名 → entry 实际字段名(按 block 区分,避免歧义) */
const BLOCK_FIELD_MAP = {
  // Skills 视图用 name/level,实际存 skillName/proficiency
  skills: { name: 'skillName', level: 'proficiency' },
}

/** block id → entry type 映射（用于空态 CTA 跳转与数据判定） */
const BLOCK_TO_ENTRY_TYPE = {
  experiences: 'work',
  education: 'education',
  projects: 'project',
  skills: 'skill',
  certificates: 'certificate',
  awards: 'award',
  activities: 'activity',
}

/** block id → 中文标签（用于 EmptyState 显示） */
const BLOCK_LABELS = {
  experiences: '工作经历',
  education: '教育',
  projects: '项目',
  skills: '技能',
  certificates: '证书',
  awards: '奖项',
  activities: '活动',
}

/** block id → 英文标题 */
const BLOCK_TITLES = {
  experiences: 'Experience',
  education: 'Education',
  projects: 'Projects',
  skills: 'Skills',
  certificates: 'Certificates',
  awards: 'Awards',
  activities: 'Activities',
}

/** 判断区块是否为空（无对应数据） */
function isBlockEmpty(blockId) {
  if (blockId === 'profile') return false
  // experiences 需同时检查 work + internship
  if (blockId === 'experiences') {
    return resume.getByType(['work', 'internship']).length === 0
  }
  const entryType = BLOCK_TO_ENTRY_TYPE[blockId]
  if (!entryType) return false
  const items = resume.getByType(entryType)
  // education 在 single layout 下同时查 education + certificate
  if (blockId === 'education' && layout.state.layout === 'single') {
    return items.length === 0 && resume.getByType('certificate').length === 0
  }
  return items.length === 0
}

function onBlockUpdate(blockId, { id, field, value }) {
  if (!id) return
  const map = BLOCK_FIELD_MAP[blockId] || {}
  const realField = map[field] || field
  resume.update(id, { [realField]: value })
}

function onEmptyCtaAdd(entryType) {
  router.push(`/resume/manage?focus=${entryType}`)
}

function onToggleVisible(blockId) {
  layout.toggleBlock(blockId)
}

function onResetBlockOrder() {
  layout.resetLayout()
}

function blockProps(blockId) {
  const isSingle = layout.state.layout === 'single'
  switch (blockId) {
    case 'profile':
      return {
        bio: resume.getByType('profile')[0]?.summary || '',
      }
    case 'experiences':
      return { label: '工作经历', title: 'Experience', items: resume.getByType(['work', 'internship']), itemType: 'experience', collapsible: true }
    case 'education':
      if (isSingle) {
        return {
          educationItems: resume.getByType('education'),
          certificateItems: resume.getByType('certificate'),
        }
      }
      return { label: '教育', title: 'Education', items: resume.getByType('education'), itemType: 'education' }
    case 'projects':
      return { items: resume.getByType('project') }
    case 'skills':
      return { items: resume.getByType('skill').map(s => ({
        ...s,
        name: s.skillName || s.name,
        level: s.proficiency || s.level
      })) }
    case 'certificates':
      if (isSingle) return {}
      return { title: '证书', items: resume.getByType('certificate'), schema: 'certificate' }
    case 'awards':
      return { title: '奖项', items: resume.getByType('award'), schema: 'award' }
    case 'activities':
      return { title: '活动', items: resume.getByType('activity'), schema: 'activity' }
    default:
      return {}
  }
}
</script>

<template>
  <div
    class="resume-portal"
    :class="{ 'layout-two-column': layout.state.layout === 'two-column' }"
    :style="layout.themeVars"
  >
    <div class="portal-layout">
      <!-- Main content area -->
      <main class="portal-main">
        <!-- Top nav -->
        <nav class="portal-nav">
          <span
            class="nav-item nav-active"
          >预览</span>
          <button
            class="nav-item"
            @click="router.push('/resume/manage')"
          >管理</button>
        </nav>

        <!-- Hero -->
        <ResumeHero
          :personal-info="personalInfo"
          :accent="accentColor"
          @update="onHeroUpdate"
          @edit="router.push('/resume/manage')"
        />

        <ResumeDivider />

        <!-- Content blocks -->
        <div class="blocks-container">
          <template v-for="(block, idx) in layout.orderedVisibleBlocks.value" :key="block.id">
            <ResumeDivider v-if="idx > 0" />
            <div
              class="block-wrapper"
              :class="{ 'is-dragging': blockDraggingId === block.id }"
              @dragover.prevent="blockOnDragOver(idx, $event.currentTarget.getBoundingClientRect(), $event.clientY)"
              @drop="blockOnDrop()"
            >
            <!-- Empty state for non-profile blocks with no data -->
            <ResumeBlockEmptyState
              v-if="block.id !== 'profile' && isBlockEmpty(block.id)"
              :block-id="block.id"
              :label="BLOCK_LABELS[block.id] || block.id"
              :title="BLOCK_TITLES[block.id] || ''"
              :entry-type="BLOCK_TO_ENTRY_TYPE[block.id] || ''"
              :hideable="true"
              :hidden="false"
              :draggable="true"
              :resettable="true"
              @add="onEmptyCtaAdd"
              @toggle-visible="onToggleVisible(block.id)"
              @drag-start="blockOnDragStart(block.id)"
              @keymove="blockOnKeyMove(block.id, $event)"
              @reset-order="onResetBlockOrder()"
            />
            <!-- Normal block -->
            <component
              v-else-if="blockComponents[block.id]"
              :is="blockComponents[block.id]"
              v-bind="blockProps(block.id)"
              :hideable="block.id !== 'profile'"
              :hidden="false"
              :draggable="block.id !== 'profile'"
              :resettable="block.id !== 'profile'"
              @update="onBlockUpdate(block.id, $event)"
              @toggle-visible="onToggleVisible(block.id)"
              @drag-start="blockOnDragStart(block.id)"
              @keymove="blockOnKeyMove(block.id, $event)"
              @reset-order="onResetBlockOrder()"
            />
            </div>
          </template>
        </div>
      </main>

      <!-- Sidebar config (wide) -->
      <ResumeConfigPanel
        v-if="isWide"
        variant="sidebar"
      />
    </div>

    <!-- Narrow screen: config trigger button + drawer -->
    <button
      v-if="!isWide"
      type="button"
      class="config-fab"
      aria-label="打开配置面板"
      @click="configOpen = true"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    </button>

    <ResumeConfigPanel
      v-if="!isWide"
      v-model:open="configOpen"
      variant="drawer"
    />
  </div>
</template>

<style scoped>
.resume-portal {
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
}

.portal-layout {
  display: flex;
  max-width: 1500px;
  margin: 0 auto;
}

.portal-main {
  flex: 1;
  min-width: 0;
  padding: 0 64px 64px;
}

.portal-nav {
  display: flex;
  gap: 0.25rem;
  padding: 1rem 0;
  border-bottom: 1px solid var(--border);
  margin-bottom: 0;
}

.nav-item {
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 13px;
  font-weight: 500;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--muted);
  transition: all 0.15s;
}

.nav-item:hover {
  color: var(--text);
}

.nav-active {
  background: var(--accent);
  color: #fff !important;
}

.blocks-container {
  display: flex;
  flex-direction: column;
}

.block-wrapper {
  transition: opacity 0.15s;
}

.block-wrapper.is-dragging {
  opacity: 0.4;
}

/* Config FAB for narrow screens */
.config-fab {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 50;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--accent);
  color: #fff;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s;
}

.config-fab:hover {
  transform: scale(1.1);
}

/* Responsive: narrow screen */
@media (max-width: 1199px) {
  .portal-main {
    padding: 0 1.5rem 5rem;
  }
}
</style>
