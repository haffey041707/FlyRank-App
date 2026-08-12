import { useCallback, useRef } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { STORAGE_KEY } from '../lib/constants'
import { applyDraft, createTask, normalizeTasks } from '../lib/taskUtils'

/**
 * Owns the task collection and every mutation applied to it.
 * Persistence is handled by useLocalStorage, so components never touch storage.
 *
 * Also reports how the initial load went (`recovery`) and whether saving is
 * currently failing (`storageWriteFailed`), so the UI can warn instead of
 * quietly losing the user's work.
 */
export function useTasks() {
  // Populated inside the lazy state initializer below. Writing a ref there runs
  // exactly once per mount and is idempotent, so StrictMode's double-invoke
  // produces the same values.
  const recoveryRef = useRef({ dropped: 0, reset: false })

  const [tasks, setTasks, status] = useLocalStorage(STORAGE_KEY, [], {
    deserialize: (parsed) => {
      const { tasks: restored, dropped, reset } = normalizeTasks(parsed)
      recoveryRef.current = { dropped, reset }
      return restored
    },
  })

  const addTask = useCallback(
    (draft) => {
      setTasks((current) => [createTask(draft), ...current])
    },
    [setTasks],
  )

  const updateTask = useCallback(
    (id, draft) => {
      setTasks((current) =>
        current.map((task) => (task.id === id ? applyDraft(task, draft) : task)),
      )
    },
    [setTasks],
  )

  const deleteTask = useCallback(
    (id) => {
      setTasks((current) => current.filter((task) => task.id !== id))
    },
    [setTasks],
  )

  const toggleTask = useCallback(
    (id) => {
      setTasks((current) =>
        current.map((task) => {
          if (task.id !== id) return task
          const completed = !task.completed
          return {
            ...task,
            completed,
            completedAt: completed ? new Date().toISOString() : null,
          }
        }),
      )
    },
    [setTasks],
  )

  const clearCompleted = useCallback(() => {
    setTasks((current) => current.filter((task) => !task.completed))
  }, [setTasks])

  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    clearCompleted,
    recovery: recoveryRef.current,
    storageWriteFailed: status.writeFailed,
  }
}
