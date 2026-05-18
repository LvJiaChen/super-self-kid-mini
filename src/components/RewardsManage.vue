<template>
  <div class="rewards-manage">
    <div class="section-header">
      <h3>奖励管理</h3>
      <button class="add-btn" @click="showForm = true">+ 添加</button>
    </div>

    <div v-if="store.state.rewards.length === 0" class="empty">
      还没有奖励，点击"添加"创建第一个
    </div>

    <div class="reward-item" v-for="reward in store.state.rewards" :key="reward.id">
      <div class="r-body">
        <span class="r-title">{{ reward.title }}</span>
        <span class="r-cost">{{ reward.pointsCost }}⭐</span>
      </div>
      <div class="r-meta">
        <span class="r-cat" v-if="reward.category">{{ reward.category }}</span>
        <button class="toggle-btn" :class="{ active: reward.isActive }" @click="toggle(reward)">
          {{ reward.isActive ? '上架' : '下架' }}
        </button>
      </div>
      <div class="r-actions">
        <button class="action-edit" @click="editReward(reward)">编辑</button>
        <button class="action-del" @click="store.deleteReward(reward.id)">删除</button>
      </div>
    </div>

    <RewardForm
      v-if="showForm"
      :editing="editingReward"
      @save="handleSave"
      @close="closeForm"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useStore } from '../composables/useStore.js'
import RewardForm from './RewardForm.vue'

const store = useStore()
const showForm = ref(false)
const editingReward = ref(null)

function toggle(reward) {
  store.updateReward(reward.id, { isActive: !reward.isActive })
}

function editReward(reward) {
  editingReward.value = reward
  showForm.value = true
}

function handleSave(form) {
  if (editingReward.value) {
    store.updateReward(editingReward.value.id, form)
  } else {
    store.addReward(form)
  }
  closeForm()
}

function closeForm() {
  showForm.value = false
  editingReward.value = null
}
</script>

<style scoped>
.rewards-manage { padding: 16px; }
.section-header {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;
}
.section-header h3 { font-size: 17px; }
.add-btn { padding: 6px 16px; background: #ff6b35; color: white; border: none; border-radius: 20px; font-size: 14px; cursor: pointer; }
.empty { text-align: center; padding: 40px 20px; color: #bbb; }
.reward-item { background: white; border-radius: 12px; padding: 14px; margin-bottom: 8px; }
.r-body { display: flex; justify-content: space-between; align-items: center; }
.r-title { font-size: 16px; font-weight: 500; }
.r-cost { color: #ff6b35; font-weight: 600; }
.r-meta { margin-top: 4px; display: flex; gap: 8px; align-items: center; }
.r-cat { font-size: 12px; color: #999; }
.toggle-btn { padding: 2px 10px; border: 1px solid #ddd; border-radius: 12px; background: white; font-size: 11px; cursor: pointer; }
.toggle-btn.active { background: #4caf50; color: white; border-color: #4caf50; }
.r-actions { margin-top: 8px; display: flex; gap: 12px; justify-content: flex-end; }
.action-edit, .action-del { padding: 4px 12px; border: none; border-radius: 14px; font-size: 12px; cursor: pointer; }
.action-edit { background: #e3f2fd; color: #1565c0; }
.action-del { background: #fce4ec; color: #c62828; }
</style>
