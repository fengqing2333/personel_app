## 1. 修复 Bug

- [x] 1.1 将 `AttendancePanel.vue:28` 的 `attendedDays.value` 改为 `props.attendedDays`
- [x] 1.2 将 `AttendancePanel.vue:38` 的 `attendedDays.value` 改为 `props.attendedDays`

## 2. 编写失败用例（RED）

- [x] 2.1 创建 `ManagementView.test.js`，编写 mount 测试验证组件正常渲染
- [x] 2.2 运行测试确认失败（`ReferenceError: attendedDays is not defined`）

## 3. 验证修复（GREEN）

- [x] 3.1 执行修复后运行 `npx vitest run`，确认 59 测试通过
- [x] 3.2 运行 `npm run build`，确认构建成功

## 4. 提交

- [x] 4.1 `git add -A && git commit -m "fix: resolve management page crash due to attendedDays prop access"`
