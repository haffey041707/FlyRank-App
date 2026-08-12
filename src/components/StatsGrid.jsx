import StatCard from './StatCard'
import { AlertIcon, CheckCircleIcon, CircleIcon, ListIcon } from './ui/Icons'

export default function StatsGrid({ stats }) {
  return (
    <section aria-label="Task statistics" className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label="Total tasks" value={stats.total} icon={ListIcon} tone="slate" />
        <StatCard label="Active" value={stats.active} icon={CircleIcon} tone="sky" />
        <StatCard
          label="Completed"
          value={stats.completed}
          icon={CheckCircleIcon}
          tone="emerald"
        />
        <StatCard label="Overdue" value={stats.overdue} icon={AlertIcon} tone="rose" />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-baseline justify-between gap-4">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Progress
          </p>
          <p className="text-sm text-slate-500 tabular-nums dark:text-slate-400">
            {stats.completed} of {stats.total} done
            <span className="ml-2 font-semibold text-slate-900 dark:text-white">
              {stats.completionRate}%
            </span>
          </p>
        </div>

        <div
          className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"
          role="progressbar"
          aria-valuenow={stats.completionRate}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Completion rate"
        >
          <div
            className="h-full rounded-full bg-emerald-500 transition-[width] duration-500 ease-out"
            style={{ width: `${stats.completionRate}%` }}
          />
        </div>

        {stats.dueToday > 0 && (
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            {stats.dueToday} {stats.dueToday === 1 ? 'task is' : 'tasks are'} due today.
          </p>
        )}
      </div>
    </section>
  )
}
