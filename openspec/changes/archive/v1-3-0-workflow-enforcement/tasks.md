# Tasks — V1.3.0 工作流规范强化

> 实施顺序: 先建闸门与制品 (#2 #3 #5) → 再去重 CLAUDE.md (#1) → 落地 L1 (#4) → 最后写脚本兜底 (#6)
> 每个一级任务对应落地计划中的一条建议。每个二级任务建议 0.5~2 小时可完成。

## 1. 在 workflow spec 中新增"阶段闸门"章节 (对应建议 #2)

- [x] 1.1 在 [`openspec/specs/workflow/spec.md`](openspec/specs/workflow/spec.md) 的"协作流程"章节后插入 `## 阶段闸门` 章节
- [x] 1.2 写入 Phase 1~4 完整闸门表 (按 design.md D1 给出的表格)
- [x] 1.3 补充"违反闸门时的处置"3 条规则
- [x] 1.4 检查 spec 内部链接与目录,确认章节顺序合理

## 2. 在 workflow spec 中新增 review.md 制品规则 + 模板文件 (对应建议 #3)

- [x] 2.1 在 workflow spec 中新增 `## review.md 模板与强制要求` 章节,粘贴完整模板
- [x] 2.2 写入"归档拒绝条件":review.md 不存在或结论非"通过"即拒绝
- [x] 2.3 创建 [`openspec/templates/review.md`](openspec/templates/review.md) 模板文件,内容与 spec 中一致
- [x] 2.4 在本变更目录创建 `review.md` 草稿作为示范(暂留结论为空,Phase 3.5 时再填)

## 3. 在 workflow spec 中新增"规约同步硬约束" (对应建议 #5)

- [x] 3.1 在 spec 的"补充规则"章节内追加"规约同步硬约束"子条目
- [x] 3.2 明确例外列表 (纯重构/纯样式/纯注释)
- [x] 3.3 明确"无法判断时默认视为行为变更"的兜底原则

## 4. 修改黄金用例规则 + 落地 `test:golden` 命令 (对应建议 #4)

> **✅ 阻塞已解除 (2026-06-04)**: 已由独立提案 **v1.3.1-vitest-infra-fix** 解决并归档(见 [`openspec/changes/archive/v1-3-1-vitest-infra-fix/`](../archive/v1-3-1-vitest-infra-fix/))。
> 修复方式: vitest 1.6 → 3.2.6 + vite 5 → 8 + plugin-vue 5 → 6 + [`vite.config.js`](vite.config.js) defineConfig 来源切换到 `'vitest/config'`。
> 验证: `npm test` 10 files / 77 tests passed, 3.36s;`npm run test:golden` 2 files / 11 tests passed, 1.93s(< 5s 达标)。

- [x] 4.1 在 workflow spec 中将原 `// @golden:` 注释方案改写为 `*.golden.test.js` 文件名约定
- [x] 4.2 在 [`package.json`](package.json) 中新增脚本 `"test:golden"`(实际命令以 vitest 修复后形态为准)
- [x] 4.3 从 [`src/utils/__tests__/salaryEngine.test.js`](src/utils/__tests__/salaryEngine.test.js) 抽取核心计算用例 → 派生 [`salaryEngine.golden.test.js`](src/utils/__tests__/salaryEngine.golden.test.js)
- [x] 4.4 从 [`src/utils/__tests__/dateUtils.test.js`](src/utils/__tests__/dateUtils.test.js) 抽取工作日判定用例 → 派生 [`dateUtils.golden.test.js`](src/utils/__tests__/dateUtils.golden.test.js)
- [x] 4.5 已运行 `npm run test:golden` — 2 files / 11 tests passed, **1.93s**(< 5 秒达标),输出已粘进 v1.3.1 review.md

## 5. 重写 CLAUDE.md 去重 (对应建议 #1,依赖 #1~#4 完成)

- [x] 5.1 比对 [`CLAUDE.md`](CLAUDE.md) 与 workflow spec,标记所有重复条款 (三铁律/流程图/路径选择)
- [x] 5.2 重写 CLAUDE.md,仅保留: 项目概述 / 技术栈 / 项目结构 / 指向 workflow spec 的指针段
- [x] 5.3 更新技术栈段为 Vue 3 + Vite + Tailwind + Vitest (�换"待定")
- [x] 5.4 补全项目结构树,加入 `src/`、`docs/` 等真实目录
- [x] 5.5 校验: `findstr /c:"铁律一" CLAUDE.md` 输出 0 行,`findstr /c:"Phase 1" CLAUDE.md` 输出 0 行

## 6. 新增 workflow 章节 + 实现校验脚本 (对应建议 #6)

- [x] 6.1 在 workflow spec 中新增 `## 自动化校验` 章节,描述脚本职责与运行方式
- [x] 6.2 创建 `scripts/check-workflow.mjs`,实现 design.md 中描述的核心逻辑
- [x] 6.3 在 [`package.json`](package.json) 新增脚本 `"check:workflow": "node scripts/check-workflow.mjs"`
- [x] 6.4 本地运行 `npm run check:workflow`,确认对本变更目录通过(此时 review.md 草稿存在但结论未填,应给出警告但不阻断 Phase 2)
- [x] 6.5 制造一个假错误目录(如手工删除某文件),验证脚本能正确报错并 exit 1
- [x] 6.6 还原假错误,把命令输出粘进 review.md

## 7. 自演练 + 审查 + 归档 (Phase 3.5 + Phase 4)

- [x] 7.1 复跑 `npm test` 确认全量测试仍全绿(本变更不应破坏现有测试)— 9 files / 76 tests passed, 2.84s
- [x] 7.2 复跑 `npm run test:golden` 确认 L1 通过 — 2 files / 11 tests passed, 1.51s
- [x] 7.3 完成本变更目录的 `review.md`,逐项勾选检查清单
- [x] 7.4 review.md 的"规约同步"三项必须真实核对:本变更涉及的 spec 改动是否完整、CLAUDE.md 是否与 spec 一致、tasks 是否全部勾选
- [x] 7.5 review.md 结论勾选"通过"
- [x] 7.6 运行 `npm run check:workflow`,确认对本变更目录全部通过 — 1 个变更,ERROR 0 / WARN 0
- [x] 7.7 归档: 将本变更目录从 `openspec/changes/v1-3-0-workflow-enforcement/` 移至 `openspec/changes/archive/v1-3-0-workflow-enforcement/`
- [x] 7.8 specs delta 已直接合入主规范 [`openspec/specs/workflow/spec.md`](../../../openspec/specs/workflow/spec.md)(本变更采用直接修改主规范的模式,无独立 delta 文件需合并)