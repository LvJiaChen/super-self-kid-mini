# 亲子任务积分系统 — 设计文档

## 概述

一个本地优先的网页应用，家长设置每日任务和临时任务，孩子完成任务并获得积分，积分可兑换奖励（看电视、买玩具、去游乐园等）。共用设备场景，通过 PIN 码切换家长/孩子模式。

## 技术选型

| 项   | 选择                  |
|------|----------------------|
| 框架 | Vue 3 + Vite          |
| 存储 | localStorage + JSON 导出/导入备份 |
| 路由 | 无路由 — 单页面模式切换 |
| 模式切换 | PIN 码保护家长模式 |

## 架构方案

**单页面模式切换**：一个 Vue 应用，通过响应式变量 `isParentMode` 切换家长/孩子视图。数据通过 composable `useStore` 统一管理，组件只消费和派发。

## 数据模型

localStorage 中存储：

```
settings: { parentPIN, kidName, parentName }

tasks: [{ id, title, description, points, type ("daily"|"one-time"), category, isActive, createdAt }]

taskRecords: [{ id, taskId, date, status ("pending"|"submitted"|"approved"|"rejected"), submittedAt, approvedAt }]

rewards: [{ id, title, description, pointsCost, category, isActive }]

redemptions: [{ id, rewardId, rewardTitle, pointsSpent, redeemedAt, status }]
```

积分余额 = 已批准任务积分总和 - 已兑换奖励积分总和（computed 实时计算）。

## 组件结构

```
App.vue
├── ModeGate.vue              -- 默认孩子模式，进入家长模式需 PIN
├── KidView.vue
│   ├── KidHeader.vue         -- 孩子名字、当前积分
│   ├── DailyTasks.vue        -- 今日任务列表
│   │   └── TaskCard.vue      -- 单个任务操作
│   ├── RewardShop.vue        -- 积分兑换商店
│   │   └── RewardCard.vue    -- 单个奖励兑换
│   └── RedemptionHistory.vue -- 兑换记录
└── ParentView.vue
    ├── ParentTabs.vue        -- Tab 切换
    ├── TasksManage.vue       -- 任务模板管理
    │   └── TaskForm.vue      -- 新增/编辑任务
    ├── ReviewCenter.vue      -- 待审核任务
    ├── RewardsManage.vue     -- 奖励管理
    │   └── RewardForm.vue    -- 新增/编辑奖励
    ├── SettingsPanel.vue     -- PIN、姓名、备份/恢复
    └── StatsPanel.vue        -- 积分统计
```

## 状态管理

`useStore` composable（单例），核心：

- **state**：settings, tasks, taskRecords, rewards, redemptions, isParentMode, kidPoints (computed)
- **actions**：verifyPIN, CRUD（任务/奖励）, submitTask, approveTask/rejectTask, redeemReward, generateDailyTasks, exportData, importData
- **auto-save**：watcher 监听变化自动写入 localStorage

## 核心流程

1. **启动**：加载数据 → 若日期变化 → 自动生成当天任务实例
2. **孩子提交任务**：taskRecord → submitted
3. **家长审核**：status → approved → 积分自动更新
4. **孩子兑换**：校验积分 → 创建 redemption → 积分自动扣减
5. **备份恢复**：导出 JSON 文件 / 导入 JSON 文件

## 约束

- 不依赖任何后端服务
- 不依赖第三方认证
- 所有数据仅存在当前浏览器 localStorage 中
- JSON 文件备份作为数据安全保障
