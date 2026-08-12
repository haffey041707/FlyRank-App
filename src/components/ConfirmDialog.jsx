import Modal from './ui/Modal'
import Button from './ui/Button'
import { AlertIcon } from './ui/Icons'

/**
 * Reused for both the single-task delete and the clear-completed action.
 *
 * The message is passed as the dialog's `description`, so it is both shown once
 * and announced via aria-describedby when the dialog opens. The destructive
 * button takes initial focus, and Escape or Cancel backs out.
 */
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  onConfirm,
  onClose,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={message}
      size="sm"
      icon={
        <span
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300"
        >
          <AlertIcon className="h-5 w-5" />
        </span>
      }
    >
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="danger" data-autofocus onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
