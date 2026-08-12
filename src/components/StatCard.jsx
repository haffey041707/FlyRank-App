import { cx } from '../lib/cx'

export default function StatCard({ label, value, icon: Icon, tone = 'slate' }) {
  const tones = {
    slate: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    sky: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
    emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    rose: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition duration-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-3">
        <span
          className={cx(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
            tones[tone],
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-2xl font-semibold tabular-nums text-slate-900 dark:text-white">
            {value}
          </p>
          <p className="truncate text-sm text-slate-500 dark:text-slate-400">{label}</p>
        </div>
      </div>
    </div>
  )
}
