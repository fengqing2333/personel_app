<script setup>
const emit = defineEmits(['select', 'close'])
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center" @click.self="emit('close')">
    <div class="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
    <div class="relative bg-[var(--bg-card)] rounded-2xl p-6 shadow-xl border border-[var(--border)] w-72">
      <h3 class="text-sm font-medium mb-4 text-[var(--text-primary)]">选择请假类型</h3>
      <div class="space-y-2">
        <button
          class="w-full py-3 px-4 rounded-xl text-sm font-medium transition-all hover:opacity-80"
          style="background: rgba(0,194,255,0.1); color: var(--accent); border: 1px solid rgba(0,194,255,0.2);"
          @click="emit('select', 'annual')"
        >年假</button>
        <button
          class="w-full py-3 px-4 rounded-xl text-sm font-medium transition-all hover:opacity-80"
          style="background: rgba(251,113,133,0.1); color: var(--danger); border: 1px solid rgba(251,113,133,0.2);"
          @click="emit('select', 'personal')"
        >事假</button>
        <button
          class="w-full py-3 px-4 rounded-xl text-sm font-medium transition-all hover:opacity-80"
          style="background: rgba(133,150,251,0.1); color: #8596fb; border: 1px solid rgba(133,150,251,0.2);"
          @click="emit('select', 'sick')"
        >病假</button>
      </div>
      <button
        class="w-full mt-3 py-2 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        @click="emit('close')"
      >取消</button>
    </div>
  </div>
</template>
