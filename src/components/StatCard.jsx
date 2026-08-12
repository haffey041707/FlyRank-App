import { cx } from '../lib/cx'

const TONES = {
  slate: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  brand: 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300',
  emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  rose: 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
}

/**
 * The number and its label are one statement, so they are read as one phrase
 * rather than as a stray digit followed by unrelated text.
 */
export default function StatCard({ label, value, icon: Icon, tone = 'slate' }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs transition duration-200 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700">
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className={cx(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
            TONES[tone],
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-2xl font-semibold tracking-tight tabular-nums text-slate-900 dark:text-white">
            <span className="sr-only">
              {value} {label}
            </span>
            <span aria-hidden="true">{value}</span>
          </p>
          <p aria-hidden="true" className="truncate text-sm text-slate-600 dark:text-slate-400">
            {label}
          </p>
        </div>
      </div>
    </div>
  )
}
