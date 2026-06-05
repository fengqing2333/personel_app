<script setup>
import { ref, computed } from 'vue'
import { useResume } from '../composables/useResume'
import { useResumeLayout } from '../composables/useResumeLayout'
import ResumeHero from '../components/ResumeHero.vue'
import ResumeBlockProfile from '../components/ResumeBlockProfile.vue'
import ResumeBlockTimeline from '../components/ResumeBlockTimeline.vue'
import ResumeBlockProjects from '../components/ResumeBlockProjects.vue'
import ResumeBlockSkills from '../components/ResumeBlockSkills.vue'
import ResumeBlockList from '../components/ResumeBlockList.vue'
import ResumeConfigPanel from '../components/ResumeConfigPanel.vue'

const resume = useResume()
const layout = useResumeLayout()
const configOpen = ref(false)

const blockComponents = {
  profile: ResumeBlockProfile,
  experiences: ResumeBlockTimeline,
  education: ResumeBlockTimeline,
  projects: ResumeBlockProjects,
  skills: ResumeBlockSkills,
  certificates: ResumeBlockList,
  awards: ResumeBlockList,
  activities: ResumeBlockList,
}

const personalInfo = computed(() => {
  const profile = resume.getByType('profile')[0]
  if (!profile) return { name: '', title: '', bio: '', email: '', phone: '', location: '' }
  return {
    name: profile.name || '',
    title: profile.title || '',
    bio: profile.summary || '',
    email: profile.email || '',
    phone: profile.phone || '',
    location: profile.location || '',
  }
})

const accentColor = computed(() => {
  return layout.themeVars.value['--accent'] || '#7c8aff'
})

function blockProps(blockId) {
  switch (blockId) {
    case 'profile':
      return {
        bio: resume.getByType('profile')[0]?.summary || '',
      }
    case 'experiences':
      return { title: '工作经历', items: resume.getByType('work'), itemType: 'experience' }
    case 'education':
      return { title: '教育', items: resume.getByType('education'), itemType: 'education' }
    case 'projects':
      return { items: resume.getByType('project') }
    case 'skills':
      return { items: resume.getByType('skill') }
    case 'certificates':
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
    <!-- Sticky header -->
    <header class="resume-header">
      <h2 class="resume-header-title">简历预览</h2>
      <button
        class="config-btn"
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
    </header>

    <!-- Hero section -->
    <div class="resume-hero">
      <ResumeHero
        :personal-info="personalInfo"
        :accent="accentColor"
      />
    </div>

    <!-- Main content blocks -->
    <main class="resume-main">
      <template v-for="blockId in layout.orderedVisibleBlocks" :key="blockId">
        <component
          :is="blockComponents[blockId]"
          v-bind="blockProps(blockId)"
        />
      </template>
    </main>

    <!-- Config panel -->
    <ResumeConfigPanel v-model:open="configOpen" />
  </div>
</template>

<style scoped>
.resume-portal {
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
  padding: 1.5rem;
}

.resume-header {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border);
  background: var(--bg);
}

.resume-header-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
}

.config-btn {
  background: none;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  color: var(--muted);
  cursor: pointer;
  padding: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.config-btn:hover {
  color: var(--text);
  border-color: var(--accent);
}

.resume-hero {
  margin-bottom: 2rem;
}

.resume-main {
  max-width: 720px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.layout-two-column .resume-main {
  max-width: 960px;
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 2rem;
  align-items: start;
}
</style>
