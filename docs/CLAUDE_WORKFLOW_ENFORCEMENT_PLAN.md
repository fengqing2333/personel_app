# 工作流规范强化 — 落地计划

> **目标**: 把 [`docs/CLAUDE_WORKFLOW_REVIEW.md`](docs/CLAUDE_WORKFLOW_REVIEW.md) 提出的 6 条优化建议,转化为可执行、可验收的工程动作。
> **核心诉求**: 每次执行都符合规范流程、保持规约同步、不跳过规约。
> **预计总工时**: P0 约 2.5 小时,P1 约 4 小时
> **建议路径**: 本身就是一次"规范变更",应通过 OpenSpec 流程实施 — 即先创建变更提案 `v1-1-0-workflow-enforcement`,再分步落地。

---

## 全局策略

### 实施原则

1. **规范变更也要走规范流程**:不能用规范变更去绕开规范。必须先建提案。
2. **从硬制品 / 闸门入手**:先建立"机器可校验"的部分(#2 #3 #6),再补软规则。
3. **小步快跑**:每条建议独立落地、独立验证、独立提交,避免一次性大改。
4. **不破坏现有归档**:已归档的 v1.0.0 / v1.0.1 / v1.0.2 不补 `review.md`,新规则只对未来变更生效。

### OpenSpec 变更目录建议

```
openspec/changes/v1-1-0-workflow-enforcement/
├── proposal.md       # [V1.1.0] 工作流规范强化:阶段闸门 + review.md + 校验脚本
├── design.md         # 闸门表设计 / review.md 模板设计 / 脚本架构
├── tasks.md          # 6 大子任务,对应 #1~#6
├── specs/
│   └── workflow/
│       └── spec.md   # workflow spec 的 delta(新增章节)
└── review.md         # 本变更归档前的自审报告
```

### 总验收标准

✅ 所有改动通过 `node scripts/check-workflow.mjs` 校验
✅ workflow spec 中"阶段闸门表 / review.md 模板 / 同步硬约束"三节齐备
✅ CLAUDE.md 不再包含任何与 workflow spec 重复的条款
✅ `npm run test:golden` 可在本地真实跑通
✅ 用一次"演练性 Bug 修复"端到端跑完整套流程,无任何步骤靠人工记忆推进

---

## #1 CLAUDE.md 与 workflow spec 去重 🔴 P0

### 目标

让规约只有一处真相 — `openspec/specs/workflow/spec.md`。CLAUDE.md 退化为项目级元信息 + 一条指针。

### 步骤

1. **审计**: 对比 [`CLAUDE.md`](CLAUDE.md) 与 [`workflow/spec.md`](openspec/specs/workflow/spec.md),逐段标记重复部分(预期包括: 三条铁律、路径选择、流程图)。
2. **重写 `CLAUDE.md`**,只保留:
   - 项目一句话概述
   - 技术栈(同步更新真实情况)
   - 项目结构树(包含 `src/`、`docs/`、`openspec/` 等真实目录)
   - **指针段**:"流程规范以 `openspec/specs/workflow/spec.md` 为单一信息源,本文件不重复其中任何条款"
3. **检查 `.claude/commands/` 与 `.joycode/rules/`** 是否也有重复条款,如有一并归并。

### 产物

- 修订后的 [`CLAUDE.md`](CLAUDE.md) (预计 30~40 行,当前 75 行)

### 命令 / 校验

```bash
# 校验是否仍有重复条款(应输出 0)
grep -c "铁律一" CLAUDE.md
grep -c "Phase 1" CLAUDE.md
grep -c "OpenSpec.*规定" CLAUDE.md
```

### 验收

- [ ] CLAUDE.md 不再含"铁律"、"Phase 1~4"、"路径选择"等字样
- [ ] CLAUDE.md 含一条指向 workflow spec 的明确链接
- [ ] 技术栈段已更新为 Vue 3 / Vite / Tailwind / Vitest

### 工时

约 20 分钟

---

## #2 阶段闸门表 🔴 P0

### 目标

在 workflow spec 中新增 "阶段闸门" 章节,定义每个 Phase **进入前必须存在的制品** 与 **退出前必须存在的制品**。把"不得跳步"从口号变成可逐项核对的清单。

### 步骤

1. **在 [`workflow/spec.md`](openspec/specs/workflow/spec.md) 中插入新章节**,位置建议在"协作流程"之后、"铁律一"之前(因为它是铁律的执行底座)。
2. **章节内容核心是一张表**:

   | Phase | 进入前必须存在 | 退出前必须存在 |
   |---|---|---|
   | Phase 1 探索 | (无) | `docs/superpowers/specs/<change>.md` 草案 |
   | Phase 2 规格 | 上一阶段制品 | `proposal.md` + `design.md` + `specs/` 非空目录 + `tasks.md` 全部存在 |
   | Phase 3 执行 | tasks.md 存在 | 所有 tasks 已勾选 + `npm test` 输出全绿截图/日志 |
   | Phase 3.5 审查 | 测试全绿证据 | `review.md` 存在且 "结论" 字段 = 通过 |
   | Phase 4 归档 | review.md 通过 | 主规范 `openspec/specs/` 已合并 |

3. **配套写"违反闸门时的处置"**:
   - AI 检测到下一阶段闸门所需制品缺失 → **必须停下,提示用户**,不得继续执行
   - 用户强行要求继续 → 必须显式确认并在对话中留痕

### 产物

- `workflow/spec.md` 新增 "## 阶段闸门" 章节(约 60 行)
- 在 v1-1-0 变更的 `specs/workflow/spec.md` 中以 delta 形式给出

### 验收

- [ ] workflow spec 有完整闸门表
- [ ] 每个 Phase 的"必须存在制品"用文件路径明确说明
- [ ] 违反闸门时的处置规则明确

### 工时

约 30 分钟

---

## #3 强制 `review.md` 制品 🔴 P0

### 目标

让"审查通过"从主观感受变成可校验文件;审查清单中包含"specs 与实现一致",直接绑定规约同步诉求。

### 步骤

1. **在 workflow spec 中追加 "## review.md 模板与强制要求" 章节**,粘贴下方模板,明确"归档前必须存在且结论=通过"。

2. **模板内容**(放入 spec 的代码块中):

   ```markdown
   # Code Review — v<version>-<name>

   - 审查时间:
   - 审查范围: (commit 哈希列表 或 受影响文件清单)

   ## 检查清单

   ### 功能与测试
   - [ ] 测试覆盖关键路径与边界场景
   - [ ] 黄金用例 (L1) 通过: 粘贴命令输出
   - [ ] 全量测试 (L2) 通过: 粘贴命令输出 (仅 MAJOR/MINOR 必填)

   ### 规约同步(核心)
   - [ ] 本次涉及的功能在 `specs/` 中均有对应条目
   - [ ] `src/` 实现行为与 `specs/` 一致(关键场景逐条对照)
   - [ ] tasks.md 所有项已勾选,且每项均能在 commit 中找到对应改动

   ### 代码质量
   - [ ] 无遗留 TODO / console.log / 调试代码
   - [ ] 命名 / 风格符合既有约定
   - [ ] 无安全 / 性能明显隐患

   ## 发现问题

   - Blocker:
   - Major:
   - Minor:

   ## 结论

   - [ ] 通过 → 进入归档
   - [ ] 就地修复 (仅 Minor) → 修复后重新审查
   - [ ] 创建新提案 (Major / Blocker) → 触发铁律三
   ```

3. **在 spec 中加一条硬约束**:

   > `/opsx:archive` 在归档前必须检测当前变更目录下 `review.md` 是否存在且"结论"段落已勾选"通过"。任一不满足,归档拒绝执行。

4. **在项目里创建模板文件**:
   - 路径: `openspec/templates/review.md`
   - 供未来变更直接拷贝复用

### 产物

- workflow spec 新增章节(约 50 行)
- `openspec/templates/review.md` 模板文件

### 验收

- [ ] workflow spec 包含完整 review.md 模板
- [ ] 模板内"规约同步"三项明确列出
- [ ] `openspec/templates/review.md` 文件存在
- [ ] 校验脚本(#6)会检查此文件存在性

### 工时

约 30 分钟

---

## #4 L1 黄金用例可执行命令 🟠 P1

### 目标

让 L1 不再是纸面命令,改造为真实可执行的 `npm run test:golden`。

### 步骤

1. **决定标记方式**: 推荐 **文件名标记**(描述更明确,IDE 可识别):
   - 黄金用例文件命名为 `*.golden.test.js`
   - 例如: `salaryEngine.golden.test.js`

2. **在 [`vite.config.js`](vite.config.js) 中增加配置**(或新建 `vitest.golden.config.js`):

   ```js
   // 方案 A: 复用主配置,通过 CLI include 筛选
   // 无需改 vite.config.js
   ```

3. **在 [`package.json`](package.json) 增加脚本**:

   ```json
   {
     "scripts": {
       "test:golden": "vitest run --testPathPattern='\\.golden\\.test\\.'"
     }
   }
   ```

   或者用 include:

   ```json
   "test:golden": "vitest run \"**/*.golden.test.js\""
   ```

4. **筛选 2~3 个核心用例改名为 `.golden.test.js`**:
   - 候选: [`salaryEngine.test.js`](src/utils/__tests__/salaryEngine.test.js) 中的核心计算用例
   - [`dateUtils.test.js`](src/utils/__tests__/dateUtils.test.js) 中的工作日判定用例
   - 拆出来形成独立的 `.golden.test.js` 文件,保持 < 5 秒执行

5. **更新 workflow spec 中黄金用例章节**: 删除 `// @golden:` 注释方案,改写为文件名约定。

### 产物

- `package.json` 新增 `test:golden` 脚本
- 至少 1 个 `*.golden.test.js` 文件
- workflow spec 黄金用例章节更新

### 命令 / 校验

```bash
npm run test:golden
# 期望: 输出在 5 秒以内, 全部通过
```

### 验收

- [ ] `npm run test:golden` 可执行且在 5 秒内完成
- [ ] 至少 1 个 `*.golden.test.js` 存在
- [ ] workflow spec 反映新的命名方式

### 工时

约 1 小时

---

## #5 制品-代码同步硬约束 🟠 P1

### 目标

任何 `src/` 行为变更必须在同变更目录的 `specs/` 中有对应条目;否则审查必须打回。

### 步骤

1. **在 workflow spec 中追加 "## 规约同步硬约束" 子章节**,文字如下:

   > 任何 `src/` 下的行为变更(新增/修改/删除可观测行为),必须在同一变更目录的 `specs/` 中有对应描述。如无,视为规约脱节,审查必须打回。
   >
   > 例外:纯重构(行为完全不变)、纯样式调整、纯注释修改 — 但必须在 review.md 中显式声明"无行为变更"。

2. **将该条目同步进 `review.md` 模板**(#3 已覆盖)。

3. **在 #6 的校验脚本中增加检查**: 若变更目录 `specs/` 为空且 `src/` 有 diff,警告但不阻断(因为脚本难以判定"是否纯重构")。

### 产物

- workflow spec 新增子章节(约 15 行)
- review.md 模板已含此项(#3)
- check-workflow.mjs 有对应警告(#6)

### 验收

- [ ] workflow spec 明确该条规则与例外
- [ ] 校验脚本能输出对应警告

### 工时

约 20 分钟

---

## #6 自动化校验脚本 🟠 P1

### 目标

提供 `scripts/check-workflow.mjs`,把规约从"AI 自律"升级为"机器闸门"。

### 步骤

1. **在仓库根目录创建 `scripts/check-workflow.mjs`**,功能清单:
   - 扫描 `openspec/changes/` 下所有未归档变更目录
   - 对每个变更目录,按"阶段闸门表"逐项校验:
     - 目录命名是否符合 `v<MAJOR>-<MINOR>-<PATCH>-<kebab-name>`
     - `proposal.md` 存在且标题含 `[Vx.y.z]`
     - `design.md` / `tasks.md` 存在且非空
     - `specs/` 子目录存在且非空
     - 若 `tasks.md` 全部勾选,则要求 `review.md` 存在
     - 若 `review.md` 存在,要求"结论"已勾选"通过"
   - 输出:
     - 阻断错误(exit code 1)
     - 警告(exit code 0,但红字提示)

2. **package.json 增加脚本**:

   ```json
   "scripts": {
     "check:workflow": "node scripts/check-workflow.mjs"
   }
   ```

3. **接入 pre-commit**(可选,如果引入 husky):

   ```bash
   # .husky/pre-commit
   npm run check:workflow
   ```

4. **在 workflow spec 中追加 "## 自动化校验" 章节**,说明脚本职责与如何运行。

### 产物

- `scripts/check-workflow.mjs` (约 100~150 行)
- `package.json` 新增 `check:workflow` 脚本
- workflow spec 章节描述

### 命令 / 校验

```bash
node scripts/check-workflow.mjs
# 期望: 当前所有活跃变更目录均通过校验(若无活跃变更,直接退出 0)
```

### 验收

- [ ] 脚本能正确扫描 `openspec/changes/`
- [ ] 对缺失制品的目录报错并 exit 1
- [ ] 文档说明如何使用

### 工时

约 1.5 小时

---

## 执行顺序建议

```
Step 1: 走 OpenSpec 流程,创建 v1-1-0-workflow-enforcement 提案
        - 完成 proposal / design / tasks / specs
        - 经用户审批
Step 2: 按 tasks 顺序实施
        - 先 #2 #3 (定义闸门与 review.md)
        - 再 #1 (去重 CLAUDE.md,因为依赖 spec 的稳定)
        - 再 #4 (黄金用例落地)
        - 再 #5 (同步硬约束写入)
        - 最后 #6 (校验脚本,作为兜底)
Step 3: 走代码审查,产出 review.md
Step 4: 用脚本 self-check
Step 5: 归档,合并主规范
Step 6: 此后所有变更都必须通过 check:workflow
```

---

## 风险与注意事项

1. **#1 重写 CLAUDE.md 时**: 不要误删 `## 项目概述`、`## 项目结构`、`## 技术栈` 等项目级元信息。
2. **#3 review.md 模板**: 不要写得过于复杂,否则每次审查都成为负担。当前模板已是最小集。
3. **#4 黄金用例改名**: 不要直接重命名原文件,推荐复制后拆分,保留原文件作为完整测试。
4. **#6 脚本**: 不要过度严格(例如要求 specs/ 必须有 N 个文件),否则会卡住小变更。当前规则只要求"存在且非空"。
5. **整体**: 本变更是规范变更,**实施过程本身就是对新规范的第一次演练** — 必须严格按新流程走,否则失去说服力。

---

## 一句话总结

按 OpenSpec 走流程 → 先建闸门与制品(#2 #3 #5) → 再做信息源去重(#1) → 再让 L1 真正可跑(#4) → 最后用脚本(#6)把整个规范变成机器可校验。

---

*— 计划完 —*