## Design

### LeaveSelectModal
点击请假时弹出模态框，选择年假/事假/病假，点击即确认。emit close 事件。

### now 拆分
- nowSeconds: 每秒更新，仅用于 todayEarned
- nowDate: 每 60 秒更新一次，用于日历/统计
- todayEarned 依赖 nowSeconds，其余依赖 nowDate

### safeStorage
封装 get/set 方法，try-catch 包裹。

### ESLint
@vue/eslint-config-prettier + eslint-plugin-vue
