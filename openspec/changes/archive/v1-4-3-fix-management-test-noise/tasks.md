## 1. 验证现状（RED）

- [x] 1.1 运行 `npm test`，确认 `ManagementView.test.js` 输出 30+ 条 `holidayMap is empty` 警告

## 2. 修复（GREEN）

- [x] 2.1 在 `src/views/__tests__/ManagementView.test.js` 顶部新增 `import { beforeAll }`、`import { loadHolidays } from '@/utils/dateUtils'`、`import holidays from '@/data/holidays'`
- [x] 2.2 在 `describe` 之前调用 `beforeAll(() => loadHolidays(holidays))`
- [x] 2.3 重新运行 `npm test`，确认 stderr 中已无该警告

## 3. 回归验证

- [x] 3.1 `npm test` 全量通过且 stderr 干净（84/84）
- [x] 3.2 `npm run check:workflow` 全绿

## 4. 审查与归档

- [x] 4.1 完成 `review.md`（结论勾选"通过"）
- [x] 4.2 `git commit -m "[V1.4.3] fix(test): preload holidays in ManagementView test to silence warnings"`
- [x] 4.3 归档变更目录到 `openspec/changes/archive/`