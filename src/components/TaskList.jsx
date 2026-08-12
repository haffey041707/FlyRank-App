import TaskCard from './TaskCard'

export default function TaskList({ tasks, onToggle, onEdit, onDelete }) {
  return (
    <section aria-labelledby="tasks-heading">
      <h2 id="tasks-heading" className="sr-only">
        Tasks
      </h2>
      {/* A real list, so screen readers announce "list, N items" and support
          list navigation instead of reading a wall of loose cards. */}
      <ul className="grid gap-3 sm:gap-4 xl:grid-cols-2">
        {tasks.map((task) => (
          <li key={task.id}>
            <TaskCard
              task={task}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}
