# Resume Storage Engine — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a centralized storage engine (`src/storage/`) with schema-driven validation, versioned migrations, and backup/restore; refactor composables to delegate; fix internship display.

**Architecture:** New `src/storage/` directory holds schemas, engine, migration pipeline, and backup utilities. `useResume.js` and `useResumeLayout.js` become thin wrappers over the engine, preserving all existing public API signatures. All resume data converges into a single localStorage key `resume-storage-v2`.

**Tech Stack:** Vue 3.4, Vitest 3.2, jsdom 24, localStorage (safeStorage wrapper)

---

## File Structure Map

```
Create:
  src/storage/schemas.js          → Schema definitions, normalizeEntry, getMatchableFields
  src/storage/migration.js        → Versioned migration pipeline, extractGpaFromDescription
  src/storage/storageEngine.js    → Singleton CRUD engine, init, layout, manualOrders
  src/storage/backup.js           → exportAll, importAll, downloadBackup, validate
  src/storage/__tests__/
    schemas.test.js
    storageEngine.test.js
    migration.test.js
    backup.test.js

Modify:
  src/composables/useResume.js                        → Thin wrapper over storageEngine
  src/composables/useResumeLayout.js                  → Delegate to engine.getLayout/setLayout
  src/composables/__tests__/useResume.test.js         → Update persistence key + add array getByType test
  src/composables/__tests__/useResumeLayout.test.js   → Update storage key refs
  src/views/ResumePortal.vue                          → getByType(['work','internship']), isBlockEmpty
  src/components/ResumeBlockTimeline.vue              → Internship badge in template + CSS
  src/views/ResumeManage.vue                          → Import/Export buttons
```

---

### Task 1: schemas.js — Schema Definitions

**Files:**
- Create: `src/storage/schemas.js`
- Create: `src/storage/__tests__/schemas.test.js`

- [ ] **Step 1: Write tests for schemas.js**

Create `src/storage/__tests__/schemas.test.js`:

```js
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
```

- [ ] **Step 2: Run tests, verify they fail**

Run: `npx vitest run src/storage/__tests__/schemas.test.js`
Expected: FAIL — module not found

- [ ] **Step 3: Implement schemas.js**

Create `src/storage/schemas.js`:

```js
/**
 * schemas.js — 简历条目类型字段定义（唯一真相源）
 *
 * 每个字段:
 *   type:        JavaScript 类型 / 语义类型
 *   required:    是否必填
 *   default:     默认值（normalizeEntry 补全缺失字段时使用）
 *   matchWeight: JD 匹配权重 (high | medium | low | null)，null = 不参与匹配
 */

export const PROFILE_SCHEMA = {
  name:     { type: 'string',   required: true,  default: '',   matchWeight: 'high' },
  title:    { type: 'string',   required: false, default: '',   matchWeight: 'high' },
  email:    { type: 'string',   required: false, default: '',   matchWeight: 'low' },
  phone:    { type: 'string',   required: false, default: '',   matchWeight: 'low' },
  location: { type: 'string',   required: false, default: '',   matchWeight: 'medium' },
  summary:  { type: 'text',     required: false, default: '',   matchWeight: 'high' },
  avatar:   { type: 'string',   required: false, default: '',   matchWeight: null },
  github:   { type: 'string',   required: false, default: '',   matchWeight: 'low' },
  website:  { type: 'string',   required: false, default: '',   matchWeight: 'low' },
  tags:     { type: 'string[]', required: false, default: [],   matchWeight: 'medium' },
}

export const WORK_INTERNSHIP_SCHEMA = {
  company:      { type: 'string',   required: true,  default: '',  matchWeight: 'high' },
  position:     { type: 'string',   required: true,  default: '',  matchWeight: 'high' },
  startDate:    { type: 'month',    required: true,  default: '',  matchWeight: null },
  endDate:      { type: 'month',    required: false, default: '',  matchWeight: null },
  description:  { type: 'text',     required: false, default: '',  matchWeight: 'high' },
  achievements: { type: 'string[]', required: false, default: [],  matchWeight: 'medium' },
  location:     { type: 'string',   required: false, default: '',  matchWeight: 'low' },
  logo:         { type: 'string',   required: false, default: '',  matchWeight: null },
  tags:         { type: 'string[]', required: false, default: [],  matchWeight: 'medium' },
}

export const PROJECT_SCHEMA = {
  name:         { type: 'string',   required: true,  default: '',     matchWeight: 'high' },
  role:         { type: 'string',   required: true,  default: '',     matchWeight: 'high' },
  startDate:    { type: 'month',    required: true,  default: '',     matchWeight: null },
  endDate:      { type: 'month',    required: false, default: '',     matchWeight: null },
  description:  { type: 'text',     required: false, default: '',     matchWeight: 'high' },
  technologies: { type: 'string[]', required: false, default: [],     matchWeight: 'high' },
  url:          { type: 'string',   required: false, default: '',     matchWeight: 'low' },
  featured:     { type: 'boolean',  required: false, default: false,  matchWeight: null },
  tags:         { type: 'string[]', required: false, default: [],     matchWeight: 'medium' },
}

export const EDUCATION_SCHEMA = {
  school:      { type: 'string',   required: true,  default: '',  matchWeight: 'high' },
  degree:      { type: 'string',   required: true,  default: '',  matchWeight: 'high' },
  field:       { type: 'string',   required: false, default: '',  matchWeight: 'medium' },
  gpa:         { type: 'string',   required: false, default: '',  matchWeight: 'low' },
  startDate:   { type: 'month',    required: true,  default: '',  matchWeight: null },
  endDate:     { type: 'month',    required: false, default: '',  matchWeight: null },
  description: { type: 'text',     required: false, default: '',  matchWeight: 'medium' },
  logo:        { type: 'string',   required: false, default: '',  matchWeight: null },
  tags:        { type: 'string[]', required: false, default: [],  matchWeight: 'medium' },
}

export const SKILL_SCHEMA = {
  skillName:   { type: 'string',   required: true,  default: '',  matchWeight: 'high' },
  category:    { type: 'string',   required: false, default: '',  matchWeight: 'medium' },
  proficiency: { type: 'number',   required: false, default: 1,   matchWeight: 'low' },
  tags:        { type: 'string[]', required: false, default: [],  matchWeight: 'medium' },
}

export const CERTIFICATE_SCHEMA = {
  name:        { type: 'string',   required: true,  default: '',  matchWeight: 'high' },
  issuer:      { type: 'string',   required: true,  default: '',  matchWeight: 'high' },
  date:        { type: 'month',    required: true,  default: '',  matchWeight: null },
  description: { type: 'text',     required: false, default: '',  matchWeight: 'medium' },
  url:         { type: 'string',   required: false, default: '',  matchWeight: 'low' },
  tags:        { type: 'string[]', required: false, default: [],  matchWeight: 'medium' },
}

/** 所有条目类型的 schema 注册表 */
export const SCHEMAS = {
  profile:     PROFILE_SCHEMA,
  work:        WORK_INTERNSHIP_SCHEMA,
  internship:  WORK_INTERNSHIP_SCHEMA,
  project:     PROJECT_SCHEMA,
  education:   EDUCATION_SCHEMA,
  skill:       SKILL_SCHEMA,
  certificate: CERTIFICATE_SCHEMA,
}

/** 按类型获取 schema，未知类型返回 null */
export function getSchema(type) {
  return SCHEMAS[type] || null
}

/** 获取某类型的 JD 可匹配字段列表（matchWeight !== null 的字段） */
export function getMatchableFields(type) {
  const schema = SCHEMAS[type]
  if (!schema) return []
  return Object.entries(schema)
    .filter(([, def]) => def.matchWeight !== null)
    .map(([key, def]) => ({ key, type: def.type, weight: def.matchWeight }))
}

/** 对单条 entry 补全 schema 定义的默认值，保留多余字段（自愈） */
export function normalizeEntry(entry) {
  const schema = SCHEMAS[entry.type]
  if (!schema) return entry
  const result = { ...entry }
  for (const [key, def] of Object.entries(schema)) {
    if (result[key] === undefined || result[key] === null) {
      result[key] = def.default
    }
  }
  return result
}
```

- [ ] **Step 4: Run tests, verify they pass**

Run: `npx vitest run src/storage/__tests__/schemas.test.js`
Expected: 14 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/storage/schemas.js src/storage/__tests__/schemas.test.js
git commit -m "[V1.6.0] feat: add resume schema definitions and normalizeEntry"
```

---

### Task 2: migration.js — Migration Pipeline

**Files:**
- Create: `src/storage/migration.js`
- Create: `src/storage/__tests__/migration.test.js`

- [ ] **Step 1: Write tests for migration.js**

Create `src/storage/__tests__/migration.test.js`:

```js
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
```

- [ ] **Step 2: Run tests, verify they fail**

Run: `npx vitest run src/storage/__tests__/migration.test.js`
Expected: FAIL — module not found

- [ ] **Step 3: Implement migration.js**

Create `src/storage/migration.js`:

```js
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
```

- [ ] **Step 4: Run tests, verify they pass**

Run: `npx vitest run src/storage/__tests__/migration.test.js`
Expected: 9 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/storage/migration.js src/storage/__tests__/migration.test.js
git commit -m "[V1.6.0] feat: add versioned migration pipeline"
```

---

### Task 3: storageEngine.js — Core Storage Engine

**Files:**
- Create: `src/storage/storageEngine.js`
- Create: `src/storage/__tests__/storageEngine.test.js`

- [ ] **Step 1: Write tests for storageEngine.js**

Create `src/storage/__tests__/storageEngine.test.js`:

```js
import { describe, it, expect, beforeEach } from 'vitest'
import { engine, __resetForTests } from '../storageEngine'
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
      engine.init()
      const stored = safeStorage.get(ENGINE_KEY)
      expect(stored).not.toBeNull()
      expect(stored.version).toBe(2)
      expect(stored.entries.length).toBeGreaterThan(0)
      expect(stored.layout).toEqual(DEFAULT_LAYOUT)
      expect(stored.manualOrders).toEqual({})
    })

    it('does not inject seed if entries exist in legacy key', () => {
      safeStorage.set('resume-data', [{ id: 1, type: 'work', company: 'OldCorp', position: 'Dev', startDate: '2020-01' }])
      engine.init()
      const entries = engine.getByType('work')
      expect(entries).toHaveLength(1)
      expect(entries[0].company).toBe('OldCorp')
    })

    it('migrates from legacy 4-key structure', () => {
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
      engine.init()
      const firstLen = engine.getAll().value.length
      engine.__reset()
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
      const entries = engine.getByType('work')
      const ids = entries.map(e => e.id)
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
    it('clears internal state and localStorage', () => {
      engine.init()
      engine.addEntry('work', { company: 'X', position: 'Dev', startDate: '2024' })
      engine.__reset()
      expect(safeStorage.get(ENGINE_KEY)).toBeNull()
      expect(engine.getAll().value).toEqual([])
    })
  })
})
```

- [ ] **Step 2: Run tests, verify they fail**

Run: `npx vitest run src/storage/__tests__/storageEngine.test.js`
Expected: FAIL — module not found

- [ ] **Step 3: Implement storageEngine.js**

Create `src/storage/storageEngine.js`:

```js
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

  if (!stored || stored.entries.length === 0) {
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
  safeStorage.remove(ENGINE_KEY)
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
```

- [ ] **Step 4: Run tests, verify they pass**

Run: `npx vitest run src/storage/__tests__/storageEngine.test.js`
Expected: 24 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/storage/storageEngine.js src/storage/__tests__/storageEngine.test.js
git commit -m "[V1.6.0] feat: add storageEngine singleton with unified CRUD + layout + migration"
```

---

### Task 4: backup.js — Backup Module

**Files:**
- Create: `src/storage/backup.js`
- Create: `src/storage/__tests__/backup.test.js`

- [ ] **Step 1: Write tests for backup.js**

Create `src/storage/__tests__/backup.test.js`:

```js
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
```

- [ ] **Step 2: Run tests, verify they fail**

Run: `npx vitest run src/storage/__tests__/backup.test.js`
Expected: FAIL — module not found

- [ ] **Step 3: Implement backup.js**

Create `src/storage/backup.js`:

```js
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
```

- [ ] **Step 4: Run tests, verify they pass**

Run: `npx vitest run src/storage/__tests__/backup.test.js`
Expected: 10 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/storage/backup.js src/storage/__tests__/backup.test.js
git commit -m "[V1.6.0] feat: add backup module with JSON export/import/validate"
```

---

### Task 5: Refactor useResume.js — Delegate to Engine

**Files:**
- Modify: `src/composables/useResume.js`
- Modify: `src/composables/__tests__/useResume.test.js`

**Constraints:** All public API signatures remain unchanged. `migrateEntries` stays exported for backward-compatible tests.

- [ ] **Step 1: Edit useResume.test.js — update persistence key + add array getByType test**

Edit `src/composables/__tests__/useResume.test.js` with two changes:

**Change A**: Replace the legacy-key persistence test (line 129-135). Find:
```
    it('manualOrders 持久化到 localStorage', () => {
      const { add, setManualOrder } = useResume()
      const e1 = add('work', { company: 'A', startDate: '2024' })
      setManualOrder('work', [e1.id])
      const stored = JSON.parse(localStorage.getItem('resume-manual-orders') || '{}')
      expect(stored.work).toEqual([e1.id])
    })
```
Replace with:
```js
    it('manualOrders 持久化到 storage', () => {
      const { add, setManualOrder } = useResume()
      const e1 = add('work', { company: 'A', startDate: '2024' })
      setManualOrder('work', [e1.id])
      const stored = JSON.parse(localStorage.getItem('resume-storage-v2') || '{}')
      expect(stored.manualOrders.work).toEqual([e1.id])
    })
```

**Change B**: Add new test block before the final `});` of the file (after the `loadEntries` describe block, before the closing `})` at line 211):

```js
  // --- v1.6.0: getByType array parameter ---
  describe('getByType array (v1.6.0)', () => {
    it('getByType 接受数组参数，合并查询 work + internship', () => {
      const { add, getByType } = useResume()
      add('work', { company: 'FTJob', position: 'Dev', startDate: '2024-01' })
      add('internship', { company: 'InternCo', position: 'Intern', startDate: '2023-06' })
      const combined = getByType(['work', 'internship'])
      expect(combined).toHaveLength(2)
      const types = combined.map(e => e.type)
      expect(types).toContain('work')
      expect(types).toContain('internship')
    })
  })
```

- [ ] **Step 2: Run tests — the array getByType test should fail (composable hasn't been refactored yet)**

Run: `npx vitest run src/composables/__tests__/useResume.test.js`
Expected: The new `getByType(['work','internship'])` test FAILS. The persistence key test also FAILS (old composable still uses old key). Other tests may also start failing because the composable still reads old keys but test injects new key... Actually no — the old composable reads `resume-data` and `resume-manual-orders` keys which are NOT set by beforeEach (localStorage.clear()). So they'd get empty data. The tests that call `add()` then `getByType()` should still work because they use in-memory state.

Wait — the old composable's `loadEntries` reads `safeStorage.get('resume-data', [])` which returns `[]` (fallback). And `safeStorage.get('resume-seed-version', null)` returns `null`. No seed matches, no data. Entries stays empty. Then `add()` calls `entries.value.push(...)` and `saveEntries()`. `getByType()` filters in-memory. So all old tests should still pass except the persistence key one. 

- [ ] **Step 3: Refactor useResume.js**

Replace `src/composables/useResume.js` entirely:

```js
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
```

- [ ] **Step 4: Run tests, verify all pass**

Run: `npx vitest run src/composables/__tests__/useResume.test.js`
Expected: All 17 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/composables/useResume.js src/composables/__tests__/useResume.test.js
git commit -m "[V1.6.0] refactor: delegate useResume to storageEngine"
```

---

### Task 6: Refactor useResumeLayout.js — Delegate to Engine

**Files:**
- Modify: `src/composables/useResumeLayout.js`
- Modify: `src/composables/__tests__/useResumeLayout.test.js`

**Constraints:** The `reactive` state + `deep watch` auto-persist pattern stays. Only the init load and the watch persist target change to use engine.

- [ ] **Step 1: Read current useResumeLayout.js to confirm changes**

The file at `src/composables/useResumeLayout.js` is already known (164 lines). Key changes:

1. `initialize()` reads from `engine.getLayout()` instead of `safeStorage.get('resume-layout')`
2. The `watch` handler persists via `engine.setLayout(newVal)` instead of `safeStorage.set('resume-layout', ...)`
3. `__resetForTests` calls `engine.__reset()` instead of `safeStorage.remove(STORAGE_KEY)`
4. Import `engine` and `DEFAULT_LAYOUT` from storage module

- [ ] **Step 2: Update useResumeLayout.test.js to use engine key for persistence checks**

Edit `src/composables/__tests__/useResumeLayout.test.js`:

**Change A**: Replace imports and constants at top of file. Find lines 1-6:
```js
import { describe, it, expect, beforeEach } from 'vitest'
import { nextTick } from 'vue'
import { safeStorage } from '../../utils/safeStorage'
import { useResumeLayout, __resetForTests } from '../useResumeLayout'

const STORAGE_KEY = 'resume-layout'
```
Replace with:
```js
import { describe, it, expect, beforeEach } from 'vitest'
import { nextTick } from 'vue'
import { safeStorage } from '../../utils/safeStorage'
import { useResumeLayout, __resetForTests } from '../useResumeLayout'
```

**Change B**: Change beforeEach (currently at line 24-27):
```js
  beforeEach(() => {
    safeStorage.remove(STORAGE_KEY)
    __resetForTests()
  })
```
Replace with:
```js
  beforeEach(() => {
    __resetForTests()
  })
```
(`__resetForTests` now calls `engine.__reset()` internally, which clears the unified key.)

**Change C**: Update the persistence test at line 35-40. Find:
```js
    expect(safeStorage.get(STORAGE_KEY).layout).toBe('two-column')
```
Replace with:
```js
    expect(safeStorage.get('resume-storage-v2').layout.layout).toBe('two-column')
```

**Change D**: Update the reorderBlocks persistence test at line 120-127. Find:
```js
      const stored = safeStorage.get(STORAGE_KEY)
```
Replace with:
```js
      const stored = safeStorage.get('resume-storage-v2').layout
```

- [ ] **Step 3: Refactor useResumeLayout.js**

Replace `src/composables/useResumeLayout.js` entirely:

```js
/**
 * useResumeLayout — 简历布局配置管理（模块级单例）
 *
 * 管理简历的布局模式、区块可见性、主题和发光效果。
 * v1.6.0: 数据读写委托到 storageEngine，保留 reactive + deep watch 自动持久化。
 *
 * 单例模式：所有组件共享同一份布局配置。
 */

import { computed, reactive, readonly, watch } from 'vue'
import { engine } from '../storage/storageEngine'
import { RESUME_THEMES, DEFAULT_THEME_ID } from '../data/resumeThemes'

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
  themeId: DEFAULT_THEME_ID,
  glowEnabled: false,
}

// --- Module-level state (singleton) ---

let _instance = null
let _watcherStop = null

const state = reactive(structuredClone(DEFAULT_LAYOUT))

function mergeLayout(defaults, stored) {
  const result = structuredClone(defaults)
  if (!stored) return result

  for (const key of Object.keys(stored)) {
    if (key === 'blocks' && typeof stored.blocks === 'object' && !Array.isArray(stored.blocks)) {
      for (const blockId of Object.keys(stored.blocks)) {
        if (result.blocks[blockId]) {
          result.blocks[blockId] = { ...result.blocks[blockId], ...stored.blocks[blockId] }
        } else {
          result.blocks[blockId] = stored.blocks[blockId]
        }
      }
    } else {
      result[key] = stored[key]
    }
  }
  return result
}

function initialize() {
  // Ensure engine is initialized first (entries etc.)
  engine.init()

  const stored = engine.getLayout()
  if (stored) {
    Object.assign(state, mergeLayout(DEFAULT_LAYOUT, stored))
  }

  _watcherStop = watch(
    state,
    (newVal) => {
      engine.setLayout(newVal)
    },
    { deep: true }
  )
}

// --- Singleton accessor ---

export function useResumeLayout() {
  if (!_instance) {
    initialize()

    const readonlyState = readonly(state)

    const orderedVisibleBlocks = computed(() => {
      return Object.entries(state.blocks)
        .filter(([, block]) => block.visible)
        .map(([id, block]) => ({ id, ...block }))
        .sort((a, b) => a.order - b.order)
    })

    const themeVars = computed(() => {
      const theme = RESUME_THEMES[state.themeId] || RESUME_THEMES[DEFAULT_THEME_ID]
      return theme ? theme.vars : {}
    })

    function toggleBlock(blockId) {
      const block = state.blocks[blockId]
      if (block) {
        block.visible = !block.visible
      }
    }

    function setLayout(layout) {
      state.layout = layout
    }

    function setTheme(themeId) {
      if (RESUME_THEMES[themeId]) {
        state.themeId = themeId
      }
    }

    function toggleGlow() {
      state.glowEnabled = !state.glowEnabled
    }

    function reorderBlocks(orderedIds) {
      orderedIds.forEach((id, index) => {
        if (state.blocks[id]) {
          state.blocks[id].order = index
        }
      })
    }

    function resetLayout() {
      Object.assign(state, structuredClone(DEFAULT_LAYOUT))
    }

    _instance = {
      state: readonlyState,
      orderedVisibleBlocks,
      themeVars,
      toggleBlock,
      setLayout,
      setTheme,
      toggleGlow,
      reorderBlocks,
      resetLayout,
    }
  }
  return _instance
}

export function __resetForTests() {
  if (_watcherStop) {
    _watcherStop()
    _watcherStop = null
  }
  _instance = null
  Object.assign(state, structuredClone(DEFAULT_LAYOUT))
  engine.__reset()
}
```

- [ ] **Step 4: Run tests, verify all pass**

Run: `npx vitest run src/composables/__tests__/useResumeLayout.test.js`
Expected: All 10 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/composables/useResumeLayout.js src/composables/__tests__/useResumeLayout.test.js
git commit -m "[V1.6.0] refactor: delegate useResumeLayout to storageEngine"
```

---

### Task 7: Fix Internship Display in Portal

**Files:**
- Modify: `src/views/ResumePortal.vue` — `blockProps`, `isBlockEmpty`
- Modify: `src/components/ResumeBlockTimeline.vue` — internship badge in template + CSS

- [ ] **Step 1: Modify ResumePortal.vue — experiences block queries both work + internship**

Edit `src/views/ResumePortal.vue`:

**Change A**: `blockProps('experiences')` at line 157. Find:
```js
    case 'experiences':
      return { label: '工作经历', title: 'Experience', items: resume.getByType('work'), itemType: 'experience', collapsible: true }
```
Replace with:
```js
    case 'experiences':
      return { label: '工作经历', title: 'Experience', items: resume.getByType(['work', 'internship']), itemType: 'experience', collapsible: true }
```

**Change B**: `isBlockEmpty` for experiences at line 117-128. Find:
```js
function isBlockEmpty(blockId) {
  if (blockId === 'profile') return false
  const entryType = BLOCK_TO_ENTRY_TYPE[blockId]
  if (!entryType) return false
  const items = resume.getByType(entryType)
  // education 在 single layout 下同时查 education + certificate
  if (blockId === 'education' && layout.state.layout === 'single') {
    return items.length === 0 && resume.getByType('certificate').length === 0
  }
  return items.length === 0
}
```
Replace with:
```js
function isBlockEmpty(blockId) {
  if (blockId === 'profile') return false
  // experiences 需同时检查 work + internship
  if (blockId === 'experiences') {
    return resume.getByType(['work', 'internship']).length === 0
  }
  const entryType = BLOCK_TO_ENTRY_TYPE[blockId]
  if (!entryType) return false
  const items = resume.getByType(entryType)
  // education 在 single layout 下同时查 education + certificate
  if (blockId === 'education' && layout.state.layout === 'single') {
    return items.length === 0 && resume.getByType('certificate').length === 0
  }
  return items.length === 0
}
```

- [ ] **Step 2: Add internship badge to ResumeBlockTimeline.vue**

Edit `src/components/ResumeBlockTimeline.vue`:

**Change A**: Add badge after `<h3 class="timeline-company">` section (around line 127-136). Find:
```html
              <h3 class="timeline-company">
                <InlineEdit
                  v-if="editable"
                  :model-value="itemType === 'education' ? (item.school || '') : (item.company || '')"
                  :placeholder="itemType === 'education' ? '学校名称' : '公司名称'"
                  :aria-label="itemType === 'education' ? '编辑学校名称' : '编辑公司名称'"
                  @update:model-value="emitUpdate(item.id, itemType === 'education' ? 'school' : 'company', $event)"
                />
                <template v-else>{{ itemType === 'education' ? item.school : item.company }}</template>
              </h3>
```
Replace with:
```html
              <h3 class="timeline-company">
                <InlineEdit
                  v-if="editable"
                  :model-value="itemType === 'education' ? (item.school || '') : (item.company || '')"
                  :placeholder="itemType === 'education' ? '学校名称' : '公司名称'"
                  :aria-label="itemType === 'education' ? '编辑学校名称' : '编辑公司名称'"
                  @update:model-value="emitUpdate(item.id, itemType === 'education' ? 'school' : 'company', $event)"
                />
                <template v-else>{{ itemType === 'education' ? item.school : item.company }}</template>
                <span v-if="item.type === 'internship'" class="internship-badge">实习</span>
              </h3>
```

**Change B**: Add CSS for the badge. In the `<style scoped>` block, add after `.timeline-company` rule (after line 263):
```css
.internship-badge {
  display: inline-block;
  padding: 1px 6px;
  font-size: 11px;
  font-weight: 500;
  color: var(--accent);
  background: color-mix(in srgb, var(--accent) 15%, transparent);
  border-radius: 3px;
  margin-left: 6px;
  vertical-align: middle;
}
```

- [ ] **Step 3: Run golden tests to verify no regressions**

Run: `npx vitest run golden`
Expected: All 11 golden tests PASS (including ResumeBlockTimeline golden test)

- [ ] **Step 4: Commit**

```bash
git add src/views/ResumePortal.vue src/components/ResumeBlockTimeline.vue
git commit -m "[V1.6.0] fix: merge internship into experiences timeline with badge"
```

---

### Task 8: Add Import/Export Buttons to Manage Page

**Files:**
- Modify: `src/views/ResumeManage.vue`

- [ ] **Step 1: Add import/export UI to ResumeManage.vue**

Read `src/views/ResumeManage.vue` first to find the right insertion point for the buttons. The template has a nav area at the top.

Add in the `<script setup>` section (after existing imports):
```js
import { downloadBackup, importAll } from '../storage/backup'
```

Add a file input ref and handler:
```js
const fileInput = ref(null)

function handleExport() {
  downloadBackup()
  pushToast({ message: '数据已导出为 JSON 文件', type: 'success' })
}

function handleImportClick() {
  fileInput.value?.click()
}

function handleFileChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (event) => {
    const result = importAll(event.target.result)
    if (result.success) {
      pushToast({ message: '数据导入成功', type: 'success' })
      // Force refresh by reloading
      window.location.reload()
    } else {
      pushToast({ message: `导入失败: ${result.errors.join(', ')}`, type: 'error' })
    }
  }
  reader.readAsText(file)
  // Reset so same file can be selected again
  e.target.value = ''
}
```

Add in the template, inside the nav/header area (after the existing action buttons):
```html
        <button class="btn btn-ghost" @click="handleExport">
          <span>📥</span> 导出数据
        </button>
        <button class="btn btn-ghost" @click="handleImportClick">
          <span>📤</span> 导入数据
        </button>
        <input
          ref="fileInput"
          type="file"
          accept=".json"
          style="display:none"
          @change="handleFileChange"
        />
```

- [ ] **Step 2: Verify the page compiles and renders**

Since template/style varies by the actual Manage page structure, inspect the current template and place buttons near existing action buttons.

- [ ] **Step 3: Commit**

```bash
git add src/views/ResumeManage.vue
git commit -m "[V1.6.0] feat: add import/export buttons to ResumeManage"
```

---

### Task 9: Final Full Test Run

**Files:** None (verification only)

- [ ] **Step 1: Run golden tests**

Run: `npx vitest run golden`
Expected: All 11 golden tests PASS

- [ ] **Step 2: Run full test suite**

Run: `npx vitest run`
Expected: All tests PASS (existing + new storage tests)

- [ ] **Step 3: Run linter**

Run: `npm run lint`
Expected: No new errors

- [ ] **Step 4: Build check**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 5: Final commit if any lint fixes needed**

```bash
git add -A
git commit -m "[V1.6.0] chore: final lint and test pass for storage engine"
```

---

## Self-Review Checklist

After implementing, verify:
- [ ] `src/storage/schemas.js` — all 7 types defined, normalizeEntry works
- [ ] `src/storage/migration.js` — chain runs correctly, GPA extraction intact
- [ ] `src/storage/storageEngine.js` — init → migrate → seed → normalize → persist
- [ ] `src/storage/backup.js` — importAll rejects bad data, exportAll produces valid JSON
- [ ] `useResume.js` — ALL public API signatures unchanged, getByType accepts array
- [ ] `useResumeLayout.js` — reactive + deep watch pattern preserved
- [ ] `ResumePortal.vue` — experiences queries ['work','internship']
- [ ] `ResumeBlockTimeline.vue` — internship badge renders for type='internship' items
- [ ] `ResumeManage.vue` — import/export buttons functional
- [ ] Old localStorage keys untouched (safe migration)
- [ ] All existing tests pass (no regressions)
- [ ] New tests pass (schemas, migration, engine, backup)
