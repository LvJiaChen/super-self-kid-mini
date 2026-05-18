<template>
  <div class="kid-header">
    <div class="avatar">🦸</div>
    <div class="info">
      <div class="name">{{ store.state.settings.kidName || '小超人' }}</div>
      <div class="points">
        <span class="points-star">⭐</span>
        <span class="points-value">{{ store.kidPoints }}</span>
        <span class="points-label">积分</span>
      </div>
    </div>
    <div class="streak">🔥 第 1 天</div>
  </div>
</template>

<script setup>
import { useStore } from '../composables/useStore.js'
const store = useStore()
</script>

<style scoped>
.kid-header {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background: white;
  border-radius: 16px;
  margin: 0 16px 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}
.avatar { font-size: 40px; margin-right: 12px; }
.info { flex: 1; }
.name { font-size: 20px; font-weight: 700; color: #333; }
.points { margin-top: 4px; }
.points-star { font-size: 18px; }
.points-value {
  font-size: 22px;
  font-weight: 700;
  color: #ff6b35;
  margin: 0 4px 0 6px;
}
.points-label { font-size: 13px; color: #999; }
.streak {
  font-size: 13px;
  color: #ff9800;
  background: #fff3e0;
  padding: 6px 12px;
  border-radius: 20px;
}
</style>
