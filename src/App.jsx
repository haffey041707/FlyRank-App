const stack = [
  { name: 'React', detail: 'UI library' },
  { name: 'Vite', detail: 'Build tool & dev server' },
  { name: 'JavaScript', detail: 'No TypeScript' },
  { name: 'Tailwind CSS', detail: 'Utility-first styling' },
]

export default function App() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-8 px-6 py-16">
      <header className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-widest text-sky-600 dark:text-sky-400">
          Project scaffold
        </p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          FlyRank App
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          The toolchain is wired up and the dev server is running. Nothing has
          been built yet — this page is a placeholder.
        </p>
      </header>

      <ul className="grid gap-3 sm:grid-cols-2">
        {stack.map((item) => (
          <li
            key={item.name}
            className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900"
          >
            <p className="font-semibold">{item.name}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {item.detail}
            </p>
          </li>
        ))}
      </ul>

      <p className="text-sm text-slate-500 dark:text-slate-500">
        Edit <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-slate-800 dark:bg-slate-800 dark:text-slate-200">src/App.jsx</code>{' '}
        to get started.
      </p>
    </main>
  )
}
