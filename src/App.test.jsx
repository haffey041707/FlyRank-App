import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import { makeTask, readStorage, seedRawStorage, seedStorage } from './test/factories'

/** Render the app and return a configured user-event instance. */
function setup() {
  const user = userEvent.setup()
  return { user, ...render(<App />) }
}

const dialog = () => screen.getByRole('dialog')

/** Walk through the new-task form and submit it. */
async function addTask(user, { title, notes, priority, dueDate } = {}) {
  const opener =
    screen.queryByRole('button', { name: 'Add your first task' }) ??
    screen.getByRole('button', { name: 'New task' })
  await user.click(opener)

  if (title !== undefined) {
    await user.type(within(dialog()).getByLabelText('Title'), title)
  }
  if (notes) {
    await user.type(within(dialog()).getByLabelText('Notes'), notes)
  }
  if (priority) {
    await user.click(within(dialog()).getByRole('radio', { name: priority }))
  }
  if (dueDate) {
    await user.type(within(dialog()).getByLabelText('Due date'), dueDate)
  }

  await user.click(screen.getByRole('button', { name: 'Add task' }))
}

const taskCards = () => screen.queryAllByRole('article')

// ---------------------------------------------------------------------------

describe('adding a task', () => {
  it('shows the new task on a card', async () => {
    const { user } = setup()
    expect(screen.getByText('No tasks yet')).toBeInTheDocument()

    await addTask(user, {
      title: 'Draft the launch plan',
      notes: 'Cover pricing and rollout.',
      priority: 'High',
    })

    expect(screen.getByRole('heading', { name: /Draft the launch plan/ })).toBeInTheDocument()
    expect(screen.getByText('Cover pricing and rollout.')).toBeInTheDocument()
    expect(taskCards()).toHaveLength(1)
  })

  it('closes the dialog and clears the empty state', async () => {
    const { user } = setup()
    await addTask(user, { title: 'Something to do' })

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.queryByText('No tasks yet')).not.toBeInTheDocument()
  })

  it('persists the task to localStorage', async () => {
    const { user } = setup()
    await addTask(user, { title: 'Persist me', priority: 'High' })

    const stored = readStorage()
    expect(stored).toHaveLength(1)
    expect(stored[0]).toMatchObject({ title: 'Persist me', priority: 'high', completed: false })
  })

  it('stores the trimmed title, not what was typed', async () => {
    const { user } = setup()
    await addTask(user, { title: '   Spaced    out   ' })

    expect(readStorage()[0].title).toBe('Spaced out')
  })

  it('records the task the user chose, including priority and due date', async () => {
    const { user } = setup()
    await addTask(user, { title: 'Dated task', priority: 'Low', dueDate: '2026-06-15' })

    expect(readStorage()[0]).toMatchObject({ priority: 'low', dueDate: '2026-06-15' })
  })
})

describe('empty title validation', () => {
  it('disables submit while the title is empty', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: 'Add your first task' }))

    expect(screen.getByRole('button', { name: 'Add task' })).toBeDisabled()
    expect(within(dialog()).getByText('Required')).toBeInTheDocument()
  })

  it('does not accuse the user before they have typed anything', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: 'Add your first task' }))

    expect(screen.queryByText('Give the task a title.')).not.toBeInTheDocument()
  })

  it.each([
    ['spaces only', '   '],
    ['a tab', '\t'],
    ['a zero-width space', '​'],
  ])('rejects %s', async (_label, value) => {
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: 'Add your first task' }))

    const title = within(dialog()).getByLabelText('Title')
    await user.type(title, value)
    await user.tab()

    expect(screen.getByRole('button', { name: 'Add task' })).toBeDisabled()
    expect(taskCards()).toHaveLength(0)
  })

  it('explains the problem once the field is left', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: 'Add your first task' }))

    const title = within(dialog()).getByLabelText('Title')
    await user.type(title, '   ')
    await user.tab()

    const error = within(dialog()).getByText('Give the task a title.')
    expect(error).toBeInTheDocument()
    expect(error).toHaveAttribute('role', 'alert')
    expect(title).toHaveAttribute('aria-invalid', 'true')
    expect(title).toHaveAccessibleDescription('Give the task a title.')
  })

  it('re-enables submit once a real title is typed', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: 'Add your first task' }))

    const title = within(dialog()).getByLabelText('Title')
    await user.type(title, '  ')
    await user.tab()
    expect(screen.getByRole('button', { name: 'Add task' })).toBeDisabled()

    await user.clear(title)
    await user.type(title, 'Now valid')
    expect(screen.getByRole('button', { name: 'Add task' })).toBeEnabled()
  })

  it('will not let an edit blank an existing title', async () => {
    seedStorage([makeTask({ title: 'Original title' })])
    const { user } = setup()

    await user.click(screen.getByRole('button', { name: /^Edit "/ }))
    const title = within(dialog()).getByLabelText('Title')
    await user.clear(title)
    await user.tab()

    expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled()
    expect(readStorage()[0].title).toBe('Original title')
  })
})

describe('marking a task completed', () => {
  it('toggles the checkbox state', async () => {
    seedStorage([makeTask({ title: 'Finish me' })])
    const { user } = setup()

    const checkbox = screen.getByRole('checkbox', { name: 'Mark "Finish me" complete' })
    expect(checkbox).toHaveAttribute('aria-checked', 'false')

    await user.click(checkbox)

    expect(
      screen.getByRole('checkbox', { name: 'Mark "Finish me" active' }),
    ).toHaveAttribute('aria-checked', 'true')
  })

  it('updates the statistics and progress', async () => {
    seedStorage([makeTask({ title: 'A' }), makeTask({ title: 'B' })])
    const { user } = setup()

    expect(screen.getByText(/0 of 2 done/)).toBeInTheDocument()
    await user.click(screen.getByRole('checkbox', { name: 'Mark "A" complete' }))
    expect(screen.getByText(/1 of 2 done/)).toBeInTheDocument()
  })

  it('persists completion across a remount', async () => {
    seedStorage([makeTask({ title: 'Finish me' })])
    const { user } = setup()

    await user.click(screen.getByRole('checkbox', { name: 'Mark "Finish me" complete' }))

    expect(readStorage()[0].completed).toBe(true)
    expect(readStorage()[0].completedAt).toEqual(expect.any(String))
  })

  it('can be toggled back to active', async () => {
    seedStorage([makeTask({ title: 'Finish me', completed: true })])
    const { user } = setup()

    await user.click(screen.getByRole('checkbox', { name: 'Mark "Finish me" active' }))

    expect(readStorage()[0].completed).toBe(false)
    expect(readStorage()[0].completedAt).toBeNull()
  })

  it('announces the change to screen readers', async () => {
    seedStorage([makeTask({ title: 'Finish me' })])
    const { user } = setup()

    await user.click(screen.getByRole('checkbox', { name: 'Mark "Finish me" complete' }))

    expect(screen.getByRole('status')).toHaveTextContent('Finish me marked complete')
  })
})

describe('deleting a task', () => {
  it('asks for confirmation first', async () => {
    seedStorage([makeTask({ title: 'Delete me' })])
    const { user } = setup()

    await user.click(screen.getByRole('button', { name: 'Delete "Delete me"' }))

    expect(screen.getByRole('heading', { name: 'Delete task?' })).toBeInTheDocument()
    expect(taskCards()).toHaveLength(1)
  })

  it('keeps the task when the confirmation is cancelled', async () => {
    seedStorage([makeTask({ title: 'Delete me' })])
    const { user } = setup()

    await user.click(screen.getByRole('button', { name: 'Delete "Delete me"' }))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(taskCards()).toHaveLength(1)
    expect(readStorage()).toHaveLength(1)
  })

  it('removes the task once confirmed', async () => {
    seedStorage([makeTask({ title: 'Delete me' }), makeTask({ title: 'Keep me' })])
    const { user } = setup()

    await user.click(screen.getByRole('button', { name: 'Delete "Delete me"' }))
    await user.click(within(dialog()).getByRole('button', { name: 'Delete task' }))

    expect(screen.queryByRole('heading', { name: /Delete me/ })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Keep me/ })).toBeInTheDocument()
    expect(readStorage()).toHaveLength(1)
  })

  it('clears completed tasks in bulk, after confirming', async () => {
    seedStorage([
      makeTask({ title: 'Done one', completed: true }),
      makeTask({ title: 'Done two', completed: true }),
      makeTask({ title: 'Still open' }),
    ])
    const { user } = setup()

    await user.click(screen.getByRole('button', { name: /Clear completed/ }))
    expect(screen.getByRole('heading', { name: 'Clear completed tasks?' })).toBeInTheDocument()

    await user.click(within(dialog()).getByRole('button', { name: 'Clear completed' }))

    expect(taskCards()).toHaveLength(1)
    expect(readStorage()).toHaveLength(1)
    expect(readStorage()[0].title).toBe('Still open')
  })
})

describe('filtering tasks', () => {
  // "income" rather than "revenue": search matches substrings, and "revenue"
  // contains "venue", which would make the title search below match two tasks.
  const seed = () =>
    seedStorage([
      makeTask({ title: 'Write the report', notes: 'include Q2 income', priority: 'high' }),
      makeTask({ title: 'Book the venue', priority: 'low', completed: true }),
      makeTask({ title: 'Review budget', priority: 'medium' }),
    ])

  it('narrows by search term', async () => {
    seed()
    const { user } = setup()

    await user.type(screen.getByLabelText('Search tasks by title or notes'), 'venue')

    expect(taskCards()).toHaveLength(1)
    expect(screen.getByRole('heading', { name: /Book the venue/ })).toBeInTheDocument()
  })

  it('searches notes as well as titles', async () => {
    seed()
    const { user } = setup()

    await user.type(screen.getByLabelText('Search tasks by title or notes'), 'income')

    expect(taskCards()).toHaveLength(1)
    expect(screen.getByRole('heading', { name: /Write the report/ })).toBeInTheDocument()
  })

  it('shows a distinct empty state when nothing matches', async () => {
    seed()
    const { user } = setup()

    await user.type(screen.getByLabelText('Search tasks by title or notes'), 'nothing matches this')

    expect(screen.getByText('Nothing matches those filters')).toBeInTheDocument()
    expect(screen.queryByText('No tasks yet')).not.toBeInTheDocument()
  })

  it('resets the filters from the empty state', async () => {
    seed()
    const { user } = setup()

    await user.type(screen.getByLabelText('Search tasks by title or notes'), 'zzz')
    await user.click(screen.getByRole('button', { name: 'Reset filters' }))

    expect(taskCards()).toHaveLength(3)
  })

  it('filters by status', async () => {
    seed()
    const { user } = setup()

    await user.click(screen.getByRole('radio', { name: /^Active/ }))
    expect(taskCards()).toHaveLength(2)

    await user.click(screen.getByRole('radio', { name: /^Completed/ }))
    expect(taskCards()).toHaveLength(1)

    await user.click(screen.getByRole('radio', { name: /^All/ }))
    expect(taskCards()).toHaveLength(3)
  })

  it('filters by priority', async () => {
    seed()
    const { user } = setup()
    const select = screen.getByLabelText('Filter by priority')

    await user.selectOptions(select, 'high')
    expect(taskCards()).toHaveLength(1)

    await user.selectOptions(select, 'low')
    expect(taskCards()).toHaveLength(1)

    await user.selectOptions(select, 'all')
    expect(taskCards()).toHaveLength(3)
  })

  it('combines search, status and priority', async () => {
    seed()
    const { user } = setup()

    await user.selectOptions(screen.getByLabelText('Filter by priority'), 'medium')
    await user.click(screen.getByRole('radio', { name: /^Active/ }))
    await user.type(screen.getByLabelText('Search tasks by title or notes'), 'budget')

    expect(taskCards()).toHaveLength(1)
    expect(screen.getByRole('heading', { name: /Review budget/ })).toBeInTheDocument()
  })

  it('reports how many tasks are shown', async () => {
    seed()
    const { user } = setup()

    await user.click(screen.getByRole('radio', { name: /^Completed/ }))
    expect(screen.getByText('1 task shown')).toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: /^All/ }))
    expect(screen.getByText('3 tasks shown')).toBeInTheDocument()
  })
})

describe('restoring tasks from localStorage', () => {
  it('renders tasks saved by a previous session', () => {
    seedStorage([
      makeTask({ title: 'Saved earlier', priority: 'high' }),
      makeTask({ title: 'Also saved', completed: true }),
    ])
    render(<App />)

    expect(screen.getByRole('heading', { name: /Saved earlier/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Also saved/ })).toBeInTheDocument()
    expect(taskCards()).toHaveLength(2)
  })

  it('restores completion state, priority and due dates', () => {
    seedStorage([
      makeTask({ title: 'Restored', priority: 'high', dueDate: '2026-06-15', completed: true }),
    ])
    render(<App />)

    expect(
      screen.getByRole('checkbox', { name: 'Mark "Restored" active' }),
    ).toHaveAttribute('aria-checked', 'true')
    // toHaveTextContent reads the whole subtree: the badge splits the
    // screen-reader prefix and the visible label into separate elements.
    expect(screen.getByRole('article')).toHaveTextContent('Priority: High')
  })

  it('starts empty for a first-time visitor, with no recovery warning', () => {
    render(<App />)

    expect(screen.getByText('No tasks yet')).toBeInTheDocument()
    expect(screen.queryByText(/could not be read/i)).not.toBeInTheDocument()
  })

  it('survives a full add-and-remount round trip', async () => {
    const { user, unmount } = setup()
    await addTask(user, { title: 'Round trip' })

    // Unmount before re-rendering: leaving the first tree mounted would put two
    // copies of the app in the document rather than simulating a reload.
    unmount()
    render(<App />)

    expect(screen.getByRole('heading', { name: /Round trip/ })).toBeInTheDocument()
  })
})

describe('corrupted localStorage fallback', () => {
  it('falls back to an empty list when the JSON will not parse', () => {
    seedRawStorage('{this is not json')
    render(<App />)

    expect(screen.getByRole('heading', { name: 'TaskFlow' })).toBeInTheDocument()
    expect(screen.getByText('No tasks yet')).toBeInTheDocument()
    expect(taskCards()).toHaveLength(0)
  })

  it.each([
    ['an object', '{"tasks":[]}'],
    ['a string', '"hello"'],
    ['a number', '42'],
    ['a boolean', 'true'],
    ['null', 'null'],
  ])('falls back to an empty list when storage holds %s', (_label, raw) => {
    seedRawStorage(raw)
    render(<App />)

    expect(screen.getByText('No tasks yet')).toBeInTheDocument()
  })

  it('tells the user when the saved list was unreadable', () => {
    seedRawStorage('{"tasks":[]}')
    render(<App />)

    expect(screen.getByText(/saved task list was unreadable/i)).toBeInTheDocument()
  })

  it('keeps the good records from a partially corrupt list', () => {
    seedRawStorage(
      JSON.stringify([
        makeTask({ title: 'Survivor one' }),
        null,
        'garbage',
        { title: '' },
        makeTask({ title: 'Survivor two' }),
      ]),
    )
    render(<App />)

    expect(taskCards()).toHaveLength(2)
    expect(screen.getByRole('heading', { name: /Survivor one/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Survivor two/ })).toBeInTheDocument()
    expect(screen.getByText(/3 saved records were incomplete/i)).toBeInTheDocument()
  })

  it('repairs unusable field values rather than dropping the task', () => {
    seedRawStorage(
      JSON.stringify([
        { title: 'Repaired', priority: 'urgent', dueDate: '2026-02-30', completed: 'false' },
      ]),
    )
    render(<App />)

    expect(screen.getByRole('heading', { name: /Repaired/ })).toBeInTheDocument()
    expect(screen.getByRole('article')).toHaveTextContent('Priority: Medium')
    expect(
      screen.getByRole('checkbox', { name: 'Mark "Repaired" complete' }),
    ).toHaveAttribute('aria-checked', 'false')
  })

  it('lets the user dismiss the recovery warning', async () => {
    seedRawStorage('{"tasks":[]}')
    const { user } = setup()

    await user.click(screen.getByRole('button', { name: /^Dismiss/ }))

    expect(screen.queryByText(/could not be read/i)).not.toBeInTheDocument()
  })

  it('stays usable after recovering: a new task can still be added', async () => {
    seedRawStorage('not json at all')
    const { user } = setup()

    await addTask(user, { title: 'Added after recovery' })

    expect(screen.getByRole('heading', { name: /Added after recovery/ })).toBeInTheDocument()
    expect(readStorage()).toHaveLength(1)
  })
})
