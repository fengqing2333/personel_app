# 项目概述

- **项目名称**: personel_app
- **创建日期**: 2026-06-03
- **技术栈**: （待定）
- **描述**: 人员管理应用

## 目录结构

```
.
├── .claude/                    # Claude Code 命令和技能
├── openspec/                   # OpenSpec 配置与规格
│   ├── config.yaml             # 项目配置
│   ├── specs/                  # 主规范（按领域组织）
│   │   ├── project/spec.md     # 项目概述
│   │   └── workflow/spec.md    # OpenSpec + Superpowers 协作规范
│   └── changes/                # 变更提案
│       └── archive/            # 已归档变更
```

## 工作流

本项目遵循 **Superpowers + OpenSpec 协作工作流**。

### 核心理念
- OpenSpec 负责"规定做什么"（需求规格层）
- Superpowers 负责"确保做好"（工程流程层）

### 路径选择

| 场景 | 推荐路径 |
|------|----------|
| 小变更、需求明确 | OpenSpec 核心路径 |
| 复杂变更、需求模糊 | 完整四阶段（Superpowers 探索 → OpenSpec 规格 → Superpowers 执行 → OpenSpec 归档） |

### OpenSpec 命令
- `/opsx:new` — 创建变更脚手架
- `/opsx:propose` — 创建提案+规范+设计+任务
- `/opsx:apply` — 按任务清单执行
- `/opsx:archive` — 归档完成，合并规范
- `/opsx:continue` — 逐步推进，每步审核
- `/opsx:ff` — 快速生成全部规划文档
- `/opsx:verify` — 验证实现完整性
- `/opsx:explore` — 探索式调研

### 协作规范

详见 `openspec/specs/workflow/spec.md` — 完整的职责边界和四阶段协作流程定义。
