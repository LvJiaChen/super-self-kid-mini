<template>
  <div class="history" v-if="store.state.redemptions.length > 0">
    <h2 class="section-title">📜 兑换记录</h2>
    <div class="history-item" v-for="r in recentRedemptions" :key="r.id">
      <span class="h-title">{{ r.rewardTitle }}</span>
      <span class="h-points">-{{ r.pointsSpent }} ⭐</span>
      <span class="h-date">{{ formatDate(r.redeemedAt) }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from '../composables/useStore.js'

const store = useStore()

const recentRedemptions = computed(() =>
  [...store.state.redemptions].reverse().slice(0, 10)
)

function formatDate(ts) {
  const d = new Date(ts)
  return `${d.getMonth() + 1}/${d.getDate()}`
}
</script>

<style scoped>
.history { margin: 20px 16px; }
.section-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 12px;
  color: #555;
}
.history-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  background: white;
  border-radius: 10px;
  margin-bottom: 6px;
  gap: 12px;
}
.h-title { flex: 1; font-size: 14px; }
.h-points { font-size: 14px; color: #e74c3c; font-weight: 600; }
.h-date { font-size: 12px; color: #aaa; }
</style>
