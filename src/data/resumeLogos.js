/**
 * 简历 Logo 生成工具
 *
 * 为公司/学校名称生成占位 Logo 样式（纯 CSS 色块 + 首字符）。
 * 常见公司使用专属品牌色，其余按名称哈希分配预定义色板。
 */

const LOGO_COLORS = [
  { bg: '#3b82f6', fg: '#ffffff' },
  { bg: '#10b981', fg: '#ffffff' },
  { bg: '#f59e0b', fg: '#ffffff' },
  { bg: '#ef4444', fg: '#ffffff' },
  { bg: '#8b5cf6', fg: '#ffffff' },
  { bg: '#ec4899', fg: '#ffffff' },
  { bg: '#14b8a6', fg: '#ffffff' },
  { bg: '#f97316', fg: '#ffffff' },
]

const NAMED_LOGOS = {
  google: { bg: '#4285f4', fg: '#ffffff' },
  meta: { bg: '#1877f2', fg: '#ffffff' },
  apple: { bg: '#555555', fg: '#ffffff' },
  microsoft: { bg: '#00a4ef', fg: '#ffffff' },
  amazon: { bg: '#ff9900', fg: '#ffffff' },
  tencent: { bg: '#466eb4', fg: '#ffffff' },
  alibaba: { bg: '#ff6a00', fg: '#ffffff' },
  bytedance: { bg: '#325ab4', fg: '#ffffff' },
}

/**
 * 基于名称字符串的简单哈希
 * @param {string} name
 * @returns {number} 非负整数哈希值
 */
function hashColor(name) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash) + name.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

/**
 * 获取公司/学校名称对应的 Logo 色板与首字符
 *
 * 优先匹配 NAMED_LOGOS（不区分大小写），
 * 未匹配则基于名称哈希从 LOGO_COLORS 中选取。
 *
 * @param {string|null|undefined} name 公司/学校名称
 * @returns {{ bg: string, fg: string, char: string }}
 */
export function getLogoStyle(name) {
  if (!name) {
    return { bg: '#6b7280', fg: '#ffffff', char: '?' }
  }

  const key = name.toLowerCase().trim()
  const named = NAMED_LOGOS[key]
  if (named) {
    return { bg: named.bg, fg: named.fg, char: name[0].toUpperCase() }
  }

  const idx = hashColor(key) % LOGO_COLORS.length
  return { bg: LOGO_COLORS[idx].bg, fg: LOGO_COLORS[idx].fg, char: name[0].toUpperCase() }
}
