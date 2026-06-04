# [V1.3.2] 门户 UI 统一

## Why
工资页和管理页还保留原有深色科技风样式，与门户的复古暖色调完全割裂。需要统一到门户视觉语言下。

## What Changes
- SalaryDashboard.vue：改用门户配色（暖米底、深棕文字、圆角卡片）
- ManagementView.vue：同上
- LiveCounter.vue / StatsCards.vue / WeeklyChart.vue：统一配色
- WorkCalendar.vue / AttendancePanel.vue：统一配色

## Goals
- 所有页面视觉风格一致
- 保留暗色模式独立（门户侧边栏样式不变）
