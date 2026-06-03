## Context

V1.0.0 实施后，用户报告管理页面点击后空白不渲染。组件树为 `ManagementView → AttendancePanel`。

## Root Cause

`AttendancePanel.vue` 第 28、38 行将 prop `attendedDays` 误写为 `attendedDays.value`。

在 Vue 3 `<script setup>` 中，`defineProps` 返回的 prop 是响应式对象属性，通过 `props.attendedDays` 访问，不是 `ref`，不支持 `.value` 语法。使用了 `.value` 导致 `ReferenceError: attendedDays is not defined`。

## Fix

将 `AttendancePanel.vue` 中两处 `attendedDays.value` 替换为 `props.attendedDays`。

## Files Changed

- `src/components/AttendancePanel.vue` — 第 28、38 行各改一处
- `src/views/__tests__/ManagementView.test.js` — 新增组件挂载测试
