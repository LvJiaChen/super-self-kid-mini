<template>
  <div class="reward-shop">
    <h2 class="section-title">🎪 奖励商店</h2>
    <div v-if="activeRewards.length === 0" class="empty">
      <p>暂时没有可兑换的奖励</p>
    </div>
    <RewardCard
      v-for="reward in activeRewards"
      :key="reward.id"
      :reward="reward"
      @redeem="handleRedeem"
    />
    <div v-if="redeemMsg" class="redeem-msg" :class="redeemMsg.type">
      {{ redeemMsg.text }}
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useStore } from '../composables/useStore.js'
import RewardCard from './RewardCard.vue'

const store = useStore()
const redeemMsg = ref(null)

const activeRewards = computed(() =>
  store.state.rewards.filter(r => r.isActive)
)

function handleRedeem(rewardId) {
  const ok = store.redeemReward(rewardId)
  if (ok) {
    redeemMsg.value = { type: 'success', text: '兑换成功！快去享受吧～' }
  } else {
    redeemMsg.value = { type: 'error', text: '积分不够哦，继续加油完成任务吧！' }
  }
  setTimeout(() => { redeemMsg.value = null }, 3000)
}
</script>

<style scoped>
.reward-shop { margin: 20px 16px; }
.section-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 12px;
  color: #555;
}
.empty { text-align: center; padding: 30px; color: #bbb; }
.redeem-msg {
  text-align: center;
  padding: 10px;
  border-radius: 8px;
  margin-top: 8px;
  font-size: 14px;
}
.redeem-msg.success { background: #d4edda; color: #155724; }
.redeem-msg.error { background: #f8d7da; color: #721c24; }
</style>
