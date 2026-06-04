# Design — V1.3.1 vitest 基础设施修复

## D1. 诊断顺序(必须按此顺序,不跳步)

> 按"最低成本先做"排序。每一步若已恢复测试运行,即停止,记录根因到 review.md。

| 步骤 | 操作 | 成本 | 期望发现 |
|---|---|---|---|
| 1 | 确认 Node 版本: `node -v` | 极低 | 是否在 vitest 1.6 支持的 LTS 区间(>= 18.x) |
| 2 | 清理缓存: 删除 `node_modules/.vite`、`node_modules/.vitest` | 低 | 旧缓存导致的载入异常 |
| 3 | 单文件最小复现: 新建 `src/utils/__tests__/__smoke__.test.js` 只含 `it('smoke', () => expect(1).toBe(1))` | 低 | 隔离用例自身/导入问题 |
| 4 | 关掉 `globals: true` 看是否影响 | 中 | 双重注入冲突 |
| 5 | 关掉 `environment: 'jsdom'` 改用 `'node'`(对非 DOM 用例) | 中 | jsdom 加载问题 |
| 6 | 重装依赖: `rm -rf node_modules package-lock.json && npm install` | 中 | node_modules 损坏 |
| 7 | 升级或锁定 vitest 到 1.6.0 / 1.6.x 最新补丁 | 高 | 已知 bug |

## D2. 修复方式偏好

**优先级**: 配置调整 > 缓存清理 > 依赖锁版本 > 依赖升级

- ~~不主动升 vitest 大版本(避免破坏更多东西)。~~ **(2026-06-04 修订: 见 D2-补 / D8)**
- 修配置时只动 [`vite.config.js`](vite.config.js) 的 `test` 块,不动 `plugins` / `resolve`。
- `globals: true` 与 `import from 'vitest'` 共存是 vitest 官方支持的模式;若必须二选一,**保留 import 形式**(显式 > 隐式),并�� `globals` 改为 `false`。

### D2-补. 主版本升级决策(2026-06-04)

诊�结论(见 D8):vitest 1.6.x 与 Node v24.15.0 不兼容,任何配置/缓存/降版至 1.6.x 范围内均无效。
经用户确认采纳**方案 B**:升级 vitest 到 latest(发布时为 `4.1.8`),一步到位避免后续再升级。

- 同步评估并按需调整: `@vitest/ui`(若有)、`jsdom`、`@vue/test-utils`、`vite`、`@vitejs/plugin-vue` 的版本兼容矩阵。
- 升级后必须用 smoke + 全量两阶段验证。
- 任何用例因 API 变化失败,**按铁律一处理**:不顺手改源码,标记 `it.skip` 并在 review.md 单独列出,由后续提案处理。

## D3. 测试运行命令统一

诊断阶段需要稳定可重复的运行命令,临时使用:
```
npx vitest run --reporter=verbose <文件路径>
```
得到清晰输出后再决定是否调整 [`package.json`](package.json) 中的 `test` / `test:golden` 脚本。

## D4. 黄金用例脚本的最终形态

v1.3.0 当前 `test:golden` 用显式文件清单:
```
"test:golden": "vitest run src/utils/__tests__/salaryEngine.golden.test.js src/utils/__tests__/dateUtils.golden.test.js"
```

修复后,如果 vitest 在 Windows cmd 下支持 glob,**改回**文件名约定方案:
```
"test:golden": "vitest run --dir src --testNamePattern \"\\[GOLDEN\\]\""
```
或保留显式清单(避免 cmd glob 转义陷阱)。**决策推到 Phase 3.5 验证后**。

## D5. review.md 必填内容

本变更的 review.md 必须包含:
1. **根因**: 步骤 1~7 中具体哪一步定位到。
2. **修改清单**: 配置/依赖/脚本各动了什么。
3. **验证输出**: `npm test` 与 `npx vitest run <smoke>` 的完整 stdout(粘贴而非概述)。
4. **回滚预案**: 如果将来还坏,先做什么。

## D6. 与规范的关系

本提案**不修改** [`openspec/specs/workflow/spec.md`](openspec/specs/workflow/spec.md):
- 没有新增/修改规约条目,因为仅修测试基础设施;
- 黄金用例的"文件名约定"已在 v1.3.0 的 spec delta 中定义,本提案只让它能跑起来;
- 按 v1.3.0 引入的"补充规则第 7 条 规约同步硬约束",纯基础设施修复属于例外(非业务行为变更)。

## D7. 风险与回滚

| 风险 | 缓解 |
|---|---|
| 改配置后某些原测试用例红 | 按"铁律一" — 不修源码,把红用例标记 `it.skip` 并在 review.md 列出,由后续提案处理 |
| 依赖重装导致 node_modules 体积变化 | 提交 `package-lock.json` 变更前 diff 一遍,确认只动测试相关 |
| 改了配置但 v1.3.0 的 `test:golden` 脚本失效 | Phase 3.5 必须同步跑 `npm run test:golden`,失败则回滚 |

## D8. Phase 3 诊断结论(2026-06-04 已确认)

**事实基线**:
- Node: `v24.15.0`
- vitest: `1.6.1`
- npm view vitest dist-tags: `{ latest: '4.1.8', V3: '3.2.6' }`

**复现路径**:
1. 已有用例 `salaryEngine.test.js` → `Error: No test suite found in file ...`
2. 已有用例 `dateUtils.test.js` → `TypeError: Cannot read properties of undefined (reading 'on')` (beforeEach undefined)
3. 最小 smoke 用例 `__smoke__.test.js`(仅 `import { it, expect } from 'vitest'; it('smoke', () => expect(1).toBe(1))`) → `TypeError: Cannot read properties of undefined (reading 'test')`

**结论**: smoke 用例失败已排除"配置/jsdom/已有用例自身/缓存"等所有项目侧因素。
根因为 vitest 1.6.1 内部依赖的 Node loader hook 在 Node 24 ESM 模型下未正确注入,
导致 `describe` / `it` / `beforeEach` 等从 `'vitest'` 导入的符号在调用时其内部 ctx 为 `undefined`。

**修复路径**: 按 D2-补,升级 vitest 到 `^4.1.8`。
- 不再执行 tasks.md 2.1~2.4 这些 1.6.x 范围内的诊断步骤(无意义)。
- tasks.md 2.5 升级 vitest 改为升至 `^4.1.8`,并按需同步 jsdom / @vue/test-utils 版本。