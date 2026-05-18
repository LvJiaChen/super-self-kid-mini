<template>
  <div class="settings-panel">
    <h3>设置</h3>

    <div class="setting-group">
      <label>孩子名字</label>
      <input v-model="store.state.settings.kidName" placeholder="输入孩子的名字" />
    </div>

    <div class="setting-group">
      <label>家长称呼</label>
      <input v-model="store.state.settings.parentName" placeholder="例如：妈妈" />
    </div>

    <div class="setting-group">
      <label>家长密码（6位数字）</label>
      <input v-model="newPin" type="password" inputmode="numeric" maxlength="6" placeholder="留空则不修改" />
    </div>

    <div class="setting-actions">
      <button class="btn-primary" @click="savePin">保存密码</button>
    </div>

    <hr class="divider" />

    <h4>数据备份与恢复</h4>
    <p class="hint">备份数据可防止浏览器缓存清理导致数据丢失</p>

    <div class="backup-buttons">
      <button class="btn-secondary" @click="doExport">📥 导出备份</button>
      <button class="btn-secondary" @click="triggerImport">📤 恢复备份</button>
      <input
        type="file"
        accept=".json"
        ref="fileInput"
        style="display:none"
        @change="doImport"
      />
    </div>
    <p v-if="backupMsg" class="backup-msg">{{ backupMsg }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useStore } from '../composables/useStore.js'

const store = useStore()
const newPin = ref('')
const fileInput = ref(null)
const backupMsg = ref('')

function savePin() {
  if (newPin.value.length === 6 && /^\d+$/.test(newPin.value)) {
    store.state.settings.parentPIN = newPin.value
    newPin.value = ''
    backupMsg.value = '密码修改成功'
    setTimeout(() => { backupMsg.value = '' }, 2000)
  } else if (newPin.value.length > 0) {
    backupMsg.value = '密码必须是6位数字'
    setTimeout(() => { backupMsg.value = '' }, 2000)
  }
}

function doExport() {
  const json = store.exportData()
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `super-kid-backup-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
  backupMsg.value = '备份导出成功'
  setTimeout(() => { backupMsg.value = '' }, 2000)
}

function triggerImport() {
  fileInput.value?.click()
}

function doImport(e) {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    store.importData(ev.target.result)
    backupMsg.value = '数据恢复成功'
    setTimeout(() => { backupMsg.value = '' }, 2000)
  }
  reader.readAsText(file)
  e.target.value = ''
}
</script>

<style scoped>
.settings-panel { padding: 16px; }
.settings-panel h3 { font-size: 17px; margin-bottom: 16px; }
.settings-panel h4 { font-size: 15px; margin: 16px 0 8px; }
.setting-group { margin-bottom: 14px; }
.setting-group label { display: block; font-size: 13px; color: #888; margin-bottom: 4px; }
.setting-group input {
  width: 100%; padding: 10px; border: 1px solid #ddd;
  border-radius: 8px; font-size: 15px;
}
.setting-actions { margin: 16px 0; }
.btn-primary {
  padding: 10px 24px; background: #ff6b35; color: white;
  border: none; border-radius: 10px; font-size: 14px; cursor: pointer;
}
.divider { border: none; border-top: 1px solid #eee; margin: 20px 0; }
.hint { font-size: 12px; color: #aaa; margin-bottom: 12px; }
.backup-buttons { display: flex; gap: 12px; }
.btn-secondary {
  padding: 10px 20px; background: #f5f5f5; color: #555;
  border: 1px solid #ddd; border-radius: 10px; font-size: 14px; cursor: pointer;
}
.backup-msg { margin-top: 12px; font-size: 14px; color: #4caf50; }
</style>
