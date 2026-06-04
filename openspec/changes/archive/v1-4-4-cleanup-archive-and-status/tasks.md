## 1. 删除嵌套归档目录

- [x] 1.1 `git rm -rf openspec/changes/archive/v1-3-1-resume-storage/v1-3-1-resume-storage`

## 2. 修正归档首部乱码

- [x] 2.1 修正 `archive/v1-3-1-resume-storage/proposal.md` 首部为 `# [V1.3.1] 个人简历储存模块`
- [x] 2.2 修正 `archive/v1-3-1-resume-storage/design.md` 首部，去掉 `artifacts done`
- [x] 2.3 修正 `archive/v1-3-1-resume-storage/tasks.md` 首部为 `## 1. Data Layer`
- [x] 2.4 修正 `archive/v1-4-0-resume-customize-flow/proposal.md` 首部为 `# [V1.4.0] 定制简历页面流程`
- [x] 2.5 修正 `archive/v1-4-0-resume-customize-flow/design.md` 首部，去掉 `artifacts done`（确认已无残留）
- [x] 2.6 检查 `archive/v1-4-1-resume-customize-data/design.md` 无同类乱码（已干净，无需改动）

## 3. 更新 RESUME_PROJECT_STATUS.md

- [x] 3.1 修正首两行为 `# 项目完成状态一览` 与 `> 更新日期：2026-06-04`
- [x] 3.2 测试条目更新为 `84 passed / 0 failed`
- [x] 3.3 已归档变更表追加 V1.4.2 / V1.4.3 / V1.4.4 三行

## 4. 回归 + 审查 + 归档

- [x] 4.1 `npm test`（84/84）+ `npm run build` + `npm run check:workflow` 全部通过
- [x] 4.2 完成 `review.md`（结论"通过"）
- [x] 4.3 `git commit -m "[V1.4.4] chore: cleanup archive nesting and status doc encoding"` + 归档