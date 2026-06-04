# [V1.4.3] 修复 ManagementView 测试中节假日数据未加载的告警噪音

## Why

`npm test` 输出 30+ 条 `[dateUtils] isWorkDay called but holidayMap is empty. Call loadHolidays() first.` 警告，全部来自 `src/views/__tests__/ManagementView.test.js`。根因是 `loadHolidays(holidays)` 仅在 `App.vue` 的 `onMounted` 钩子里调用，而该测试直接挂载 `ManagementView`，绕过了 `App.vue`，导致 `dateUtils` 内部 `holidayMap` 为空，每次 `isWorkDay` 调用都打 warning。

虽然不影响测试通过，但会污染 CI 输出，掩盖真正的告警，违反"无遗留 console.log / 调试代码"的代码质量准则。

## Goals

- `npm test` 输出干净，无 holiday-empty 警告
- 不改变 `dateUtils.isWorkDay` 的运行时行为或警告语义（生产用户仍能在配置错误时看到提醒）
- 不改变 `ManagementView.test.js` 的断言

## Non-goals

- 不重构 `dateUtils` 警告机制
- 不引入全局 vitest setup 文件（保持简单，本次仅修单文件）
- 不改其它测试

## What Changes

- 在 `src/views/__tests__/ManagementView.test.js`部 `beforeAll` 中导入 `loadHolidays` 与 `holidays` 并调用 `loadHolidays(holidays)`，与生产环境 `App.vue:18` 行为一致

## Capabilities

### New Capabilities / Modified Capabilities

- 无（仅修复测试基础设施，运行时行为不变）

## Impact

- `src/views/__tests__/ManagementView.test.js` — 新增 import 与 beforeAll 钩子