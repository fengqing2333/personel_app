import { describe, it, expect, beforeEach } from 'vitest'
import { useLeave, __resetForTests } from '../useLeave'

describe('useLeave', () => {
  beforeEach(() => {
    localStorage.clear()
    __resetForTests()
  })

  describe('record management', () => {
    it('starts with empty records when localStorage is empty', () => {
      const leave = useLeave()
      expect(leave.records.value).toEqual([])
    })

    it('loads records from localStorage', () => {
      const records = [
        { date: '2025-06-03', type: 'annual' },
        { date: '2025-06-04', type: 'sick' }
      ]
      localStorage.setItem('leave-records', JSON.stringify(records))
      const leave = useLeave()
      expect(leave.records.value).toHaveLength(2)
      expect(leave.records.value[0].type).toBe('annual')
    })

    it('adds a leave record', () => {
      const leave = useLeave()
      leave.addLeave('2025-06-03', 'annual')
      expect(leave.records.value).toHaveLength(1)
      expect(leave.records.value[0]).toEqual({ date: '2025-06-03', type: 'annual' })
    })

    it('adds multiple leave records', () => {
      const leave = useLeave()
      leave.addLeave('2025-06-03', 'annual')
      leave.addLeave('2025-06-05', 'personal')
      leave.addLeave('2025-06-10', 'sick')
      expect(leave.records.value).toHaveLength(3)
    })

    it('removes a leave record by date', () => {
      const leave = useLeave()
      leave.addLeave('2025-06-03', 'annual')
      leave.addLeave('2025-06-04', 'sick')
      leave.removeLeave('2025-06-03')
      expect(leave.records.value).toHaveLength(1)
      expect(leave.records.value[0].date).toBe('2025-06-04')
    })

    it('removing a non-existent date does not change records', () => {
      const leave = useLeave()
      leave.addLeave('2025-06-03', 'annual')
      leave.removeLeave('2025-06-99')
      expect(leave.records.value).toHaveLength(1)
    })

    it('persists records to localStorage after add', () => {
      const leave = useLeave()
      leave.addLeave('2025-06-03', 'annual')
      const stored = JSON.parse(localStorage.getItem('leave-records'))
      expect(stored).toHaveLength(1)
      expect(stored[0].date).toBe('2025-06-03')
    })

    it('persists records to localStorage after remove', () => {
      const leave = useLeave()
      leave.addLeave('2025-06-03', 'annual')
      leave.addLeave('2025-06-04', 'sick')
      leave.removeLeave('2025-06-03')
      const stored = JSON.parse(localStorage.getItem('leave-records'))
      expect(stored).toHaveLength(1)
      expect(stored[0].date).toBe('2025-06-04')
    })
  })

  describe('query methods', () => {
    it('hasLeave returns true when date has leave', () => {
      const leave = useLeave()
      leave.addLeave('2025-06-03', 'annual')
      expect(leave.hasLeave('2025-06-03')).toBe(true)
    })

    it('hasLeave returns false when date has no leave', () => {
      const leave = useLeave()
      leave.addLeave('2025-06-03', 'annual')
      expect(leave.hasLeave('2025-06-04')).toBe(false)
    })

    it('getLeaveByDate returns the record for a date with leave', () => {
      const leave = useLeave()
      leave.addLeave('2025-06-03', 'personal')
      const record = leave.getLeaveByDate('2025-06-03')
      expect(record).toEqual({ date: '2025-06-03', type: 'personal' })
    })

    it('getLeaveByDate returns null for a date without leave', () => {
      const leave = useLeave()
      expect(leave.getLeaveByDate('2025-06-03')).toBeNull()
    })

    it('getLeaveCount counts records for a specific month', () => {
      const leave = useLeave()
      leave.addLeave('2025-06-03', 'annual')
      leave.addLeave('2025-06-10', 'sick')
      leave.addLeave('2025-07-01', 'personal')
      expect(leave.getLeaveCount(2025, 6)).toBe(2)
      expect(leave.getLeaveCount(2025, 7)).toBe(1)
      expect(leave.getLeaveCount(2025, 8)).toBe(0)
    })

    it('getLeaveCount returns 0 for empty records', () => {
      const leave = useLeave()
      expect(leave.getLeaveCount(2025, 6)).toBe(0)
    })
  })

  describe('deduction', () => {
    it('getLeaveDeduction returns 0 when no leave this month', () => {
      const leave = useLeave()
      expect(leave.getLeaveDeduction(400)).toBe(0)
    })

    it('getLeaveDeduction calculates deduction based on daily rate and leave days', () => {
      const leave = useLeave()
      // We add records manually for this month
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      leave.addLeave(`${year}-${month}-03`, 'annual')
      leave.addLeave(`${year}-${month}-10`, 'sick')
      // totalLeaveDaysThisMonth = 2
      // deduction = dailyRate * 2 = 400 * 2 = 800
      expect(leave.getLeaveDeduction(400)).toBe(800)
    })

    it('totalLeaveDaysThisMonth reflects current month count', () => {
      const leave = useLeave()
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      leave.addLeave(`${year}-${month}-01`, 'annual')
      leave.addLeave(`${year}-${month}-15`, 'personal')
      expect(leave.totalLeaveDaysThisMonth.value).toBe(2)
    })
  })
})
