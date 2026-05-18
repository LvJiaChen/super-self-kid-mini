<template>
  <div class="kid-view">
    <KidHeader />
    <DailyTasks />
    <RewardShop />
    <RedemptionHistory />
  </div>
</template>

<script setup>
import KidHeader from './KidHeader.vue'
import DailyTasks from './DailyTasks.vue'
import RewardShop from './RewardShop.vue'
import RedemptionHistory from './RedemptionHistory.vue'
</script>

<style scoped>
.kid-view {
  padding-bottom: 40px;
}
</style>
