import { describe, it, expect } from 'vitest'
import {
  SCHEMAS,
  getSchema,
  getMatchableFields,
  normalizeEntry,
  PROFILE_SCHEMA,
  WORK_INTERNSHIP_SCHEMA,
} from '../schemas'

describe('schemas', () => {
  describe('SCHEMAS registry', () => {
    it('contains all 7 entry types', () => {
      expect(Object.keys(SCHEMAS)).toEqual([
        'profile', 'work', 'internship', 'project', 'education', 'skill', 'certificate',
      ])
    })

    it('work and internship share the same schema reference', () => {
      expect(SCHEMAS.work).toBe(SCHEMAS.internship)
    })
  })

  describe('getSchema', () => {
    it('returns schema for valid type', () => {
      expect(getSchema('work')).toBe(WORK_INTERNSHIP_SCHEMA)
    })

    it('returns null for unknown type', () => {
      expect(getSchema('nonexistent')).toBeNull()
    })
  })

  describe('getMatchableFields', () => {
    it('returns only fields with matchWeight !== null for work', () => {
      const fields = getMatchableFields('work')
      expect(fields.every(f => f.weight !== null)).toBe(true)
      expect(fields.find(f => f.key === 'company').weight).toBe('high')
      expect(fields.find(f => f.key === 'position').weight).toBe('high')
      expect(fields.find(f => f.key === 'description').weight).toBe('high')
      expect(fields.find(f => f.key === 'achievements').weight).toBe('medium')
      expect(fields.find(f => f.key === 'location').weight).toBe('low')
      expect(fields.find(f => f.key === 'tags').weight).toBe('medium')
      expect(fields.find(f => f.key === 'startDate')).toBeUndefined()
      expect(fields.find(f => f.key === 'endDate')).toBeUndefined()
      expect(fields.find(f => f.key === 'logo')).toBeUndefined()
    })

    it('returns empty array for unknown type', () => {
      expect(getMatchableFields('unknown')).toEqual([])
    })
  })

  describe('normalizeEntry', () => {
    it('fills missing fields with schema defaults for work', () => {
      const entry = { id: 1, type: 'work', company: 'Test', position: 'Dev', startDate: '2024-01' }
      const result = normalizeEntry(entry)
      expect(result.description).toBe('')
      expect(result.achievements).toEqual([])
      expect(result.location).toBe('')
      expect(result.logo).toBe('')
      expect(result.tags).toEqual([])
      expect(result.endDate).toBe('')
    })

    it('preserves existing values', () => {
      const entry = {
        id: 1, type: 'work', company: 'Test', position: 'Dev', startDate: '2024-01',
        description: 'custom desc', achievements: ['a1'], location: 'Beijing',
        logo: 'url', tags: ['vue'], endDate: '2025-01',
      }
      const result = normalizeEntry(entry)
      expect(result.description).toBe('custom desc')
      expect(result.achievements).toEqual(['a1'])
      expect(result.location).toBe('Beijing')
      expect(result.logo).toBe('url')
      expect(result.tags).toEqual(['vue'])
      expect(result.endDate).toBe('2025-01')
    })

    it('preserves extra fields not defined in schema', () => {
      const entry = { id: 1, type: 'work', company: 'Test', position: 'Dev', startDate: '2024-01', customField: 'keep-me' }
      const result = normalizeEntry(entry)
      expect(result.customField).toBe('keep-me')
    })

    it('returns entry unchanged for unknown type', () => {
      const entry = { id: 1, type: 'unknown', foo: 'bar' }
      expect(normalizeEntry(entry)).toEqual(entry)
    })

    it('fills null values with defaults', () => {
      const entry = { id: 1, type: 'work', company: 'Test', position: 'Dev', startDate: '2024-01', achievements: null, tags: null }
      const result = normalizeEntry(entry)
      expect(result.achievements).toEqual([])
      expect(result.tags).toEqual([])
    })

    it('normalizes profile entry', () => {
      const entry = { id: 1, type: 'profile', name: 'Test' }
      const result = normalizeEntry(entry)
      expect(result.title).toBe('')
      expect(result.email).toBe('')
      expect(result.phone).toBe('')
      expect(result.location).toBe('')
      expect(result.summary).toBe('')
      expect(result.avatar).toBe('')
      expect(result.github).toBe('')
      expect(result.website).toBe('')
      expect(result.tags).toEqual([])
    })

    it('normalizes education entry', () => {
      const entry = { id: 1, type: 'education', school: 'ZJU', degree: 'BS', startDate: '2014-09' }
      const result = normalizeEntry(entry)
      expect(result.field).toBe('')
      expect(result.gpa).toBe('')
      expect(result.endDate).toBe('')
      expect(result.description).toBe('')
      expect(result.logo).toBe('')
      expect(result.tags).toEqual([])
    })

    it('normalizes skill entry with proficiency default 1', () => {
      const entry = { id: 1, type: 'skill', skillName: 'Vue' }
      const result = normalizeEntry(entry)
      expect(result.proficiency).toBe(1)
    })

    it('normalizes project entry with featured default false', () => {
      const entry = { id: 1, type: 'project', name: 'P1', role: 'Dev', startDate: '2024' }
      const result = normalizeEntry(entry)
      expect(result.featured).toBe(false)
    })

    it('normalizes certificate entry', () => {
      const entry = { id: 1, type: 'certificate', name: 'AWS', issuer: 'Amazon', date: '2023' }
      const result = normalizeEntry(entry)
      expect(result.description).toBe('')
      expect(result.url).toBe('')
      expect(result.tags).toEqual([])
    })
  })
})
