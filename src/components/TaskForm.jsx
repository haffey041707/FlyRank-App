import { useState } from 'react'
import Button from './ui/Button'
import SegmentedControl from './ui/SegmentedControl'
import { Field, Input, Textarea } from './ui/Field'
import { PRIORITY_OPTIONS } from '../lib/constants'

const MAX_TITLE = 120

/**
 * Add/edit fields for a single task. Mounted with a `key` tied to the task id,
 * so switching which task is being edited remounts it with fresh state instead
 * of needing a sync effect.
 */
export default function TaskForm({ task, onSubmit, onCancel }) {
  const [title, setTitle] = useState(task?.title ?? '')
  const [notes, setNotes] = useState(task?.notes ?? '')
  const [priority, setPriority] = useState(task?.priority ?? 'medium')
  const [dueDate, setDueDate] = useState(task?.dueDate ?? '')
  const [error, setError] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()

    const trimmed = title.trim()
    if (!trimmed) {
      setError('Give the task a title.')
      return
    }

    onSubmit({
      title: trimmed.slice(0, MAX_TITLE),
      notes: notes.trim(),
      priority,
      dueDate,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Field label="Title" error={error}>
        {({ id, invalid }) => (
          <Input
            id={id}
            data-autofocus
            value={title}
            maxLength={MAX_TITLE}
            placeholder="e.g. Draft the Q3 launch plan"
            invalid={invalid}
            onChange={(event) => {
              setTitle(event.target.value)
              if (error) setError('')
            }}
          />
        )}
      </Field>

      <Field label="Notes" hint="Optional">
        {({ id }) => (
          <Textarea
            id={id}
            rows={3}
            value={notes}
            placeholder="Add any detail worth remembering..."
            onChange={(event) => setNotes(event.target.value)}
          />
        )}
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <span className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Priority
          </span>
          <SegmentedControl
            label="Priority"
            options={PRIORITY_OPTIONS}
            value={priority}
            onChange={setPriority}
            className="w-full"
          />
        </div>

        <Field label="Due date" hint="Optional">
          {({ id }) => (
            <Input
              id={id}
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
            />
          )}
        </Field>
      </div>

      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{task ? 'Save changes' : 'Add task'}</Button>
      </div>
    </form>
  )
}
