# 亮色模式主题优化 — 设计文档

## 背景

当前亮色模式使用纯白背景（`#ffffff`）+ 纯白卡片（`#ffffff`），仅靠极淡边框（`#e9ecef`）区分层次，整体发白刺眼，缺乏视觉深度和个性。

## 设计方向（已确认）

基于奶油色底色的 V4 方案：**品牌色渐变背景**。

## 色彩方案

### 背景
```css
background: linear-gradient(160deg, #f0f8fe 0%, #faf5f0 40%, #f5faee 100%);
```
三段柔和渐变：淡蓝 → 暖白 → 淡绿。

### 装饰条
- 顶部：`linear-gradient(90deg, #00c2ff, #0066ff, #667eea)`，3px 高
- 底部：`linear-gradient(90deg, #ffc107, #fb7185, #a277ff)`，4px 高，opacity 0.3

### 光晕
- 左上区域：`radial-gradient(circle, rgba(0,194,255,0.03), transparent 70%)`，300px

### 卡片
- 背景：`#ffffff`
- 圆角：16-20px
- 阴影：`0 2px 16px rgba(0,194,255,0.06)`

### 文字
- 主文字：`#1a2a3a`
- 次要文字：`#7a8ba3`
- 强调色：`#00c2ff`（不变）
- 危险色：`#fb7185`（不变）

### 边框
`rgba(0,0,0,0.04)` — 极淡透明边框替代 `#e9ecef`，适应渐变背景

## CSS 变量变更

仅修改 `:root` 块，`.dark` 不变：

```css
:root {
  --bg-primary: #f0f8fe;   /* 渐变起始色作为回退 */
  --bg-secondary: #faf5f0;
  --bg-card: #ffffff;
  --text-primary: #1a2a3a;
  --text-secondary: #7a8ba3;
  --accent: #00c2ff;
  --accent-gradient: linear-gradient(135deg, #00c2ff, #0066ff);
  --danger: #fb7185;
  --border: rgba(0, 0, 0, 0.04);
}
```

## 实现计划

1. 修改 `src/assets/styles/main.css` 中的 `:root` 颜色变量
2. 在 `App.vue` 的根元素上应用渐变背景（替代纯色 `var(--bg-primary)`）
3. 添加顶部/底部装饰条
4. 添加背景光晕装饰元素
5. 验证：页面在亮色模式下有层次感、不刺眼、文字可读性良好
