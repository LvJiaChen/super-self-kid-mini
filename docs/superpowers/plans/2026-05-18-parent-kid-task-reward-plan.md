# 亲子任务积分系统 — 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个本地优先的亲子任务积分系统，家长设置任务，孩子完成获积分，积分兑换奖励。

**Architecture:** Vue 3 + Vite 单页面应用，无路由。useStore composable 统一管理状态，watch 自动保存 localStorage。PIN 码切换家长/孩子模式。

**Tech Stack:** Vue 3 (Composition API), Vite, vitest

**File Structure:**
```
src/
├── main.js
├── App.vue
├── style.css
├── composables/
│   └── useStore.js
├── components/
│   ├── ModeGate.vue
│   ├── KidView.vue
│   ├── KidHeader.vue
│   ├── DailyTasks.vue
│   ├── TaskCard.vue
│   ├── RewardShop.vue
│   ├── RewardCard.vue
│   ├── RedemptionHistory.vue
│   ├── ParentView.vue
│   ├── ParentTabs.vue
│   ├── TasksManage.vue
│   ├── TaskForm.vue
│   ├── ReviewCenter.vue
│   ├── RewardsManage.vue
│   ├── RewardForm.vue
│   ├── SettingsPanel.vue
│   └── StatsPanel.vue
└── __tests__/
    └── useStore.test.js
```

---

### Task 1: 项目脚手架

**Files:**
- Create: `package.json`, `vite.config.js`, `index.html`, `src/main.js`, `src/App.vue`, `src/style.css`
- Create: `vitest.config.js`

- [ ] **Step 1: 初始化项目**

```bash
cd D:/HSProject/super-self-kid-mini
npm init -y
npm install vue
npm install -D vite @vitejs/plugin-vue vitest @vue/test-utils jsdom
```

- [ ] **Step 2: 创建 package.json scripts**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

Edit `package.json` to include the scripts section above, keeping existing fields.

- [ ] **Step 3: 创建 vite.config.js**

```js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()]
})
```

- [ ] **Step 4: 创建 vitest.config.js**

```js
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom'
  }
})
```

- [ ] **Step 5: 创建 index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>超级自律小超人</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>
```

- [ ] **Step 6: 创建 src/main.js**

```js
import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

createApp(App).mount('#app')
```

- [ ] **Step 7: 创建占位 src/App.vue**

```vue
<template>
  <div class="app">
    <h1>超级自律小超人</h1>
  </div>
</template>

<script setup>
</script>

<style scoped>
.app {
  text-align: center;
  padding: 20px;
}
</style>
```

- [ ] **Step 8: 创建 src/style.css**

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background: #fff8e7;
  color: #333;
  min-height: 100vh;
}
```

- [ ] **Step 9: 创建目录结构并验证启动**

```bash
mkdir -p src/composables src/components src/__tests__
npm run dev
```

确认浏览器打开后能看到 "超级自律小超人"。

- [ ] **Step 10: 运行测试确认 vitest 正常**

```bash
echo "import { describe, it } from 'vitest'\ndescribe('placeholder', () => { it('works', () => {}) })" > src/__tests__/placeholder.test.js
npm test
rm src/__tests__/placeholder.test.js
```

预期: 测试通过。

---

### Task 2: useStore — 基础结构与 settings

**Files:**
- Create: `src/composables/useStore.js`
- Create: `src/__tests__/useStore.test.js`

- [ ] **Step 1: 编写测试 — 初始化与 settings**

创建 `src/__tests__/useStore.test.js`：

```js
import { describe, it, expect, beforeEach } from 'vitest'
import { useStore } from '../composables/useStore.js'

// useStore 内部会自动 loadFromStorage，我们需在测试前清理 localStorage
// 并提供一种重置单例的方法
describe('useStore - settings', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('初始化时使用默认 settings', () => {
    const store = useStore()
    expect(store.state.settings.parentPIN).toBe('123456')
    expect(store.state.settings.kidName).toBe('')
    expect(store.state.settings.parentName).toBe('')
  })

  it('verifyPIN 返回正确结果', () => {
    const store = useStore()
    expect(store.verifyPIN('123456')).toBe(true)
    expect(store.verifyPIN('000000')).toBe(false)
  })

  it('修改 settings 后保存到 localStorage', () => {
    const store = useStore()
    store.state.settings.kidName = '小明'
    store.state.settings.parentPIN = '999999'
    store.saveToStorage()

    const raw = localStorage.getItem('super-kid-data')
    const data = JSON.parse(raw)
    expect(data.settings.kidName).toBe('小明')
    expect(data.settings.parentPIN).toBe('999999')
  })

  it('从 localStorage 加载数据', () => {
    localStorage.setItem('super-kid-data', JSON.stringify({
      settings: { parentPIN: '111111', kidName: '小红', parentName: '爸爸' },
      tasks: [],
      taskRecords: [],
      rewards: [],
      redemptions: [],
      lastDate: ''
    }))
    // 由于单例，需要重新创建
    const store = useStore()
    expect(store.state.settings.kidName).toBe('小红')
    expect(store.verifyPIN('111111')).toBe(true)
  })

  it('kidPoints 正确计算', () => {
    const store = useStore()
    store.state.taskRecords = [
      { id: '1', taskId: 't1', title: '刷牙', points: 5, date: '2026-05-18', status: 'approved' },
      { id: '2', taskId: 't2', title: '作业', points: 10, date: '2026-05-18', status: 'approved' },
      { id: '3', taskId: 't3', title: '整理', points: 3, date: '2026-05-18', status: 'submitted' }
    ]
    store.state.redemptions = [
      { id: 'r1', rewardId: 'rw1', rewardTitle: '看电视', pointsSpent: 5, redeemedAt: Date.now(), status: 'completed' }
    ]
    expect(store.kidPoints).toBe(10) // 5 + 10 - 5
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

```bash
npx vitest run
```

预期: FAIL，因为 `useStore.js` 尚不存在。

- [ ] **Step 3: 创建 useStore.js 基础实现**

创建 `src/composables/useStore.js`：

```js
import { reactive, computed, watch } from 'vue'

const STORAGE_KEY = 'super-kid-data'

let instance = null

export function useStore() {
  if (instance) return instance

  const state = reactive({
    isParentMode: false,
    lastDate: '',
    settings: {
      parentPIN: '123456',
      kidName: '',
      parentName: ''
    },
    tasks: [],
    taskRecords: [],
    rewards: [],
    redemptions: []
  })

  const kidPoints = computed(() => {
    const earned = state.taskRecords
      .filter(r => r.status === 'approved')
      .reduce((sum, r) => sum + r.points, 0)
    const spent = state.redemptions
      .reduce((sum, r) => sum + r.pointsSpent, 0)
    return earned - spent
  })

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 7)
  }

  function verifyPIN(pin) {
    return pin === state.settings.parentPIN
  }

  function loadFromStorage() {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    try {
      const data = JSON.parse(raw)
      Object.assign(state.settings, data.settings || {})
      state.tasks = data.tasks || []
      state.taskRecords = data.taskRecords || []
      state.rewards = data.rewards || []
      state.redemptions = data.redemptions || []
      state.lastDate = data.lastDate || ''
    } catch (e) {
      console.error('Failed to load data:', e)
    }
  }

  let _saving = false
  function saveToStorage() {
    if (_saving) return
    const data = {
      settings: { ...state.settings },
      tasks: [...state.tasks],
      taskRecords: [...state.taskRecords],
      rewards: [...state.rewards],
      redemptions: [...state.redemptions],
      lastDate: state.lastDate
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }

  loadFromStorage()

  // Auto-save on state changes
  let _watchReady = false
  watch(
    () => [
      { ...state.settings },
      [...state.tasks],
      [...state.taskRecords],
      [...state.rewards],
      [...state.redemptions],
      state.lastDate
    ],
    () => {
      if (_watchReady) saveToStorage()
    },
    { deep: true }
  )
  // 延迟激活 watch，避免 loadFromStorage 触发保存
  setTimeout(() => { _watchReady = true }, 0)

  instance = {
    state,
    kidPoints,
    verifyPIN,
    generateId,
    loadFromStorage,
    saveToStorage,
    // 以下将在后续 task 中添加
    addTask: null,
    updateTask: null,
    deleteTask: null,
    submitTask: null,
    approveTask: null,
    rejectTask: null,
    generateDailyTasks: null,
    addReward: null,
    updateReward: null,
    deleteReward: null,
    redeemReward: null,
    exportData: null,
    importData: null
  }
  return instance
}
```

- [ ] **Step 4: 运行测试确认通过**

```bash
npx vitest run
```

预期: 5 tests passed。

---

### Task 3: useStore — 任务模板 CRUD

**Files:**
- Modify: `src/__tests__/useStore.test.js`
- Modify: `src/composables/useStore.js`

- [ ] **Step 1: 添加任务 CRUD 测试**

在 `src/__tests__/useStore.test.js` 末尾添加：

```js
describe('useStore - task CRUD', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('addTask 添加一个 daily 任务', () => {
    const store = useStore()
    store.addTask({ title: '刷牙', points: 5, type: 'daily', category: '生活习惯' })
    expect(store.state.tasks).toHaveLength(1)
    expect(store.state.tasks[0].title).toBe('刷牙')
    expect(store.state.tasks[0].points).toBe(5)
    expect(store.state.tasks[0].type).toBe('daily')
    expect(store.state.tasks[0].isActive).toBe(true)
    expect(store.state.tasks[0].id).toBeTruthy()
  })

  it('addTask 添加一个 one-time 任务', () => {
    const store = useStore()
    store.addTask({ title: '帮奶奶搬东西', points: 20, type: 'one-time' })
    expect(store.state.tasks).toHaveLength(1)
    expect(store.state.tasks[0].type).toBe('one-time')
  })

  it('addTask 默认值', () => {
    const store = useStore()
    store.addTask({ title: '测试', points: 0, type: 'daily' })
    expect(store.state.tasks[0].points).toBe(0)
    expect(store.state.tasks[0].category).toBe('')
    expect(store.state.tasks[0].description).toBe('')
  })

  it('updateTask 更新任务', () => {
    const store = useStore()
    store.addTask({ title: '旧标题', points: 5, type: 'daily' })
    const id = store.state.tasks[0].id
    store.updateTask(id, { title: '新标题', points: 10 })
    expect(store.state.tasks[0].title).toBe('新标题')
    expect(store.state.tasks[0].points).toBe(10)
  })

  it('updateTask 不存在的 id 不报错', () => {
    const store = useStore()
    expect(() => store.updateTask('nonexistent', { title: 'x' })).not.toThrow()
  })

  it('deleteTask 删除任务', () => {
    const store = useStore()
    store.addTask({ title: '刷牙', points: 5, type: 'daily' })
    store.addTask({ title: '作业', points: 10, type: 'daily' })
    const id = store.state.tasks[0].id
    store.deleteTask(id)
    expect(store.state.tasks).toHaveLength(1)
    expect(store.state.tasks[0].title).toBe('作业')
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

```bash
npx vitest run
```

预期: CRUD 相关测试 FAIL。

- [ ] **Step 3: 在 useStore.js 实现 task CRUD**

在 `useStore.js` 中，将 `instance = { ... }` 之前的占位 null 替换为实际函数：

```js
function addTask(taskData) {
  const task = {
    id: generateId(),
    title: taskData.title,
    description: taskData.description || '',
    points: taskData.points || 0,
    type: taskData.type || 'daily',
    category: taskData.category || '',
    isActive: true,
    createdAt: Date.now()
  }
  state.tasks.push(task)
}

function updateTask(id, updates) {
  const idx = state.tasks.findIndex(t => t.id === id)
  if (idx === -1) return
  Object.assign(state.tasks[idx], updates)
}

function deleteTask(id) {
  const idx = state.tasks.findIndex(t => t.id === id)
  if (idx !== -1) state.tasks.splice(idx, 1)
}
```

在 instance 对象中更新对应的属性为实际函数引用。

- [ ] **Step 4: 运行测试确认通过**

```bash
npx vitest run
```

预期: 11 tests passed。

---

### Task 4: useStore — 任务提交与审核

**Files:**
- Modify: `src/__tests__/useStore.test.js`
- Modify: `src/composables/useStore.js`

- [ ] **Step 1: 添加提交与审核测试**

在 `src/__tests__/useStore.test.js` 末尾添加：

```js
describe('useStore - task submission & review', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('submitTask 将 pending 状态改为 submitted', () => {
    const store = useStore()
    store.state.taskRecords = [
      { id: 'tr1', taskId: 't1', title: '刷牙', points: 5, date: '2026-05-18', status: 'pending', submittedAt: null, approvedAt: null }
    ]
    store.submitTask('tr1')
    expect(store.state.taskRecords[0].status).toBe('submitted')
    expect(store.state.taskRecords[0].submittedAt).toBeTruthy()
  })

  it('submitTask 非 pending 状态不生效', () => {
    const store = useStore()
    store.state.taskRecords = [
      { id: 'tr1', taskId: 't1', title: '刷牙', points: 5, date: '2026-05-18', status: 'approved', submittedAt: null, approvedAt: null }
    ]
    store.submitTask('tr1')
    expect(store.state.taskRecords[0].status).toBe('approved')
  })

  it('approveTask 将 submitted 状态改为 approved', () => {
    const store = useStore()
    store.state.taskRecords = [
      { id: 'tr1', taskId: 't1', title: '刷牙', points: 5, date: '2026-05-18', status: 'submitted', submittedAt: Date.now(), approvedAt: null }
    ]
    store.approveTask('tr1')
    expect(store.state.taskRecords[0].status).toBe('approved')
    expect(store.state.taskRecords[0].approvedAt).toBeTruthy()
  })

  it('approveTask 非 submitted 状态不生效', () => {
    const store = useStore()
    store.state.taskRecords = [
      { id: 'tr1', taskId: 't1', title: '刷牙', points: 5, date: '2026-05-18', status: 'pending', submittedAt: null, approvedAt: null }
    ]
    store.approveTask('tr1')
    expect(store.state.taskRecords[0].status).toBe('pending')
  })

  it('rejectTask 将 submitted 状态退回 pending', () => {
    const store = useStore()
    store.state.taskRecords = [
      { id: 'tr1', taskId: 't1', title: '刷牙', points: 5, date: '2026-05-18', status: 'submitted', submittedAt: Date.now(), approvedAt: null }
    ]
    store.rejectTask('tr1')
    expect(store.state.taskRecords[0].status).toBe('pending')
    expect(store.state.taskRecords[0].submittedAt).toBeNull()
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

```bash
npx vitest run
```

预期: 提交审核相关测试 FAIL。

- [ ] **Step 3: 在 useStore.js 实现提交审核逻辑**

```js
function submitTask(recordId) {
  const record = state.taskRecords.find(r => r.id === recordId)
  if (record && record.status === 'pending') {
    record.status = 'submitted'
    record.submittedAt = Date.now()
  }
}

function approveTask(recordId) {
  const record = state.taskRecords.find(r => r.id === recordId)
  if (record && record.status === 'submitted') {
    record.status = 'approved'
    record.approvedAt = Date.now()
  }
}

function rejectTask(recordId) {
  const record = state.taskRecords.find(r => r.id === recordId)
  if (record && record.status === 'submitted') {
    record.status = 'pending'
    record.submittedAt = null
  }
}
```

在 instance 对象中更新对应的属性。

- [ ] **Step 4: 运行测试确认通过**

```bash
npx vitest run
```

预期: 16 tests passed。

---

### Task 5: useStore — 每日任务生成

**Files:**
- Modify: `src/__tests__/useStore.test.js`
- Modify: `src/composables/useStore.js`

- [ ] **Step 1: 添加每日任务生成测试**

在 `src/__tests__/useStore.test.js` 末尾添加：

```js
describe('useStore - generateDailyTasks', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('首次运行生成当天任务记录', () => {
    const store = useStore()
    store.state.tasks = [
      { id: 't1', title: '刷牙', points: 5, type: 'daily', isActive: true },
      { id: 't2', title: '作业', points: 10, type: 'daily', isActive: true }
    ]
    store.state.lastDate = ''
    store.generateDailyTasks()
    const today = new Date().toISOString().split('T')[0]
    expect(store.state.taskRecords).toHaveLength(2)
    expect(store.state.taskRecords.every(r => r.date === today)).toBe(true)
    expect(store.state.taskRecords.every(r => r.status === 'pending')).toBe(true)
    expect(store.state.lastDate).toBe(today)
  })

  it('同日不重复生成', () => {
    const store = useStore()
    const today = new Date().toISOString().split('T')[0]
    store.state.tasks = [
      { id: 't1', title: '刷牙', points: 5, type: 'daily', isActive: true }
    ]
    store.state.lastDate = today
    store.generateDailyTasks()
    expect(store.state.taskRecords).toHaveLength(0)
  })

  it('不活跃任务不生成', () => {
    const store = useStore()
    store.state.tasks = [
      { id: 't1', title: '刷牙', points: 5, type: 'daily', isActive: false }
    ]
    store.state.lastDate = ''
    store.generateDailyTasks()
    expect(store.state.taskRecords).toHaveLength(0)
  })

  it('一次任务生成一个实例', () => {
    const store = useStore()
    store.state.tasks = [
      { id: 't1', title: '帮奶奶搬东西', points: 20, type: 'one-time', isActive: true }
    ]
    store.state.lastDate = ''
    store.generateDailyTasks()
    expect(store.state.taskRecords).toHaveLength(1)
    // 再次生成不重复
    store.state.lastDate = ''
    store.generateDailyTasks()
    expect(store.state.taskRecords).toHaveLength(1)
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

```bash
npx vitest run
```

预期: 每日生成相关测试 FAIL。

- [ ] **Step 3: 在 useStore.js 实现 generateDailyTasks**

```js
function generateDailyTasks() {
  const today = new Date().toISOString().split('T')[0]
  if (state.lastDate === today) return

  // 为 daily 类型任务生成记录
  const dailyTasks = state.tasks.filter(t => t.type === 'daily' && t.isActive)
  dailyTasks.forEach(task => {
    const exists = state.taskRecords.some(r => r.taskId === task.id && r.date === today)
    if (!exists) {
      state.taskRecords.push({
        id: generateId(),
        taskId: task.id,
        title: task.title,
        points: task.points,
        date: today,
        status: 'pending',
        submittedAt: null,
        approvedAt: null
      })
    }
  })

  // 为一次任务生成记录（只生成一次）
  const oneTimeTasks = state.tasks.filter(t => t.type === 'one-time' && t.isActive)
  oneTimeTasks.forEach(task => {
    const exists = state.taskRecords.some(r => r.taskId === task.id)
    if (!exists) {
      state.taskRecords.push({
        id: generateId(),
        taskId: task.id,
        title: task.title,
        points: task.points,
        date: today,
        status: 'pending',
        submittedAt: null,
        approvedAt: null
      })
    }
  })

  state.lastDate = today
}
```

在 instance 对象中更新对应的属性。

- [ ] **Step 4: 运行测试确认通过**

```bash
npx vitest run
```

预期: 20 tests passed。

---

### Task 6: useStore — 奖励 CRUD 与兑换

**Files:**
- Modify: `src/__tests__/useStore.test.js`
- Modify: `src/composables/useStore.js`

- [ ] **Step 1: 添加奖励与兑换测试**

在 `src/__tests__/useStore.test.js` 末尾添加：

```js
describe('useStore - rewards & redemption', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('addReward 添加奖励', () => {
    const store = useStore()
    store.addReward({ title: '看30分钟电视', pointsCost: 20, category: '屏幕时间' })
    expect(store.state.rewards).toHaveLength(1)
    expect(store.state.rewards[0].title).toBe('看30分钟电视')
    expect(store.state.rewards[0].pointsCost).toBe(20)
    expect(store.state.rewards[0].isActive).toBe(true)
  })

  it('updateReward 更新奖励', () => {
    const store = useStore()
    store.addReward({ title: '看电视', pointsCost: 20 })
    const id = store.state.rewards[0].id
    store.updateReward(id, { title: '看1小时电视', pointsCost: 30 })
    expect(store.state.rewards[0].title).toBe('看1小时电视')
    expect(store.state.rewards[0].pointsCost).toBe(30)
  })

  it('deleteReward 删除奖励', () => {
    const store = useStore()
    store.addReward({ title: '看电视', pointsCost: 20 })
    store.addReward({ title: '买玩具', pointsCost: 50 })
    store.deleteReward(store.state.rewards[0].id)
    expect(store.state.rewards).toHaveLength(1)
  })

  it('redeemReward 积分足够时成功兑换', () => {
    const store = useStore()
    // 先给积分
    store.state.taskRecords = [
      { id: 'tr1', taskId: 't1', title: '刷牙', points: 30, date: '2026-05-18', status: 'approved' }
    ]
    store.state.rewards = [
      { id: 'rw1', title: '看电视', pointsCost: 20, isActive: true }
    ]
    const result = store.redeemReward('rw1')
    expect(result).toBe(true)
    expect(store.state.redemptions).toHaveLength(1)
    expect(store.state.redemptions[0].rewardTitle).toBe('看电视')
    expect(store.state.redemptions[0].pointsSpent).toBe(20)
  })

  it('redeemReward 积分不够返回 false', () => {
    const store = useStore()
    store.state.rewards = [
      { id: 'rw1', title: '买玩具', pointsCost: 50, isActive: true }
    ]
    // 无积分
    const result = store.redeemReward('rw1')
    expect(result).toBe(false)
    expect(store.state.redemptions).toHaveLength(0)
  })

  it('redeemReward 奖励不存在不报错', () => {
    const store = useStore()
    expect(() => store.redeemReward('nonexistent')).not.toThrow()
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

```bash
npx vitest run
```

预期: 奖励兑换相关测试 FAIL。

- [ ] **Step 3: 在 useStore.js 实现奖励 CRUD 与兑换**

```js
function addReward(rewardData) {
  const reward = {
    id: generateId(),
    title: rewardData.title,
    description: rewardData.description || '',
    pointsCost: rewardData.pointsCost || 0,
    category: rewardData.category || '',
    isActive: true
  }
  state.rewards.push(reward)
}

function updateReward(id, updates) {
  const idx = state.rewards.findIndex(r => r.id === id)
  if (idx === -1) return
  Object.assign(state.rewards[idx], updates)
}

function deleteReward(id) {
  const idx = state.rewards.findIndex(r => r.id === id)
  if (idx !== -1) state.rewards.splice(idx, 1)
}

function redeemReward(rewardId) {
  const reward = state.rewards.find(r => r.id === rewardId)
  if (!reward || !reward.isActive) return false
  if (kidPoints.value < reward.pointsCost) return false
  state.redemptions.push({
    id: generateId(),
    rewardId: reward.id,
    rewardTitle: reward.title,
    pointsSpent: reward.pointsCost,
    redeemedAt: Date.now(),
    status: 'completed'
  })
  return true
}
```

在 instance 对象中更新对应的属性。

- [ ] **Step 4: 运行测试确认通过**

```bash
npx vitest run
```

预期: 26 tests passed。

---

### Task 7: useStore — 数据导入导出

**Files:**
- Modify: `src/__tests__/useStore.test.js`
- Modify: `src/composables/useStore.js`

- [ ] **Step 1: 添加导出导入测试**

在 `src/__tests__/useStore.test.js` 末尾添加：

```js
describe('useStore - export/import', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('exportData 导出 JSON 字符串', () => {
    const store = useStore()
    store.state.settings.kidName = '小明'
    store.addTask({ title: '刷牙', points: 5, type: 'daily' })
    const json = store.exportData()
    const data = JSON.parse(json)
    expect(data.settings.kidName).toBe('小明')
    expect(data.tasks).toHaveLength(1)
  })

  it('importData 导入并覆盖当前数据', () => {
    const store = useStore()
    const importJson = JSON.stringify({
      settings: { parentPIN: '999999', kidName: '小红', parentName: '妈妈' },
      tasks: [{ id: 't1', title: '导入任务', points: 10, type: 'daily', isActive: true }],
      taskRecords: [],
      rewards: [],
      redemptions: [],
      lastDate: '2026-05-18'
    })
    store.importData(importJson)
    expect(store.state.settings.kidName).toBe('小红')
    expect(store.state.tasks).toHaveLength(1)
    expect(store.state.tasks[0].title).toBe('导入任务')
  })

  it('importData 无效 JSON 不报错', () => {
    const store = useStore()
    expect(() => store.importData('invalid json')).not.toThrow()
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

```bash
npx vitest run
```

预期: 导入导出测试 FAIL。

- [ ] **Step 3: 在 useStore.js 实现 exportData / importData**

```js
function exportData() {
  return JSON.stringify({
    settings: { ...state.settings },
    tasks: [...state.tasks],
    taskRecords: [...state.taskRecords],
    rewards: [...state.rewards],
    redemptions: [...state.redemptions],
    lastDate: state.lastDate
  }, null, 2)
}

function importData(jsonStr) {
  try {
    const data = JSON.parse(jsonStr)
    if (!data.settings || !Array.isArray(data.tasks)) {
      throw new Error('Invalid data structure')
    }
    Object.assign(state.settings, data.settings)
    state.tasks = data.tasks || []
    state.taskRecords = data.taskRecords || []
    state.rewards = data.rewards || []
    state.redemptions = data.redemptions || []
    state.lastDate = data.lastDate || ''
    saveToStorage()
  } catch (e) {
    console.error('Import failed:', e)
  }
}
```

在 instance 对象中更新对应的属性。

- [ ] **Step 4: 运行全部测试确认通过**

```bash
npx vitest run
```

预期: 29 tests passed。

---

### Task 8: App 外壳 + ModeGate + style.css

**Files:**
- Modify: `src/App.vue`
- Create: `src/components/ModeGate.vue`
- Modify: `src/style.css`

- [ ] **Step 1: 创建 ModeGate.vue**

```vue
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
```

- [ ] **Step 2: 更新 App.vue**

```vue
<template>
  <ModeGate>
    <template #kid>
      <div class="placeholder">👦 孩子模式（即将实现）</div>
    </template>
    <template #parent>
      <div class="placeholder">👩 家长模式（即将实现）</div>
    </template>
  </ModeGate>
</template>

<script setup>
import ModeGate from './components/ModeGate.vue'
import { useStore } from './composables/useStore.js'
useStore().generateDailyTasks()
</script>
```

- [ ] **Step 3: 更新 style.css**

```css
* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
  background: linear-gradient(135deg, #fff8e7 0%, #ffe4c4 100%);
  color: #333;
  min-height: 100vh;
}

button { font-family: inherit; }
input { font-family: inherit; }

.placeholder {
  text-align: center;
  padding: 60px 20px;
  color: #aaa;
  font-size: 18px;
}
```

- [ ] **Step 4: 手动验证**

```bash
npm run dev
```

在浏览器中验证：
- 默认显示孩子模式占位
- 点击"家长模式"弹出 PIN 输入框
- 输入默认 PIN "123456" 进入家长模式
- 点击"回到孩子模式"返回

---

### Task 9: KidHeader 组件

**Files:**
- Create: `src/components/KidHeader.vue`

- [ ] **Step 1: 创建 KidHeader.vue**

```vue
<template>
  <div class="kid-header">
    <div class="avatar">🦸</div>
    <div class="info">
      <div class="name">{{ store.state.settings.kidName || '小超人' }}</div>
      <div class="points">
        <span class="points-star">⭐</span>
        <span class="points-value">{{ store.kidPoints }}</span>
        <span class="points-label">积分</span>
      </div>
    </div>
    <div class="streak">🔥 第 1 天</div>
  </div>
</template>

<script setup>
import { useStore } from '../composables/useStore.js'
const store = useStore()
</script>

<style scoped>
.kid-header {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background: white;
  border-radius: 16px;
  margin: 0 16px 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}
.avatar { font-size: 40px; margin-right: 12px; }
.info { flex: 1; }
.name { font-size: 20px; font-weight: 700; color: #333; }
.points { margin-top: 4px; }
.points-star { font-size: 18px; }
.points-value {
  font-size: 22px;
  font-weight: 700;
  color: #ff6b35;
  margin: 0 4px 0 6px;
}
.points-label { font-size: 13px; color: #999; }
.streak {
  font-size: 13px;
  color: #ff9800;
  background: #fff3e0;
  padding: 6px 12px;
  border-radius: 20px;
}
</style>
```

- [ ] **Step 2: 手动验证**

在 App.vue 的 #kid slot 中引入 KidHeader：

```vue
import KidHeader from './components/KidHeader.vue'
// template 中使用 <KidHeader />
```

验证积分显示正确，孩子名字显示正确。

---

### Task 10: DailyTasks + TaskCard 组件

**Files:**
- Create: `src/components/TaskCard.vue`
- Create: `src/components/DailyTasks.vue`

- [ ] **Step 1: 创建 TaskCard.vue**

```vue
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
```

- [ ] **Step 2: 创建 DailyTasks.vue**

```vue
<template>
  <div class="daily-tasks">
    <h2 class="section-title">📋 今日任务</h2>
    <div v-if="todayRecords.length === 0" class="empty">
      <p>今天没有任务哦～</p>
      <p class="sub">去家长模式添加任务吧</p>
    </div>
    <TaskCard
      v-for="record in todayRecords"
      :key="record.id"
      :record="record"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from '../composables/useStore.js'
import TaskCard from './TaskCard.vue'

const store = useStore()

const today = new Date().toISOString().split('T')[0]
const todayRecords = computed(() =>
  store.state.taskRecords.filter(r => r.date === today)
)

function handleSubmit(recordId) {
  store.submitTask(recordId)
}
</script>

<style scoped>
.daily-tasks {
  margin: 0 16px;
}
.section-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 12px;
  color: #555;
}
.empty {
  text-align: center;
  padding: 30px;
  color: #bbb;
}
.empty .sub { font-size: 13px; margin-top: 4px; }
</style>
```

- [ ] **Step 3: 手动验证**

在 App.vue #kid slot 中引入 DailyTasks。如果 useStore 中有测试数据，应能看到任务列表。点击"我完成了"按钮后状态变为"等待审核"。

---

### Task 11: RewardShop + RewardCard + RedemptionHistory 组件

**Files:**
- Create: `src/components/RewardCard.vue`
- Create: `src/components/RewardShop.vue`
- Create: `src/components/RedemptionHistory.vue`

- [ ] **Step 1: 创建 RewardCard.vue**

```vue
<template>
  <div class="reward-card">
    <div class="reward-left">
      <div class="reward-icon">🎁</div>
      <div class="reward-info">
        <div class="reward-title">{{ reward.title }}</div>
        <div class="reward-cost">{{ reward.pointsCost }} ⭐</div>
      </div>
    </div>
    <button
      class="redeem-btn"
      :class="{ disabled: !canAfford }"
      :disabled="!canAfford"
      @click="$emit('redeem', reward.id)"
    >
      {{ canAfford ? '兑换' : '积分不够' }}
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from '../composables/useStore.js'

const props = defineProps({
  reward: { type: Object, required: true }
})

defineEmits(['redeem'])

const store = useStore()
const canAfford = computed(() => store.kidPoints >= props.reward.pointsCost)
</script>

<style scoped>
.reward-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: white;
  border-radius: 12px;
  margin-bottom: 8px;
}
.reward-left { display: flex; align-items: center; gap: 12px; }
.reward-icon { font-size: 28px; }
.reward-title { font-size: 16px; font-weight: 500; }
.reward-cost { font-size: 14px; color: #ff6b35; margin-top: 2px; }

.redeem-btn {
  padding: 8px 20px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}
.redeem-btn:active { transform: scale(0.95); }
.redeem-btn.disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>
```

- [ ] **Step 2: 创建 RewardShop.vue**

```vue
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
```

- [ ] **Step 3: 创建 RedemptionHistory.vue**

```vue
<template>
  <div class="history" v-if="store.state.redemptions.length > 0">
    <h2 class="section-title">📜 兑换记录</h2>
    <div class="history-item" v-for="r in recentRedemptions" :key="r.id">
      <span class="h-title">{{ r.rewardTitle }}</span>
      <span class="h-points">-{{ r.pointsSpent }} ⭐</span>
      <span class="h-date">{{ formatDate(r.redeemedAt) }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from '../composables/useStore.js'

const store = useStore()

const recentRedemptions = computed(() =>
  [...store.state.redemptions].reverse().slice(0, 10)
)

function formatDate(ts) {
  const d = new Date(ts)
  return `${d.getMonth() + 1}/${d.getDate()}`
}
</script>

<style scoped>
.history { margin: 20px 16px; }
.section-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 12px;
  color: #555;
}
.history-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  background: white;
  border-radius: 10px;
  margin-bottom: 6px;
  gap: 12px;
}
.h-title { flex: 1; font-size: 14px; }
.h-points { font-size: 14px; color: #e74c3c; font-weight: 600; }
.h-date { font-size: 12px; color: #aaa; }
</style>
```

---

### Task 12: KidView 组装

**Files:**
- Create: `src/components/KidView.vue`
- Modify: `src/App.vue`

- [ ] **Step 1: 创建 KidView.vue**

```vue
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
```

- [ ] **Step 2: 更新 App.vue 的 #kid slot**

将占位内容替换为 `<KidView />`，添加 import。

---

### Task 13: ParentTabs + TasksManage + TaskForm 组件

**Files:**
- Create: `src/components/ParentTabs.vue`
- Create: `src/components/TaskForm.vue`
- Create: `src/components/TasksManage.vue`

- [ ] **Step 1: 创建 ParentTabs.vue**

```vue
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
```

- [ ] **Step 2: 创建 TaskForm.vue**

```vue
<template>
  <div class="task-form-overlay" @click.self="$emit('close')">
    <div class="task-form">
      <h3>{{ editing ? '编辑任务' : '添加任务' }}</h3>
      <label>任务名称</label>
      <input v-model="form.title" placeholder="例如：刷牙洗脸" />
      <label>描述（可选）</label>
      <input v-model="form.description" placeholder="补充说明" />
      <label>积分奖励</label>
      <input v-model.number="form.points" type="number" min="1" />
      <label>任务类型</label>
      <select v-model="form.type">
        <option value="daily">每日任务</option>
        <option value="one-time">一次性任务</option>
      </select>
      <label>分类（可选）</label>
      <input v-model="form.category" placeholder="例如：生活习惯" />
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
  description: props.editing?.description || '',
  points: props.editing?.points || 1,
  type: props.editing?.type || 'daily',
  category: props.editing?.category || ''
})

function save() {
  if (!form.title.trim()) return
  emit('save', { ...form })
}
</script>

<style scoped>
.task-form-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 100;
}
.task-form {
  background: white;
  width: 100%;
  max-width: 420px;
  max-height: 80vh;
  overflow-y: auto;
  border-radius: 20px 20px 0 0;
  padding: 24px 20px 30px;
}
.task-form h3 { margin-bottom: 16px; font-size: 18px; }
.task-form label {
  display: block;
  font-size: 13px;
  color: #888;
  margin: 12px 0 4px;
}
.task-form input, .task-form select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 15px;
}
.form-buttons {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}
.btn-save {
  flex: 1;
  padding: 12px;
  background: #ff6b35;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  cursor: pointer;
}
.btn-cancel {
  flex: 1;
  padding: 12px;
  background: #eee;
  color: #666;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  cursor: pointer;
}
</style>
```

- [ ] **Step 3: 创建 TasksManage.vue**

```vue
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
```

- [ ] **Step 4: 手动验证**

在家长模式中切换到"任务"tab，测试添加、编辑、删除、启用/停用任务。

---

### Task 14: ReviewCenter 组件

**Files:**
- Create: `src/components/ReviewCenter.vue`

- [ ] **Step 1: 创建 ReviewCenter.vue**

```vue
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
```

- [ ] **Step 2: 手动验证**

在孩子模式提交一个任务，切换到家长模式→审核tab，确认能看到待审核项，测试通过和拒绝。

---

### Task 15: RewardsManage + RewardForm 组件

**Files:**
- Create: `src/components/RewardForm.vue`
- Create: `src/components/RewardsManage.vue`

- [ ] **Step 1: 创建 RewardForm.vue**

```vue
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
```

- [ ] **Step 2: 创建 RewardsManage.vue**

```vue
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
.r-actions { margin-top: 8px; display: flex; gap: 12px; }
.action-edit, .action-del { padding: 4px 12px; border: none; border-radius: 14px; font-size: 12px; cursor: pointer; }
.action-edit { background: #e3f2fd; color: #1565c0; }
.action-del { background: #fce4ec; color: #c62828; }
</style>
```

---

### Task 16: SettingsPanel 组件

**Files:**
- Create: `src/components/SettingsPanel.vue`

- [ ] **Step 1: 创建 SettingsPanel.vue**

```vue
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
```

---

### Task 17: StatsPanel 组件

**Files:**
- Create: `src/components/StatsPanel.vue`

- [ ] **Step 1: 创建 StatsPanel.vue**

```vue
<template>
  <div class="stats-panel">
    <h3>积分统计</h3>

    <div class="stat-cards">
      <div class="stat-card">
        <div class="stat-value">{{ store.kidPoints }}</div>
        <div class="stat-label">当前积分</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ totalEarned }}</div>
        <div class="stat-label">累计获得</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ totalSpent }}</div>
        <div class="stat-label">累计兑换</div>
      </div>
    </div>

    <div class="stat-cards">
      <div class="stat-card">
        <div class="stat-value">{{ todayDone }}</div>
        <div class="stat-label">今日完成</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ totalRedemptions }}</div>
        <div class="stat-label">兑换次数</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from '../composables/useStore.js'

const store = useStore()
const today = new Date().toISOString().split('T')[0]

const totalEarned = computed(() =>
  store.state.taskRecords
    .filter(r => r.status === 'approved')
    .reduce((s, r) => s + r.points, 0)
)

const totalSpent = computed(() =>
  store.state.redemptions.reduce((s, r) => s + r.pointsSpent, 0)
)

const todayDone = computed(() =>
  store.state.taskRecords.filter(r => r.status === 'approved' && r.date === today).length
)

const totalRedemptions = computed(() => store.state.redemptions.length)
</script>

<style scoped>
.stats-panel { padding: 16px; }
.stats-panel h3 { font-size: 17px; margin-bottom: 16px; }
.stat-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 10px; }
.stat-card {
  background: white; border-radius: 12px; padding: 16px 10px; text-align: center;
}
.stat-value { font-size: 28px; font-weight: 700; color: #ff6b35; }
.stat-label { font-size: 12px; color: #999; margin-top: 4px; }
</style>
```

---

### Task 18: ParentView 组装

**Files:**
- Create: `src/components/ParentView.vue`
- Modify: `src/App.vue`

- [ ] **Step 1: 创建 ParentView.vue**

```vue
<template>
  <div class="parent-view">
    <ParentTabs v-model="activeTab" />
    <ReviewCenter v-if="activeTab === 'review'" />
    <TasksManage v-if="activeTab === 'tasks'" />
    <RewardsManage v-if="activeTab === 'rewards'" />
    <StatsPanel v-if="activeTab === 'stats'" />
    <SettingsPanel v-if="activeTab === 'settings'" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ParentTabs from './ParentTabs.vue'
import ReviewCenter from './ReviewCenter.vue'
import TasksManage from './TasksManage.vue'
import RewardsManage from './RewardsManage.vue'
import StatsPanel from './StatsPanel.vue'
import SettingsPanel from './SettingsPanel.vue'

const activeTab = ref('review')
</script>

<style scoped>
.parent-view { padding-bottom: 40px; }
</style>
```

- [ ] **Step 2: 更新 App.vue — 最终版本**

```vue
<template>
  <ModeGate>
    <template #kid>
      <KidView />
    </template>
    <template #parent>
      <ParentView />
    </template>
  </ModeGate>
</template>

<script setup>
import ModeGate from './components/ModeGate.vue'
import KidView from './components/KidView.vue'
import ParentView from './components/ParentView.vue'
import { useStore } from './composables/useStore.js'

useStore().generateDailyTasks()
</script>
```

---

### Task 19: 最终验证与样式打磨

- [ ] **Step 1: 运行全部单元测试**

```bash
npx vitest run
```

预期: 29 tests passed。

- [ ] **Step 2: 启动开发服务器完整走一遍流程**

```bash
npm run dev
```

完整测试流程：
1. 打开浏览器 → 看到孩子模式（无任务，空状态）
2. 点击家长模式 → 输入默认密码 123456 → 进入家长模式
3. 在"设置"标签中设置孩子名称和密码
4. 在"任务"标签中添加一个每日任务："刷牙" 积分5，一个一次性任务："帮妈妈洗碗" 积分20
5. 在"奖励"标签中添加："看30分钟电视" 所需积分20，"买玩具" 所需积分100
6. 回到孩子模式 → 看到今日任务（刷牙 + 帮妈妈洗碗）
7. 点击刷牙的"我完成了" → 状态变为"等待审核"
8. 进入家长模式 → "审核"标签 → 通过刷牙任务
9. 回到孩子模式 → 积分变为5 → 尝试兑换"看30分钟电视" → 积分不够提示
10. 再完成帮妈妈洗碗 → 家长审核通过 → 积分25 → 兑换电视成功
11. 设置中导出备份 → 确认 JSON 文件下载
12. 删除所有任务和奖励后 → 导入备份 → 数据恢复

- [ ] **Step 3: 修复发现的问题**

根据手动测试发现的问题进行修复。

- [ ] **Step 4: 运行测试确认修改不影响已有功能**

```bash
npx vitest run
```

---
