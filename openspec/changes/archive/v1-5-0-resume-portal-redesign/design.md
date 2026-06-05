# [V1.5.0] 设计文档 —— 简历个人主页式重设计

## 1. 目标与范围

把 `/resume` 路由从"列表录入页"升级为"个人主页式展示页",数据层 `useResume` 不动,新增 1 个视图 + 6 个区块组件 + 1 个配置面板 + 1 个 layout composable + 1 个主题数据文件。

## 2. 架构总览

```
/resume  ──>  ResumePortal.vue
                ├── ResumeHero.vue                (顶部介绍区,从 useResume.personalInfo 读)
                ├── 区块流(由 useResumeLayout 控制顺序/显隐)
                │     ├── ResumeBlockProfile.vue        (关于我)
                │     ├── ResumeBlockTimeline.vue       (工作经历,数据=experiences)
                │     ├── ResumeBlockTimeline.vue       (教育,数据=education,复用同组件不同 props)
                │     ├── ResumeBlockProjects.vue       (项目,数据=projects)
                │     ├── ResumeBlockSkills.vue         (技能,数据=skills)
                │     ├── ResumeBlockList.vue           (证书,数据=certificates)
                │     ├── ResumeBlockList.vue           (奖项,数据=awards)
                │     └── ResumeBlockList.vue           (活动,数据=activities)
                └── ResumeConfigPanel.vue          (右侧抽屉,改写 useResumeLayout 状态)
```

## 3. 数据契约

### 3.1 已有数据(来自 `useResume.js`,不改动)

```js
{
  personalInfo: { name, title, email, phone, location, bio },
  experiences: [{ id, company, position, startDate, endDate, description, achievements }],
  education:   [{ id, school, degree, major, startDate, endDate, gpa, description }],
  projects:    [{ id, name, role, startDate, endDate, description, technologies, link }],
  skills:      [{ id, name, category, level }],
  certificates:[{ id, name, issuer, date, link }],
  awards:      [{ id, name, issuer, date, description }],
  activities:  [{ id, name, role, startDate, endDate, description }],
}
```

### 3.2 新增布局/偏好契约(`useResumeLayout.js`)

`localStorage["resume-layout"]` 持久化对象:

```js
{
  layout: 'single' | 'two-column',          // 单栏 / 双栏
  blocks: {
    profile:      { visible: true, order: 0 },
    experiences:  { visible: true, order: 1 },
    projects:     { visible: true, order: 2 },
    skills:       { visible: true, order: 3 },
    education:    { visible: true, order: 4 },
    certificates: { visible: true, order: 5 },
    awards:       { visible: true, order: 6 },
    activities:   { visible: false, order: 7 }, // 默认隐藏活动
  },
  themeId: 'linear-cool',                   // 主题 id,对应 resumeThemes 表中的 key
  glowEnabled: false,                       // 是否启用径向光斑(Linear 风格默认关)
}
```

## 4. 主题契约(`resumeThemes.js`)

主题数据导出 `RESUME_THEMES` 对象,key 为 themeId,value 为 CSS 变量映射:

```js
export const RESUME_THEMES = {
  'linear-cool': {
    name: 'Linear 冷调中性',
    vars: {
      '--bg':         '#252630',
      '--bg-soft':    '#2c2d38',
      '--card':       '#2f3040',
      '--border':     '#3a3b4a',
      '--text':       '#e7e7ee',
      '--muted':      '#9b9caa',
      '--accent':     '#7c8aff',
      '--accent-soft':'#a5b0ff',
    },
  },
  // 后续可扩展 stripe-slate / notion-warm / arc-purple
}
```

### 应用方式

`ResumePortal.vue` 顶层用 `<style scoped>` 写默认值,运行时通过 `:style="themeVars"` 把当前主题的 CSS 变量 inline 到根 `<div class="resume-portal">` 上;所有子组件用 `var(--bg)` 等读取,实现一处切换全树生效。

## 5. composable 设计(`useResumeLayout.js`)

```js
// 单例 + 持久化,模仿 useResume.js 的范式
const STORAGE_KEY = 'resume-layout'
const DEFAULT_LAYOUT = {
  layout: 'single',
  blocks: { ... },           // 见 3.2
  themeId: 'linear-cool',
  glowEnabled: false,
}

let _instance = null

export function useResumeLayout() {
  if (_instance) return _instance

  const state = ref({ ...DEFAULT_LAYOUT })

  // 1. 初始化:读 localStorage,做 schema 兼容 merge
  function initialize() {
    const stored = safeStorage.get(STORAGE_KEY)
    if (stored && typeof stored === 'object') {
      state.value = mergeLayout(DEFAULT_LAYOUT, stored)
    }
  }

  // 2. 操作 API
  function toggleBlock(blockId) { /* visible 反转 */ }
  function setLayout(layout)    { /* 'single' | 'two-column' */ }
  function setTheme(themeId)    { /* 在 RESUME_THEMES 中存在才生效 */ }
  function toggleGlow()         { /* boolean 反转 */ }
  function resetLayout()        { /* 回到 DEFAULT_LAYOUT */ }

  // 3. 派生
  const orderedVisibleBlocks = computed(() =>
    Object.entries(state.value.blocks)
      .filter(([_, cfg]) => cfg.visible)
      .sort((a, b) => a[1].order - b[1].order)
      .map(([id]) => id)
  )

  const themeVars = computed(() => {
    const theme = RESUME_THEMES[state.value.themeId] || RESUME_THEMES['linear-cool']
    return theme.vars
  })

  // 4. 持久化
  watch(state, (val) => safeStorage.set(STORAGE_KEY, val), { deep: true })

  initialize()

  _instance = {
    state: readonly(state),
    orderedVisibleBlocks,
    themeVars,
    toggleBlock,
    setLayout,
    setTheme,
    toggleGlow,
    resetLayout,
  }
  return _instance
}
```

### 与 `useTheme` 的关系

完全解耦:`useTheme` 控制全局 dark class(影响 App.vue/Sidebar 等),`useResumeLayout.themeId` 只作用在 `.resume-portal` 子树。

## 6. 组件接口约定

### 6.1 ResumeHero.vue

```js
props: { personalInfo: Object, accent: String }
// 内部不直接读 useResume,完全靠 props 传入,便于测试
```

### 6.2 ResumeBlockTimeline.vue

```js
props: {
  title: String,             // '工作经历' or '教育'
  items: Array,              // experiences 或 education
  itemType: 'experience' | 'education',  // 决定字段映射(company vs school 等)
}
```

### 6.3 ResumeBlockProjects.vue

```js
props: { items: Array }   // projects
// logo 占位:用 project.name 首字母 + 哈希到品牌色
```

### 6.4 ResumeBlockSkills.vue

```js
props: { items: Array }   // skills,按 category 分组
```

### 6.5 ResumeBlockList.vue

```js
props: {
  title: String,
  items: Array,
  schema: 'certificate' | 'award' | 'activity',  // 决定显示哪些字段
}
```

### 6.6 ResumeBlockProfile.vue

```js
props: { bio: String, name: String }
```

### 6.7 ResumeConfigPanel.vue

```js
props: { open: Boolean }
emits: ['update:open']
// 内部 import useResumeLayout 并调用其操作 API
```

## 7. 兼容与回滚

- 旧路由 `/resume/customize` 完全不变(继续走 ResumeCustomizeView)
- 删除 `ResumeView.vue` 时如有引用,grep 全仓清理
- 回滚策略:`git revert` 整个 V1.5.0 PR;localStorage `resume-layout` 即使残留也无害(后续版本可读可忽略)

## 8. 测试策略

### L1 黄金用例(`useResumeLayout.test.js`)

1. **默认初始化**:无 localStorage 时返回 DEFAULT_LAYOUT
2. **持久化往返**:setLayout('two-column') 后再读 localStorage,字段为 'two-column'
3. **toggleBlock 反转**:profile 默认 visible=true,toggle 后变 false
4. **主题切换**:setTheme('linear-cool') 后 themeVars 包含 `--bg: #252630`
5. **invalid 主题忽略**:setTheme('not-exist') 不抛错,themeId 不变
6. **orderedVisibleBlocks 排序**:返回按 order 升序的 visible block id 数组

### L1 组件用例(`ResumeConfigPanel.test.js`)

1. 关闭/打开 emit:点击关闭按钮 emit `update:open` false
2. 切换布局:点击"双栏"按钮后 `useResumeLayout.state.layout === 'two-column'`

### 跳过项

- 视图层 `ResumePortal.vue` / `ResumeHero.vue` 等"纯展示"组件不写 L1 用例(L2 视觉回归留待后续)

## 9. 实施分阶段

详见 `tasks.md`。原则:**数据层 → composable(TDD) → 主题数据 → 区块组件(自下而上)→ 配置面板 → 视图聚合 → 路由切换**,每一步可独立通过测试。

## 10. 设计决策记录

| 决策 | 选项 | 选择 | 理由 |
|---|---|---|---|
| 主题应用方式 | 全局 CSS 变量 / 组件 inline | 组件 inline | 不污染全局,与 useTheme 解耦 |
| 区块顺序 | 拖拽排序 / 仅显隐 | 仅显隐(本期) | 避免引入 sortable 依赖 |
| 视图测试粒度 | 全量 mount / 仅 composable | 仅 composable + ConfigPanel | 视觉部分等 L2;符合"先黄金用例"原则 |
| logo 实现 | 真实图片 / CSS 文字块 | CSS 文字块 | 零依赖,首屏快,后续可平滑替换 |
| 主题独立性 | 跟随 useTheme / 自管 | 自管 | 个人简历应有独立视觉,不跟随系统 |