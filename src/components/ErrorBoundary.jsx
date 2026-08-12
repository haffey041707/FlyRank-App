import { Component } from 'react'

/**
 * Catches render-time errors so a single bad component cannot blank the page.
 *
 * Every other defence in this app sits at the data layer -- normalizeTasks,
 * sanitizeDraft, the storage try/catch. None of that helps if a component
 * throws while rendering: React unmounts the whole tree and the user is left
 * with a white page, with their tasks apparently gone even though they are
 * still intact in localStorage. This says so explicitly and offers a way out.
 *
 * Must be a class -- there is no hook equivalent for componentDidCatch.
 */
export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    // Kept so the stack is recoverable from the console during development.
    console.error('TaskFlow failed to render:', error, info)
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-16 dark:bg-slate-950">
        <div
          role="alert"
          className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
            Something went wrong
          </h1>

          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            TaskFlow hit an unexpected error and stopped rendering. Your tasks
            are still saved in this browser and should return when you reload.
          </p>

          <button
            type="button"
            onClick={this.handleReload}
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition duration-150 hover:bg-brand-700"
          >
            Reload the page
          </button>

          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-slate-600 dark:text-slate-400">
              Technical details
            </summary>
            <pre className="mt-2 overflow-x-auto rounded-lg bg-slate-100 p-3 text-xs text-slate-800 dark:bg-slate-800 dark:text-slate-200">
              {String(error?.stack || error?.message || error)}
            </pre>
          </details>
        </div>
      </div>
    )
  }
}
