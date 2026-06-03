## Context

审查发现三个架构问题：
1. useLeave records 在函数内部创建，非单例 → 组件间数据不同步
2. useSalary 缺少测试重置方法
3. dateUtils 无节假日数据加载提示

## Design

### useLeave 单例
将 records ref 和 initialized 标志提升到模块级。loadRecords() 只执行一次。

### useSalary 测试支持
添加 __resetForTests 导出函数。window 守卫 beforeunload。stopTimer 重置 initialized。

### holidayMap 警告
isWorkDay 中如果 holidayMap 为空，dev 模式下 console.warn。
