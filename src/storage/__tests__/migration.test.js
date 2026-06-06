import { describe, it, expect } from 'vitest'
import { runMigrations, MIGRATIONS, CURRENT_VERSION } from '../migration'

describe('migration', () => {
  describe('runMigrations', () => {
    it('upgrades data from version 0 to CURRENT_VERSION', () => {
      const data = { version: 0, entries: [], layout: { layout: 'single', blocks: {} }, manualOrders: {} }
      const result = runMigrations(data)
      expect(result.version).toBe(CURRENT_VERSION)
    })

    it('returns same reference when already at CURRENT_VERSION', () => {
      const data = { version: CURRENT_VERSION, entries: [], layout: {}, manualOrders: {} }
      const result = runMigrations(data)
      expect(result).toBe(data)
    })

    it('runs v1 (no-op) then v2 (gpa extraction) from version 0', () => {
      const data = {
        version: 0,
        entries: [
          { id: 1, type: 'education', school: 'ZJU', degree: 'BS', startDate: '2014-09', description: 'GPA 3.8/4.0 · honor student' },
          { id: 2, type: 'work', company: 'Corp', position: 'Eng', startDate: '2020-01' },
        ],
        layout: {},
        manualOrders: {},
      }
      const result = runMigrations(data)
      expect(result.version).toBe(CURRENT_VERSION)
      const edu = result.entries.find(e => e.type === 'education')
      expect(edu.gpa).toBe('3.8/4.0')
      expect(edu.description).toBe('honor student')
      const work = result.entries.find(e => e.type === 'work')
      expect(work.company).toBe('Corp')
    })

    it('handles missing version field by treating as 0', () => {
      const data = { entries: [], layout: {}, manualOrders: {} }
      const result = runMigrations(data)
      expect(result.version).toBe(CURRENT_VERSION)
    })
  })

  describe('MIGRATIONS[2] — gpa extraction', () => {
    it('extracts GPA from education description with dot separator', () => {
      const data = {
        version: 1,
        entries: [{ id: 1, type: 'education', school: 'ZJU', degree: 'BS', startDate: '2014-09', description: 'GPA 3.8/4.0 · honor student' }],
        layout: {},
        manualOrders: {},
      }
      const result = MIGRATIONS[2](data)
      expect(result.entries[0].gpa).toBe('3.8/4.0')
      expect(result.entries[0].description).toBe('honor student')
    })

    it('extracts GPA with comma separator', () => {
      const data = {
        version: 1,
        entries: [{ id: 1, type: 'education', school: 'ZJU', degree: 'BS', startDate: '2014-09', description: 'GPA 3.8/4.0, honor student' }],
        layout: {},
        manualOrders: {},
      }
      const result = MIGRATIONS[2](data)
      expect(result.entries[0].gpa).toBe('3.8/4.0')
      expect(result.entries[0].description).toBe('honor student')
    })

    it('extracts GPA without any separator', () => {
      const data = {
        version: 1,
        entries: [{ id: 1, type: 'education', school: 'ZJU', degree: 'BS', startDate: '2014-09', description: 'GPA 3.8/4.0 校优秀毕业生' }],
        layout: {},
        manualOrders: {},
      }
      const result = MIGRATIONS[2](data)
      expect(result.entries[0].gpa).toBe('3.8/4.0')
      expect(result.entries[0].description).toBe('校优秀毕业生')
    })

    it('does not overwrite existing gpa', () => {
      const data = {
        version: 1,
        entries: [{ id: 1, type: 'education', school: 'ZJU', degree: 'BS', startDate: '2014-09', gpa: '4.0/4.0', description: 'my description' }],
        layout: {},
        manualOrders: {},
      }
      const result = MIGRATIONS[2](data)
      expect(result.entries[0].gpa).toBe('4.0/4.0')
      expect(result.entries[0].description).toBe('my description')
    })

    it('ignores non-education entries entirely', () => {
      const data = {
        version: 1,
        entries: [{ id: 1, type: 'work', company: 'A', startDate: '2024', description: 'GPA 3.8/4.0 not a GPA' }],
        layout: {},
        manualOrders: {},
      }
      const result = MIGRATIONS[2](data)
      expect(result.entries[0].gpa).toBeUndefined()
      expect(result.entries[0].description).toBe('GPA 3.8/4.0 not a GPA')
    })
  })
})
