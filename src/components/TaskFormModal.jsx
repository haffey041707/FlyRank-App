import Modal from './ui/Modal'
import TaskForm from './TaskForm'

export default function TaskFormModal({ open, task, onSubmit, onClose }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={task ? 'Edit task' : 'New task'}
      description={
        task ? 'Update the details and save.' : 'Capture what needs doing.'
      }
    >
      <TaskForm
        key={task?.id ?? 'new'}
        task={task}
        onSubmit={onSubmit}
        onCancel={onClose}
      />
    </Modal>
  )
}
