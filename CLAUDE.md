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

## 技术栈

- **运行时**: Node.js 22 LTS 或更高（当前开发环境 Node 24）
- **框架**: Vue 3.4（Composition API + `<script setup>`）+ Vue Router 4.3
- **构建**: Vite 8 + `@vitejs/plugin-vue` 6
- **样式**: Tailwind CSS 3.4 + PostCSS + Autoprefixer
- **测试**: Vitest 3.2（jsdom 24）+ `@vue/test-utils` 2.4
- **代码规范**: ESLint 10 + `eslint-plugin-vue` + Prettier 3
- **状态管理**: 自研 composables 单例模式（详见 `src/composables/`），未引入 Pinia/Vuex
- **数据存储**: 浏览器 `localStorage`，无后端

常用脚本（详见 [`package.json`](package.json)）：

| 命令 | 用途 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产产物 |
| `npm test` | 运行全量 Vitest 用例 |
| `npm run test:golden` | 仅运行黄金用例（L1，< 5s） |
| `npm run check:workflow` | 自动校验当前活跃变更目录是否满足阶段闸门 |
| `npm run lint` / `npm run format` | 代码检查 / 格式化 |

## 项目结构

```
.
├── CLAUDE.md                       # 本文件（项目入口指针）
├── package.json
├── vite.config.js                  # Vite + Vitest 共用配置（defineConfig 来自 vitest/config）
├── index.html
├── tailwind.config.js / postcss.config.js
├── src/
│   ├── App.vue / main.js
│   ├── views/                      # 路由视图（仪表盘、管理页、设置）
│   ├── components/                 # 通用组件
│   ├── composables/                # 状态与领域逻辑（useSalary、useLeave、useTheme 等）
│   ├── utils/                      # 纯函数工具（salaryEngine、dateUtils）
│   │   └── __tests__/              # Vitest 用例（含 *.golden.test.js 黄金用例）
│   ├── data/                       # 静态数据（节假日表）
│   ├── router/                     # 路由配置
│   └── assets/
├── scripts/
│   └── check-workflow.mjs          # 阶段闸门自动校验脚本
├── openspec/                       # 规约驱动开发制品（唯一规范来源）
│   ├── config.yaml
│   ├── specs/workflow/spec.md      # 工作流主规范（铁律 / 闸门 / 流程 / 路径选择 / 版本号）
│   ├── specs/                      # 各领域活文档
│   ├── changes/                    # 活跃变更目录
│   ├── changes/archive/            # 已归档变更
│   └── templates/review.md         # 强制审查制品模板
├── docs/                           # 项目文档（含 superpowers/、审视报告等）
└── .joycode/                       # 编辑器/Agent 配置与持久化记忆
```

## 开发工作流（唯一权威来源）

本项目所有协作规范、强制流程、铁律、阶段闸门、版本号规则等，**唯一权威来源为 [`openspec/specs/workflow/spec.md`](openspec/specs/workflow/spec.md)**。

CLAUDE.md 不再复述任何流程条款，避免双份真相导致漂移。当 spec 与历史认知不一致时，**以 spec 为准**。

如需快速进入：从 `openspec/specs/workflow/spec.md` 的"总则"段开始阅读。