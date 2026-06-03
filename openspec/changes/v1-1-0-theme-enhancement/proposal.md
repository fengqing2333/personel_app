# [V1.1.0] 亮色主题优化与样式重构

## Why

亮色模式纯白背景刺眼。内联 style 过多，Tailwind 优势未充分利用。dark class 位置不规范。

## Goals

- V4 亮色主题：三段渐变背景 + 装饰条 + 蓝色调卡片阴影
- Tailwind 配置扩展 colors 映射 CSS 变量，减少内联 style
- dark class 移到 document.documentElement

## What Changes

- main.css :root 颜色变量更新
- App.vue 渐变背景 + 装饰条 + dark class 移到 html
- tailwind.config.js 扩展 colors
- 各组件中内联 style 替换为 Tailwind class
- useTheme 操作 document.documentElement.classList

## Impact

- src/assets/styles/main.css
- src/App.vue
- tailwind.config.js
- src/composables/useTheme.js
- 各组件内联 style 替换
