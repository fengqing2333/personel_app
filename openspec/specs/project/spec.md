# 项目概述

- **项目名称**: personel_app（Personal Portal）
- **创建日期**: 2026-06-03
- **最近更新**: 2026-06-04
- **技术栈**: Vue 3.4 + Vite 8 + Tailwind CSS 3.4 + Vitest 3.2 + Vue Router 4.3
- **存储**: 浏览器 localStorage（无后端）
- **描述**: 个人效率工具集合，多模块单页应用

## 功能模块

| 模块 | 当前版本 | 说明 |
|------|---------|------|
| 个人门户 | V1.3.0 | 侧边栏导航 + 门户主页 |
| 实时工资 | V1.0.0 | 秒级跳动、发薪周期/月度/年度进度 |
| 工作日历 | V1.2.0 | 文字标注（班/假/休/节）、内置 2024-2028 节假日 |
| 请假管理 | V1.0.0 | 年假/事假/病假、自动扣薪 |
| 主题系统 | V1.1.0 | 暗色/亮色切换、V4 渐变 |
| 简历储存 | V1.3.1 | 7 类信息、时间线、localStorage 持久化 |
| 定制简历 | V1.4.x | 三步流程（输入 JD → 匹配 → 预览），数据接入尚未完成 |

详细完成状态见 [`RESUME_PROJECT_STATUS.md`](../../../RESUME_PROJECT_STATUS.md)。

## 目录结构

```
.
├── .claude/                    # Claude Code 命令和技能
├── .joycode/                   # 编辑器/Agent 配置与持久化记忆
├── docs/                       # 项目文档（含 superpowers/ 等）
├── openspec/                   # OpenSpec 配置与规格
│   ├── config.yaml             # 项目配置
│   ├── specs/                  # 主规范（按领域组织）
│   │   ├── project/spec.md     # 本文件 — 项目概述
│   │   └── workflow/spec.md    # OpenSpec + Superpowers 协作规范
│   ├── changes/                # 活跃变更目录
│   ├── changes/archive/        # 已归档变更
│   └── templates/review.md     # 审查制品模板
├── scripts/check-workflow.mjs  # 阶段闸门自动校验脚本
└── src/                        # 源码（views / components / composables / utils / data）
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

详见 [`openspec/specs/workflow/spec.md`](../workflow/spec.md) — 完整的职责边界、铁律、阶段闸门和四阶段协作流程定义（唯一权威来源）。