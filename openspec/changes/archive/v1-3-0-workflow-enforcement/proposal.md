# [V1.3.0] 工作流规范强化:阶段闸门 + review.md + 校验脚本

## Why

当前 [`openspec/specs/workflow/spec.md`](openspec/specs/workflow/spec.md) 已经清晰表达了"该做什么、不该跳什么",但仍然依赖人/AI 自律,缺少机械化的执行约束:

- **规约信息源有两份**: [`CLAUDE.md`](CLAUDE.md) 与 workflow spec 重复维护三铁律、流程图、路径选择,任一改动易产生不同步。
- **流程节点无准入/准出闸门**: 每个 Phase 应该有什么制品才允许进入下一步,从未被明确,跳步成本为零。
- **"代码审查通过"无客观判定**: 仅有 Blocker/Major/Minor 分级,但没有审查输出物,事后无法追溯,也无法机器校验。
- **黄金用例 L1 不可执行**: spec 规定用 `// @golden:` 注释标记,但 vitest 不识别该方式,[`package.json`](package.json) 亦无对应脚本,**L1 在工程中实际无法运行**,导致铁律一的回归验证形同虚设。
- **规约与代码同步无硬约束**: `src/` 改了而 `specs/` 没更新时,审查环节无强制检查机制。
- **缺少自动化校验**: 上述所有"必须 / 不得"完全依赖自律,无脚本兜底。

事件背景: 2026-06-03 已有一次"先修代码后补提案"的流程倒挂事件,虽然 workflow spec 已补充"流程纪律"章节,但仍是文字约束,缺机制兜底。

## Goals

- 在 workflow spec 中新增 **阶段闸门表**,定义每个 Phase 的"进入前/退出前必须存在的制品"
- 引入 **`review.md` 制品** 与统一模板,把"审查通过"变成可校验文件
- 在 review.md 检查清单中明确包含 **"specs 与实现一致"** 项,绑定规约同步诉求
- 落地 **L1 黄金用例可执行命令** (`npm run test:golden`),让回归验证从纸面变成现实
- 在 workflow spec 中加入 **规约同步硬约束**: `src/` 行为变更必须有 `specs/` 对应条目
- 提供 **`scripts/check-workflow.mjs`** 自动校验脚本,把规约升级为"机器闸门"
- **去重 CLAUDE.md**,使其退化为项目级元信息 + 单一指针,规约只有一处真相
- 同步更新 CLAUDE.md 的技术栈与项目结构,消除"待定"等过时信息

## Non-goals

- 不引入紧急修复 / 事后追认通道 (本次只关心"不跳步 + 规约同步")
- 不定义变更回滚 / 放弃流程
- 不定义 AI Agent 输出格式契约
- 不对已归档的 v1.0.x / v1.1.x / v1.2.0 补建 `review.md` (新规则只对未来变更生效)
- 不引入 husky / lint-staged 等额外开发依赖 (校验脚本可独立运行,接 pre-commit 留待后续)

## What Changes

### workflow spec (`openspec/specs/workflow/spec.md`)

- 新增章节: **"阶段闸门"** (含 Phase 1~4 闸门表 + 违反闸门时的处置规则)
- 新增章节: **"review.md 模板与强制要求"** (完整模板 + 归档拒绝条件)
- 新增子章节: **"规约同步硬约束"** (`src/` 行为变更与 `specs/` 的强绑定)
- 新增章节: **"自动化校验"** (脚本职责与运行方式)
- 修改章节: 黄金用例标记方式从注释 `// @golden:` 改为文件名约定 `*.golden.test.js`

### CLAUDE.md

- 删除所有与 workflow spec 重复的条款 (三铁律、流程图、路径选择)
- 仅保留: 项目概述 / 技术栈 / 项目结构 / 指向 workflow spec 的单一指针
- 更新过时信息: 技术栈 ("待定" → Vue 3 + Vite + Tailwind + Vitest);项目结构补全 `src/`、`docs/` 等真实目录

### 新增产物

- `openspec/templates/review.md` — 审查报告模板,供未来变更拷贝复用
- `scripts/check-workflow.mjs` — 自动校验脚本
- `package.json` 新增脚本: `test:golden`、`check:workflow`
- 至少 1 个 `*.golden.test.js` 文件 (从现有 utils 测试中精选核心用例派生)

## Capabilities

### New Capabilities

- **workflow/gates** — 流程阶段闸门(准入/准出制品规则)
- **workflow/review** — 强制审查制品 `review.md` 与模板
- **workflow/spec-sync** — 规约同步硬约束
- **workflow/automation** — 自动化校验脚本

### Modified Capabilities

- **workflow/golden-tests** — L1 黄金用例的标记方式与执行命令

## Impact

| 文件 / 目录 | 变更类型 |
|---|---|
| [`openspec/specs/workflow/spec.md`](openspec/specs/workflow/spec.md) | 修改 (新增 4 个章节,修改 1 个章节) |
| [`CLAUDE.md`](CLAUDE.md) | 修改 (大幅精简,只留元信息) |
| `openspec/templates/review.md` | 新增 |
| `scripts/check-workflow.mjs` | 新增 |
| [`package.json`](package.json) | 修改 (新增 2 个脚本) |
| `src/utils/__tests__/*.golden.test.js` | 新增 (至少 1 个文件) |

### 风险

- **本变更必须严格按新规范走完整流程** — 实施过程本身就是新规范的第一次演练,若跳步则失去说服力
- 旧的活跃变更目录可能不满足新校验脚本要求 — 本变更归档前,先将自身目录补齐 `review.md` 作为示范