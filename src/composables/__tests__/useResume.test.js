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

  it('handles all 7 types', () => {
    const { add, getByType } = useResume()
    add('work', { company: 'C', startDate: '2024' })
    add('internship', { company: 'I', startDate: '2023' })
    add('project', { name: 'P', startDate: '2024' })
    add('education', { school: 'U', degree: 'BS' })
    add('skill', { skillName: 'Vue' })
    add('certificate', { name: 'AWS' })
    add('profile', { title: 'Dev' })
    expect(getByType('work')).toHaveLength(1)
    expect(getByType('internship')).toHaveLength(1)
    expect(getByType('project')).toHaveLength(1)
    expect(getByType('education')).toHaveLength(1)
    expect(getByType('skill')).toHaveLength(1)
    expect(getByType('certificate')).toHaveLength(1)
    expect(getByType('profile')).toHaveLength(1)
  })
})
