## 1. CSS 变量更新

- [x] 1.1 更新 :root CSS 变量（背景色、文字色、边框色）
- [x] 1.2 App.vue 添加渐变背景 + 顶部/底部装饰条 + 光晕

## 2. Tailwind 颜色映射

- [x] 2.1 tailwind.config.js 扩展 colors
- [x] 2.2 各组件中替换内联 style color: var(--x) 为 Tailwind class

## 3. dark class 位置调整

- [x] 3.1 useTheme 操作 document.documentElement.classList
- [x] 3.2 App.vue 移除 :class="{ dark: isDark }"

## 4. 验证

- [x] 4.1 npx vitest run — 所有测试通过
- [x] 4.2 npm run build — 构建成功
- [x] 4.3 提交（16b93c8）
