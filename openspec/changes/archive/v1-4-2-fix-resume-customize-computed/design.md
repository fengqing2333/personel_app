## Context

V1.4.1 在 `ResumeCustomize.vue` 中新增 `selectedEntries` / `previewSections` 等 computed 属性以联动预览，但 import 语句仍是 V1.4.0 遗留的 `import { ref } from 'vue'`。Vue 3 SFC 编译器不会在编译期校验脚本中的标识符，因此 `vite build` 通过；运行时执行 `<script setup>` 体时才会抛出 `ReferenceError: computed is not defined`。

## Root Cause

`src/views/ResumeCustomize.vue:2` 缺失 `computed` 导入。

## Fix

将第 2 行：

```js
import { ref } from 'vue'
```

改为：

```js
import { ref, computed } from 'vue'
```

## Test Strategy

新增 `src/views/__tests__/ResumeCustomize.test.js`：

1. 通过 `@vue/test-utils` 的 `mount` 加载组件 — 在修复前会因 `ReferenceError` 失败（RED）
2. 断言初始 `checkedCount` 文案显示已选条目数量（覆盖一条 computed 求值）
3. 断言初始第三步预览区会在切换后正常渲染（覆盖另一条 computed 求值）

## Files Changed

- `src/views/ResumeCustomize.vue` — 第 2 行 import 修正
- `src/views/__tests__/ResumeCustomize.test.js` — 新增挂载与计算属性测试