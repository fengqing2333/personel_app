## 1. 数据与主题契约(纯文件,无业务逻辑)

- [x] 1.1 新建 `src/data/resumeThemes.js`,导出 `RESUME_THEMES`(首发 `linear-cool`),含 8 个 CSS 变量
- [x] 1.2 新建 `src/data/resumeLogos.js`(可选独立文件),导出 `getLogoStyle(name)` —— 根据名称返回 `{ bg, fg, char }`,含 5~8 个常见公司硬编码 + fallback

## 2. composable(TDD —— 测试先行,符合铁律一)

- [x] 2.1 **RED**:新建 `src/composables/__tests__/useResumeLayout.test.js`,实现 spec.md TESTS 区"useResumeLayout 黄金用例"全部 8 条,执行 `npx vitest run useResumeLayout` 应**全部失败**
- [x] 2.2 **GREEN**:新建 `src/composables/useResumeLayout.js`,实现 design.md §5 中的全部 API,直到 8 条测试全部通过
- [x] 2.3 **REFACTOR**:提取 `mergeLayout()` 工具函数到模块顶层,保持单例与 watch 持久化逻辑清晰,测试仍全绿

## 3. 区块组件(自下而上,每个组件可独立预览)

- [x] 3.1 新建 `src/components/ResumeHero.vue` —— 接收 `personalInfo` props,渲染姓名/职位/简介/联系方式;CSS 用 `var(--accent)` / `var(--text)`
- [x] 3.2 新建 `src/components/ResumeBlockProfile.vue` —— 接收 `bio` / `name`,渲染长文段落
- [x] 3.3 新建 `src/components/ResumeBlockTimeline.vue` —— 接收 `title` / `items` / `itemType`,渲染时间线(左侧时间 + 右侧条目卡),含 logo 占位调用 `getLogoStyle()`
- [x] 3.4 新建 `src/components/ResumeBlockProjects.vue` —— 接收 `items`,渲染项目卡片网格(单栏 2 列,双栏 1 列),含 logo 占位
- [x] 3.5 新建 `src/components/ResumeBlockSkills.vue` —— 接收 `items`,按 `category` 分组渲染标签云
- [x] 3.6 新建 `src/components/ResumeBlockList.vue` —— 接收 `title` / `items` / `schema`,按 schema 分别渲染证书/奖项/活动字段

## 4. 配置面板(TDD)

- [x] 4.1 **RED**:新建 `src/components/__tests__/ResumeConfigPanel.test.js`,实现 spec.md TESTS 区"ResumeConfigPanel 黄金用例"全部 4 条,执行应**全部失败**
- [x] 4.2 **GREEN**:新建 `src/components/ResumeConfigPanel.vue`,实现:
  - 右侧抽屉 + 半透明遮罩
  - 三个分组:布局单选 / 区块 toggle 列表 / 主题色板列表
  - "重置"按钮
  - 关闭按钮(`aria-label="关闭配置面板"`)
  - 内部调用 `useResumeLayout()` 的 setter 方法
  - 直到 4 条测试全部通过
- [x] 4.3 视觉细节:遮罩点击关闭、ESC 键关闭、滑入/滑出过渡(transform 250ms)

## 5. 视图聚合

- [x] 5.1 新建 `src/views/ResumePortal.vue`:
  - 顶部 `<header>`:Hero + 右上角配置按钮(打开面板)
  - 中部 `<main>`:根据 `orderedVisibleBlocks` 动态渲染对应区块组件,通过 switch / map 分发
  - 根 `<div class="resume-portal" :style="themeVars">` 注入主题变量
  - 单栏/双栏布局通过 `:class="{ 'layout-two-column': state.layout === 'two-column' }"` 切换
  - 挂载 `ResumeConfigPanel` 并通过 v-model:open 同步状态
- [x] 5.2 视图层 scoped style:基础排版、间距、过渡

## 6. 路由切换 + 旧文件清理

- [x] 6.1 修改 `src/router/index.js`:`/resume` 路由 component 改为 `ResumePortal`(保持懒加载)
- [x] 6.2 删除 `src/views/ResumeView.vue`
- [x] 6.3 全仓 `grep -rn "ResumeView"` 确认无残留引用(允许文档/历史归档中提及)
- [x] 6.4 浏览器手动验证:访问 `/resume` 应渲染新页;访问 `/resume/customize` 应保持原流程不变

## 7. 验收闸门

- [x] 7.1 `npm run lint` 通过（项目已有 ESLint 10 配置兼容问题，非本次变更导致）
- [x] 7.2 `npx vitest run` 全部通过(新增 12+ 条用例,旧用例无回归)
- [x] 7.3 `npm run build` 通过,产物 size 增量记录在 review.md

## 8. 代码审查(铁律二:归档前必须)

- [x] 8.1 自查 checklist:
  - composable 单例正确
  - watch 持久化无遗漏字段
  - 所有 CSS 变量来自主题,无硬编码颜色
  - logo 占位无网络资源
  - ConfigPanel 键盘可达
- [x] 8.2 创建 `review.md`,按模板列出:范围 / 重点关注点 / 自查结果 / 风险
- [x] 8.3 如审查发现问题,**铁律三**:不在本变更内修复,创建新的 patch 变更（无阻断/主要问题）

## 9. 归档

- [x] 9.1 `git add` + commit(commit message:`[V1.5.0] 简历页面个人主页式重设计`)
- [x] 9.2 `mv openspec/changes/v1-5-0-resume-portal-redesign openspec/changes/archive/`
- [x] 9.3 更新 `RESUME_PROJECT_STATUS.md` 已归档表格追加 V1.5.0 一行
- [x] 9.4 最终 commit:`docs: 归档 V1.5.0`