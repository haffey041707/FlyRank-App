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
| `npm test`        | Run the test suite once (Vitest)          |
| `npm run test:watch` | Re-run tests on change                 |

## Tests

Vitest with React Testing Library and jsdom. 112 tests across three files:

| File | Covers |
| ---- | ------ |
| `src/lib/validation.test.js` | Title cleaning, calendar-date checks, draft validation and sanitising |
| `src/lib/taskUtils.test.js`  | Storage normalising, filtering, sorting, statistics |
| `src/App.test.jsx`           | The app end to end: add, validate, complete, delete, filter, restore, recover |

Tests drive the app the way a user does — by role and label, through
`user-event` — so they exercise the same accessible names the app exposes to
screen readers. A test that cannot find a button by its label is telling you
something real.

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
│   │   │   ├── IconButton.jsx  # Icon-only button; `label` is required
│   │   │   ├── Icons.jsx       # Inline SVG icon set
│   │   │   ├── Modal.jsx       # Portal dialog: focus trap, escape, focus return
│   │   │   ├── Notice.jsx      # Storage / data-recovery banner
│   │   │   └── SegmentedControl.jsx  # ARIA radiogroup w/ roving tabindex
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
│   │   ├── taskUtils.js        # Filter, sort, stats, dates, storage normalising
│   │   └── validation.js       # Field rules, text cleaning, date checks
│   ├── App.jsx                 # Composes the dashboard, owns UI state
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js
├── .oxlintrc.json
├── .gitignore
└── package.json
```

## Accessibility

Built to WCAG 2.1 AA and verified against the running app rather than by eye.

**Structure** — real landmarks (`header`, `main`, `search`, `ul`/`li`, `article`,
`time`), one `h1`, and visually hidden `h2` headings for each section so the
outline never skips a level. Every task `article` is labelled by its own title.

**Keyboard** — a skip link is the first tab stop. The status and priority
pickers follow the ARIA radiogroup pattern: one tab stop with arrow keys, Home
and End moving between options, rather than a tab stop per option. Dialogs trap
Tab and Shift+Tab, take focus on open, close on Escape, and return focus to
whatever opened them.

**Focus** — a `:focus-visible` baseline in `index.css` means no control can ever
end up without a visible ring, including ones added later. Windows High Contrast
Mode falls back to the system focus colour.

**Names** — icon-only buttons go through `IconButton`, which requires a `label`,
so an unlabelled icon button is not expressible. Per-task actions are named for
their task (`Edit "Prepare the board deck"`), because ten identical "Edit task"
buttons tell a screen-reader user nothing about which one they are on.

**Announcements** — form errors carry `role="alert"` and are tied to their input
with `aria-describedby` and `aria-invalid`. A disabled submit button describes
why it is disabled. Adding, editing, completing, deleting, and clearing tasks
are announced through a polite live region, as is the filtered result count.
Storage failures are assertive; recovery summaries are polite.

**Contrast** — all text clears 4.5:1 in both themes, measured from computed
styles. Colour is never the only signal: priority is spelled out in each badge,
and completion is announced as text rather than conveyed by strike-through
alone.

## Validation and resilience

All validation rules live in `lib/validation.js` and are shared by the form and
the storage reader, so a value the form rejects is also a value that cannot
enter the app through storage.

**Form** — the submit button is disabled while the draft is invalid, and each
field explains its own problem. Errors appear only after you leave a field or
try to submit, so an untouched form is never pre-scolded. A title is required
and must survive trimming; notes are optional. Due dates are optional, and a
past date warns without blocking, since logging something already late is
legitimate.

**Titles and notes** are trimmed and cleaned before being stored: whitespace
collapses, control characters are stripped, and zero-width characters are
removed. `"​"` looks blank but survives `String.prototype.trim()`, so a title
made only of it would otherwise pass as valid.

**Dates** are checked as real calendar dates, not just against a format regex.
`2026-02-30` matches `\d{4}-\d{2}-\d{2}` but is not a real day, and `Date` would
silently roll it forward to March 2. Values are round-tripped through `Date` and
compared back, then bounded to 1970–2099.

**Storage** is treated as untrusted input, because it is user-writable. Anything
that is not a well-formed list loads as an empty list, individual malformed
records are dropped while the rest are kept, and repairable fields are repaired
rather than discarded. The user is told when this happens instead of silently
losing rows. A first visit with no stored key is not treated as corruption.

**Failed writes are surfaced.** `setItem` throws on a full quota and in Safari
private mode. Swallowing that leaves someone working in an app that has quietly
stopped saving, so a banner says so explicitly and the app keeps running from
memory.

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
