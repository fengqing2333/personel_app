## Context

现有节假日数据 (`src/data/holidays.js`) 在 2026-2028 年存在大量缺失：
- 2026 年劳动节（5月1-5日）缺少调休补班 4月26日（周日）和 5月9日（周六）
- 2026-2028 年其他节假日（端午、中秋等）缺少完整的起止日期和调休补班

## Root Cause

初始实现时只录入了主要日期，未录入完整的调休安排。

## Fix

在 `holidays.js` 中补充缺失的 `'workday'` 和 `'holiday'` 条目。添加黄金测试用例验证已知日期。

## Files Changed

- `src/data/holidays.js` — 补充数据条目
- `src/utils/__tests__/dateUtils.test.js` — 添加验证测试
