<template>
  <div class="reward-card">
    <div class="reward-left">
      <div class="reward-icon">🎁</div>
      <div class="reward-info">
        <div class="reward-title">{{ reward.title }}</div>
        <div class="reward-cost">{{ reward.pointsCost }} ⭐</div>
      </div>
    </div>
    <button
      class="redeem-btn"
      :class="{ disabled: !canAfford }"
      :disabled="!canAfford"
      @click="$emit('redeem', reward.id)"
    >
      {{ canAfford ? '兑换' : '积分不够' }}
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from '../composables/useStore.js'

const props = defineProps({
  reward: { type: Object, required: true }
})

defineEmits(['redeem'])

const store = useStore()
const canAfford = computed(() => store.kidPoints >= props.reward.pointsCost)
</script>

<style scoped>
.reward-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: white;
  border-radius: 12px;
  margin-bottom: 8px;
}
.reward-left { display: flex; align-items: center; gap: 12px; }
.reward-icon { font-size: 28px; }
.reward-title { font-size: 16px; font-weight: 500; }
.reward-cost { font-size: 14px; color: #ff6b35; margin-top: 2px; }

.redeem-btn {
  padding: 8px 20px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}
.redeem-btn:active { transform: scale(0.95); }
.redeem-btn.disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>
