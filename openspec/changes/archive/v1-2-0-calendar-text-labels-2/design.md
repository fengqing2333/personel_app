## Design

### 日期类型 → 文字映射
- isWorkDay + 非节假日 → "班"（青蓝）
- isWorkDay + 节假日 → "节"（金色）
- 有请假记录 → "假"（粉色）
- 非工作日 → "休"（灰色）
- isWorkDay + 调休补班 → "班" + "调休"小标签

### 组件变更
WorkCalendar.vue 重构：
- 每个日期 cell 改为上下布局：数字 + 文字标注
- 月份头部加统计行
- 图例行改为文字方块
- 今日日期用渐变色背景突出

### 数据流
dateUtils 扩展 getDayType(date) 返回类型字符串。
