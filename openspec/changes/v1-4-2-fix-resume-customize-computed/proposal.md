# [V1.4.2] 修复定制简历页 computed 未导入导致运行时崩溃

## Why

`src/views/ResumeCustomize.vue` 在 `<script setup>` 中只 `import { ref } from 'vue'`，却在 28、30、32 行使用了 `computed`（`checkedCount` / `selectedEntries` / `previewSections`）。Vite 构建未报错，但用户在浏览器中访问 `/resume/customize` 时会抛出 `ReferenceError: computed is not defined`，整个页面无法渲染。

该问题源自 V1.4.1 引入动态预览联动时遗漏了 `computed` 导入，是阻断级（Blocker）运行时缺陷。

## Goals

- 修复 `ResumeCustomize.vue` 中缺失的 `computed` 导入
- 新增组件挂载测试，覆盖三步流程的 computed 计算路径，防止回归
- 全量测试通过，构建通过

## Non-goals

- 不调整定制简历页面的任何 UI 或交互行为
- 不接入真实 `useResume` 数据
- 不改动其它视图

## What Changes

- 修改 `src/views/ResumeCustomize.vue` 第 2 行的 import 语句，补充 `computed`
- 新增 `src/views/__tests__/ResumeCustomize.test.js`，验证组件挂载、`checkedCount` 与 `previewSections` 正常计算

## Capabilities

### New Capabilities

- 无（纯 bug 修复）

### Modified Capabilities

- 无（页面行为保持与 V1.4.1 一致）

## Impact

- `src/views/ResumeCustomize.vue` — 一行修改
- `src/views/__tests__/ResumeCustomize.test.js`— 新增测试文件