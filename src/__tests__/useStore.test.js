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

describe('useStore - task CRUD', () => {
  beforeEach(() => {
    localStorage.clear()
    resetStore()
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
