## ADDED Requirements

### Portal Page

- 访问 `/resume` 路由必须渲染 `ResumePortal.vue`,不再渲染旧的 `ResumeView.vue`。
- 页面必须包含顶部 `ResumeHero` 区与配置面板入口按钮(右上角图标按钮)。
- 页面布局必须根据 `useResumeLayout().state.layout` 切换:`single` 为单栏垂直流动,`two-column` 为左主右副两栏。

### Block Rendering

- 区块渲染顺序与显隐必须由 `useResumeLayout().orderedVisibleBlocks` 控制,而非组件内部硬编码。
- 当某区块对应数据为空数组时,该区块组件必须显示空态文案(例:"暂无工作经历,可在右上角配置面板隐藏此区块"),但仍占位。
- 当区块在配置中 `visible=false` 时,组件不渲染、不占位。

### Config Panel

- 配置面板必须以右侧抽屉形式从右向左滑入,带半透明遮罩。
- 配置面板必须包含三个分组:
  1. **布局**:单选按钮"单栏" / "双栏"
  2. **区块**:每个区块一个 toggle(开关),显示区块中文名
  3. **主题**:列出 `RESUME_THEMES` 中所有主题,每项展示色块预览 + 名称
- 配置面板必须提供"重置"按钮,点击后调用 `resetLayout()` 回到默认状态。
- 任何配置变更必须立即同步到 `localStorage["resume-layout"]`(由 composable 的 watch 保证,无需 UI 显式触发保存)。

### Theme System

- 主题切换必须通过修改 `ResumePortal.vue` 根元素的 inline CSS 变量实现,不修改 `:root` 全局变量。
- 主题切换必须仅影响 `.resume-portal` 子树,不影响 App.vue 侧边栏与其他路由页面。
- 切换主题不得引入页面闪烁(过渡时间 ≤ 200ms 或瞬时切换均可,严禁出现白屏)。

### Persistence

- `useResumeLayout` 必须使用 `safeStorage` 抽象访问 localStorage(与 `useResume` / `useTheme` 保持一致)。
- localStorage key 必须为 `resume-layout`,且存储格式必须符合 design.md §3.2 的结构。
- 当 localStorage 存储格式与默认结构不匹配时(例如旧版本数据缺字段),必须做向后兼容的 merge,不得抛出未捕获异常或重置用户数据。

### Composable Singleton

- `useResumeLayout()` 必须返回单例:在同一应用生命周期内多次调用必须返回同一对象引用。
- 必须导出以下方法:`toggleBlock(blockId)`、`setLayout(layout)`、`setTheme(themeId)`、`toggleGlow()`、`resetLayout()`。
- 必须导出以下响应式状态:`state`(只读)、`orderedVisibleBlocks`(computed)、`themeVars`(computed)。

### Data Source Reuse

- `ResumePortal.vue` 必须通过 `useResume()` 获取数据,不允许新建数据 store。
- 不得修改 `useResume.js` 的 API、数据结构或 localStorage key。

### Routing

- `/resume` 路由的 component 必须改为 `ResumePortal`(动态 import 或静态 import 均可)。
- `/resume/customize` 路由必须保留,继续指向现有 `ResumeCustomizeView`。
- 旧文件 `src/views/ResumeView.vue` 必须删除,且全仓 grep `ResumeView` 无残留引用。

### Logo Placeholder

- 公司、学校、证书、项目等条目旁的 logo 必须以纯 CSS 方块(配色 + 首字母)形式实现,不依赖网络图片或本地资源文件。
- logo 配色方案必须可在 `data/resumeThemes.js` 之外的独立映射中维护(便于后续扩展),首版可硬编码常见公司映射 + 默认 fallback。

### Accessibility

- 配置面板必须可通过键盘 Tab 顺序访问,关闭按钮必须有 `aria-label="关闭配置面板"`。
- 所有 toggle 开关必须有可读 label(屏读器能听到"切换 项目 区块显示")。

## TESTS

### useResumeLayout 黄金用例(L1,强制)

- `initialize - no storage returns DEFAULT_LAYOUT`
- `setLayout - persists to localStorage`
- `toggleBlock - flips visible field`
- `setTheme - valid id updates themeVars`
- `setTheme - invalid id is silently ignored`
- `orderedVisibleBlocks - returns visible blocks sorted by order ascending`
- `resetLayout - returns to DEFAULT_LAYOUT after mutations`
- `singleton - two calls return same reference`

### ResumeConfigPanel 黄金用例(L1)

- `open=false - panel not visible (or aria-hidden)`
- `click close button - emits update:open false`
- `click "双栏" button - useResumeLayout.state.layout becomes 'two-column'`
- `toggle profile switch - useResumeLayout.state.blocks.profile.visible flips`

### 验收命令

```bash
npm run lint && npx vitest run && npm run build
```

必须全部通过方可进入归档。