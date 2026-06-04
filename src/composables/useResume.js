/**
 * useResume — 简历数据管理（模块级单例）
 *
 * 管理 7 种数据类型：work, internship, project, education, skill, certificate, profile
 * 数据持久化到 localStorage key 'resume-data'
 */

import { ref, computed } from 'vue'
import { safeStorage } from '../utils/safeStorage'

const STORAGE_KEY = 'resume-data'

const TYPES = ['work', 'internship', 'project', 'education', 'skill', 'certificate', 'profile']

const defaultData = () => ({
  work: [],
  internship: [],
  project: [],
  education: [],
  skill: [],
  certificate: [],
  profile: []
})

const data = ref(defaultData())
let initialized = false

function loadData() {
  const stored = safeStorage.get(STORAGE_KEY)
  data.value = stored ? { ...defaultData(), ...stored } : defaultData()
}

function saveData() {
  safeStorage.set(STORAGE_KEY, data.value)
}

function addEntry(type, entry) {
  if (!data.value[type]) {
    data.value[type] = []
  }
  const newEntry = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), ...entry }
  data.value[type].push(newEntry)
  saveData()
  return newEntry
}

function updateEntry(type, id, patch) {
  const idx = data.value[type]?.findIndex(e => e.id === id)
  if (idx !== -1) {
    data.value[type][idx] = { ...data.value[type][idx], ...patch }
    saveData()
    return true
  }
  return false
}

function removeEntry(type, id) {
  const len = data.value[type]?.length
  data.value[type] = (data.value[type] || []).filter(e => e.id !== id)
  if (data.value[type].length !== len) {
    saveData()
    return true
  }
  return false
}

function getAll(type) {
  return data.value[type] || []
}

function getById(type, id) {
  return (data.value[type] || []).find(e => e.id === id) || null
}

const stats = computed(() => {
  const s = {}
  for (const t of TYPES) {
    s[t] = (data.value[t] || []).length
  }
  return s
})

const allEntries = computed(() => {
  const entries = []
  for (const t of ['work', 'internship', 'project', 'education']) {
    for (const e of (data.value[t] || [])) {
      entries.push({ ...e, _type: t })
    }
  }
  entries.sort((a, b) => {
    const da = a.endDate || a.startDate || ''
    const db = b.endDate || b.startDate || ''
    return db.localeCompare(da)
  })
  return entries
})

/** 测试用：重置所有内部状态 */
export function __resetForTests() {
  initialized = false
  data.value = defaultData()
  safeStorage.remove(STORAGE_KEY)
}

export function useResume() {
  if (!initialized) {
    initialized = true
    loadData()
  }

  return {
    data,
    stats,
    allEntries,
    loadData,
    saveData,
    addEntry,
    updateEntry,
    removeEntry,
    getAll,
    getById
  }
}
