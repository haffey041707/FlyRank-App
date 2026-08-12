import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { CloseIcon } from './Icons'
import { cx } from '../../lib/cx'

const SIZES = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-lg',
}

/**
 * Portal dialog with Escape-to-close, backdrop dismiss, background scroll lock,
 * and focus returned to whatever opened it.
 *
 * The enter transition runs off an `entered` flag flipped on the frame after
 * mount, so the panel animates in from its starting classes. `onClose` is read
 * through a ref so a caller passing an inline arrow function does not retrigger
 * the effect and restart the animation on every render.
 */
export default function Modal({
  open,
  onClose,
  title,
  description,
  size = 'md',
  children,
}) {
  const [entered, setEntered] = useState(false)
  const panelRef = useRef(null)
  const returnFocusRef = useRef(null)
  const onCloseRef = useRef(onClose)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    if (!open) return undefined

    returnFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null

    const frame = requestAnimationFrame(() => setEntered(true))

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onCloseRef.current()
      }
    }
    document.addEventListener('keydown', handleKeyDown)

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      setEntered(false)
      returnFocusRef.current?.focus()
    }
  }, [open])

  // Move focus into the dialog: the first control marked data-autofocus, or the panel.
  useEffect(() => {
    if (!open) return
    const target = panelRef.current?.querySelector('[data-autofocus]') ?? panelRef.current
    target?.focus()
  }, [open])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close dialog"
        onClick={onClose}
        className={cx(
          'absolute inset-0 cursor-default bg-slate-900/50 backdrop-blur-sm transition-opacity duration-200',
          entered ? 'opacity-100' : 'opacity-0',
        )}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cx(
          'relative w-full max-h-[92vh] overflow-y-auto rounded-t-2xl bg-white p-6 shadow-xl outline-none',
          'transition duration-200 ease-out sm:rounded-2xl dark:bg-slate-900',
          SIZES[size],
          entered
            ? 'translate-y-0 opacity-100 sm:scale-100'
            : 'translate-y-6 opacity-0 sm:translate-y-0 sm:scale-95',
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h2
              id={titleId}
              className="text-lg font-semibold text-slate-900 dark:text-white"
            >
              {title}
            </h2>
            {description && (
              <p
                id={descriptionId}
                className="text-sm text-slate-500 dark:text-slate-400"
              >
                {description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-1.5 -mt-1.5 rounded-lg p-1.5 text-slate-400 transition duration-150 hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5">{children}</div>
      </div>
    </div>,
    document.body,
  )
}
