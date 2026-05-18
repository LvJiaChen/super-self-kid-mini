<template>
  <div class="task-card" :class="statusClass">
    <div class="task-left">
      <div class="task-icon">
        {{ status === 'approved' ? '✅' : status === 'submitted' ? '⏳' : '📌' }}
      </div>
      <div class="task-info">
        <div class="task-title">{{ record.title }}</div>
        <div class="task-points">+{{ record.points }} ⭐</div>
      </div>
    </div>
    <button
      v-if="status === 'pending'"
      class="task-submit"
      @click="$emit('submit', record.id)"
    >
      我完成了！
    </button>
    <div v-else-if="status === 'submitted'" class="task-badge badge-submitted">
      等待审核
    </div>
    <div v-else-if="status === 'approved'" class="task-badge badge-approved">
      已获得积分
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  record: { type: Object, required: true }
})

defineEmits(['submit'])

const status = computed(() => props.record.status)
const statusClass = computed(() => `status-${status.value}`)
</script>

<style scoped>
.task-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: white;
  border-radius: 12px;
  margin-bottom: 8px;
  transition: all 0.2s;
}
.task-card.status-approved {
  opacity: 0.7;
  background: #f0fff0;
}
.task-left { display: flex; align-items: center; gap: 12px; }
.task-icon { font-size: 24px; }
.task-title { font-size: 16px; font-weight: 500; }
.task-points { font-size: 13px; color: #ff6b35; margin-top: 2px; }

.task-submit {
  padding: 8px 16px;
  background: #ff6b35;
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}
.task-submit:active { transform: scale(0.95); }

.task-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  white-space: nowrap;
}
.badge-submitted { background: #fff3cd; color: #856404; }
.badge-approved { background: #d4edda; color: #155724; }
</style>
