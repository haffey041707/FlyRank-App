import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { CloseIcon } from './Icons'
import { cx } from '../../lib/cx'

const SIZES = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-lg',
}

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

/**
 * Portal dialog with Escape-to-close, backdrop dismiss, background scroll lock,
 * a focus trap, and focus returned to whatever opened it.
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
  icon,
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

  // Visible, focusable children in DOM order. Recomputed per keypress because
  // the form's submit button moves in and out of the list as it enables.
  const focusableItems = useCallback(() => {
    const nodes = panelRef.current?.querySelectorAll(FOCUSABLE)
    return Array.from(nodes ?? []).filter((node) => node.getClientRects().length > 0)
  }, [])

  useEffect(() => {
    if (!open) return undefined

    returnFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null

    const frame = requestAnimationFrame(() => setEntered(true))

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onCloseRef.current()
        return
      }

      if (event.key !== 'Tab') return

      // Keep Tab inside the dialog: a modal that lets focus wander onto the
      // page behind it strands keyboard and screen-reader users.
      const items = focusableItems()
      if (items.length === 0) {
        event.preventDefault()
        panelRef.current?.focus()
        return
      }

      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement

      if (!panelRef.current?.contains(active)) {
        event.preventDefault()
        first.focus()
      } else if (event.shiftKey && active === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
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

      // The opener is often destroyed by the very action the dialog confirmed:
      // deleting a task removes that task's delete button. focus() on a
      // detached node silently does nothing and focus falls to <body>, which
      // sends keyboard users back to the top of the page. Fall back to the
      // element the page nominates instead.
      const opener = returnFocusRef.current
      if (opener?.isConnected) {
        opener.focus()
      } else {
        document.querySelector('[data-modal-focus-fallback]')?.focus()
      }
    }
  }, [open, focusableItems])

  // Move focus into the dialog: the first control marked data-autofocus, or the panel.
  useEffect(() => {
    if (!open) return
    const target = panelRef.current?.querySelector('[data-autofocus]') ?? panelRef.current
    target?.focus()
  }, [open])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      {/* Presentational: Escape and the labelled Close button are the real
          dismiss paths, so this must not appear as a control to assistive tech. */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={cx(
          'absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-200',
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
          'relative max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-900/5 outline-none',
          'transition duration-200 ease-out sm:rounded-2xl dark:bg-slate-900 dark:ring-white/10',
          SIZES[size],
          entered
            ? 'translate-y-0 opacity-100 sm:scale-100'
            : 'translate-y-6 opacity-0 sm:translate-y-0 sm:scale-95',
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3">
            {icon}
            <div className="space-y-1">
              <h2
                id={titleId}
                className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white"
              >
                {title}
              </h2>
              {description && (
                <p
                  id={descriptionId}
                  className="text-sm text-slate-600 dark:text-slate-400"
                >
                  {description}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="-mt-1.5 -mr-1.5 rounded-lg p-1.5 text-slate-500 transition duration-150 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
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
