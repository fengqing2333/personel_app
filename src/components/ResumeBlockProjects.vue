<script setup>
import { getLogoStyle } from '../data/resumeLogos.js'

defineProps({
  items: {
    type: Array,
    default: () => []
  }
})
</script>

<template>
  <section>
    <h2 class="text-xl font-bold mb-4" style="color: var(--text)">
      项目
    </h2>
    <div
      v-if="items.length === 0"
      class="text-sm"
      style="color: var(--muted)"
    >
      暂无项目，可在右上角配置面板隐藏此区块
    </div>
    <div v-else class="grid grid-cols-1 gap-4">
      <div
        v-for="item in items"
        :key="item.id"
        class="p-4 rounded-xl"
        style="background: var(--card); border: 1px solid var(--border)"
      >
        <div class="flex items-start gap-3">
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
              {{ item.name }}
            </h3>
            <p
              v-if="item.role"
              class="text-sm"
              style="color: var(--accent)"
            >
              {{ item.role }}
            </p>
            <p
              v-if="item.description"
              class="text-sm mt-2 leading-relaxed"
              style="color: var(--muted)"
            >
              {{ item.description }}
            </p>
            <div
              v-if="item.technologies && item.technologies.length"
              class="flex flex-wrap gap-1.5 mt-3"
            >
              <span
                v-for="(tech, i) in item.technologies"
                :key="i"
                class="px-2.5 py-0.5 rounded-full text-xs"
                style="background: var(--bg-soft); color: var(--text)"
              >
                {{ tech }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
