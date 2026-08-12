import { useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { STORAGE_KEY } from '../lib/constants'
import { createTask, normalizeTasks } from '../lib/taskUtils'

/**
 * Owns the task collection and every mutation applied to it.
 * Persistence is handled by useLocalStorage, so components never touch storage.
 */
export function useTasks() {
  const [tasks, setTasks] = useLocalStorage(STORAGE_KEY, [], {
    deserialize: normalizeTasks,
  })

  const addTask = useCallback(
    (draft) => {
      setTasks((current) => [createTask(draft), ...current])
    },
    [setTasks],
  )

  const updateTask = useCallback(
    (id, changes) => {
      setTasks((current) =>
        current.map((task) => (task.id === id ? { ...task, ...changes } : task)),
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

  return { tasks, addTask, updateTask, deleteTask, toggleTask, clearCompleted }
}
