## Context

历史归档目录里夹杂了"工作目录被反复嵌套复制"和"模板生成时残留的状态字符串（done / artifacts done / proposal done）"两类脏数据。这些数据虽然不被 `npm run check:workflow`（只扫 `openspec/changes/` 顶层活跃目录）检出，但：

- 阻碍未来通过 `grep '^# \['` 反向检索版本号
- 让 `git log -- archive/...` 中的差异噪音变大
- 在 PR 评审或读档时让新人困惑"为什么这里有重复目录"

## Decisions

1. **嵌套目录处理**：直接整目录删除内层 `v1-3-1-resume-storage/v1-3-1-resume-storage/`
   - 理由：外层 tasks 全勾，且 `git log` 显示 V1.3.1 提交 `f44108d / ade3948` 已完整实现该功能；内层 tasks 全空，明确是被误归档的工作目录拷贝
   - 删除 = 无信息损失

2. **首行乱码处理**：仅替换文件顶部不合规的非内容行（`done`、`artifacts done`、`proposal done`、`` 这类编码残缺字符），不动文档其它部分。修正后第一行统一改为 `# [V<x.y.z>] <中文标题>`，与 V1.0.0 ~ V1.4.3 已规范化的归档保持格式一致。

3. **RESUME_PROJECT_STATUS 更新**：
   - 修首行 `done\n目完成状态一览` → `# 项目完成状态一览`
   - 更新日期 `2026-06-04`
   - 已归档变更表追加 V1.4.2 / V1.4.3 / V1.4.4
   - 更新测试总数 `82` → `84`（V1.4.2 新增 2 个 ResumeCustomize 用例）

## Plan

1. 用 IDE 文件删除工具删除嵌套目录（用 `git rm -rf`）
2. 用 `replace_file` 工具逐个修正 6 个 archive 文件的首部
3. 用 `write_file` 重写 `RESUME_PROJECT_STATUS.md`
4. `git add -A` 并校验 `npm run check:workflow`
5. 全量 `npm test` 保证文档清理未误触代码

## Files Changed

- 删除：`openspec/changes/archive/v1-3-1-resume-storage/v1-3-1-resume-storage/`（5 文件）
- 修首部：`archive/v1-3-1-resume-storage/{proposal,design,tasks}.md`、`archive/v1-4-0-resume-customize-flow/{proposal,design}.md`、`archive/v1-4-1-resume-customize-data/design.md`
- 重写：`RESUME_PROJECT_STATUS.md`