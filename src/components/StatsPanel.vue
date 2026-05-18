<template>
  <div class="stats-panel">
    <h3>积分统计</h3>

    <div class="stat-cards">
      <div class="stat-card">
        <div class="stat-value">{{ store.kidPoints }}</div>
        <div class="stat-label">当前积分</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ totalEarned }}</div>
        <div class="stat-label">累计获得</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ totalSpent }}</div>
        <div class="stat-label">累计兑换</div>
      </div>
    </div>

    <div class="stat-cards">
      <div class="stat-card">
        <div class="stat-value">{{ todayDone }}</div>
        <div class="stat-label">今日完成</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ totalRedemptions }}</div>
        <div class="stat-label">兑换次数</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from '../composables/useStore.js'

const store = useStore()
const today = new Date().toISOString().split('T')[0]

const totalEarned = computed(() =>
  store.state.taskRecords
    .filter(r => r.status === 'approved')
    .reduce((s, r) => s + r.points, 0)
)

const totalSpent = computed(() =>
  store.state.redemptions.reduce((s, r) => s + r.pointsSpent, 0)
)

const todayDone = computed(() =>
  store.state.taskRecords.filter(r => r.status === 'approved' && r.date === today).length
)

const totalRedemptions = computed(() => store.state.redemptions.length)
</script>

<style scoped>
.stats-panel { padding: 16px; }
.stats-panel h3 { font-size: 17px; margin-bottom: 16px; }
.stat-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 10px; }
.stat-card {
  background: white; border-radius: 12px; padding: 16px 10px; text-align: center;
}
.stat-value { font-size: 28px; font-weight: 700; color: #ff6b35; }
.stat-label { font-size: 12px; color: #999; margin-top: 4px; }
</style>
