# Workflow Spec Delta — V1.3.0

本文件描述对 [`openspec/specs/workflow/spec.md`](openspec/specs/workflow/spec.md) 的增量变更。归档时按 ADDED / MODIFIED / REMOVED 合并入主规范。

---

## ADDED Requirements

### Req A1: 阶段闸门(Phase Gates)

**位置**: workflow spec 在"协作流程"章节之后新增 `## 阶段闸门` 章节。

**内容**:

每个 Phase 必须满足以下"进入前必须存在 / 退出前必须存在"的硬制品要求。AI 检测到下一阶段闸门所需制品缺失时,**必须停下并提示用户**,不得继续执行。

| Phase | 进入前必须存在 | 退出前必须存在 |
|---|---|---|
| Phase 1 探索 | (无) | `docs/superpowers/specs/<change>.md` 草案 (复杂变更必需;小变更可省略) |
| Phase 2 规格 | (Phase 1 制品,如适用) | `proposal.md` + `design.md` + `tasks.md` 全部存在且非空,`specs/` 目录存在且非空 |
| Phase 3 执行 | `tasks.md` 存在 | `tasks.md` 全部勾选 + 测试输出粘贴在 `review.md` 或 commit message |
| Phase 3.5 审查 | 测试全绿证据 | `review.md` 存在,且"结论"段已勾选"通过" |
| Phase 4 归档 | `review.md` 通过 | 主规范 `openspec/specs/` 已合并 |

**违反闸门时的处置**:
1. AI 必须停止当前操作,显式告知用户缺失的制品
2. 用户强行要求继续时,必须在对话中明确授权,且事后补全所有遗漏制品
3. 跳过闸门的行为在 review.md 中必须留痕

### Req A2: review.md 制品与模板

**位置**: workflow spec 新增 `## review.md 模板与强制要求` 章节。

**内容**:

每个变更目录归档前**必须**包含 `review.md`,采用统一模板。`/opsx:archive` (或手动归档) 在归档前必须检测当前变更目录下 `review.md` 是否存在且"结论"段已勾选"通过";任一不满足,归档拒绝执行。

模板见 [`openspec/templates/review.md`](openspec/templates/review.md),核心结构:

```markdown
# Code Review — v<version>-<name>

- 审查时间:
- 审查范围:

## 检查清单

### 功能与测试
- [ ] 测试覆盖关键路径与边界
- [ ] 黄金用例 (L1) 通过 — 命令输出
- [ ] 全量测试 (L2) 通过 — 仅 MAJOR/MINOR 必填

### 规约同步(核心)
- [ ] 本次涉及的功能在 `specs/` 中均有对应条目
- [ ] `src/` 实现行为与 `specs/` 一致
- [ ] tasks.md 所有项已勾选

### 代码质量
- [ ] 无遗留 TODO / console.log
- [ ] 命名 / 风格符合约定
- [ ] 无安全 / 性能隐患

## 发现问题
- Blocker:
- Major:
- Minor:

## 结论
- [ ] 通过 → 归档
- [ ] 就地修复 (Minor)
- [ ] 创建新提案 (Major/Blocker) → 触发铁律三
```

**强制要求**:
- 归档前 review.md 必须存在
- "结论"段必须勾选恰好一项
- 若结论为"通过",方可归档
- 若结论为"就地修复",修复后必须重新审查(更新审查时间)
- 若结论为"创建新提案",触发铁律三流程

### Req A3: 规约同步硬约束

**位置**: workflow spec 在"补充规则"章节中新增子条目"规约同步硬约束"。

**内容**:

任何 `src/` 下的行为变更(新增/修改/删除可观测行为),必须在同一变更目录的 `specs/` 中有对应描述。如无,视为规约脱节,审查必须打回。

**例外**: 纯重构(行为完全不变)、纯样式调整、纯注释修改 — 但必须在 `review.md` 中显式声明"无行为变更"。

**判定原则**:
- "行为"指用户、用方或测试可观测的输入/输出/副作用
- 内部实现重命名 / 私有函数拆分 / 性能优化(行为等价)不属于行为变更
- 当无法判断是否为行为变更时,默认视为"是",必须更新 specs

### Req A4: 自动化校验脚本

**位置**: workflow spec 新增 `## 自动化校验` 章节。

**内容**:

仓库提供 `scripts/check-workflow.mjs` 校验脚本,通过 `npm run check:workflow` 调用。

**职责**:
- 扫描 `openspec/changes/` 下所有未归档变更目录(排除 `archive/`)
- 对每个变更目录,按"阶段闸门表"逐项校验:
  - 目录命名符合 `v<MAJOR>-<MINOR>-<PATCH>-<kebab-name>`
  - `proposal.md` / `design.md` / `tasks.md` 存在且非空
  - `proposal.md` 标题含 `[Vx.y.z]`
  - `specs/` 子目录存在且非空
  - 若 `tasks.md` 全部勾选,则 `review.md` 必须存在
  - 若 `review.md` 存在,"结论"段必须勾选"通过"才能归档

**退出码**:
- `0` 全部通过(可能含警告)
- `1` 至少一个阻断错误

**使用约定**:
- 进入 Phase 4 归档前**必须**手动或自动调用,失败禁止归档
- 后续可接入 pre-commit / CI(本变更不强制)

---

## MODIFIED Requirements

### Req M1: 黄金用例(L1)的标记与执行方式

**原规则** (workflow spec 当前内容):
> 黄金用例标记方式(在测试文件中添加注释):
> ```js
> // @golden: 核心功能 - 描述该测试覆盖的关键路径
> ```
> L1 执行命令: `npx vitest run --pool=forks` 或自定义 golden 脚本

**问题**: vitest 默认不识别注释筛选,所谓"L1 命令"无法独立执行,导致铁律一的回归验证形同虚设。

**新规则**:
- 黄金用例采用**文件名约定**: `*.golden.test.js`
- 文件中应包含核心功能的最小测试集(典型用例 + 边界用例),总执行时间 < 5 秒
- L1 执行命令: `npm run test:golden`,对应 `package.json` 脚本:
  ```json
  "test:golden": "vitest run \"**/*.golden.test.js\""
  ```
- L2 执行命令保持: `npm test` 或 `npx vitest run`

**兼容性**: 现有测试文件不需要立即改名;黄金用例可从现有测试中按需派生,保留原文件作为完整测试集。

---

## REMOVED Requirements

无 — 本变更只新增和修改,不移除任何现有规则。

---

## 验收

合并后,主规范 [`openspec/specs/workflow/spec.md`](openspec/specs/workflow/spec.md) 必须满足:

- [ ] 含 `## 阶段闸门` 章节,完整闸门表 + 违反处置规则
- [ ] 含 `## review.md 模板与强制要求` 章节,完整模板
- [ ] "补充规则"含"规约同步硬约束"子条
- [ ] 含 `## 自动化校验` 章节,说明 `scripts/check-workflow.mjs` 用途
- [ ] 黄金用例章节已改写为文件名约定 + `npm run test:golden`
- [ ] 删除原 `// @golden:` 注释方案