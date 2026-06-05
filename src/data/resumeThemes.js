/**
 * 简历主题配置
 *
 * 每个主题包含 CSS 变量，用于简历预览和导出时的样式渲染。
 * 命名规则：{gradient-direction}-{tone-name}
 *
 * 数据格式：
 *   key        — 主题唯一标识
 *   name       — 主题显示名称（中文）
 *   vars       — CSS 自定义属性键值对
 */
export const RESUME_THEMES = {
  'linear-cool': {
    name: 'Linear 冷调中性',
    vars: {
      '--bg': '#252630',
      '--bg-soft': '#2c2d38',
      '--card': '#2f3040',
      '--border': '#3a3b4a',
      '--text': '#e7e7ee',
      '--muted': '#9b9caa',
      '--accent': '#7c8aff',
      '--accent-soft': '#a5b0ff',
    },
  },
}
