<script setup>
defineProps({
  entries: {
    type: Array,
    default: () => []
  },
  type: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['edit', 'delete'])
</script>

<template>
  <div class="space-y-4">
    <div
      v-for="entry in entries"
      :key="entry.id"
      class="relative flex gap-5 p-5 rounded-xl transition-all hover:shadow-md group"
      style="background: var(--resume-card, #e4e6ea);"
    >
      <!-- Timeline dot -->
      <div class="flex-shrink-0">
        <div
          class="w-[72px] h-[72px] rounded-full flex items-center justify-center text-lg font-bold overflow-hidden"
          :style="{
            background: 'var(--resume-logo-bg, #5a6a8a)',
            color: '#fff'
          }"
        >
          <template v-if="entry.logo && entry.logo.startsWith('http')">
            <img :src="entry.logo" alt="" class="w-full h-full object-cover" />
          </template>
          <template v-else-if="entry.logo">
            {{ entry.logo }}
          </template>
          <template v-else>
            {{ (entry.company || entry.name || entry.school || entry.issuer || '?').charAt(0).toUpperCase() }}
          </template>
        </div>
      </div>

      <!-- Content -->
      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between gap-2">
          <div>
            <h3 class="text-lg font-bold truncate" style="color: var(--resume-text, #2a2a3a); font-size: 18px;">
              {{ entry.company || entry.name || entry.school || entry.issuer || entry.title || entry.skillName }}
            </h3>
            <p v-if="entry.position || entry.role || entry.degree || entry.title || entry.category" class="text-sm mt-0.5" style="color: #5a6a8a;">
              {{ entry.position || entry.role || entry.degree || entry.title }}<template v-if="entry.field"> — {{ entry.field }}</template>
            </p>
          </div>
          <!-- Action buttons -->
          <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              class="w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-colors hover:opacity-70"
              style="background: rgba(90,106,138,0.15); color: #5a6a8a;"
              @click="emit('edit', entry)"
              title="编辑"
            >&#9998;</button>
            <button
              class="w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-colors hover:opacity-70"
              style="background: rgba(220,80,80,0.12); color: #dc5050;"
              @click="emit('delete', entry)"
              title="删除"
            >&#10005;</button>
          </div>
        </div>

        <!-- Date range -->
        <p v-if="entry.startDate" class="text-xs mt-2" style="color: #7a8aaa;">
          {{ entry.startDate }}<template v-if="entry.endDate"> — {{ entry.endDate }}</template>
          <template v-else-if="entry.date"> — {{ entry.date }}</template>
        </p>

        <!-- Description -->
        <p v-if="entry.description" class="text-sm mt-2 leading-relaxed" style="color: #4a5a7a;">
          {{ entry.description }}
        </p>

        <!-- Tags -->
        <div v-if="entry.tags && entry.tags.length" class="flex flex-wrap gap-1.5 mt-3">
          <span
            v-for="(tag, i) in entry.tags"
            :key="i"
            class="px-2.5 py-0.5 rounded-full text-xs font-medium"
            :style="{
              background: 'rgba(90,106,138,0.12)',
              color: '#5a6a8a'
            }"
          >{{ tag }}</span>
        </div>

        <!-- Technologies -->
        <div v-if="entry.technologies && entry.technologies.length" class="flex flex-wrap gap-1.5 mt-2">
          <span
            v-for="(tech, i) in entry.technologies"
            :key="i"
            class="px-2 py-0.5 rounded text-xs"
            :style="{
              background: 'rgba(90,106,138,0.08)',
              color: '#6a7a9a',
              fontFamily: 'monospace'
            }"
          >{{ tech }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
