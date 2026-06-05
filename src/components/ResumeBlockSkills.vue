<script setup>
import { computed } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  }
})

const grouped = computed(() => {
  const map = {}
  for (const item of props.items) {
    const cat = item.category || '其他'
    if (!map[cat]) map[cat] = []
    map[cat].push(item)
  }
  return map
})
</script>

<template>
  <section>
    <h2 class="text-xl font-bold mb-4" style="color: var(--text)">
      技能
    </h2>
    <div
      v-if="Object.keys(grouped).length === 0"
      class="text-sm"
      style="color: var(--muted)"
    >
      暂无技能信息，可在右上角配置面板隐藏此区块
    </div>
    <div v-else class="space-y-6">
      <div
        v-for="(skills, category) in grouped"
        :key="category"
      >
        <h3 class="text-sm font-semibold mb-2 uppercase tracking-wider" style="color: var(--muted)">
          {{ category }}
        </h3>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="skill in skills"
            :key="skill.name || skill.id"
            class="px-3 py-1 rounded-full text-sm font-medium"
            :style="{
              background: 'var(--accent)',
              color: '#ffffff',
              opacity: 0.6 + (skill.level ?? 50) / 250
            }"
          >
            {{ skill.name }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>
