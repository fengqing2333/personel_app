<script setup>
defineProps({
  bio: {
    type: String,
    default: ''
  },
  name: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <section>
    <h2 class="text-xl font-bold mb-4" style="color: var(--text)">
      关于我
    </h2>
    <p
      v-if="bio"
      class="text-sm leading-relaxed"
      style="color: var(--muted)"
    >
      {{ bio }}
    </p>
    <p
      v-else
      class="text-sm"
      style="color: var(--muted)"
    >
      暂无个人简介，可在右上角配置面板隐藏此区块
    </p>
  </section>
</template>
