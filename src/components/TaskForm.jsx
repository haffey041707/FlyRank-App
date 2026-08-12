import { useId, useState } from 'react'
import Button from './ui/Button'
import SegmentedControl from './ui/SegmentedControl'
import { Field, Input, Textarea } from './ui/Field'
import { PRIORITY_OPTIONS } from '../lib/constants'
import { LIMITS, isUsableDate, validateDraft } from '../lib/validation'
import { todayISO } from '../lib/taskUtils'

/**
 * Add/edit fields for a single task. Mounted with a `key` tied to the task id,
 * so switching which task is being edited remounts it with fresh state instead
 * of needing a sync effect.
 *
 * Validation runs on every render against the current values, but an error is
 * only *shown* once the user has left that field or tried to submit -- nobody
 * wants to be told the title is empty before they have typed anything.
 */
export default function TaskForm({ task, onSubmit, onCancel }) {
  const [values, setValues] = useState(() => ({
    title: task?.title ?? '',
    notes: task?.notes ?? '',
    priority: task?.priority ?? 'medium',
    dueDate: task?.dueDate ?? '',
  }))
  const [touched, setTouched] = useState({})
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const blockedId = useId()
  const priorityLabelId = useId()

  const errors = validateDraft(values)
  const firstError = errors.title ?? errors.notes ?? errors.priority ?? errors.dueDate
  const isBlocked = Boolean(firstError)

  const setField = (field, value) => setValues((current) => ({ ...current, [field]: value }))
  const markTouched = (field) => setTouched((current) => ({ ...current, [field]: true }))
  const errorFor = (field) =>
    touched[field] || submitAttempted ? errors[field] : undefined

  // Past dates are allowed -- you can log something already late -- but say so.
  const dueInPast =
    isUsableDate(values.dueDate) && values.dueDate < todayISO() ? values.dueDate : null

  const handleSubmit = (event) => {
    event.preventDefault()
    setSubmitAttempted(true)
    if (isBlocked) return
    onSubmit(values)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Field
        label="Title"
        error={errorFor('title')}
        hint={values.title ? undefined : 'Required'}
        counter={{ value: values.title.length, max: LIMITS.title }}
      >
        {({ id, invalid, describedBy }) => (
          <Input
            id={id}
            data-autofocus
            value={values.title}
            maxLength={LIMITS.title}
            placeholder="e.g. Draft the Q3 launch plan"
            invalid={invalid}
            describedBy={describedBy}
            onChange={(event) => setField('title', event.target.value)}
            onBlur={() => markTouched('title')}
          />
        )}
      </Field>

      <Field
        label="Notes"
        error={errorFor('notes')}
        hint="Optional"
        counter={{ value: values.notes.length, max: LIMITS.notes }}
      >
        {({ id, invalid, describedBy }) => (
          <Textarea
            id={id}
            rows={3}
            value={values.notes}
            maxLength={LIMITS.notes}
            placeholder="Add any detail worth remembering..."
            invalid={invalid}
            describedBy={describedBy}
            onChange={(event) => setField('notes', event.target.value)}
            onBlur={() => markTouched('notes')}
          />
        )}
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <span
            id={priorityLabelId}
            className="block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Priority
          </span>
          <SegmentedControl
            labelledBy={priorityLabelId}
            options={PRIORITY_OPTIONS}
            value={values.priority}
            onChange={(value) => setField('priority', value)}
            className="w-full"
          />
        </div>

        <Field
          label="Due date"
          error={errorFor('dueDate')}
          warning={dueInPast ? 'That date has passed, so this will show as overdue.' : undefined}
          hint="Optional"
        >
          {({ id, invalid, describedBy }) => (
            <div className="flex items-center gap-2">
              <Input
                id={id}
                type="date"
                value={values.dueDate}
                min={LIMITS.minDate}
                max={LIMITS.maxDate}
                invalid={invalid}
                describedBy={describedBy}
                onChange={(event) => setField('dueDate', event.target.value)}
                onBlur={() => markTouched('dueDate')}
              />
              {values.dueDate && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setField('dueDate', '')
                    markTouched('dueDate')
                  }}
                >
                  Clear
                </Button>
              )}
            </div>
          )}
        </Field>
      </div>

      {/* Announced to screen readers so a disabled button is never a mystery. */}
      <p id={blockedId} className="sr-only" aria-live="polite">
        {isBlocked ? `Cannot save yet: ${firstError}` : ''}
      </p>

      <div className="flex flex-col-reverse items-stretch gap-2 pt-2 sm:flex-row sm:items-center sm:justify-end">
        {/* Visual echo only -- the field's own role="alert" already announced
            the specific problem, and the sr-only region below names it again
            for the disabled button. Repeating it here would be a third read. */}
        {isBlocked && submitAttempted && (
          <p aria-hidden="true" className="mr-auto text-sm text-rose-700 dark:text-rose-400">
            Fix the highlighted field to continue.
          </p>
        )}
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isBlocked} aria-describedby={blockedId}>
          {task ? 'Save changes' : 'Add task'}
        </Button>
      </div>
    </form>
  )
}
