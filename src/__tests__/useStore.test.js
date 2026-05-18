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

describe('useStore - task submission & review', () => {
  beforeEach(() => {
    localStorage.clear()
    resetStore()
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

describe('useStore - generateDailyTasks', () => {
  beforeEach(() => {
    localStorage.clear()
    resetStore()
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

describe('useStore - rewards & redemption', () => {
  beforeEach(() => {
    localStorage.clear()
    resetStore()
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
    const result = store.redeemReward('rw1')
    expect(result).toBe(false)
    expect(store.state.redemptions).toHaveLength(0)
  })

  it('redeemReward 奖励不存在不报错', () => {
    const store = useStore()
    expect(() => store.redeemReward('nonexistent')).not.toThrow()
  })
})
