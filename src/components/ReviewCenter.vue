<template>
  <div class="review-center">
    <h3>任务审核</h3>
    <div v-if="submitted.length === 0 && approved.length === 0" class="empty">
      暂无待审核任务
    </div>

    <div v-if="submitted.length > 0">
      <h4 class="sub-title">待审核 ({{ submitted.length }})</h4>
      <div class="review-item submitted" v-for="r in submitted" :key="r.id">
        <div class="r-left">
          <div class="r-title">{{ r.title }}</div>
          <div class="r-meta">{{ r.date }} · +{{ r.points }}⭐</div>
        </div>
        <div class="r-actions">
          <button class="r-approve" @click="store.approveTask(r.id)">✓ 通过</button>
          <button class="r-reject" @click="store.rejectTask(r.id)">✗ 拒绝</button>
        </div>
      </div>
    </div>

    <div v-if="approved.length > 0" class="approved-section">
      <h4 class="sub-title">今日已通过</h4>
      <div class="review-item approved" v-for="r in approved" :key="r.id">
        <span class="r-title">{{ r.title }}</span>
        <span class="r-pts">+{{ r.points }}⭐</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from '../composables/useStore.js'

const store = useStore()
const today = new Date().toISOString().split('T')[0]

const submitted = computed(() =>
  store.state.taskRecords.filter(r => r.status === 'submitted' && r.date === today)
)
const approved = computed(() =>
  store.state.taskRecords.filter(r => r.status === 'approved' && r.date === today)
)
</script>

<style scoped>
.review-center { padding: 16px; }
.review-center h3 { font-size: 17px; margin-bottom: 12px; }
.sub-title { font-size: 14px; color: #888; margin: 12px 0 8px; }
.empty { text-align: center; padding: 40px 20px; color: #bbb; }
.review-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: white;
  border-radius: 12px;
  margin-bottom: 8px;
}
.review-item.submitted { border-left: 3px solid #ff9800; }
.review-item.approved { border-left: 3px solid #4caf50; }
.r-left { flex: 1; }
.r-title { font-size: 16px; font-weight: 500; }
.r-meta { font-size: 12px; color: #999; margin-top: 2px; }
.r-pts { color: #4caf50; font-weight: 600; }
.r-actions { display: flex; gap: 8px; }
.r-approve, .r-reject {
  padding: 6px 14px;
  border: none;
  border-radius: 16px;
  font-size: 13px;
  cursor: pointer;
}
.r-approve { background: #4caf50; color: white; }
.r-reject { background: #eee; color: #666; }
</style>
