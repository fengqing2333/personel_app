<script setup>
import { getLogoStyle } from '../data/resumeLogos.js'

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  items: {
    type: Array,
    default: () => []
  },
  schema: {
    type: String,
    default: 'certificate'
  }
})

const VALID_SCHEMAS = ['certificate', 'award', 'activity']

const fieldMap = {
  certificate: { primary: 'name', secondary: 'issuer', date: 'date' },
  award: { primary: 'name', secondary: 'issuer', date: 'date' },
  activity: { primary: 'name', secondary: 'role', date: 'startDate' }
}

import { computed } from 'vue'
const resolvedSchema = computed(() => {
  return VALID_SCHEMAS.includes(props.schema) ? props.schema : 'certificate'
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
    <div v-else class="space-y-3">
      <div
        v-for="item in items"
        :key="item.id"
        class="flex gap-4 p-4 rounded-xl"
        style="background: var(--card); border: 1px solid var(--border)"
      >
        <div
          class="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
          :style="{
            background: getLogoStyle(item.name || '').bg,
            color: getLogoStyle(item.name || '').fg
          }"
        >
          {{ getLogoStyle(item.name || '').char }}
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="font-semibold" style="color: var(--text)">
            {{ item[fieldMap[resolvedSchema.value].primary] }}
          </h3>
          <p
            v-if="item[fieldMap[resolvedSchema.value].secondary]"
            class="text-sm"
            style="color: var(--accent)"
          >
            {{ item[fieldMap[resolvedSchema.value].secondary] }}
          </p>
          <p
            v-if="item[fieldMap[resolvedSchema.value].date]"
            class="text-xs mt-1"
            style="color: var(--muted)"
          >
            {{ item[fieldMap[resolvedSchema.value].date] }}
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
