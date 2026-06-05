<script setup>
import { getLogoStyle } from '../data/resumeLogos.js'

defineProps({
  title: {
    type: String,
    default: ''
  },
  items: {
    type: Array,
    default: () => []
  },
  itemType: {
    type: String,
    default: 'experience'
  }
})
</script>

<template>
  <section>
    <h2 class="text-xl font-bold mb-4" style="color: var(--text)">
      {{ title }}
    </h2>
    <div
      v-if="items.length === 0"
      class="text-sm"
      style="color: var(--muted)"
    >
      暂无{{ title }}，可在右上角配置面板隐藏此区块
    </div>
    <div v-else class="space-y-4">
      <div
        v-for="item in items"
        :key="item.id"
        class="flex gap-4 p-4 rounded-xl"
        style="background: var(--card); border: 1px solid var(--border)"
      >
        <div
          class="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
          :style="{
            background: getLogoStyle(item.company || item.school || '').bg,
            color: getLogoStyle(item.company || item.school || '').fg
          }"
        >
          {{ getLogoStyle(item.company || item.school || '').char }}
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="font-semibold" style="color: var(--text)">
            {{ itemType === 'education' ? item.school : item.company }}
          </h3>
          <p
            v-if="itemType === 'education' ? item.degree : item.position"
            class="text-sm"
            style="color: var(--accent)"
          >
            {{ itemType === 'education' ? item.degree : item.position }}
          </p>
          <p
            v-if="item.startDate"
            class="text-xs mt-1"
            style="color: var(--muted)"
          >
            {{ item.startDate }}<template v-if="item.endDate"> — {{ item.endDate }}</template>
            <template v-else> — 至今</template>
          </p>
          <p
            v-if="item.description"
            class="text-sm mt-2 leading-relaxed"
            style="color: var(--muted)"
          >
            {{ item.description }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
