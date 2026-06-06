/**
 * storageEngine.js — 简历存储引擎（模块级单例）
 *
 * 所有简历数据收敛到单一 localStorage key: 'resume-storage-v2'
 * 提供 CRUD / 布局 / 手动排序的统一入口。
 * useResume.js 和 useResumeLayout.js 重构为对此 engine 的薄封装。
 */

import { ref } from 'vue'
import { safeStorage } from '../utils/safeStorage'
import { normalizeEntry } from './schemas'
import { runMigrations, CURRENT_VERSION } from './migration'
import { RESUME_SEED } from '../data/resumeSeed'

const ENGINE_KEY = 'resume-storage-v2'

export const DEFAULT_LAYOUT = {
  layout: 'single',
  blocks: {
    profile:      { visible: true,  order: 0 },
    experiences:  { visible: true,  order: 1 },
    projects:     { visible: true,  order: 2 },
    skills:       { visible: true,  order: 3 },
    education:    { visible: true,  order: 4 },
    certificates: { visible: true,  order: 5 },
    awards:       { visible: true,  order: 6 },
    activities:   { visible: false, order: 7 },
  },
  themeId: 'warm-charcoal',
  glowEnabled: false,
}

// --- Module-level state (singleton) ---
let _initialized = false
const _entries = ref([])
const _layout = ref(structuredClone(DEFAULT_LAYOUT))
const _manualOrders = ref({})
let _nextId = 1
let _pendingRemoval = null

// --- Private helpers ---

function _persist() {
  safeStorage.set(ENGINE_KEY, {
    version: CURRENT_VERSION,
    entries: _entries.value,
    layout: _layout.value,
    manualOrders: _manualOrders.value,
  })
}

function _recalcNextId() {
  if (_entries.value.length > 0) {
    _nextId = Math.max(..._entries.value.map(e => e.id)) + 1
  } else {
    _nextId = 1
  }
}

function migrateFromLegacyKeys() {
  const oldEntries = safeStorage.get('resume-data', null)
  const oldLayout = safeStorage.get('resume-layout', null)
  const oldOrders = safeStorage.get('resume-manual-orders', {})
  const oldVersion = safeStorage.get('resume-seed-version', null)

  if (!oldEntries && !oldLayout && !oldVersion) {
    return null
  }

  return {
    version: 1,
    entries: Array.isArray(oldEntries) ? oldEntries : [],
    layout: oldLayout || DEFAULT_LAYOUT,
    manualOrders: oldOrders || {},
  }
}

// --- Public API ---

function init() {
  if (_initialized) return

  let stored = safeStorage.get(ENGINE_KEY, null)

  if (!stored) {
    stored = migrateFromLegacyKeys()
  }

  // Seed only on first visit (no unified key AND no legacy data)
  if (!stored) {
    const seeded = RESUME_SEED.map((item, idx) => ({ id: idx + 1, ...item }))
    _entries.value = seeded
    _layout.value = structuredClone(DEFAULT_LAYOUT)
    _manualOrders.value = {}
    _recalcNextId()
    _persist()
    _initialized = true
    return
  }

  const migrated = runMigrations(stored)
  _entries.value = migrated.entries.map(normalizeEntry)
  _layout.value = migrated.layout || structuredClone(DEFAULT_LAYOUT)
  _manualOrders.value = migrated.manualOrders || {}
  _recalcNextId()
  _persist()

  _initialized = true
}

function getByType(type) {
  const types = Array.isArray(type) ? type : [type]
  const filtered = _entries.value.filter(e => types.includes(e.type))
  const primaryType = Array.isArray(type) ? type[0] : type
  const order = _manualOrders.value[primaryType]

  if (order && Array.isArray(order) && order.length > 0) {
    const orderMap = new Map(order.map((id, idx) => [id, idx]))
    const manual = filtered.filter(e => orderMap.has(e.id)).sort((a, b) => orderMap.get(a.id) - orderMap.get(b.id))
    const rest = filtered.filter(e => !orderMap.has(e.id)).sort((a, b) => (b.startDate || '').localeCompare(a.startDate || ''))
    return [...manual, ...rest]
  }

  return filtered.sort((a, b) => (b.startDate || '').localeCompare(a.startDate || ''))
}

function addEntry(type, data) {
  const entry = normalizeEntry({ id: _nextId++, type, ...data })
  _entries.value.push(entry)
  _persist()
  return entry
}

function updateEntry(id, data) {
  const idx = _entries.value.findIndex(e => e.id === id)
  if (idx === -1) return null
  _entries.value[idx] = { ..._entries.value[idx], ...data }
  _persist()
  return _entries.value[idx]
}

function removeEntry(id) {
  const idx = _entries.value.findIndex(e => e.id === id)
  if (idx === -1) return false
  if (_pendingRemoval) {
    _pendingRemoval = null
  }
  _pendingRemoval = { entry: { ..._entries.value[idx] } }
  _entries.value.splice(idx, 1)
  _persist()
  return true
}

function undoRemove() {
  if (!_pendingRemoval) return false
  const restored = _pendingRemoval.entry
  if (_entries.value.some(e => e.id === restored.id)) {
    _pendingRemoval = null
    return false
  }
  _entries.value.push({ ...restored })
  _pendingRemoval = null
  _persist()
  return true
}

function commitRemoval() {
  _pendingRemoval = null
}

/** Returns the reactive ref — components use .value to access array */
function getAll() {
  return _entries
}

function getLayout() {
  return _layout.value
}

function setLayout(partial) {
  Object.assign(_layout.value, partial)
  _persist()
}

function getManualOrder(type) {
  return _manualOrders.value[type] || []
}

function setManualOrder(type, orderedIds) {
  _manualOrders.value = { ..._manualOrders.value, [type]: [...orderedIds] }
  _persist()
}

function clearManualOrder(type) {
  const updated = { ..._manualOrders.value }
  delete updated[type]
  _manualOrders.value = updated
  _persist()
}

function getRawStorage() {
  return safeStorage.get(ENGINE_KEY)
}

function __reset() {
  _initialized = false
  _entries.value = []
  _layout.value = structuredClone(DEFAULT_LAYOUT)
  _manualOrders.value = {}
  _nextId = 1
  _pendingRemoval = null
  // Write empty-but-present record so engine.init() treats this as
  // "user has visited before with empty data", not "first visit".
  safeStorage.set(ENGINE_KEY, {
    version: CURRENT_VERSION,
    entries: [],
    layout: structuredClone(DEFAULT_LAYOUT),
    manualOrders: {},
  })
}

export const engine = {
  init,
  getByType,
  addEntry,
  updateEntry,
  removeEntry,
  undoRemove,
  commitRemoval,
  getAll,
  getLayout,
  setLayout,
  getManualOrder,
  setManualOrder,
  clearManualOrder,
  getRawStorage,
  __reset,
}

export function __resetForTests() {
  engine.__reset()
}
