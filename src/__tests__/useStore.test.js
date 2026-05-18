import { describe, it, expect, beforeEach } from 'vitest'
import { useStore, resetStore } from '../composables/useStore.js'

describe('useStore - settings', () => {
  beforeEach(() => {
    localStorage.clear()
    resetStore()
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
    const store = useStore()
    expect(store.state.settings.kidName).toBe('小红')
    expect(store.verifyPIN('111111')).toBe(true)
  })

  it('isParentMode 持久化到 localStorage', () => {
    const store = useStore()
    store.state.isParentMode = true
    store.saveToStorage()

    resetStore()
    const store2 = useStore()
    expect(store2.state.isParentMode).toBe(true)
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
