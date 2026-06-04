# V1.3.1 — 修复 vitest 测试基础设施

> **类型**: Patch / Bug fix
> **触发**: v1.3.0 执行期间(2026-06-04)发现所有 vitest 用例均无法运行,属于预先存在的基础设施缺陷,按铁律三独立成提案。
> **范围**: 仅修复测试基础设施,不引入新功能、不修改业务代码。

## 1. 背景与问题

在 v1.3.0-workflow-enforcement 提案的 Task 4.5 中,执行 `npm run test:golden` 与 `npx vitest run <任意已有测试>` 均失败,典型报错:

```
FAIL  src/utils/__tests__/salaryEngine.test.js
Error: No test suite found in file ...salaryEngine.test.js

FAIL  src/utils/__tests__/dateUtils.test.js
TypeError: Cannot read properties of undefined (reading 'on')
 ❯ src/utils/__tests__/dateUtils.test.js:6:1
```

经核查:
- 报错文件**不限于**本次新增的 `*.golden.test.js`,**原有 `*.test.js` 同样无法运行**。
- 缺陷在 v1.3.0 引入任何改动之前就存在,与黄金用例派生无关。
- 当前栈: vitest 1.6.1 + @vitejs/plugin-vue 5.x + Node(本机版本待 Phase 2 调研) + Windows cmd。
- `jsdom` 已在 devDependencies 中(24.x)。

## 2. 目标

- **G1**: 恢复 `npm test` 全量绿。
- **G2**: 恢复 `npm run test:golden` 绿,且 < 5 秒。
- **G3**: 找到根因并在 review.md 记录,避免再次踩坑。

## 3. 非目标

- 不升级 Vue / Vite 主版本。
- 不引入新的测试框架。
- 不重写测试用例(只解决"跑不起来"问题)。
- 不顺手修业务代码 Bug(任何业务问题另开提案)。

## 4. 候选根因方向(Phase 2 验证)

1. vitest 1.6.1 与 @vitejs/plugin-vue 5.x 在 Node 当前版本下的兼容性问题。
2. `globals: true` + 显式 `import { describe, beforeEach } from 'vitest'` 的双重注入冲突。
3. vite/vitest 缓存或 node_modules 损坏(`node_modules/.vite` 或 `.vitest` 残留)。
4. Windows 路径 / CRLF 引发的模块解析问题。

最终选哪条由 Phase 2 design.md 决定,**先复现再下结论**。

## 5. 受影响范围

| 维度 | 说明 |
|---|---|
| 源码 | 无修改 |
| 测试用例 | 不增删,可能微调断言(若 vitest API 行为有调整) |
| 配置 | 可能修改 [`vite.config.js`](vite.config.js)(test 块)、[`package.json`](package.json)(依赖版本/脚本) |
| 规范 | 无修改(不动 workflow spec) |

## 6. 完成判定

- [ ] `npm test` 全绿
- [ ] `npm run test:golden` 全绿且 < 5 秒
- [ ] review.md 记录根因 + 验证输出
- [ ] v1.3.0 的 Task 4.5 恢复可执行

## 7. 与 v1.3.0 的关系

v1.3.0 在本提案归档后恢复 Task 4.5 → Task 5 → Task 6 → Task 7。
本提案不修改 v1.3.0 的任何文件,只解锁其执行环境。