# [V1.0.1] 修复管理页面空白渲染

## Why

管理页面（ManagementView）点击后完全空白不渲染。根因是 AttendancePanel.vue 中的 prop `attendedDays` 被错误地以 `attendedDays.value` 方式访问（prop 不是 ref，无 `.value` 属性），导致 computed 抛出 `ReferenceError`，组件渲染中断。

## Goals

- 修复管理页面空白渲染问题
- 确保所有 prop 访问不使用 `.value` 后缀
- 添加组件渲染测试防止回归

## Non-goals

- 不新增功能
- 不改动现有功能行为

## What Changes

- 修复 `AttendancePanel.vue` 中两处 `attendedDays.value` → `props.attendedDays`
- 新增 `ManagementView` 组件渲染测试

## Capabilities

### New Capabilities

- 无（纯 bug 修复）

### Modified Capabilities

- 无（不改动规范行为）

## Impact

- `src/components/AttendancePanel.vue` — 两行代码修改
- `src/views/__tests__/ManagementView.test.js` — 新增测试文件
