# 设计 — V1.2.0 工作流规范强化

## Context

当前规范停留在"文字约束"阶段。本变更的核心设计原则是 **"用制品 + 脚本把约束物化"**:
- **制品**: 不可绕过的文件 (review.md / 模板)
- **闸门**: 进入下一阶段前必须存在的文件清单
- **脚本**: 用机器替代人来核对清单

## Decisions

### D1. 阶段闸门表的形式

**选项**:
- A. 自由文字描述 — 缺点: 难以机械化校验
- B. **结构化表格 + 文件路径明确** — ✅ 选择此方案
- C. 用 YAML schema 定义 — 过度工程,当前规模不需要

**理由**: B 既可读 (文档形式),又可被脚本 `fs.exists()` 直接校验,平衡度最佳。

**最终表格**:

| Phase | 进入前必须存在 | 退出前必须存在 |
|---|---|---|
| Phase 1 探索 | (无) | `docs/superpowers/specs/<change>.md` 草案 (复杂变更必需;小变更可省略) |
| Phase 2 规格 | (Phase 1 制品,如适用) | `proposal.md` + `design.md` + `tasks.md` 全部存在且非空,`specs/` 目录存在且非空 |
| Phase 3 执行 | `tasks.md` 存在 | `tasks.md` 全部勾选 + 测试输出粘贴在 `review.md` 或 commit message |
| Phase 3.5 审查 | 测试全绿证据 | `review.md` 存在,且"结论"段已勾选"通过" |
| Phase 4 归档 | `review.md` 通过 | 主规范 `openspec/specs/` 已合并 |

### D2. 黄金用例标记方式

**选项**:
- A. `// @golden:` 注释 (现状) — vitest 不支持注释筛选,**实际不可执行**
- B. **`*.golden.test.js` 文件名约定** — ✅ 选择此方案
- C. `describe('[GOLDEN] ...')` + `--testNamePattern` — 可行但需在每个 describe 中添加前缀,易遗漏

**理由**: B 一目了然,IDE 可识别,vitest 用 `--include` 或 `testPathPattern` 即可筛选,零额外约定。

**对应命令**:
```json
"test:golden": "vitest run \"**/*.golden.test.js\""
```

### D3. review.md 模板的复杂度

**原则**: 以"最小必填"为目标,避免变成负担。

**纳入模板的字段**:
- 元信息: 时间 / 范围
- 检查清单: 三组 (功能与测试 / 规约同步 / 代码质量)
- 问题列表: 三档分级
- 结论: 三选一勾选

**不纳入** (避免膨胀):
- 详细审查日
- 每个文件逐行批注
- 自动化指标 (覆盖率、复杂度)

### D4. 校验脚本的边界

**纳入脚本检查**:
- 目录命名格式
- 必备文件存在性 (proposal/design/tasks/specs/review)
- proposal 标题格式 `[Vx.y.z]`
- tasks 是否全部勾选
- review 结论字段

**不纳入脚本** (人工审查):
- "specs 与实现一致" 的语义判断
- review 检查清单各项是否真的检查过
- 测试质量

**输出策略**:
- 阻断错误 → exit code 1
- 警告 → 红字提示但 exit code 0 (例如: `specs/` 为空但 `src/` 已改 — 因为可能是纯重构)

### D5. 信息源单一化

CLAUDE.md 完全去掉规范条款,**只留指针**:

```markdown
## 工作流规范

完整流程规范以 [`openspec/specs/workflow/spec.md`](openspec/specs/workflow/spec.md) 为单一信息源。
本文件不重复其中任何条款。
```

避免在 CLAUDE.md 重新表述任何"必须 / 不得",哪怕是最简化的版本。

### D6. 旧变更的兼容策略

- **已归档变更不动**: 不补 `review.md`,保留历史原貌
- **当前活跃变更目录** (本变更自身): 必须按新规范完整跑一遍,作为示范
- **校验脚本只扫描 `openspec/changes/` 下非 `archive/` 子目录**

## review.md 模板 (最终版)

```markdown
# Code Review — v<version>-<name>

- 审查时间:
- 审查范围: (commit 哈希列表 或 受影响文件清单)

## 检查清单

### 功能与测试
- [ ] 测试覆盖关键路径与边界场景
- [ ] 黄金用例 (L1) 通过 — 命令输出:
  ```
  (粘贴 npm run test:golden 输出)
  ```
- [ ] 全量测试 (L2) 通过 — 仅 MAJOR/MINOR 必填,命令输出:
  ```
  (粘贴 npm test 输出)
  ```

### 规约同步(核心)
- [ ] 本次涉及的功能在 `specs/` 中均有对应条目
- [ ] `src/` 实现行为与 `specs/` 一致 (关键场景逐条对照)
- [ ] tasks.md 所有项已勾选,且每项均能在 commit 中找到对应改动

### 代码质量
- [ ] 无遗留 TODO / console.log / 调试代码
- [ ] 命名 / 风格符合既有约定
- [ ] 无安全 / 性能明显隐患

## 发现问题

- Blocker: (无 / 列举)
- Major: (无 / 列举)
- Minor: (无 / 列举)

## 结论

- [ ] 通过 → 进入归档
- [ ] 就地修复 (仅 Minor) → 修复后重新审查
- [ ] 创建新提案 (Major / Blocker) → 触发铁律三
```

## 校验脚本架构

### 文件: `scripts/check-workflow.mjs`

**输入**: 无 (扫描 `openspec/changes/` 全目录)

**核心逻辑**:
```
for each dir in openspec/changes/* (非 archive):
  validateNaming(dir)            // v\d+-\d+-\d+-...
  validateRequiredFiles(dir)     // proposal/design/tasks 存在
  validateProposalTitle(dir)     // [Vx.y.z]
  validateSpecsNonEmpty(dir)     // specs/ 至少一个文件
  if tasksAllChecked(dir):
    validateReviewExists(dir)    // tasks 完成则必须有 review
    validateReviewConclusion(dir) // 结论=通过
```

**退出码**:
- `0` 全部通过 (含警告)
- `1` 至少一个阻断错误

**依赖**: 仅 Node.js 内置 `fs`、`path` — 不引入 npm 依赖,保持脚本零成本。

## Alternatives Considered

- **用 OpenSpec CLI 内置校验**: 当前 OpenSpec 工具未提供此粒度校验,且我们的规则 (review.md / 标题格式) 是项目特化,自建更灵活。
- **接入 husky 强制 pre-commit**: 增加开发依赖,本变更先以独立脚本形式上线,等用户主动开启再接入,降低耦合。
- **GitHub Actions 校验**: 项目目前无 CI 配置,且本地优先 — 后续若引入 CI 可调用同一脚本。

## Open Questions

- 黄金用例首批选哪些?(在 tasks.md 中具体列出,候选: salaryEngine 核心计算 + dateUtils 工作日判定)
- `check:workflow` 是否在归档命令中调用?(本次先提供独立脚本,接入 `/opsx:archive` 留待后续提案)