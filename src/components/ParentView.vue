<template>
  <div class="parent-view">
    <ParentTabs v-model="activeTab" />
    <ReviewCenter v-if="activeTab === 'review'" />
    <TasksManage v-if="activeTab === 'tasks'" />
    <RewardsManage v-if="activeTab === 'rewards'" />
    <StatsPanel v-if="activeTab === 'stats'" />
    <SettingsPanel v-if="activeTab === 'settings'" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ParentTabs from './ParentTabs.vue'
import ReviewCenter from './ReviewCenter.vue'
import TasksManage from './TasksManage.vue'
import RewardsManage from './RewardsManage.vue'
import StatsPanel from './StatsPanel.vue'
import SettingsPanel from './SettingsPanel.vue'

const activeTab = ref('review')
</script>

<style scoped>
.parent-view { padding-bottom: 40px; }
</style>
