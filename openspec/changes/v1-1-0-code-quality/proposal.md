# [V1.1.0] 代码质量提升

## Why

审查发现多项可改进的质量问题：window.prompt 体验差、now ref 每秒触发全树重渲染、localStorage 无异常处理、缺少 lint 配置、组件测试覆盖不足。

## Goals

- 替换 window.prompt 为弹出层组件
- 拆分 now 为秒级/天级 ref，优化渲染性能
- 封装 safeStorage 统一异常处理
- 添加 ESLint + Prettier
- 补充组件交互测试

## What Changes

- 新增 LeaveSelectModal 组件
- useSalary 拆分 nowSeconds/nowDate
- 新增 utils/safeStorage.js
- 新增 ESLint/Prettier 配置
- 补充组件测试

## Impact

- 新增文件：LeaveSelectModal.vue、safeStorage.js、.eslintrc.js、.prettierrc
- 修改：useSalary.js、ManagementView.vue、各 composable
