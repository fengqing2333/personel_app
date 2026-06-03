## 1. useLeave 单例化

- [x] 1.1 将 records ref 和 initialized 标志提升到模块作用域
- [x] 1.2 loadRecords 只在首次调用时执行
- [x] 1.3 验证：两个组件调用 useLeave() 共享同一份 records

## 2. useSalary 测试支持

- [x] 2.1 添加 __resetForTests 导出（stopTimer + 重置 initialized）
- [x] 2.2 添加 typeof window !== 'undefined' 守卫
- [x] 2.3 stopTimer 重置 initialized = false
- [x] 2.4 更新 useSalary 测试使用 __resetForTests

## 3. dateUtils 开发警告

- [x] 3.1 isWorkDay 在 holidayMap 为空时 console.warn（仅 dev）

## 4. 验证

- [x] 4.1 npx vitest run — 所有测试通过（62 passing）
- [x] 4.2 npm run build — 构建成功
- [x] 4.3 提交
