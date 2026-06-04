## Context

`dateUtils` 模块的 `holidayMap` 是模块级 `Map`。生产环境由 `App.vue` 在 `onMounted` 钩子中调用 `loadHolidays(holidays)` 注入数据。测试环境直接 `mount(ManagementView)` 不会触发 `App.vue`，导致 `holidayMap.size === 0`，`isWorkDay` 触发 warning 路径：

```js
if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production' && holidayMap.size === 0) {
  console.warn('[dateUtils] isWorkDay called but holidayMap is empty. Call loadHolidays() first.')
}
```

`ManagementView` 内部多处 computed（`totalWorkDays`、`passedWorkDays` 等）连续调用 `isWorkDay`，单次挂载产生 30+ 警告。

## Options Considered

1. **测试文件内 beforeAll 加载 holidays（推荐）** — 局部修复，零侵入，与 `App.vue` 生产行为完全一致
2. 引入全局 vitest setupFiles — 改动较大，会影响所有测试，且需要更新 `vite.config.js`
3. 在 `dateUtils` 模块顶层自动加载 — 破坏纯函数边界，违反 V1.0.0 设计

选择方案 1。

## Fix

```js
import { beforeAll } from 'vitest'
import { loadHolidays } from '@/utils/dateUtils'
import holidays from '@/data/holidays'

beforeAll(() => { loadHolidays(holidays) })
```

## Files Changed

- `src/views/__tests__/ManagementView.test.js` — 顶部新增 import 与 beforeAll