# [V1.2.0] 日历文字标注优化

## Why

当前日历仅用颜色区分工作日/请假/休息日，不够直观。用户需要在每个日期上直接看到文字标注。

## Goals

- 每个日期下方显示文字标注：班/假/休/节/调
- 日历头部集成月度统计（出勤/请假/休息/剩余）
- 今日日期用醒目的蓝色渐变圆环突出
- 节假日和调休补班有单独的文字标签

## What Changes

- 重构 WorkCalendar.vue：添加文字标注逻辑和样式
- 更新日历头部：月份切换 + 图例行 + 底部统计行
- isWorkDay 返回值扩展：区分普通工作日、节假日、调休补班

## Impact

- src/components/WorkCalendar.vue — 主要修改
- src/views/ManagementView.vue — 可能移除冗余统计
