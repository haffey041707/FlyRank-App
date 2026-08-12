# TaskFlow

A task management dashboard built with React, Vite and Tailwind CSS.

## Overview

TaskFlow is a single-page task manager: capture tasks with a priority and an
optional due date, search and filter them, and track progress from a statistics
panel. Everything is stored in the browser through `localStorage`, so the app
runs with no backend, no build-time configuration and no account — clone it,
install, and it works offline.

The application was built to be robust rather than merely functional. Stored
data is treated as untrusted input and repaired or discarded on load rather than
trusted; the interface is keyboard-operable and screen-reader-friendly
throughout; and behaviour is covered by 112 automated tests.

## Features

| Area | What it does |
| ---- | ------------ |
| Tasks | Add, edit, delete and mark complete |
| Priority | Low / Medium / High, colour-coded and labelled on every card |
| Due dates | Optional, shown as "Today" / "Tomorrow" / "Mar 15", flagged when overdue |
| Search | Live substring match across task titles and notes |
| Filters | By status (all / active / completed) and by priority |
| Bulk actions | Clear all completed tasks in one step |
| Statistics | Total, active, completed and overdue counts, plus a completion progress bar |
| Persistence | Saved to `localStorage` and restored on load |
| Empty states | Distinct messages for "no tasks yet" and "nothing matches these filters" |
| Safety | Confirmation before deleting a task or clearing completed ones |
| Theming | Light and dark, following the operating system setting |

## Tech stack

| Layer | Choice |
| ----- | ------ |
| UI library | React 19 |
| Language | JavaScript (JSX) — no TypeScript |
| Build tool | Vite 8 |
| Styling | Tailwind CSS v4 via `@tailwindcss/vite` |
| Testing | Vitest, React Testing Library, jsdom |
| Linting | oxlint |
| State | React hooks only — no external state library |
| Persistence | Browser `localStorage` |

There are no runtime dependencies beyond `react` and `react-dom`.

## Installation

**Requirements:** Node.js 20.19+ or 22.12+ (developed on Node 24) and npm 10+.

```bash
git clone https://github.com/haffey041707/FlyRank-App.git
cd FlyRank-App
npm install
```

## How to run

```bash
npm run dev
```

The dev server prints a local URL, by default <http://localhost:5173>.

| Command | What it does |
| ------- | ------------ |
| `npm run dev` | Start the Vite dev server with hot reload |
| `npm run build` | Produce a production build in `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm test` | Run the test suite once |
| `npm run test:watch` | Re-run tests on change |
| `npm run lint` | Lint the project with oxlint |

## Project structure

```
FlyRank-App/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── ui/                    # Presentational primitives, no app knowledge
│   │   │   ├── Badge.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── Field.jsx          # Field wrapper + Input / Textarea / Select
│   │   │   ├── IconButton.jsx     # Icon-only button; `label` is required
│   │   │   ├── Icons.jsx          # Inline SVG icon set
│   │   │   ├── Modal.jsx          # Portal dialog: focus trap, escape, focus return
│   │   │   ├── Notice.jsx         # Storage / data-recovery banner
│   │   │   └── SegmentedControl.jsx  # ARIA radiogroup with roving tabindex
│   │   ├── ConfirmDialog.jsx      # Reused by delete and clear-completed
│   │   ├── EmptyState.jsx         # "No tasks yet" and "no filter matches"
│   │   ├── ErrorBoundary.jsx      # Catches render errors instead of blanking the page
│   │   ├── FilterBar.jsx          # Search + status + priority + clear completed
│   │   ├── Header.jsx
│   │   ├── StatCard.jsx
│   │   ├── StatsGrid.jsx
│   │   ├── TaskCard.jsx           # Memoised; the only component that scales with data
│   │   ├── TaskForm.jsx           # Add/edit fields and validation
│   │   ├── TaskFormModal.jsx
│   │   └── TaskList.jsx
│   ├── hooks/
│   │   ├── useAnnouncer.js        # Message state for the polite live region
│   │   ├── useLocalStorage.js     # State mirrored into localStorage
│   │   └── useTasks.js            # The task collection and every mutation
│   ├── lib/
│   │   ├── constants.js           # Priority definitions, filter options, storage key
│   │   ├── cx.js                  # Class name joiner
│   │   ├── taskUtils.js           # Filter, sort, stats, dates, storage normalising
│   │   ├── taskUtils.test.js
│   │   ├── validation.js          # Field rules, text cleaning, date checks
│   │   └── validation.test.js
│   ├── test/
│   │   ├── factories.js           # Task and storage fixtures
│   │   └── setup.js               # jest-dom matchers, storage reset per test
│   ├── App.jsx                    # Composes the dashboard, owns UI state
│   ├── App.test.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js                 # Vite + React + Tailwind, and the Vitest block
├── .oxlintrc.json
├── AI_USAGE.md
├── PROMPTS.md
└── package.json
```

## Architecture

`useTasks` owns the task array and every mutation, delegating persistence to
`useLocalStorage`, so no component touches storage directly. `App.jsx` holds only
UI state — active filters, which dialog is open — and derives the visible list
through `filterTasks` → `sortTasks`, both pure functions in `lib/taskUtils.js`.
Keeping that logic out of components is what makes it directly unit-testable.

Validation rules live in `lib/validation.js` and are shared by the form *and* the
storage reader, so a value the form rejects cannot enter the app through
`localStorage` either.

Tasks sort as: open before completed, then highest priority, then soonest due
date (undated last), then newest.

## Validation and resilience

**Form** — the submit button is disabled while a draft is invalid, and each field
explains its own problem. Errors appear only after a field is left or a submit is
attempted, so an untouched form is never pre-scolded. Titles are required and
must survive trimming; notes and due dates are optional. A past due date warns
without blocking.

**Text cleaning** — titles and notes are trimmed, whitespace collapsed, and
control and zero-width characters stripped. A title made only of `U+200B` looks
blank but survives `String.prototype.trim()`, so it is removed explicitly.

**Dates** — checked as real calendar dates rather than against a format regex.
`2026-02-30` matches `\d{4}-\d{2}-\d{2}` but is not a real day, and `Date` would
silently roll it forward to March 2. Values are round-tripped through `Date` and
compared back, then bounded to 1970–2099.

**Storage** — treated as untrusted input, because it is user-writable. Anything
that is not a well-formed list loads as an empty list; individual malformed
records are dropped while the rest are kept; repairable fields are repaired.
The user is told when data was discarded rather than silently losing rows.

**Failures are surfaced** — `setItem` throws on a full quota and in Safari private
mode, so a banner says changes are not being saved rather than letting someone
work in an app that has quietly stopped persisting. An error boundary catches
render-time errors so a single failure cannot blank the page.

## Accessibility

Built to WCAG 2.1 AA and verified against the running application.

- **Structure** — real landmarks (`header`, `main`, `search`, `ul`/`li`,
  `article`, `time`), one `h1`, and hidden `h2` section headings so the outline
  never skips a level.
- **Keyboard** — a skip link is the first tab stop; the status and priority
  pickers follow the ARIA radiogroup pattern (one tab stop, arrow/Home/End keys);
  dialogs trap Tab, close on Escape, and return focus to whatever opened them.
- **Focus** — a `:focus-visible` baseline in `index.css` means no control can end
  up without a visible ring, with a forced-colors fallback for Windows High
  Contrast Mode.
- **Names** — icon-only buttons go through `IconButton`, which requires a
  `label`. Per-task actions are named for their task (`Edit "Prepare the deck"`)
  so repeated buttons are distinguishable.
- **Announcements** — form errors carry `role="alert"` and are tied to their input
  via `aria-describedby`; task changes and the filtered result count are
  announced through a polite live region.
- **Contrast** — all text clears 4.5:1 in both themes. Colour is never the only
  signal: priority is spelled out in each badge, and completion is announced as
  text rather than conveyed by strike-through alone.

## Testing

Vitest with React Testing Library and jsdom. **112 tests across three files**, all
passing:

| File | Covers |
| ---- | ------ |
| `src/lib/validation.test.js` | Title cleaning, calendar-date checks, draft validation and sanitising |
| `src/lib/taskUtils.test.js` | Storage normalising, filtering, sorting, statistics |
| `src/App.test.jsx` | The app end to end: adding, empty-title validation, completing, deleting, filtering, restoring from `localStorage`, and the corrupted-storage fallback |

```bash
npm test
```

Tests drive the app the way a user does — by role and label, through
`user-event` — so they exercise the same accessible names the app exposes to
assistive technology. A test that cannot find a button by its label is reporting
a real problem.

The suite was also checked for whether it can fail at all: nine deliberate
mutations of the covered behaviour (no-op add, no-op toggle, no-op delete,
disabled title check, ignored search term, ignored status filter, discarded
stored data, and two removed data guards) were each caught.

## AI-assisted development

This project was built with AI assistance (Claude, via Claude Code), used for
project scaffolding, component generation, implementation suggestions, debugging,
accessibility review, test creation and code review.

Generated code was reviewed rather than accepted at face value. Reported bugs
were reproduced in a running browser before being believed; the performance claim
behind memoising `TaskCard` was benchmarked (500 ms → 38 ms over 400 tasks and 12
keystrokes) rather than asserted; and when six tests failed on their first run,
all six were traced to defects in the tests rather than the application and fixed
as such. Tooling that disagreed with the code was investigated too — a contrast
audit reporting six failures turned out to be misparsing Tailwind v4's `oklch()`
colours as RGB, and was rewritten.

A formal review pass produced a list of concrete issues; four were fixed
immediately (a missing error boundary, focus lost after deleting a task,
unnecessary re-renders of every card, and incorrect screen-reader announcements),
and the remainder are documented as open rather than quietly dropped.

Full detail, including every correction with file names and reasons:

- **[AI_USAGE.md](AI_USAGE.md)** — where AI was used, how output was verified, all
  post-review corrections, and the issues that remain open.
- **[PROMPTS.md](PROMPTS.md)** — the prompts that drove each stage, reproduced
  verbatim and mapped to the commits they produced.

## Styling notes

Tailwind v4 is wired in through the official Vite plugin, so there is no
`tailwind.config.js` and no PostCSS config. Everything starts from one line in
`src/index.css`:

```css
@import "tailwindcss";
```

Design tokens, the brand colour scale and custom animations live in the `@theme`
block of that same file. Priority colours are stored as complete Tailwind class
strings in `lib/constants.js` — the v4 scanner reads source files literally, so
these class names must never be built by string concatenation, or the styles will
work in development and vanish from the production build.
