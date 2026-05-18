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

  instance = {
    state,
    get kidPoints() { return kidPoints.value },
    verifyPIN,
    generateId,
    loadFromStorage,
    saveToStorage,
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
