<template>
  <ModeGate>
    <template #kid>
      <div class="placeholder">👦 孩子模式（即将实现）</div>
    </template>
    <template #parent>
      <div class="placeholder">👩 家长模式（即将实现）</div>
    </template>
  </ModeGate>
</template>

<script setup>
import ModeGate from './components/ModeGate.vue'
import { useStore } from './composables/useStore.js'
useStore().generateDailyTasks()
</script>
