import { describe, it, expect } from 'vitest'
import {
  applyDraft,
  createTask,
  filterTasks,
  formatDueDate,
  getStats,
  isOverdue,
  normalizeTasks,
  sortTasks,
  todayISO,
} from './taskUtils'
import { makeTask } from '../test/factories'

describe('normalizeTasks: contents that are not a task list', () => {
  it.each([
    ['null', null],
    ['a string', 'nope'],
    ['an object', { tasks: [] }],
    ['a number', 7],
    ['a boolean', true],
  ])('treats %s as a reset', (_label, value) => {
    expect(normalizeTasks(value)).toEqual({ tasks: [], dropped: 0, reset: true })
  })

  it('treats an empty array as clean, not as corruption', () => {
    expect(normalizeTasks([])).toEqual({ tasks: [], dropped: 0, reset: false })
  })
})

describe('normalizeTasks: partially corrupt lists', () => {
  it('keeps the good records and counts the rest as dropped', () => {
    const result = normalizeTasks([
      { title: 'Survivor' },
      null,
      'garbage',
      42,
      [],
      { title: '   ' },
      {},
      { notes: 'no title' },
    ])

    expect(result.tasks).toHaveLength(1)
    expect(result.tasks[0].title).toBe('Survivor')
    expect(result.dropped).toBe(7)
    expect(result.reset).toBe(false)
  })

  it('repairs individual fields rather than discarding the record', () => {
    const { tasks } = normalizeTasks([
      {
        title: '  Messy   title  ',
        notes: 42,
        priority: 'urgent',
        dueDate: '2026-02-30',
        completed: 'false',
        createdAt: 'not a date',
      },
    ])

    expect(tasks[0]).toMatchObject({
      title: 'Messy title',
      notes: '',
      priority: 'medium',
      dueDate: '',
      completed: false,
      completedAt: null,
    })
    expect(Number.isNaN(Date.parse(tasks[0].createdAt))).toBe(false)
    expect(tasks[0].id).toBeTruthy()
  })

  it('does not read the string "false" as completed', () => {
    const { tasks } = normalizeTasks([{ title: 'x', completed: 'false' }])
    expect(tasks[0].completed).toBe(false)
  })

  it('reissues duplicate ids so they cannot collide as React keys', () => {
    const { tasks } = normalizeTasks([
      { id: 'same', title: 'First' },
      { id: 'same', title: 'Second' },
      { id: 'same', title: 'Third' },
    ])

    expect(tasks).toHaveLength(3)
    expect(new Set(tasks.map((task) => task.id)).size).toBe(3)
  })
})

describe('due dates', () => {
  it('has no label when there is no due date', () => {
    expect(formatDueDate('')).toBeNull()
    expect(formatDueDate(null)).toBeNull()
    expect(formatDueDate(undefined)).toBeNull()
  })

  it('has no label for a date that does not exist', () => {
    expect(formatDueDate('2026-02-30')).toBeNull()
  })

  it('labels today as "Today"', () => {
    expect(formatDueDate(todayISO())).toBe('Today')
  })

  it('never marks an undated task overdue', () => {
    expect(isOverdue(makeTask({ dueDate: '' }))).toBe(false)
  })

  it('marks an open past-due task overdue', () => {
    expect(isOverdue(makeTask({ dueDate: '1999-01-01' }))).toBe(true)
  })

  it('does not mark a completed past-due task overdue', () => {
    expect(isOverdue(makeTask({ dueDate: '1999-01-01', completed: true }))).toBe(false)
  })
})

describe('filterTasks', () => {
  // "income" rather than "revenue": search is a substring match, and
  // "revenue" contains "venue", which would make the title-search case
  // below match two tasks for the right reason and the wrong one.
  const tasks = [
    makeTask({ title: 'Write the report', notes: 'include Q2 income', priority: 'high' }),
    makeTask({ title: 'Book the venue', priority: 'low', completed: true }),
    makeTask({ title: 'Review budget', priority: 'medium' }),
  ]
  const all = { query: '', status: 'all', priority: 'all' }

  it('returns everything with default filters', () => {
    expect(filterTasks(tasks, all)).toHaveLength(3)
  })

  it('matches on the title', () => {
    expect(filterTasks(tasks, { ...all, query: 'venue' })).toHaveLength(1)
  })

  it('matches on the notes as well as the title', () => {
    const found = filterTasks(tasks, { ...all, query: 'income' })
    expect(found).toHaveLength(1)
    expect(found[0].title).toBe('Write the report')
  })

  it('matches on a substring, not only whole words', () => {
    expect(filterTasks(tasks, { ...all, query: 'budg' })).toHaveLength(1)
  })

  it('ignores case and surrounding whitespace in the query', () => {
    expect(filterTasks(tasks, { ...all, query: '  VENUE  ' })).toHaveLength(1)
  })

  it('filters by status', () => {
    expect(filterTasks(tasks, { ...all, status: 'active' })).toHaveLength(2)
    expect(filterTasks(tasks, { ...all, status: 'completed' })).toHaveLength(1)
  })

  it('filters by priority', () => {
    expect(filterTasks(tasks, { ...all, priority: 'high' })).toHaveLength(1)
  })

  it('combines filters', () => {
    expect(
      filterTasks(tasks, { query: 'e', status: 'active', priority: 'medium' }),
    ).toHaveLength(1)
  })
})

describe('sortTasks', () => {
  it('puts open tasks before completed ones', () => {
    const sorted = sortTasks([
      makeTask({ title: 'Done', completed: true, priority: 'high' }),
      makeTask({ title: 'Open', priority: 'low' }),
    ])
    expect(sorted.map((t) => t.title)).toEqual(['Open', 'Done'])
  })

  it('orders open tasks by priority, highest first', () => {
    const sorted = sortTasks([
      makeTask({ title: 'Low', priority: 'low' }),
      makeTask({ title: 'High', priority: 'high' }),
      makeTask({ title: 'Medium', priority: 'medium' }),
    ])
    expect(sorted.map((t) => t.title)).toEqual(['High', 'Medium', 'Low'])
  })

  it('puts undated tasks after dated ones at the same priority', () => {
    const sorted = sortTasks([
      makeTask({ title: 'Undated', priority: 'high', dueDate: '' }),
      makeTask({ title: 'Dated', priority: 'high', dueDate: '2026-03-01' }),
    ])
    expect(sorted.map((t) => t.title)).toEqual(['Dated', 'Undated'])
  })

  it('does not throw on an unknown priority', () => {
    expect(() => sortTasks([makeTask({ priority: 'ghost' })])).not.toThrow()
  })

  it('does not mutate the input array', () => {
    const input = [makeTask({ priority: 'low' }), makeTask({ priority: 'high' })]
    const copy = [...input]
    sortTasks(input)
    expect(input).toEqual(copy)
  })
})

describe('getStats', () => {
  it('reports zeroes for an empty list without dividing by zero', () => {
    expect(getStats([])).toMatchObject({ total: 0, completed: 0, active: 0, completionRate: 0 })
  })

  it('counts totals, completion and overdue', () => {
    const stats = getStats([
      makeTask({ completed: true }),
      makeTask({ completed: false }),
      makeTask({ completed: false, dueDate: '1999-01-01' }),
      makeTask({ completed: false }),
    ])

    expect(stats).toMatchObject({ total: 4, completed: 1, active: 3, overdue: 1 })
    expect(stats.completionRate).toBe(25)
  })
})

describe('createTask / applyDraft', () => {
  it('sanitizes a draft on creation', () => {
    const task = createTask({ title: '  Hello  ', priority: 'nope', dueDate: 'bad', notes: null })
    expect(task).toMatchObject({
      title: 'Hello',
      priority: 'medium',
      dueDate: '',
      notes: '',
      completed: false,
      completedAt: null,
    })
    expect(task.id).toBeTruthy()
  })

  it('keeps the previous title when an edit would blank it', () => {
    const task = createTask({ title: 'Original', priority: 'high' })
    const edited = applyDraft(task, { title: '   ', priority: 'low', notes: 'kept' })

    expect(edited.title).toBe('Original')
    expect(edited.priority).toBe('low')
    expect(edited.notes).toBe('kept')
    expect(edited.id).toBe(task.id)
  })
})
