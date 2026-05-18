<template>
  <div class="parent-tabs">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      class="tab-btn"
      :class="{ active: modelValue === tab.key }"
      @click="$emit('update:modelValue', tab.key)"
    >
      {{ tab.icon }} {{ tab.label }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: String, required: true }
})
defineEmits(['update:modelValue'])

const tabs = [
  { key: 'review', label: '审核', icon: '✅' },
  { key: 'tasks', label: '任务', icon: '📋' },
  { key: 'rewards', label: '奖励', icon: '🎁' },
  { key: 'stats', label: '统计', icon: '📊' },
  { key: 'settings', label: '设置', icon: '⚙️' }
]
</script>

<style scoped>
.parent-tabs {
  display: flex;
  gap: 6px;
  padding: 10px 16px;
  overflow-x: auto;
  background: white;
  border-bottom: 1px solid #eee;
}
.tab-btn {
  flex-shrink: 0;
  padding: 8px 14px;
  border: none;
  background: #f5f5f5;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  color: #666;
  white-space: nowrap;
}
.tab-btn.active {
  background: #ff6b35;
  color: white;
}
</style>
