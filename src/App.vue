<template>
  <ModeGate>
    <template #kid>
      <KidView />
    </template>
    <template #parent>
      <ParentView />
    </template>
  </ModeGate>
</template>

<script setup>
import ModeGate from './components/ModeGate.vue'
import KidView from './components/KidView.vue'
import ParentView from './components/ParentView.vue'
import { useStore } from './composables/useStore.js'

useStore().generateDailyTasks()
</script>
