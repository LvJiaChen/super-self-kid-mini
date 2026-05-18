import { reactive, computed, watch } from 'vue'

const STORAGE_KEY = 'super-kid-data'

let instance = null

export function resetStore() {
  instance = null
}

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
      state.isParentMode = data.isParentMode || false
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

  function saveToStorage() {
    const data = {
      isParentMode: state.isParentMode,
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
  setTimeout(() => { _watchReady = true }, 0)

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

  function generateDailyTasks() {
    const today = new Date().toISOString().split('T')[0]
    if (state.lastDate === today) return

    // Daily tasks: generate one record per active daily task for today
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

    // One-time tasks: generate one record only (check across all dates)
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

  instance = {
    state,
    get kidPoints() { return kidPoints.value },
    verifyPIN,
    generateId,
    loadFromStorage,
    saveToStorage,
    addTask,
    updateTask,
    deleteTask,
    submitTask,
    approveTask,
    rejectTask,
    generateDailyTasks,
    addReward,
    updateReward,
    deleteReward,
    redeemReward,
    exportData: null,
    importData: null
  }
  return instance
}
