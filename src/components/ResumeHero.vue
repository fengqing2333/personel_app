<script setup>
defineProps({
  personalInfo: {
    type: Object,
    default: () => ({ name: '', title: '', bio: '', email: '', phone: '', location: '' })
  },
  accent: {
    type: String,
    default: '#7c8aff'
  }
})
</script>

<template>
  <div class="space-y-4">
    <h1 class="text-3xl font-bold" style="color: var(--text)">
      {{ personalInfo.name || '未命名' }}
    </h1>
    <p
      v-if="personalInfo.title"
      class="text-xl font-medium"
      :style="{ color: accent }"
    >
      {{ personalInfo.title }}
    </p>
    <p
      v-if="personalInfo.bio"
      class="text-sm leading-relaxed"
      style="color: var(--muted)"
    >
      {{ personalInfo.bio }}
    </p>
    <div
      v-if="personalInfo.email || personalInfo.phone || personalInfo.location"
      class="flex flex-wrap gap-x-6 gap-y-1 text-sm"
      style="color: var(--muted)"
    >
      <span v-if="personalInfo.email">{{ personalInfo.email }}</span>
      <span v-if="personalInfo.phone">{{ personalInfo.phone }}</span>
      <span v-if="personalInfo.location">{{ personalInfo.location }}</span>
    </div>
  </div>
</template>
