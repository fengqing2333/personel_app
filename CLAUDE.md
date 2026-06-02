# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

Personal Portal — 个人效率工具集合，当前核心功能为**实时工资计算**。

特性：
- 实时显示今日已赚金额（精确到秒，数字跳动更新）
- 发薪周期 / 月度 / 年度薪资进度追踪
- 请假管理（年假/事假/病假）自动扣薪
- 智能工作日识别（内置 2024-2028 中国节假日和调休数据）
- 全屏沉浸体验，暗色/亮色主题切换，响应式布局
- 纯本地运行，无后端服务器（localStorage 存储）

## 开发工作流

本项目使用 **Superpowers + OpenSpec** 规范驱动开发流程，两者分工明确：

- **OpenSpec** 规定"做什么" — 持久化变更制品（proposal / design / specs / tasks）
- **Superpowers** 确保"做好" — 需求探索、TDD 实施、质量验证、项目记忆

### 三条铁律（强制）

```
铁律一：Bug 修复必须失败用例先行         → 禁止不写测试直接修复
铁律二：归档前必须代码审查               → 禁止跳过审查直接归档
铁律三：审查发现问题必须创建新提案修复     → 禁止在原变更中修补
```

**以上三条铁律在本项目强制执行，无例外。** 不得以任何侥幸心理跳过：
- "这个很简单"、"只改一行"、"紧急修复" 都不是跳过理由
- Claude 不得自行决定跳过任何强制步骤
- 用户明确授权跳过的，事后必须补全所有遗漏步骤

### 路径选择

| 场景 | 强制路径 |
|------|----------|
| 小变更、需求明确 | `/opsx:propose` → `/opsx:apply` → **代码审查** → `/opsx:archive` |
| 复杂变更、需求模糊 | `/superpowers-openspec-execution-workflow`（完整四阶段） |

注意：两条路径都必须经过代码审查，无例外。

### 完整流程

```
Superpowers 探索 → OpenSpec 规格 → Superpowers 执行
  → 代码审查 → OpenSpec 归档
     ↑ 审查发现主要/阻断问题 → 创建新提案修复
```

详见 `openspec/specs/workflow/spec.md` — 完整协作规范文档。

## 项目结构

```
.
├── CLAUDE.md                       # 本文件
├── openspec/                       # OpenSpec 规格与变更
│   ├── config.yaml                 # 项目配置
│   ├── specs/                      # 活文档（按领域组织）
│   └── changes/archive/            # 已归档变更
├── docs/superpowers/               # 设计与计划
│   ├── specs/
│   └── plans/
├── .claude/                        # Claude Code 命令与技能
└── .superpowers-memory/            # 跨会话项目记忆
```

## 技术栈

待定 — 将在首次变更提案中确定。
