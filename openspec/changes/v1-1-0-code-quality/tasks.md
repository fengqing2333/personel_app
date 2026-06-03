## 1. 请假弹出层

- [ ] 1.1 创建 LeaveSelectModal 组件
- [ ] 1.2 ManagementView 中替换 window.prompt 为 LeaveSelectModal

## 2. now ref 拆分

- [ ] 2.1 useSalary 拆分 nowSeconds(1s) / nowDate(60s)
- [ ] 2.2 todayEarned 依赖 nowSeconds，其余用 nowDate

## 3. safeStorage 封装

- [ ] 3.1 创建 src/utils/safeStorage.js
- [ ] 3.2 useSalary/useLeave/useTheme 改用 safeStorage

## 4. ESLint + Prettier

- [ ] 4.1 安装 eslint prettier 相关依赖
- [ ] 4.2 创建 .eslintrc.js / .prettierrc
- [ ] 4.3 添加 lint/format 脚本

## 5. 组件测试

- [ ] 5.1 补充 WorkCalendar 基础渲染测试
- [ ] 5.2 补充 SalarySettings 编辑/保存交互测试

## 6. 验证

- [ ] 6.1 npx vitest run — 所有测试通过
- [ ] 6.2 npm run build — 构建成功
- [ ] 6.3 提交
