/**
 * useResume — 简历数据管理（模块级单例）
 *
 * 支持 7 种类型：work, internship, project, education, skill, certificate, profile。
 * v1.6.0: 数据逻辑下沉到 storageEngine，本 composable 作为薄封装保持 API 兼容。
 */

import { engine } from '../storage/storageEngine'

// --- Legacy migrateEntries (kept for v1.9.5 test compatibility) ---
// The actual migration now runs in storage/migration.js.
// This thin adapter is exported for tests that call useResume().migrateEntries().

function migrateEntries(raw) {
  return raw.map(entry => {
    if (entry.type === 'education') {
      const patched = { ...entry }
      if (patched.gpa == null && patched.description) {
        const gpaMatch = patched.description.match(/GPA\s*([\d.]+\s*\/\s*[\d.]+)/)
        if (gpaMatch) {
          patched.gpa = gpaMatch[1].replace(/\s+/g, ' ')
          patched.description = patched.description.replace(/GPA\s*[\d.]+\s*\/\s*[\d.]+[·•,;\s]*\s*/, '').trim()
        }
      }
      return patched
    }
    return entry
  })
}

// --- Singleton ---

let _instance = null

export function useResume() {
  if (!_instance) {
    engine.init()

    const entries = engine.getAll() // ref from engine

    function getByType(type) {
      return engine.getByType(type)
    }

    function add(type, data) {
      return engine.addEntry(type, data)
    }

    function update(id, data) {
      return engine.updateEntry(id, data)
    }

    function remove(id) {
      return engine.removeEntry(id)
    }

    function undoRemove() {
      return engine.undoRemove()
    }

    function commitRemoval() {
      engine.commitRemoval()
    }

    function setManualOrder(type, orderedIds) {
      engine.setManualOrder(type, orderedIds)
    }

    function clearManualOrder(type) {
      engine.clearManualOrder(type)
    }

    function getAll() {
      return engine.getAll().value
    }

    function loadEntries() {
      // No-op — engine.init() handles this. Kept for API compatibility.
    }

    function saveEntries() {
      // No-op — engine persists on every mutation. Kept for API compatibility.
    }

    _instance = {
      entries,
      getByType,
      add,
      update,
      remove,
      undoRemove,
      commitRemoval,
      setManualOrder,
      clearManualOrder,
      migrateEntries,
      getAll,
      loadEntries,
      saveEntries,
    }
  }
  return _instance
}

export function __resetForTests() {
  _instance = null
  engine.__reset()
}
