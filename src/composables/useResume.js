/**
 * useResume — 简历数据管理（模块级单例）
 *
 * 支持 7 种类型：work, internship, project, education, skill, certificate, profile。
 * entries 定义在模块作用域，所有组件共享同一份数据。
 * 首次调用时从 localStorage 加载，后续调用复用。
 */

import { ref } from 'vue'
import { safeStorage } from '../utils/safeStorage'

const STORAGE_KEY = 'resume-data'

/** @type {import('vue').Ref<Array<Object>>} */
const entries = ref([])

let initialized = false
let nextId = 1

function loadEntries() {
  const raw = safeStorage.get(STORAGE_KEY, [])
  entries.value = raw
  if (raw.length > 0) {
    nextId = Math.max(...raw.map(e => e.id)) + 1
  }
}

function saveEntries() {
  safeStorage.set(STORAGE_KEY, entries.value)
}

/** 测试用：重置所有内部状态 */
export function __resetForTests() {
  initialized = false
  entries.value = []
  nextId = 1
  safeStorage.remove(STORAGE_KEY)
}

export function useResume() {
  if (!initialized) {
    initialized = true
    loadEntries()
  }

  function getByType(type) {
    return entries.value.filter(e => e.type === type)
  }

  function add(type, data) {
    const entry = { id: nextId++, type, ...data }
    entries.value.push(entry)
    saveEntries()
    return entry
  }

  function update(id, data) {
    const idx = entries.value.findIndex(e => e.id === id)
    if (idx === -1) return null
    entries.value[idx] = { ...entries.value[idx], ...data }
    saveEntries()
    return entries.value[idx]
  }

  function remove(id) {
    const idx = entries.value.findIndex(e => e.id === id)
    if (idx === -1) return false
    entries.value.splice(idx, 1)
    saveEntries()
    return true
  }

  function getAll() {
    return entries.value
  }

  return {
    entries,
    getByType,
    add,
    update,
    remove,
    getAll,
    loadEntries,
    saveEntries
  }
}
