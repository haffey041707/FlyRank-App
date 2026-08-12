# TaskFlow

A task management dashboard built with React, Vite, and Tailwind CSS. Tasks are
stored in the browser via `localStorage`, so everything survives a refresh with
no backend to run.

## Features

| Area          | What it does                                                        |
| ------------- | ------------------------------------------------------------------- |
| Tasks         | Add, edit, delete, and mark complete                                |
| Priority      | Low / Medium / High, color-coded on each card                       |
| Due dates     | Optional, shown as "Today" / "Tomorrow" / "Mar 15", flagged overdue |
| Search        | Live match across task titles and notes                             |
| Filters       | By status (all / active / completed) and by priority                |
| Bulk actions  | Clear all completed tasks in one step                               |
| Statistics    | Total, active, completed, overdue, and a completion progress bar    |
| Persistence   | Saved to `localStorage` and restored on load                        |

Deleting a task and clearing completed tasks both ask for confirmation first.

## Requirements

- Node.js 20.19+ or 22.12+ (developed on Node 24)
- npm 10+

## Getting started

```bash
git clone https://github.com/haffey041707/FlyRank-App.git
cd FlyRank-App
npm install
npm run dev
```

The dev server prints a local URL (default <http://localhost:5173>).

## Scripts

| Command           | What it does                              |
| ----------------- | ----------------------------------------- |
| `npm run dev`     | Start the Vite dev server with hot reload |
| `npm run build`   | Produce a production build in `dist/`     |
| `npm run preview` | Serve the production build locally        |
| `npm run lint`    | Lint the project with oxlint              |

## Project structure

```
FlyRank-App/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── ui/                 # Presentational primitives, no app knowledge
│   │   │   ├── Badge.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── Field.jsx       # Field wrapper + Input / Textarea / Select
│   │   │   ├── Icons.jsx       # Inline SVG icon set
│   │   │   ├── Modal.jsx       # Portal dialog: escape, scroll lock, focus return
│   │   │   └── SegmentedControl.jsx
│   │   ├── ConfirmDialog.jsx   # Reused by delete and clear-completed
│   │   ├── EmptyState.jsx      # "No tasks yet" and "no filter matches"
│   │   ├── FilterBar.jsx       # Search + status + priority + clear completed
│   │   ├── Header.jsx
│   │   ├── StatCard.jsx
│   │   ├── StatsGrid.jsx
│   │   ├── TaskCard.jsx
│   │   ├── TaskForm.jsx        # Add/edit fields and validation
│   │   ├── TaskFormModal.jsx
│   │   └── TaskList.jsx
│   ├── hooks/
│   │   ├── useLocalStorage.js  # State mirrored into localStorage
│   │   └── useTasks.js         # Task collection + every mutation
│   ├── lib/
│   │   ├── constants.js        # Priority definitions, filter options, storage key
│   │   ├── cx.js               # Class name joiner
│   │   └── taskUtils.js        # Filter, sort, stats, dates, validation
│   ├── App.jsx                 # Composes the dashboard, owns UI state
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js
├── .oxlintrc.json
├── .gitignore
└── package.json
```

## How it fits together

`useTasks` owns the task array and every mutation; it delegates persistence to
`useLocalStorage` so no component touches storage directly. `App.jsx` holds only
UI state — active filters, which modal is open — and derives the visible list
with `filterTasks` → `sortTasks`, both pure functions in `lib/taskUtils.js`.

Anything read back out of `localStorage` is passed through `normalizeTasks`,
which drops malformed records and fills in missing fields. Storage is
user-writable, so hand-edited or corrupt data loads as an empty list rather than
crashing the app.

Tasks sort as: open before completed, then highest priority, then soonest due
date (undated last), then newest.

## Styling

Tailwind v4 is wired in through the official Vite plugin, so there is no
`tailwind.config.js` and no PostCSS config. Everything starts from one line in
`src/index.css`:

```css
@import "tailwindcss";
```

Design tokens and custom animations live in the `@theme` block of that same
file. Light and dark themes both follow the OS setting via `prefers-color-scheme`,
and all motion is disabled under `prefers-reduced-motion`.

Priority colors are stored as complete Tailwind class strings in
`lib/constants.js` — the v4 scanner reads source files literally, so these class
names must never be built by string concatenation.
