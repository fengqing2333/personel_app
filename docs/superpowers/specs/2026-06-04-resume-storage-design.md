done
历储存模块 — 设计文档

## 概述
个人信息储存系统，用于积累所有工作/实习/教育/项目/技能经历。作为个人门户的模块之一。

## 配色（已确认）
烟灰蓝复古风
- 底色：#eef0f2
- 卡片：#e4e6ea
- 主文字：#2a2a3a
- 辅文字：#8a92a0
- 点缀：#a0b0c8
- Logo 头像：#5a6a8a

## 布局
左侧栏 220px（个人档案 + 分类统计）+ 右侧时间线，一页到底

## 数据模型
- 工作经历/实习经历：{ company, position, startDate, endDate, description, highlights, tags }
- 项目：{ name, role, startDate, endDate, description, tech, url }
- 教育：{ school, degree, major, startDate, endDate, gpa }
- 技能：{ name, level, category }
- 证书：{ name, issuer, date }
- 个人简介：{ title, content }

## 组件
- src/views/ResumeView.vue — 时间线主页
- src/components/ResumeTimeline.vue — 时间线条目
- src/components/ResumeForm.vue — 新增/编辑表单
- src/composables/useResume.js — 数据管理
