import { describe, it, expect, beforeEach } from 'vitest'
import { useResume, __resetForTests } from '../useResume'

describe('useResume', () => {
  beforeEach(() => {
    localStorage.clear()
    __resetForTests()
  })

  it('starts with empty entries', () => {
    const { entries } = useResume()
    expect(entries.value).toEqual([])
  })

  it('adds entries', () => {
    const { add, getByType } = useResume()
    add('work', { company: 'TestCorp', position: 'Engineer', startDate: '2024-01' })
    expect(getByType('work')).toHaveLength(1)
  })

  it('sorts entries newest first', () => {
    const { add, getByType } = useResume()
    add('work', { company: 'Old', startDate: '2023-01' })
    add('work', { company: 'New', startDate: '2024-06' })
    const works = getByType('work')
    expect(works[0].company).toBe('New')
  })

  it('removes entries', () => {
    const { add, remove, getByType } = useResume()
    add('work', { company: 'Test', startDate: '2024-01' })
    const works = getByType('work')
    remove(works[0].id)
    expect(getByType('work')).toHaveLength(0)
  })

  it('updates entries', () => {
    const { add, update, getByType } = useResume()
    add('work', { company: 'OldName', startDate: '2024-01' })
    const works = getByType('work')
    update(works[0].id, { company: 'NewName' })
    expect(getByType('work')[0].company).toBe('NewName')
  })

  describe('soft delete & undo (v1.8.0)', () => {
    it('undoRemove restores last removed entry with original id', () => {
      const { add, remove, undoRemove, getByType } = useResume()
      add('work', { company: 'TempCorp', startDate: '2024-01' })
      const works = getByType('work')
      const originalId = works[0].id
      remove(originalId)
      expect(getByType('work')).toHaveLength(0)
      const ok = undoRemove()
      expect(ok).toBe(true)
      const restored = getByType('work')
      expect(restored).toHaveLength(1)
      expect(restored[0].id).toBe(originalId)
      expect(restored[0].company).toBe('TempCorp')
    })

    it('undoRemove returns false after commitRemoval', () => {
      const { add, remove, commitRemoval, undoRemove, getByType } = useResume()
      add('work', { company: 'X', startDate: '2024-01' })
      const id = getByType('work')[0].id
      remove(id)
      commitRemoval()
      expect(undoRemove()).toBe(false)
    })

    it('consecutive removes auto-commit previous, only last is undoable', () => {
      const { add, remove, undoRemove, getByType } = useResume()
      add('work', { company: 'A', startDate: '2024-01' })
      add('work', { company: 'B', startDate: '2024-02' })
      const works = getByType('work') // sorted desc by startDate -> [B, A]
      const idB = works[0].id
      const idA = works[1].id
      remove(idA)
      remove(idB) // auto-commit A
      // 现在两个都被删, 但只有 B (最后一个) 可撤销
      expect(undoRemove()).toBe(true)
      const after = getByType('work')
      expect(after).toHaveLength(1)
      expect(after[0].company).toBe('B')
      // 再次撤销, A 已被 commit, 不可恢复
      expect(undoRemove()).toBe(false)
    })

    it('undoRemove returns false if no pending removal', () => {
      const { undoRemove } = useResume()
      expect(undoRemove()).toBe(false)
    })
  })

  // --- v1.9.0: manual order ---
  describe('setManualOrder / clearManualOrder (v1.9.0)', () => {
    it('setManualOrder 后 getByType 按手动顺序返回', () => {
      const { add, setManualOrder, getByType } = useResume()
      const e1 = add('work', { company: 'Alpha', startDate: '2023-01' })
      const e2 = add('work', { company: 'Beta', startDate: '2024-06' })
      const e3 = add('work', { company: 'Gamma', startDate: '2022-03' })
      // 默认按 startDate desc → Beta, Alpha, Gamma
      expect(getByType('work').map(e => e.company)).toEqual(['Beta', 'Alpha', 'Gamma'])
      // 手动排序 → Gamma, Alpha, Beta
      setManualOrder('work', [e3.id, e1.id, e2.id])
      expect(getByType('work').map(e => e.company)).toEqual(['Gamma', 'Alpha', 'Beta'])
    })

    it('clearManualOrder 恢复 startDate 排序', () => {
      const { add, setManualOrder, clearManualOrder, getByType } = useResume()
      const e1 = add('work', { company: 'Alpha', startDate: '2023-01' })
      const e2 = add('work', { company: 'Beta', startDate: '2024-06' })
      setManualOrder('work', [e1.id, e2.id])
      expect(getByType('work').map(e => e.company)).toEqual(['Alpha', 'Beta'])
      clearManualOrder('work')
      expect(getByType('work').map(e => e.company)).toEqual(['Beta', 'Alpha'])
    })

    it('不同 type 互不影响', () => {
      const { add, setManualOrder, getByType } = useResume()
      const w1 = add('work', { company: 'W1', startDate: '2023' })
      const p1 = add('project', { name: 'P1', startDate: '2022' })
      const p2 = add('project', { name: 'P2', startDate: '2024' })
      setManualOrder('work', [w1.id])
      setManualOrder('project', [p1.id, p2.id])
      expect(getByType('work').map(e => e.company)).toEqual(['W1'])
      expect(getByType('project').map(e => e.name)).toEqual(['P1', 'P2'])
    })

    it('manualOrders 持久化到 storage', () => {
      const { add, setManualOrder } = useResume()
      const e1 = add('work', { company: 'A', startDate: '2024' })
      setManualOrder('work', [e1.id])
      const stored = JSON.parse(localStorage.getItem('resume-storage-v2') || '{}')
      expect(stored.manualOrders.work).toEqual([e1.id])
    })
  })

  // --- v1.9.5: migrateEntries GPA regex fix ---
  describe('migrateEntries (v1.9.5)', () => {
    it('GPA 提取在无分隔符场景下不残留原始文本', () => {
      const { migrateEntries } = useResume()
      const result = migrateEntries([
        { id: 1, type: 'education', school: 'TestU', degree: 'BS', startDate: '2015', description: 'GPA 3.8/4.0 校优秀毕业生' }
      ])
      expect(result[0].gpa).toBe('3.8/4.0')
      expect(result[0].description).toBe('校优秀毕业生')
      expect(result[0].description).not.toMatch(/GPA/i)
    })

    it('GPA 提取在逗号分隔符场景下正确清理', () => {
      const { migrateEntries } = useResume()
      const result = migrateEntries([
        { id: 1, type: 'education', school: 'TestU', degree: 'BS', startDate: '2015', description: 'GPA 3.8/4.0, 校优秀毕业生' }
      ])
      expect(result[0].gpa).toBe('3.8/4.0')
      expect(result[0].description).toBe('校优秀毕业生')
    })

    it('空字符串 field 不被迁移覆盖', () => {
      const { migrateEntries } = useResume()
      const result = migrateEntries([
        { id: 1, type: 'education', school: 'TestU', degree: 'BS', startDate: '2015', description: 'GPA 3.8/4.0 · 研究方向说明', field: '' }
      ])
      // field 为用户刻意清空的空字符串，不应被覆盖
      expect(result[0].field).toBe('')
      // 但 gpa 仍应被提取（gpa 是 undefined，不是空字符串）
      expect(result[0].gpa).toBe('3.8/4.0')
    })

    it('已存在 gpa 字段时不覆盖', () => {
      const { migrateEntries } = useResume()
      const result = migrateEntries([
        { id: 1, type: 'education', school: 'TestU', degree: 'BS', startDate: '2015', description: '用户自己写的描述', field: 'CS', gpa: '4.0 / 4.0' }
      ])
      expect(result[0].gpa).toBe('4.0 / 4.0')
      expect(result[0].field).toBe('CS')
      expect(result[0].description).toBe('用户自己写的描述')
    })

    it('非 education 条目不处理', () => {
      const { migrateEntries } = useResume()
      const result = migrateEntries([
        { id: 1, type: 'work', company: 'A', startDate: '2024', description: 'GPA 3.8/4.0 不含 GPA 字段' }
      ])
      expect(result[0].gpa).toBeUndefined()
      expect(result[0].description).toBe('GPA 3.8/4.0 不含 GPA 字段')
    })
  })

  // --- v1.9.5: loadEntries 分支 3a manualOrders 加载 ---
  describe('loadEntries (v1.9.5)', () => {
    it('版本不匹配 + 空数据时引擎从 legacy keys 迁移但不再注入 seed', () => {
      // 模拟老用户场景：只有旧 key，无统一 key
      localStorage.clear()
      __resetForTests()
      localStorage.removeItem('resume-storage-v2')
      localStorage.setItem('resume-seed-version', 'v0-ancient')
      localStorage.setItem('resume-data', JSON.stringify([]))
      // 清除内存状态，但保留 localStorage
      __resetForTests()
      localStorage.removeItem('resume-storage-v2')
      localStorage.setItem('resume-seed-version', 'v0-ancient')
      const { entries } = useResume()
      // v1.6.0: 旧数据存在（即使是空数组）视为用户已有数据，不注入 seed
      // entries 保持为空，用户可在管理页手动添加
      expect(entries.value.length).toBe(0)
    })
  })

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
})
