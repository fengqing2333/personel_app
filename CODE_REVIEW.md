# 工程代码审查与修改建议

> 审查日期: 2026-06-03
> 审查范围: `personel_app` 个人薪资/考勤管理应用 (Vue 3 + Vite + Tailwind)

---

## 一、整体评价

工程整体结构清晰,采用了 Vue 3 Composition API + Composables 模式,职责分离合理:

- **`utils/`** 纯函数 (`salaryEngine`, `dateUtils`),便于单元测试 ✅
- **`composables/`** 状态封装 (`useSalary`, `useLeave`, `useTheme`),复用性强 ✅
- **`components/` + `views/`** UI 与业务解耦 ✅
- **测试覆盖** 关键 utils 与 composables 都有 `__tests__/` ✅
- **CSS 变量 + Tailwind** 主题切换方案优雅 ✅

但仍有若干设计与实现层面的问题值得改进,详见下文。

---

## 二、关键问题与修改建议

### 1. `useSalary` 单例存在内存与测试隔离问题 🔴 高优先级

**位置**: [`src/composables/useSalary.js`](src/composables/useSalary.js:24)

**问题**:
- 模块级 `initialized`、`intervalId`、`timerActive` 状态在测试用例间无法重置,容易导致测试相互污染。
- `cleanup: stopTimer` 暴露给所有调用方,但 `initialized` 不会被重置,再次调用 `useSalary()` 不会重启定时器。
- `beforeunload` 监听器在 SSR 或非浏览器环境下会报错(虽然当前是纯前端,但缺乏防御)。

**建议**:
```js
// 1) 提供导出的 __resetForTests 仅用于测试
export function __resetForTests() {
  stopTimer()
  initialized = false
  config.value = { ...DEFAULT_CONFIG }
}

// 2) 守卫 window 引用
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', stopTimer)
}

// 3) cleanup 后允许重新初始化
function stopTimer() {
  // ...
  initialized = false
}
```

---

### 2. `useLeave` 不是单例,数据可能不同步 🔴 高优先级

**位置**: [`src/composables/useLeave.js`](src/composables/useLeave.js:32)

**问题**:
- `records` 定义在 `useLeave()` 函数内部,**每次调用都会创建新的 ref 实例**。
- `App.vue`、`SalaryDashboard.vue`、`ManagementView.vue` 各自调用 `useLeave()`,得到独立的 `records`。
- 一处 `addLeave` 后,另一处只能等待 `loadRecords()` 才看到变化,容易出现 UI 不同步。
- 与 `useSalary` 的"模块级共享 ref"模式不一致,架构不统一。

**建议**: 将 `records` 提升到模块级,与 `useSalary` 保持一致:
```js
const records = ref([])
let initialized = false

export function useLeave() {
  if (!initialized) {
    loadRecords()
    initialized = true
  }
  // ...
}
```

---

### 3. 使用 `window.prompt` 作为请假类型选择 🟠 中优先级

**位置**: [`src/views/ManagementView.vue`](src/views/ManagementView.vue:60)

**问题**:
- `window.prompt('请假类型:\n1=年假\n2=事假\n3=病假', '2')` 体验差,移动端兼容性差,无法测试。
- 输入校验薄弱(只识别 1/2/3,其他直接吞掉)。

**建议**: 改用一个轻量的 Modal/Popover 组件或下拉菜单,或使用 [`@headlessui/vue`](https://headlessui.com/vue) 实现可访问的弹层。

---

### 4. 跨年统计逻辑缺失 🟠 中优先级

**位置**: [`src/views/SalaryDashboard.vue`](src/views/SalaryDashboard.vue:43)

**问题**:
- `yearlyEarned` 只累计当年 1 月至当前月,无法处理跨年场景下的过往年份对比。
- `dailyRate` 用当前 `config.workDaysPerMonth` 反算所有过去月份,忽视了历史月份计薪天数差异。

**建议**:
- 若需要严格年度统计,应对每个月使用 `getMonthWorkDays(y, monthIdx)` 计算实际工作日,且未来可考虑对历史 config 做快照。
- 短期可在 UI 上加注"基于当前配置估算"的说明文字。

---

### 5. `now` 每秒更新触发整个组件树重渲染 🟠 中优先级

**位置**: [`src/composables/useSalary.js`](src/composables/useSalary.js:48)

**问题**:
- `setInterval` 每秒更新 `now.value`,所有依赖 `now` 的 `computed` 都会重算,包括 `passedWorkDays`、`yearlyEarned` 等较重的循环。
- 整月日历重新渲染没必要每秒发生。

**建议**:
- 拆分为两个 ref: `nowSeconds`(秒级,仅用于 `todayEarned`)与 `nowDate`(分钟/天级,用于工作日统计)。
- 或对 `passedWorkDays`、`yearlyEarned` 等使用基于"日期字符串"的依赖,而非 `Date` 对象。

---

### 6. `localStorage` 写入未做异常处理 🟡 低优先级

**位置**: 多处 `saveConfig`、`saveRecords`、`useTheme` 的 `watch`

**问题**: `localStorage.setItem` 在隐私模式或配额溢出时会抛错,目前未捕获。

**建议**: 统一封装一个 `safeStorage` 工具:
```js
export const safeStorage = {
  get(key, fallback) { try { ... } catch { return fallback } },
  set(key, val) { try { localStorage.setItem(key, JSON.stringify(val)) } catch {} }
}
```

---

### 7. CSS 内联 `style="..."` 过多 🟡 低优先级

**位置**: 几乎所有 `.vue` 模板

**问题**:
- 大量 `style="color: var(--text-secondary);"` 重复出现,可读性差,Tailwind 的优势被冲淡。
- 可考虑在 `tailwind.config.js` 中扩展 colors,把 CSS 变量映射成 Tailwind class:
  ```js
  theme: { extend: { colors: {
    'text-primary': 'var(--text-primary)',
    'text-secondary': 'var(--text-secondary)',
    accent: 'var(--accent)'
  }}}
  ```
  之后即可写 `class="text-text-secondary"`,大幅减少内联样式。

---

### 8. 暗色模式触发位置不一致 🟡 低优先级

**位置**: [`src/App.vue`](src/App.vue:27)

**问题**:
- `dark` class 加在内层 `<div>` 而非 `<html>` 或 `<body>`。
- 如果未来引入 Tailwind 的 `dark:` 变体或第三方组件库,大概率失效。

**建议**: 切换 `document.documentElement.classList`,这也是 Tailwind 默认 `darkMode: 'class'` 推荐方式。

---

### 9. `holidayMap` 模块级可变状态 🟡 低优先级

**位置**: [`src/utils/dateUtils.js`](src/utils/dateUtils.js:9)

**问题**:
- 模块级 `let holidayMap`,如果忘记 `loadHolidays`,所有 `isWorkDay` 退化为"周末判断"。
- 没有对未加载状态发出警告。

**建议**: 在第一次调用 `isWorkDay` 时若 `holidayMap.size === 0`,在 dev 模式下 `console.warn` 一次。

---

### 10. 路由懒加载缺少 `Suspense`/Loading 状态 🟡 低优先级

**位置**: [`src/router/index.js`](src/router/index.js:11)

**建议**: 在 `<RouterView>` 外层包一层 `<Suspense>` 或全局 Loading 提示,提升慢网络下的体验。

---

### 11. 缺少 ESLint / Prettier / TypeScript 配置 🟡 低优先级

**问题**:
- `package.json` 中没有任何 lint/format 工具。
- 代码已有 JSDoc 类型注解,迁移到 TS 成本不高,可获得更强的类型保护。

**建议**:
```bash
npm i -D eslint @vue/eslint-config-prettier eslint-plugin-vue prettier
```
同时增加 `npm run lint`、`npm run format` 脚本。

---

### 12. 测试覆盖不全 🟡 低优先级

**问题**: 组件仅 `ManagementView.test.js` 一个,且只 628B,覆盖度低。`WorkCalendar`、`SalarySettings`、`FullscreenOverlay` 都缺少测试。

**建议**: 至少为有交互逻辑的组件(日历点击增删、设置表单保存)补充快照与交互测试。

---

## 三、优先级排序建议

| 优先级 | 任务 | 预计工作量 |
| --- | --- | --- |
| 🔴 P0 | 修复 `useLeave` 非单例 (#2) | 0.5h |
| 🔴 P0 | `useSalary` 测试隔离与 SSR 守卫 (#1) | 1h |
| 🟠 P1 | 替换 `prompt` 为 Modal (#3) | 2h |
| 🟠 P1 | 拆分秒级/天级 `now` (#5) | 1.5h |
| 🟠 P1 | 跨年统计与历史配置说明 (#4) | 1h |
| 🟡 P2 | 引入 Tailwind 颜色映射、删除内联 style (#7) | 2h |
| 🟡 P2 | `dark` class 提升到 `<html>` (#8) | 0.5h |
| 🟡 P2 | `safeStorage` 封装 (#6) | 0.5h |
| 🟡 P2 | ESLint/Prettier (#11) | 1h |
| 🟡 P2 | 组件测试补全 (#12) | 视范围 |

---

## 四、亮点总结

- 纯函数 + composables 的分层值得保持。
- 节假日/调休数据驱动设计 (`holidays.js` + `loadHolidays`) 是优雅的扩展点。
- CSS 变量 + 单一 `dark` class 的主题方案易维护。
- 已具备 Vitest + jsdom + @vue/test-utils 测试基础设施,可低成本补齐覆盖。

按 P0 → P1 → P2 顺序迭代即可。