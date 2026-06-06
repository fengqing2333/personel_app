import { describe, it, expect, beforeEach } from 'vitest'
import { engine } from '../storageEngine'
import { safeStorage } from '../../utils/safeStorage'

const ENGINE_KEY = 'resume-storage-v2'

const DEFAULT_LAYOUT = {
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

describe('storageEngine', () => {
  beforeEach(() => {
    localStorage.clear()
    engine.__reset()
  })

  describe('init', () => {
    it('injects seed on first visit (no existing data)', () => {
      // Truly empty — no unified key
      localStorage.clear()
      engine.__reset()
      localStorage.removeItem(ENGINE_KEY)
      engine.init()
      const stored = safeStorage.get(ENGINE_KEY)
      expect(stored).not.toBeNull()
      expect(stored.version).toBe(2)
      expect(stored.entries.length).toBeGreaterThan(0)
      expect(stored.layout).toEqual(DEFAULT_LAYOUT)
      expect(stored.manualOrders).toEqual({})
    })

    it('does not inject seed if entries exist in legacy key', () => {
      localStorage.clear()
      engine.__reset()
      localStorage.removeItem(ENGINE_KEY)
      safeStorage.set('resume-data', [{ id: 1, type: 'work', company: 'OldCorp', position: 'Dev', startDate: '2020-01' }])
      engine.init()
      const entries = engine.getByType('work')
      expect(entries).toHaveLength(1)
      expect(entries[0].company).toBe('OldCorp')
    })

    it('migrates from legacy 4-key structure', () => {
      localStorage.clear()
      engine.__reset()
      localStorage.removeItem(ENGINE_KEY)
      safeStorage.set('resume-data', [
        { id: 1, type: 'work', company: 'OldCorp', position: 'Dev', startDate: '2020-01' },
        { id: 2, type: 'project', name: 'OldProject', role: 'Dev', startDate: '2019' },
      ])
      safeStorage.set('resume-layout', { ...DEFAULT_LAYOUT, themeId: 'linear-cool' })
      safeStorage.set('resume-manual-orders', { work: [1] })
      safeStorage.set('resume-seed-version', 'v0-old')

      engine.init()
      const stored = safeStorage.get(ENGINE_KEY)
      expect(stored.entries).toHaveLength(2)
      expect(stored.layout.themeId).toBe('linear-cool')
      expect(stored.manualOrders.work).toEqual([1])
      expect(stored.version).toBe(2)
    })

    it('is idempotent (does not re-inject seed on subsequent inits)', () => {
      localStorage.clear()
      engine.__reset()
      localStorage.removeItem(ENGINE_KEY)
      engine.init()
      const firstLen = engine.getAll().value.length
      expect(firstLen).toBeGreaterThan(0)
      engine.init()
      expect(engine.getAll().value.length).toBe(firstLen)
    })
  })

  describe('getByType', () => {
    beforeEach(() => {
      engine.init()
    })

    it('returns entries of single type', () => {
      const work = engine.getByType('work')
      expect(work.every(e => e.type === 'work')).toBe(true)
    })

    it('returns entries of multiple types when passed array', () => {
      engine.addEntry('work', { company: 'FTJob', position: 'Dev', startDate: '2024-01' })
      engine.addEntry('internship', { company: 'MSRA', position: 'Intern', startDate: '2021-06', endDate: '2021-09' })
      const combined = engine.getByType(['work', 'internship'])
      expect(combined.every(e => e.type === 'work' || e.type === 'internship')).toBe(true)
      const types = new Set(combined.map(e => e.type))
      expect(types.has('work')).toBe(true)
      expect(types.has('internship')).toBe(true)
    })

    it('returns empty array for unknown type', () => {
      expect(engine.getByType('unknown')).toEqual([])
    })

    it('sorts by startDate descending by default', () => {
      engine.addEntry('work', { company: 'OldCo', position: 'Dev', startDate: '2018-01' })
      engine.addEntry('work', { company: 'NewCo', position: 'Dev', startDate: '2024-01' })
      const works = engine.getByType('work')
      for (let i = 1; i < works.length; i++) {
        expect(works[i - 1].startDate.localeCompare(works[i].startDate) >= 0).toBe(true)
      }
    })

    it('applies manual order when set', () => {
      engine.addEntry('work', { company: 'A', position: 'Dev', startDate: '2023-01' })
      engine.addEntry('work', { company: 'B', position: 'Dev', startDate: '2024-01' })
      const entries = engine.getByType('work')
      const ids = entries.map(e => e.id)
      expect(ids.length).toBeGreaterThanOrEqual(2)
      const reversed = [...ids].reverse()
      engine.setManualOrder('work', reversed)
      const reordered = engine.getByType('work')
      expect(reordered.map(e => e.id)).toEqual(reversed)
    })
  })

  describe('addEntry', () => {
    beforeEach(() => {
      engine.init()
    })

    it('adds entry with auto-incremented id and normalized fields', () => {
      const entry = engine.addEntry('work', { company: 'NewCorp', position: 'Dev', startDate: '2024-01' })
      expect(entry.id).toBeGreaterThan(0)
      expect(entry.company).toBe('NewCorp')
      expect(entry.description).toBe('')
      expect(entry.achievements).toEqual([])
      expect(entry.tags).toEqual([])
    })

    it('persists to localStorage', () => {
      engine.addEntry('work', { company: 'PersistCorp', position: 'Dev', startDate: '2024-01' })
      const stored = safeStorage.get(ENGINE_KEY)
      expect(stored.entries.find(e => e.company === 'PersistCorp')).toBeTruthy()
    })

    it('generates unique ids', () => {
      const e1 = engine.addEntry('work', { company: 'A', position: 'Dev', startDate: '2024-01' })
      const e2 = engine.addEntry('work', { company: 'B', position: 'Dev', startDate: '2024-01' })
      expect(e1.id).not.toBe(e2.id)
    })
  })

  describe('updateEntry', () => {
    beforeEach(() => {
      engine.init()
    })

    it('updates existing entry by id', () => {
      const entry = engine.addEntry('work', { company: 'OldName', position: 'Dev', startDate: '2024-01' })
      const updated = engine.updateEntry(entry.id, { company: 'NewName' })
      expect(updated.company).toBe('NewName')
      expect(updated.position).toBe('Dev')
    })

    it('returns null for non-existent id', () => {
      expect(engine.updateEntry(99999, { company: 'X' })).toBeNull()
    })

    it('persists update to localStorage', () => {
      const entry = engine.addEntry('work', { company: 'Old', position: 'Dev', startDate: '2024-01' })
      engine.updateEntry(entry.id, { company: 'New' })
      const stored = safeStorage.get(ENGINE_KEY)
      expect(stored.entries.find(e => e.id === entry.id).company).toBe('New')
    })
  })

  describe('removeEntry / undoRemove / commitRemoval', () => {
    beforeEach(() => {
      engine.init()
    })

    it('removes entry and returns true', () => {
      const entry = engine.addEntry('work', { company: 'Temp', position: 'Dev', startDate: '2024-01' })
      expect(engine.removeEntry(entry.id)).toBe(true)
      expect(engine.getByType('work').find(e => e.id === entry.id)).toBeUndefined()
    })

    it('returns false for non-existent id', () => {
      expect(engine.removeEntry(99999)).toBe(false)
    })

    it('undoRemove restores last removed entry with original id', () => {
      const entry = engine.addEntry('work', { company: 'UndoMe', position: 'Dev', startDate: '2024-01' })
      const originalId = entry.id
      engine.removeEntry(entry.id)
      expect(engine.undoRemove()).toBe(true)
      const restored = engine.getByType('work').find(e => e.id === originalId)
      expect(restored).toBeTruthy()
      expect(restored.company).toBe('UndoMe')
    })

    it('undoRemove returns false after commitRemoval', () => {
      const entry = engine.addEntry('work', { company: 'X', position: 'Dev', startDate: '2024-01' })
      engine.removeEntry(entry.id)
      engine.commitRemoval()
      expect(engine.undoRemove()).toBe(false)
    })

    it('consecutive removes auto-commit previous, only last is undoable', () => {
      const e1 = engine.addEntry('work', { company: 'A', position: 'Dev', startDate: '2024-01' })
      const e2 = engine.addEntry('work', { company: 'B', position: 'Dev', startDate: '2024-02' })
      engine.removeEntry(e1.id)
      engine.removeEntry(e2.id)
      expect(engine.undoRemove()).toBe(true)
      const after = engine.getByType('work')
      expect(after.find(e => e.company === 'B')).toBeTruthy()
      expect(after.find(e => e.company === 'A')).toBeUndefined()
      expect(engine.undoRemove()).toBe(false)
    })
  })

  describe('layout', () => {
    beforeEach(() => {
      engine.init()
    })

    it('getLayout returns default layout initially', () => {
      expect(engine.getLayout().layout).toBe('single')
    })

    it('setLayout merges partial updates', () => {
      engine.setLayout({ layout: 'two-column' })
      expect(engine.getLayout().layout).toBe('two-column')
      expect(engine.getLayout().blocks.profile.visible).toBe(true)
    })

    it('setLayout persists to localStorage', () => {
      engine.setLayout({ themeId: 'linear-cool' })
      const stored = safeStorage.get(ENGINE_KEY)
      expect(stored.layout.themeId).toBe('linear-cool')
    })
  })

  describe('manualOrders', () => {
    beforeEach(() => {
      engine.init()
    })

    it('getManualOrder returns empty array for unset type', () => {
      expect(engine.getManualOrder('work')).toEqual([])
    })

    it('setManualOrder and getManualOrder round-trip', () => {
      engine.setManualOrder('work', [3, 1, 2])
      expect(engine.getManualOrder('work')).toEqual([3, 1, 2])
    })

    it('clearManualOrder removes the order', () => {
      engine.setManualOrder('work', [3, 1])
      engine.clearManualOrder('work')
      expect(engine.getManualOrder('work')).toEqual([])
    })

    it('persists to localStorage', () => {
      engine.setManualOrder('work', [5, 3])
      const stored = safeStorage.get(ENGINE_KEY)
      expect(stored.manualOrders.work).toEqual([5, 3])
    })
  })

  describe('normalizeEntry on read (self-healing)', () => {
    it('fills missing fields on entries loaded from bare storage', () => {
      safeStorage.set(ENGINE_KEY, {
        version: 2,
        entries: [{ id: 1, type: 'work', company: 'Bare', position: 'Dev', startDate: '2024' }],
        layout: DEFAULT_LAYOUT,
        manualOrders: {},
      })
      engine.init()
      const works = engine.getByType('work')
      expect(works[0].description).toBe('')
      expect(works[0].achievements).toEqual([])
      expect(works[0].tags).toEqual([])
    })
  })

  describe('__reset', () => {
    it('clears internal state and resets localStorage to empty state', () => {
      engine.init()
      engine.addEntry('work', { company: 'X', position: 'Dev', startDate: '2024' })
      engine.__reset()
      const stored = safeStorage.get(ENGINE_KEY)
      expect(stored).not.toBeNull()
      expect(stored.entries).toEqual([])
      expect(engine.getAll().value).toEqual([])
    })
  })
})
