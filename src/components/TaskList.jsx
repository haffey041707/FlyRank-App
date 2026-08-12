import TaskCard from './TaskCard'

export default function TaskList({ tasks, onToggle, onEdit, onDelete }) {
  return (
    <ul aria-label="Tasks" className="grid gap-3 sm:gap-4 xl:grid-cols-2">
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
  )
}
