import { useCallback, useMemo, useState } from 'react'
import Header from './components/Header'
import StatsGrid from './components/StatsGrid'
import FilterBar from './components/FilterBar'
import TaskList from './components/TaskList'
import EmptyState from './components/EmptyState'
import TaskFormModal from './components/TaskFormModal'
import ConfirmDialog from './components/ConfirmDialog'
import Notice from './components/ui/Notice'
import { useTasks } from './hooks/useTasks'
import { useAnnouncer } from './hooks/useAnnouncer'
import { DEFAULT_FILTERS } from './lib/constants'
import { filterTasks, getStats, sortTasks } from './lib/taskUtils'
import { sanitizeDraft } from './lib/validation'

export default function App() {
  const {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    clearCompleted,
    recovery,
    storageWriteFailed,
  } = useTasks()

  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [formState, setFormState] = useState({ open: false, task: null })
  const [taskPendingDelete, setTaskPendingDelete] = useState(null)
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false)
  const [recoveryDismissed, setRecoveryDismissed] = useState(false)

  // Nothing on screen changes when a task is added or deleted except the list
  // itself, which a screen reader will not read unprompted. This narrates it.
  const [announcement, announce] = useAnnouncer()

  const showRecovery =
    !recoveryDismissed && (recovery.reset || recovery.dropped > 0)

  const stats = useMemo(() => getStats(tasks), [tasks])
  const visibleTasks = useMemo(
    () => sortTasks(filterTasks(tasks, filters)),
    [tasks, filters],
  )

  const openCreateForm = useCallback(() => setFormState({ open: true, task: null }), [])
  const openEditForm = useCallback((task) => setFormState({ open: true, task }), [])
  const closeForm = useCallback(() => setFormState((s) => ({ ...s, open: false })), [])

  const handleSubmit = useCallback(
    (draft) => {
      // Announce what actually gets stored. The raw draft still carries the
      // user's untrimmed spacing, which is not what ends up on the card.
      const { title } = sanitizeDraft(draft)
      if (formState.task) {
        updateTask(formState.task.id, draft)
        announce(`Task updated: ${title || formState.task.title}`)
      } else {
        addTask(draft)
        announce(`Task added: ${title}`)
      }
      closeForm()
    },
    [formState.task, updateTask, addTask, closeForm, announce],
  )

  // Takes the whole task rather than an id: the card already has it, which
  // keeps this callback off the `tasks` array. Depending on `tasks` here gave
  // it a new identity on every mutation and defeated memoisation downstream.
  const handleToggle = useCallback(
    (task) => {
      toggleTask(task.id)
      announce(`${task.title} marked ${task.completed ? 'active' : 'complete'}`)
    },
    [toggleTask, announce],
  )

  const handleConfirmDelete = useCallback(() => {
    if (taskPendingDelete) {
      deleteTask(taskPendingDelete.id)
      announce(`Task deleted: ${taskPendingDelete.title}`)
    }
    setTaskPendingDelete(null)
  }, [taskPendingDelete, deleteTask, announce])

  const handleConfirmClear = useCallback(() => {
    clearCompleted()
    announce(
      `Cleared ${stats.completed} completed ${stats.completed === 1 ? 'task' : 'tasks'}`,
    )
    setClearConfirmOpen(false)
  }, [clearCompleted, stats.completed, announce])

  const resetFilters = useCallback(() => setFilters(DEFAULT_FILTERS), [])

  // Stable identities so the memoised cards and their siblings are not handed
  // a fresh function on every render.
  const openClearConfirm = useCallback(() => setClearConfirmOpen(true), [])
  const closeClearConfirm = useCallback(() => setClearConfirmOpen(false), [])
  const cancelDelete = useCallback(() => setTaskPendingDelete(null), [])
  const dismissRecovery = useCallback(() => setRecoveryDismissed(true), [])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* First thing in the tab order: lets keyboard users jump the header
          instead of tabbing through it on every page load. */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white focus:shadow-lg"
      >
        Skip to main content
      </a>

      <Header onCreate={openCreateForm} />

      {/* Where a dialog sends focus when whatever opened it no longer exists,
          e.g. after deleting the task whose delete button opened the dialog. */}
      <main
        id="main-content"
        tabIndex={-1}
        data-modal-focus-fallback
        className="mx-auto max-w-6xl space-y-5 px-4 py-6 pb-20 outline-none sm:px-6 sm:py-8 lg:px-8"
      >
        {storageWriteFailed && (
          <Notice tone="danger" title="Changes are not being saved">
            This browser is refusing to store data, so anything you add now will
            be lost when you close the tab. Private browsing or a full storage
            quota is the usual cause.
          </Notice>
        )}

        {showRecovery && (
          <Notice
            tone="warning"
            title="Some saved data could not be read"
            onDismiss={dismissRecovery}
          >
            {recovery.reset
              ? 'The saved task list was unreadable, so TaskFlow started fresh.'
              : `${recovery.dropped} saved ${
                  recovery.dropped === 1 ? 'record was' : 'records were'
                } incomplete and could not be restored. Everything else loaded normally.`}
          </Notice>
        )}

        <StatsGrid stats={stats} />

        <FilterBar
          filters={filters}
          onChange={setFilters}
          stats={stats}
          resultCount={visibleTasks.length}
          onClearCompleted={openClearConfirm}
        />

        {tasks.length === 0 ? (
          <EmptyState variant="no-tasks" onAction={openCreateForm} />
        ) : visibleTasks.length === 0 ? (
          <EmptyState variant="no-results" onAction={resetFilters} />
        ) : (
          <TaskList
            tasks={visibleTasks}
            onToggle={handleToggle}
            onEdit={openEditForm}
            onDelete={setTaskPendingDelete}
          />
        )}
      </main>

      {/* Polite: task changes are worth reporting but should never cut off
          whatever the user is currently listening to. */}
      <div role="status" aria-live="polite" className="sr-only">
        {announcement}
      </div>

      <TaskFormModal
        open={formState.open}
        task={formState.task}
        onSubmit={handleSubmit}
        onClose={closeForm}
      />

      <ConfirmDialog
        open={Boolean(taskPendingDelete)}
        title="Delete task?"
        message={
          taskPendingDelete
            ? `"${taskPendingDelete.title}" will be permanently removed. This cannot be undone.`
            : ''
        }
        confirmLabel="Delete task"
        onConfirm={handleConfirmDelete}
        onClose={cancelDelete}
      />

      <ConfirmDialog
        open={clearConfirmOpen}
        title="Clear completed tasks?"
        message={`This removes ${stats.completed} completed ${
          stats.completed === 1 ? 'task' : 'tasks'
        }. This cannot be undone.`}
        confirmLabel="Clear completed"
        onConfirm={handleConfirmClear}
        onClose={closeClearConfirm}
      />
    </div>
  )
}
