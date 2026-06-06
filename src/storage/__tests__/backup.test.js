import { describe, it, expect, beforeEach } from 'vitest'
import { exportAll, importAll, validate } from '../backup'
import { engine } from '../storageEngine'

describe('backup', () => {
  beforeEach(() => {
    localStorage.clear()
    engine.__reset()
  })

  describe('exportAll', () => {
    it('exports all data as JSON string', () => {
      engine.init()
      const json = exportAll()
      expect(typeof json).toBe('string')
      const parsed = JSON.parse(json)
      expect(parsed.version).toBe(2)
      expect(Array.isArray(parsed.entries)).toBe(true)
      expect(parsed.layout).toBeTruthy()
      expect(parsed.manualOrders).toBeTruthy()
    })

    it('returns valid JSON even with empty storage', () => {
      const json = exportAll()
      const parsed = JSON.parse(json)
      expect(parsed.entries).toEqual([])
    })
  })

  describe('validate', () => {
    it('returns valid: true for well-formed data', () => {
      engine.init()
      const json = exportAll()
      const result = validate(JSON.parse(json))
      expect(result.valid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('returns errors for missing required fields in entries', () => {
      const bad = {
        version: 2,
        entries: [{ id: 1, type: 'work', position: 'Dev', startDate: '2024' }],
        layout: { layout: 'single', blocks: {} },
        manualOrders: {},
      }
      const result = validate(bad)
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('returns valid: false for entries with unknown type', () => {
      const bad = {
        version: 2,
        entries: [{ id: 1, type: 'unknown_type', foo: 'bar' }],
        layout: { layout: 'single', blocks: {} },
        manualOrders: {},
      }
      const result = validate(bad)
      expect(result.valid).toBe(false)
    })

    it('returns valid: false if entries is not an array', () => {
      const bad = { version: 2, entries: 'not-array', layout: { layout: 'single', blocks: {} }, manualOrders: {} }
      const result = validate(bad)
      expect(result.valid).toBe(false)
    })

    it('returns valid: false for missing top-level keys', () => {
      const bad = { version: 2, entries: [] }
      const result = validate(bad)
      expect(result.valid).toBe(false)
    })
  })

  describe('importAll', () => {
    it('imports valid JSON and overwrites storage', () => {
      engine.init()
      const json = exportAll()
      const result = importAll(json)
      expect(result.success).toBe(true)
    })

    it('rejects invalid JSON string', () => {
      const result = importAll('not json at all')
      expect(result.success).toBe(false)
      expect(result.errors).toBeTruthy()
    })

    it('rejects data that fails schema validation', () => {
      const bad = JSON.stringify({
        version: 2,
        entries: [{ id: 1, type: 'work', position: 'Dev' }],
        layout: {},
        manualOrders: {},
      })
      const result = importAll(bad)
      expect(result.success).toBe(false)
    })

    it('does not modify storage on reject', () => {
      engine.init()
      engine.addEntry('work', { company: 'Safe', position: 'Dev', startDate: '2024' })
      const beforeCount = engine.getAll().value.length

      const bad = JSON.stringify({
        version: 2,
        entries: [{ id: 1, type: 'invalid', foo: 'bar' }],
        layout: { layout: 'single', blocks: {} },
        manualOrders: {},
      })
      importAll(bad)
      expect(engine.getAll().value.length).toBe(beforeCount)
    })
  })
})
