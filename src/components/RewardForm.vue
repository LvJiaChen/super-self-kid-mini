<template>
  <div class="form-overlay" @click.self="$emit('close')">
    <div class="reward-form">
      <h3>{{ editing ? '编辑奖励' : '添加奖励' }}</h3>
      <label>奖励名称</label>
      <input v-model="form.title" placeholder="例如：看30分钟电视" />
      <label>所需积分</label>
      <input v-model.number="form.pointsCost" type="number" min="1" />
      <label>分类（可选）</label>
      <input v-model="form.category" placeholder="例如：屏幕时间" />
      <div class="form-buttons">
        <button class="btn-save" @click="save">保存</button>
        <button class="btn-cancel" @click="$emit('close')">取消</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

const props = defineProps({
  editing: { type: Object, default: null }
})

const emit = defineEmits(['save', 'close'])

const form = reactive({
  title: props.editing?.title || '',
  pointsCost: props.editing?.pointsCost || 10,
  category: props.editing?.category || ''
})

function save() {
  if (!form.title.trim()) return
  emit('save', { ...form })
}
</script>

<style scoped>
.form-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex; align-items: flex-end; justify-content: center;
  z-index: 100;
}
.reward-form {
  background: white; width: 100%; max-width: 420px;
  border-radius: 20px 20px 0 0; padding: 24px 20px 30px;
}
.reward-form h3 { margin-bottom: 16px; font-size: 18px; }
.reward-form label { display: block; font-size: 13px; color: #888; margin: 12px 0 4px; }
.reward-form input {
  width: 100%; padding: 10px; border: 1px solid #ddd;
  border-radius: 8px; font-size: 15px;
}
.form-buttons { display: flex; gap: 12px; margin-top: 20px; }
.btn-save { flex: 1; padding: 12px; background: #ff6b35; color: white; border: none; border-radius: 10px; font-size: 16px; cursor: pointer; }
.btn-cancel { flex: 1; padding: 12px; background: #eee; color: #666; border: none; border-radius: 10px; font-size: 16px; cursor: pointer; }
</style>
