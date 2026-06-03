# [V1.1.0] Composable 架构重构

## Why

代码审查发现两个 P0 问题：useLeave 非单例导致组件间数据不同步，useSalary 测试隔离性不足。同时 dateUtils 缺少节假日数据未加载时的开发警告。

## Goals

- useLeave 改为模块级单例，确保所有组件共享同一份 records 数据
- useSalary 添加 __resetForTests / window 守卫 / stopTimer 可重置
- dateUtils 添加 holidayMap 未加载的 dev 警告

## Non-goals

- 不改动业务逻辑
- 不改动 UI 组件

## What Changes

- useLeave: records 提升到模块级，添加 initialized 标志
- useSalary: 添加 __resetForTests 导出、window 守卫、stopTimer 重置 initialized
- dateUtils: isWorkDay 在 holidayMap 为空时 console.warn

## Impact

- src/composables/useLeave.js
- src/composables/useSalary.js
- src/utils/dateUtils.js
- 相关测试文件
