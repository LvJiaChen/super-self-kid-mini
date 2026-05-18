<template>
  <div class="daily-tasks">
    <h2 class="section-title">📋 今日任务</h2>
    <div v-if="todayRecords.length === 0" class="empty">
      <p>今天没有任务哦～</p>
      <p class="sub">去家长模式添加任务吧</p>
    </div>
    <TaskCard
      v-for="record in todayRecords"
      :key="record.id"
      :record="record"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from '../composables/useStore.js'
import TaskCard from './TaskCard.vue'

const store = useStore()

const today = new Date().toISOString().split('T')[0]
const todayRecords = computed(() =>
  store.state.taskRecords.filter(r => r.date === today)
)

function handleSubmit(recordId) {
  store.submitTask(recordId)
}
</script>

<style scoped>
.daily-tasks {
  margin: 0 16px;
}
.section-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 12px;
  color: #555;
}
.empty {
  text-align: center;
  padding: 30px;
  color: #bbb;
}
.empty .sub { font-size: 13px; margin-top: 4px; }
</style>
