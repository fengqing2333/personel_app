# [V1.5.0] 简历页面个人主页式重设计

## Why

当前 `src/views/ResumeView.vue` 是一个偏列表式的"录入面板",信息密度高但缺乏个人门户的展示力,与项目"个人门户"的定位脱节:

1. **视觉割裂**:简历页继续使用烟蓝色块布局,而设计稿目标是 Linear 冷调中性风格(`#252630` + `#7c8aff`),需要专门的页面承载这个新视觉语言
2. **展示力不足**:7 类数据(工作经历/项目/教育/证书/技能/奖项/活动)堆叠在表单里,访客视角下读不出"履历叙事"
3. **缺少个性化配置**:用户希望可以选择布局(单栏/双栏)、显示哪些区块、切换主题色板,目前完全没有这个能力
4. **设计稿已就绪**:`docs/superpowers/specs/2026-06-05-resume-redesign-design.md` 已沉淀完整设计草案,`design-previews/version-a-warm-charcoal.html` 已迭代到最终配色,需要按规范工作流落地

## Goals

- 新增 `ResumePortal.vue` 替换 `ResumeView.vue` 的展示功能,呈现"个人主页式"垂直流动布局
- 复用现有 `useResume.js` 的 7 类数据 CRUD,**不改动数据层**
- 新增右侧/抽屉式 `ResumeConfigPanel.vue` 提供布局/区块/主题三类配置
- 新增 `useResumeLayout.js` composable,localStorage 持久化用户偏好
- 引入 `data/resumeThemes.js` 主题色板数据,首发 Linear 冷调中性
- 公司/学校/证书旁的 logo 占位符方案保留(沿用 HTML 原型)
- 路由 `/resume` 切换为新的 `ResumePortal`,旧的 `ResumeView` 移除

## Non-goals

- 不改动 `useResume.js` 的数据结构与 localStorage key
- 不修改 `/resume/customize` 路由及其相关组件(`ResumeCustomizeView` 等)
- 不实现真实的公司 logo 上传/远程加载,仅用 CSS 颜色块 + 文字占位
- 不引入拖拽排序的依赖库,首版仅支持区块显隐切换
- 不实现明亮模式(本期主题均为深色,亮色留待后续版本)
- 不改动现有 `ResumeForm.vue` / `ResumeTimeline.vue`(其依然在 `/resume/customize` 流程使用)

## What Changes

### 新增文件

- `src/views/ResumePortal.vue` —— 新主视图(替代 `ResumeView.vue` 在 `/resume` 路由的位置)
- `src/components/ResumeHero.vue` —— 顶部 Hero 区(姓名/职位/简介/联系方式)
- `src/components/ResumeBlockTimeline.vue` —— 工作经历/教育时间线区块
- `src/components/ResumeBlockProjects.vue` — 项目卡片区块(含 logo 占位)
- `src/components/ResumeBlockSkills.vue` —— 技能标签区块
- `src/components/ResumeBlockList.vue` —— 通用列表区块(证书/奖项/活动复用)
- `src/components/ResumeBlockProfile.vue` —— 关于我/简介长文区块
- `src/components/ResumeConfigPanel.vue` —— 右侧配置抽屉
- `src/composables/useResumeLayout.js` —— 布局/区块/主题状态管理 + 持久化
- `src/data/resumeThemes.js` —— 主题色板数据(首发 Linear 冷调中性)

### 修改文件

- `src/router/index.js` —— `/resume` 改指 `ResumePortal.vue`
- `src/views/ResumeView.vue` —— 移除(由 `ResumePortal.vue` 承担其在 `/resume` 的角色)

### 测试

- `src/composables/__tests__/useResumeLayout.test.js` —— L1 黄金用例(初始化默认配置/切换布局/切换区块显隐/主题切换/持久化往返)
- `src/components/__tests__/ResumeConfigPanel.test.js` —— 配置面板交互(L1 子集)

## Capabilities

### New Capabilities

- **portal-redesign** (新增能力):个人主页式简历视图,含 Hero + 7 类数据区块 + 配置面板;支持布局切换、区块显隐、主题切换并持久化用户偏好

## Impact

- 路由级影响:`/resume` 完全切换到新视图,旧 `ResumeView.vue` 删除
- `App.vue` 不变(侧边栏导航文案"简历"保持)
- localStorage 新增键 `resume-layout`(布局/显隐/主题三合一对象)
- 首屏渲染:CSS 变量在 `ResumePortal.vue` 内部 scoped,不污染全局
- 性能:无新依赖,首屏 JS 体积变化预计 <15KB
- 主题与现有 `useTheme` 解耦:本视图主题独立于全局 dark/light(本期固定深色)