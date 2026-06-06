/**
 * migration.js — 版本链迁移管线
 *
 * 每次 schema 变更递增 CURRENT_VERSION 并注册对应的迁移函数。
 * 迁移只处理数据内容改写（字段提取、类型转换等）。
 * 字段补全由 schemas.normalizeEntry() 处理，不需要写迁移。
 */

export const CURRENT_VERSION = 2

/** 从 education entry 的 description 中提取 GPA 信息并清理 description */
function extractGpaFromDescription(entry) {
  if (entry.gpa != null) return entry
  if (!entry.description) return entry
  const gpaMatch = entry.description.match(/GPA\s*([\d.]+\s*\/\s*[\d.]+)/)
  if (!gpaMatch) return entry
  const gpa = gpaMatch[1].replace(/\s+/g, ' ')
  const description = entry.description
    .replace(/GPA\s*[\d.]+\s*\/\s*[\d.]+[·•,;\s]*\s*/, '')
    .trim()
  return { ...entry, gpa, description }
}

export const MIGRATIONS = {
  /** v0→v1: 旧 4-key 合并为单 key（storageEngine.migrateFromLegacyKeys 已处理，此处为占位） */
  1: (data) => ({ ...data, version: 1 }),
  /** v1→v2: education 条目补充 gpa 字段提取 */
  2: (data) => ({
    ...data,
    version: 2,
    entries: data.entries.map((e) =>
      e.type === 'education' ? extractGpaFromDescription(e) : e
    ),
  }),
}

/** 链式执行所有迁移：当前版本 → 逐级升级 → CURRENT_VERSION */
export function runMigrations(data) {
  const startVersion = data.version || 0
  let result = data
  for (let v = startVersion + 1; v <= CURRENT_VERSION; v++) {
    if (MIGRATIONS[v]) {
      result = MIGRATIONS[v](result)
    }
  }
  return result
}
