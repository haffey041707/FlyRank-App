import { useCallback, useMemo, useState } from 'react'
import Header from './components/Header'
import StatsGrid from './components/StatsGrid'
import FilterBar from './components/FilterBar'
import TaskList from './components/TaskList'
import EmptyState from './components/EmptyState'
import TaskFormModal from './components/TaskFormModal'
import ConfirmDialog from './components/ConfirmDialog'
import { useTasks } from './hooks/useTasks'
import { DEFAULT_FILTERS } from './lib/constants'
import { filterTasks, getStats, sortTasks } from './lib/taskUtils'

export default function App() {
  const { tasks, addTask, updateTask, deleteTask, toggleTask, clearCompleted } =
    useTasks()

  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [formState, setFormState] = useState({ open: false, task: null })
  const [taskPendingDelete, setTaskPendingDelete] = useState(null)
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false)

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
      if (formState.task) {
        updateTask(formState.task.id, draft)
      } else {
        addTask(draft)
      }
      closeForm()
    },
    [formState.task, updateTask, addTask, closeForm],
  )

  const handleConfirmDelete = useCallback(() => {
    if (taskPendingDelete) deleteTask(taskPendingDelete.id)
    setTaskPendingDelete(null)
  }, [taskPendingDelete, deleteTask])

  const handleConfirmClear = useCallback(() => {
    clearCompleted()
    setClearConfirmOpen(false)
  }, [clearCompleted])

  const resetFilters = useCallback(() => setFilters(DEFAULT_FILTERS), [])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header onCreate={openCreateForm} />

      <main className="mx-auto max-w-6xl space-y-5 px-4 py-6 pb-20 sm:px-6 sm:py-8 lg:px-8">
        <StatsGrid stats={stats} />

        <FilterBar
          filters={filters}
          onChange={setFilters}
          stats={stats}
          resultCount={visibleTasks.length}
          onClearCompleted={() => setClearConfirmOpen(true)}
        />

        {tasks.length === 0 ? (
          <EmptyState variant="no-tasks" onAction={openCreateForm} />
        ) : visibleTasks.length === 0 ? (
          <EmptyState variant="no-results" onAction={resetFilters} />
        ) : (
          <TaskList
            tasks={visibleTasks}
            onToggle={toggleTask}
            onEdit={openEditForm}
            onDelete={setTaskPendingDelete}
          />
        )}
      </main>

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
        onClose={() => setTaskPendingDelete(null)}
      />

      <ConfirmDialog
        open={clearConfirmOpen}
        title="Clear completed tasks?"
        message={`This removes ${stats.completed} completed ${
          stats.completed === 1 ? 'task' : 'tasks'
        }. This cannot be undone.`}
        confirmLabel="Clear completed"
        onConfirm={handleConfirmClear}
        onClose={() => setClearConfirmOpen(false)}
      />
    </div>
  )
}
