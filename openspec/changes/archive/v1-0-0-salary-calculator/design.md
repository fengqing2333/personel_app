## Context

首个功能变更，为实习生设计一个实时工资计算网页。用户为实习生，无社保/个税扣除，按月薪制、22 个工作日/月、8 小时/日计算。全前端 SPA，无需后端。

## Goals / Non-Goals

**Goals:**
- 秒级实时工资数字跳动更新
- 本月/年度薪资进度追踪
- 请假管理（年假/事假/病假）自动扣薪
- 内置 2024-2028 中国节假日数据
- 暗色/亮色主题切换
- 全屏沉浸模式
- 纯本地运行

**Non-Goals:**
- 不做税后/社保扣除（实习生不涉及）
- 不做后端服务
- 不做用户登录系统
- 不做多语言

## Decisions

| 决策 | 选择 | 理由 |
|------|------|------|
| 框架 | Vue 3 + Vite | 轻量、上手快、中文生态好 |
| 样式 | Tailwind CSS | 快速实现暗色主题，组件级样式隔离 |
| 状态管理 | Vue 3 reactive / ref | 简单应用，无需 Pinia |
| 存储 | localStorage | 纯本地，无需后端 |
| 节假日数据 | 硬编码 JSON | 仅 2024-2028 年，体积小，不需 API |
| 数字跳动 | setInterval + CSS transition | 简单可靠，不依赖第三方动画库 |
| 路由 | vue-router (hash mode) | SPA 多页面（看板/请假/设置） |
| 构建 | Vite | 快速 HMR，打包体积小 |

## Architecture

```
┌──────────────────────────────────────────────────┐
│                    App.vue                        │
│  ┌──────────────────┬──────────────────────────┐  │
│  │   SalaryView      │  ManagementView          │  │
│  │  ┌──────────────┐ │  ┌────────────────────┐  │  │
│  │  │ LiveCounter   │ │  │ WorkCalendar       │  │  │
│  │  │ (跳动数字)     │ │  │ (工作日历)         │  │  │
│  │  ├──────────────┤ │  ├────────────────────┤  │  │
│  │  │ StatsCards    │ │  │ AttendancePanel    │  │  │
│  │  │ (三指标卡片)   │ │  │ (出勤概览)         │  │  │
│  │  ├──────────────┤ │  ├────────────────────┤  │  │
│  │  │ WeeklyChart   │ │  │ SalarySettings     │  │  │
│  │  │ (周走势图)    │ │  │ (薪资设置)         │  │  │
│  │  └──────────────┘ │  └────────────────────┘  │  │
│  └──────────────────┴──────────────────────────┘  │
│  ┌────────────────────────────────────────────────┐│
│  │  FullscreenOverlay (全屏沉浸)                   ││
│  └────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────┘
```

### 数据流

```
SalaryConfig (localStorage)
     ↓
SalaryEngine (纯计算函数)
  ├── secondRate = monthlySalary ÷ 22 ÷ dailyHours ÷ 3600
  ├── todayEarned = secondRate × todayWorkedSeconds
  ├── monthlyEarned = secondRate × monthWorkedSeconds
  └── yearlyEarned = secondRate × yearWorkedSeconds
     ↓
LeaveRecords (localStorage)
     ↓
leaveDeduction = leaveDays × (monthlySalary ÷ 22)
     ↓
Computed → UI Components
```

## Component Tree

```
App
├── ThemeToggle
├── RouterView
│   ├── SalaryDashboard
│   │   ├── LiveCounter (实时数字，每秒更新)
│   │   ├── StatsCards (本月/目标/年度)
│   │   └── WeeklyChart (周趋势柱状图)
│   ├── ManagementView
│   │   ├── WorkCalendar (日历 + 节假日标记)
│   │   ├── AttendancePanel (出勤概览 + 环形进度)
│   │   └── SalarySettings (月薪/工时/计薪日表单)
│   └── LeaveManagement
│       └── LeaveForm (请假类型选择 + 日期选择)
└── FullscreenOverlay (全屏数字模式)
```

## Risks / Trade-offs

| 风险 | 缓解措施 |
|------|----------|
| setInterval 不准（浏览器节流） | 每次 tick 重新获取 Date.now()，不依赖累计 |
| localStorage 容量限制 | 数据量极小（仅配置+请假记录），不会超限 |
| 节假日数据更新（2028 年后） | 数据硬编码，到期手动更新即可 |
| 全屏 API 兼容性 | 降级为浏览器全屏 API 标准模式 |

## Open Questions

- 无（设计方向已确认）
