/**
 * backup.js — 数据备份与恢复
 *
 * 导出/导入 JSON 文件，schema 校验保证导入数据完整性。
 * 校验失败时拒绝导入，不覆盖现有数据。
 */

import { engine } from './storageEngine'
import { SCHEMAS } from './schemas'
import { safeStorage } from '../utils/safeStorage'
import { CURRENT_VERSION } from './migration'

const ENGINE_KEY = 'resume-storage-v2'

/** 导出全部数据为 JSON 字符串 */
export function exportAll() {
  const data = engine.getRawStorage()
  return JSON.stringify(data || { version: 0, entries: [], layout: {}, manualOrders: {} }, null, 2)
}

/** 触发浏览器下载 JSON 备份文件 */
export function downloadBackup() {
  const json = exportAll()
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const today = new Date().toISOString().slice(0, 10)
  a.download = `resume-backup-${today}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/** 验证数据结构是否合法（schema 校验所有 entries） */
export function validate(data) {
  const errors = []

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Data must be an object'] }
  }

  if (!Array.isArray(data.entries)) {
    return { valid: false, errors: ['entries must be an array'] }
  }

  if (!data.layout || typeof data.layout !== 'object') {
    errors.push('layout must be an object')
  }

  if (!data.manualOrders || typeof data.manualOrders !== 'object') {
    errors.push('manualOrders must be an object')
  }

  for (let i = 0; i < data.entries.length; i++) {
    const entry = data.entries[i]
    if (!entry.type) {
      errors.push(`entries[${i}]: missing type`)
      continue
    }
    const schema = SCHEMAS[entry.type]
    if (!schema) {
      errors.push(`entries[${i}]: unknown type "${entry.type}"`)
      continue
    }
    for (const [key, def] of Object.entries(schema)) {
      if (def.required && (entry[key] === undefined || entry[key] === null || entry[key] === '')) {
        errors.push(`entries[${i}] (${entry.type}): missing required field "${key}"`)
      }
    }
  }

  return { valid: errors.length === 0, errors }
}

/** 从 JSON 字符串导入数据。校验失败时拒绝导入，不覆盖现有数据。 */
export function importAll(json) {
  let data
  try {
    data = JSON.parse(json)
  } catch (e) {
    return { success: false, errors: [`JSON parse error: ${e.message}`] }
  }

  const validation = validate(data)
  if (!validation.valid) {
    return { success: false, errors: validation.errors }
  }

  // Write directly to storage, then re-init engine
  safeStorage.set(ENGINE_KEY, {
    version: CURRENT_VERSION,
    entries: data.entries,
    layout: data.layout || {},
    manualOrders: data.manualOrders || {},
  })
  engine.__reset()
  engine.init()

  return { success: true }
}
