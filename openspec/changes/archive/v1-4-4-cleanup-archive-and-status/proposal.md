# [V1.4.4] 清理归档异常嵌套与状态文档乱码

## Why

历史归档制品中存在两类问题，影响仓库整洁度与可追溯性：

1. **嵌套归档目录**：`openspec/changes/archive/v1-3-1-resume-storage/` 下出现自嵌套的 `v1-3-1-resume-storage/v1-3-1-resume-storage/` 子目录，内含一份从未完成的脚手架（所有 tasks 仍是 `[ ]` 未勾选）。疑似当时执行归档命令时把工作目录又复制了一份进去。外层目录才是真正完成版本（tasks 全勾、commit 已 `76 passed`）。
2. **proposal/design/tasks 顶部乱码**：
   - `archive/v1-3-1-resume-storage/proposal.md` 首行为 `proposal done\n人简历储存模块`，缺失 `# [V1.3.1]` 标题前缀
   - `archive/v1-3-1-resume-storage/design.md` 首行为 `artifacts done\nColors\n...`
   - `archive/v1-3-1-resume-storage/tasks.md` 首行为 `done\n Data Layer`
   - `archive/v1-3-1-resume-storage/v1-3-1-resume-storage/proposal.md` 同样问题
   - `archive/v1-3-1-resume-storage/v1-3-1-resume-storage/design.md` 同样问题
   - `archive/v1-4-0-resume-customize-flow/proposal.md` 首行为 `artifacts done\n简历页面流程`
   - `archive/v1-4-0-resume-customize-flow/design.md` 顶部有 `artifacts done` 残留
   - `archive/v1-4-1-resume-customize-data/design.md` 顶部疑似类似情况
3. **`RESUME_PROJECT_STATUS.md` 首两行**：`done\n目完成状态一览`（应为"项目完成状态一览"），且未列入 V1.4.2 / V1.4.3 的修复记录。

## Goals

- 移除 `archive/v1-3-1-resume-storage/v1-3-1-resume-storage/` 嵌套目录（嵌套版本未完成、与外层重复）
- 将所有外层 archive 文件顶部的 `done` / `artifacts done` / `proposal done` / `` 等乱码修正为规范的 `# [V<x.y.z>] <中文标题>` 起首，且不修改 Why / Goals / What Changes 的原始内容（仅修首部）
- 更新 `RESUME_PROJECT_STATUS.md`：修正首行乱码；在"已归档变更"表中追加 V1.4.2 / V1.4.3 / V1.4.4 三条记录

## Non-goals

- 不修改任何 `src/` 下的代码 — 本次纯文档清理
- 不重写归档变更的 Why / Goals / What Changes 的实质内容
- 不重新归档已完成的变更
- 不修改 `archive/v1-3-1-resume-storage/v1-3-1-resume-storage/tasks.md` 自身（直接删除整个嵌套目录）

## What Changes

- 删除目录 `openspec/changes/archive/v1-3-1-resume-storage/v1-3-1-resume-storage/`（及其下全部文件）
- 修正 6 个 archive 文件的标题首行乱码
- 修正 `RESUME_PROJECT_STATUS.md` 首两行 + 追加 V1.4.2 ~ V1.4.4 三行表格记录

## Capabilities

### New / Modified Capabilities

- 无纯文档清理，不影响运行时与规约语义）

## Impact

- `openspec/changes/archive/v1-3-1-resume-storage/v1-3-1-resume-storage/`（删除 5 文件）
- `openspec/changes/archive/v1-3-1-resume-storage/{proposal,design,tasks}.md`
- `openspec/changes/archive/v1-4-0-resume-customize-flow/{proposal,design}.md`
- `openspec/changes/archive/v1-4-1-resume-customize-data/design.md`
- `RESUME_PROJECT_STATUS.md`