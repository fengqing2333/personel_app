## 1. 编写失败用例（RED）

- [x] 1.1 新建 `src/views/__tests__/ResumeCustomize.test.js`，使用 `mount` 挂载 `ResumeCustomize.vue` 并断言"已选 N / M"文本符合默认勾选数（覆盖 `checkedCount` computed）
- [x] 1.2 运行 `npx vitest run src/views/__tests__/ResumeCustomize.test.js`，确认测试因 `computed is not defined` 失败（RED）

## 2. 编写修复代码（GREEN）

- [x] 2.1 修改 `src/views/ResumeCustomize.vue:2` 的 import 语句为 `import { ref, computed } from 'vue'`
- [x] 2.2 重新运行同一测试文件，确认通过（GREEN）

## 3. 回归验证（L2 全量）

- [x] 3.1 `npm test` 全量通过（84/84）
- [x] 3.2 `npm run build` 构建通过
- [x] 3.3 `npm run check:workflow` 全绿

## 4. 审查与归档

- [x] 4.1 完成 `review.md`（结论勾选"通过"）
- [x] 4.2 `git commit -m "[V1.4.2] fix: import computed in ResumeCustomize to fix runtime crash"`
- [x] 4.3 将变更目录移动到 `openspec/changes/archive/`