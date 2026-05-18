<template>
  <ModeGate>
    <template #kid>
      <KidView />
    </template>
    <template #parent>
      <div class="placeholder">👩 家长模式（即将实现）</div>
    </template>
  </ModeGate>
</template>

<script setup>
import ModeGate from './components/ModeGate.vue'
import KidView from './components/KidView.vue'
import { useStore } from './composables/useStore.js'
useStore().generateDailyTasks()
</script>
