# Review — V1.3.1 vitest 基础设施修复

## 1. 功能与测试

- [x] tasks.md 全部勾选(见下文 Section 7)
- [x] `npm test` 全绿: **10 test files / 77 tests passed, 3.36s**
- [x] `npm run test:golden` 全绿: **2 files / 11 tests passed, 1.93s**(< 5 秒达标)
- [x] 无新增临时调试文件残留(`__smoke__.test.js` 已删除)

## 2. 规约同步

- [x] 本提案**不涉及** spec 变更(纯基础设施修复,属于补充规则第 7 条例外)
- [x] CLAUDE.md 无需更新

## 3. 代码质量

- [x] [`vite.config.js`](vite.config.js) 改动有注释说明原因(指向本提案)
- [x] 未顺手改动业务代码
- [x] 依赖变更已 diff `package-lock.json`(由 npm 自动维护)

## 4. 诊断日志

```
node -v: v24.15.0
原始 vitest --version: vitest/1.6.1 win32-x64 node-v24.15.0
npm view vitest dist-tags: { latest: '4.1.8', V3: '3.2.6' }

# 已有用例报错(salaryEngine.test.js):
Error: No test suite found in file ...salaryEngine.test.js

# 已有用例报错(dateUtils.test.js):
TypeError: Cannot read properties of undefined (reading 'on')
 ❯ src/utils/__tests__/dateUtils.test.js:6:1  (beforeEach 为 undefined)

# 最小 smoke 测试(纯 import + describe + it/expect)报错:
TypeError: Cannot read properties of undefined (reading 'test')  -- vitest 1.6.1 下
TypeError: Cannot read properties of undefined (reading 'config') -- vitest 4.1.8 下

# 升级路径试错:
1. vitest 1.6.1 (原始) → 全报错(Node 24 不兼容)
2. 升 vitest@^4.1.8 (单独升) → 报错变形但仍失败(双 vite 实例冲突)
3. 升 vite@latest + plugin-vue@latest 至 vite 8 + plugin-vue 6 → 同 vite 但仍失败
4. 切换 defineConfig 来源至 'vitest/config' → 仍失败
5. 调 pool / globals / environment → 仍失败
6. rd /s /q node_modules + npm install 净装 → 仍失败
7. 回退 vitest@3.2.6 (V3 末版,保留 vite 8) → ✅ 通过

# 最终验证(vitest 3.2.6 + vite 8.0.16 + plugin-vue 6.0.7 + Node 24):
$ npx vitest run src/utils/__tests__/__smoke__.test.js
 ✓ src/utils/__tests__/__smoke__.test.js (1 test) 2ms
 Test Files  1 passed (1)   Tests  1 passed (1)   Duration  1.45s

$ npm test
 Test Files  10 passed (10)   Tests  77 passed (77)   Duration  3.36s

$ npm run test:golden
 ✓ src/utils/__tests__/salaryEngine.golden.test.js (6 tests) 3ms
 ✓ src/utils/__tests__/dateUtils.golden.test.js (5 tests) 3ms
 Test Files  2 passed (2)   Tests  11 passed (11)   Duration  1.93s
```

## 5. 根因与修复

**根因**: vitest 4.1.8 与 Node v24.15.0 + Windows 组合存在 ctx 注入失败问题(具体表现为 `describe` 调用时其内部 environment ctx 为 `undefined`),即使 vite 生态全升级到 vite 8 / plugin-vue 6 也无法绕过。
vitest 1.6.x 不兼容 Node 24 是已知事实(诊断起点)。
vitest 3.2.6 (V3 末版)在相同环境下工作正常,因此选择此版本。

**修复**(最终落地):
1. 依赖升级(`devDependencies`):
   - `vitest`: `^1.6.0` → `^3.2.6`
   - `vite`: `^5.4.0` → `^8.0.16`(联动)
   - `@vitejs/plugin-vue`: `^5.0.0` → `^6.0.7`(联动)
   - `package-lock.json` 同步更新
2. 配置调整:
   - [`vite.config.js`](vite.config.js) defineConfig 来源由 `'vite'` 改为 `'vitest/config'`(vite 8 之后必须这样做)
3. 已确认:
   - `dev` / `build` 可继续用 vite 8(plugin-vue 6 兼容)
   - `test` / `test:golden` 全绿

**回滚预案**: 若将来再坏,
- 第一步: `npm i -D vitest@~3.2.6` 锁定本次成功版本;
- 第二步: 检查 Node 与 vitest 版本兼容矩阵,**不要**贸然升 vitest 4(在 Node 24 + Windows 仍未稳定)。

## 6. 已知遗留(本提案不修)

- `ManagementView.test.js` 运行时输出 33 条 stderr 警告 `[dateUtils] isWorkDay called but holidayMap is empty. Call loadHolidays() first.` — 测试本身通过,属于测试代码缺少 setup 调用,按铁律一不在本提案修,后续应另开提案处理。
- npm audit 报 1 critical vulnerability(来自升级后的依赖链),不影响测试运行,后续 `npm audit` 单独评估。

## 7. 结论

- [x] 通过

**关键产出**:
- 测试基础设施全面恢复并升级(vitest 1.6 → 3.2.6 + vite 5 → 8)
- 解锁 v1.3.0 的 Task 4.5