<template>
  <div class="mode-gate">
    <header class="mode-header">
      <h1>🏆 超级自律小超人</h1>
      <p v-if="store.state.settings.kidName">{{ store.state.settings.kidName }} 加油！</p>
    </header>

    <div v-if="!store.state.isParentMode" class="mode-kid">
      <slot name="kid" />
      <button class="parent-link" @click="showPinInput = true">🔒 家长模式</button>
    </div>

    <div v-else class="mode-parent">
      <slot name="parent" />
      <button class="parent-link" @click="exitParent">👶 回到孩子模式</button>
    </div>

    <div v-if="showPinInput" class="pin-overlay">
      <div class="pin-dialog">
        <h3>请输入家长密码</h3>
        <input
          v-model="pin"
          type="password"
          inputmode="numeric"
          maxlength="6"
          placeholder="6位数字密码"
          @keyup.enter="submitPin"
          ref="pinInput"
        />
        <div class="pin-buttons">
          <button @click="submitPin">确认</button>
          <button @click="cancel">取消</button>
        </div>
        <p v-if="pinError" class="pin-error">密码错误，请重试</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { useStore } from '../composables/useStore.js'

const store = useStore()
const showPinInput = ref(false)
const pin = ref('')
const pinError = ref(false)
const pinInput = ref(null)

async function submitPin() {
  if (store.verifyPIN(pin.value)) {
    pinError.value = false
    pin.value = ''
    showPinInput.value = false
    store.state.isParentMode = true
  } else {
    pinError.value = true
  }
}

function cancel() {
  pin.value = ''
  pinError.value = false
  showPinInput.value = false
}

function exitParent() {
  store.state.isParentMode = false
  store.generateDailyTasks()
}
</script>

<style scoped>
.mode-header {
  text-align: center;
  padding: 20px 0 10px;
}
.mode-header h1 { font-size: 24px; color: #ff6b35; }
.mode-header p { margin-top: 4px; color: #888; }

.mode-kid, .mode-parent {
  min-height: 70vh;
}

.parent-link {
  display: block;
  margin: 20px auto;
  padding: 8px 20px;
  background: none;
  border: 1px dashed #ccc;
  border-radius: 8px;
  color: #999;
  font-size: 14px;
  cursor: pointer;
}

.pin-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
.pin-dialog {
  background: white;
  padding: 30px;
  border-radius: 16px;
  text-align: center;
  min-width: 280px;
}
.pin-dialog h3 { margin-bottom: 16px; }
.pin-dialog input {
  width: 100%;
  padding: 10px;
  font-size: 18px;
  text-align: center;
  border: 2px solid #ddd;
  border-radius: 8px;
  margin-bottom: 16px;
  letter-spacing: 8px;
}
.pin-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
}
.pin-buttons button {
  padding: 8px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
}
.pin-buttons button:first-child {
  background: #ff6b35;
  color: white;
}
.pin-buttons button:last-child {
  background: #eee;
  color: #666;
}
.pin-error { color: #e74c3c; margin-top: 12px; }
</style>
