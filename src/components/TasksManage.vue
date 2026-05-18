<template>
  <div class="tasks-manage">
    <div class="section-header">
      <h3>任务模板</h3>
      <button class="add-btn" @click="showForm = true">+ 添加</button>
    </div>

    <div v-if="store.state.tasks.length === 0" class="empty">
      还没有任务，点击"添加"创建第一个任务
    </div>

    <div class="task-item" v-for="task in store.state.tasks" :key="task.id">
      <div class="task-meta">
        <span class="task-type" :class="task.type">
          {{ task.type === 'daily' ? '每日' : '一次' }}
        </span>
        <span class="task-cat" v-if="task.category">{{ task.category }}</span>
      </div>
      <div class="task-body">
        <div class="task-name">{{ task.title }}</div>
        <div class="task-pts">+{{ task.points }}⭐</div>
        <button
          class="toggle-btn"
          :class="{ active: task.isActive }"
          @click="toggleActive(task)"
        >
          {{ task.isActive ? '启用' : '停用' }}
        </button>
      </div>
      <div class="task-actions">
        <button class="action-edit" @click="editTask(task)">编辑</button>
        <button class="action-del" @click="store.deleteTask(task.id)">删除</button>
      </div>
    </div>

    <TaskForm
      v-if="showForm"
      :editing="editingTask"
      @save="handleSave"
      @close="closeForm"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useStore } from '../composables/useStore.js'
import TaskForm from './TaskForm.vue'

const store = useStore()
const showForm = ref(false)
const editingTask = ref(null)

function toggleActive(task) {
  store.updateTask(task.id, { isActive: !task.isActive })
}

function editTask(task) {
  editingTask.value = task
  showForm.value = true
}

function handleSave(form) {
  if (editingTask.value) {
    store.updateTask(editingTask.value.id, form)
  } else {
    store.addTask(form)
  }
  closeForm()
}

function closeForm() {
  showForm.value = false
  editingTask.value = null
}
</script>

<style scoped>
.tasks-manage { padding: 16px; }
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.section-header h3 { font-size: 17px; }
.add-btn {
  padding: 6px 16px;
  background: #ff6b35;
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
}
.empty { text-align: center; padding: 40px 20px; color: #bbb; }
.task-item {
  background: white;
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 8px;
}
.task-meta { margin-bottom: 6px; }
.task-type {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 8px;
  margin-right: 6px;
}
.task-type.daily { background: #e3f2fd; color: #1565c0; }
.task-type.one-time { background: #fce4ec; color: #c62828; }
.task-cat { font-size: 12px; color: #999; }
.task-body {
  display: flex;
  align-items: center;
  gap: 10px;
}
.task-name { flex: 1; font-size: 16px; font-weight: 500; }
.task-pts { color: #ff6b35; font-size: 14px; font-weight: 600; }
.toggle-btn {
  padding: 4px 12px;
  border: 1px solid #ddd;
  border-radius: 14px;
  background: white;
  font-size: 12px;
  cursor: pointer;
}
.toggle-btn.active { background: #4caf50; color: white; border-color: #4caf50; }
.task-actions {
  margin-top: 8px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}
.action-edit, .action-del {
  padding: 4px 12px;
  border: none;
  border-radius: 14px;
  font-size: 12px;
  cursor: pointer;
}
.action-edit { background: #e3f2fd; color: #1565c0; }
.action-del { background: #fce4ec; color: #c62828; }
</style>
