# Tasks — V1.3.1 修复 vitest 测试基础设施

> 严格按 design.md D1 的诊断顺序执行,**任一步成功即停**。
> 每步执行完无论成败,把 stdout 粘进 review.md 的"诊断日志"段。

## 1. 复现与基线采集(Phase 3 准备)

- [x] 1.1 运行 `node -v` 记录 Node 版本 — 结果: `v24.15.0`
- [x] 1.2 运行 `npx vitest --version` 记录 vitest 实际版本 — 结果: `vitest/1.6.1`
- [x] 1.3 运行 `npx vitest run src/utils/__tests__/salaryEngine.test.js --reporter=verbose` 采集完整报错(已粘进 review.md)
- [x] 1.4 创建最小 smoke 测试 [`src/utils/__tests__/__smoke__.test.js`](src/utils/__tests__/__smoke__.test.js)
- [x] 1.5 运行 `npx vitest run src/utils/__tests__/__smoke__.test.js` — 结果: **失败**(`TypeError: Cannot read properties of undefined (reading 'test')`),根因在 vitest/Node 兼容性

## 2. 诊断结论(原 D1 步骤 2~6 跳过,见 design.md D8)

- [x] 2.1 ~~删除 vite/vitest 缓存~~ — **跳过**: smoke 失败已排除项目侧因素
- [x] 2.2 ~~关闭 globals~~ — **跳过**: smoke 用例未使用 globals 仍失败
- [x] 2.3 ~~切换 environment 至 node~~ — **跳过**: smoke 不依赖 jsdom 仍失败
- [x] 2.4 ~~重装 node_modules~~ — **跳过**: 无意义,vitest 1.6.x 整体不兼容 Node 24
- [x] 2.5 升级 vitest 主版本到 `^4.1.8`(用户决策方案 B,见 design.md D2-补)
- [x] 2.6 联动升级 `vite@latest` + `@vitejs/plugin-vue@latest` 解决双 vite 实例冲突(vite 5→8, plugin-vue 5→6)
- [x] 2.7 vitest 4.1.8 验证仍报 ctx undefined,**回退至 vitest 3.2.6**(V3 末版) — 成功

## 3. 应用最小修复

- [x] 3.1 最终落地: vitest@^3.2.6 + vite@^8.0.16 + @vitejs/plugin-vue@^6.0.7 + [`vite.config.js`](vite.config.js) defineConfig 改从 `'vitest/config'` 导入
- [x] 3.2 [`vite.config.js`](vite.config.js) 顶部添加注释指向本提案
- [x] 3.3 `package.json` / `package-lock.json` 同步更新

## 4. 验证

- [x] 4.1 `npm test` → 10 files / 77 tests passed, 3.36s
- [x] 4.2 `npx vitest run src/utils/__tests__/*.golden.test.js` → 2 files / 11 tests passed, 1.83s
- [x] 4.3 `npm run test:golden` → 2 files / 11 tests passed, **1.93s**(< 5s 达标)
- [x] 4.4 三段输出已粘进 review.md Section 4

## 5. 清理

- [x] 5.1 删除 smoke 测试文件 `src/utils/__tests__/__smoke__.test.js`
- [x] 5.2 `environment: 'jsdom'` 已保持
- [x] 5.3 无其他临时调试残留

## 6. 自演练 + 审查 + 归档(Phase 3.5 + Phase 4)

- [x] 6.1 review.md 已填写完整(根因 / 修改清单 / 验证输出 / 回滚预案)
- [x] 6.2 review.md 结论勾选"通过"
- [x] 6.3 归档: 已移至 `openspec/changes/archive/v1-3-1-vitest-infra-fix/`
- [x] 6.4 已在 v1.3.0 tasks.md Task 4 顶部注明解锁

## 7. 解除 v1.3.0 阻塞

- [x] 7.1 已编辑 [`openspec/changes/v1-3-0-workflow-enforcement/tasks.md`](../../v1-3-0-workflow-enforcement/tasks.md) Task 4 顶部,改写阻塞说明为"已由 v1.3.1 解决"
- [x] 7.2 v1.3.0 已恢复可执行状态(待回到 v1.3.0 继续 Task 4.5)