# AI usage

TaskFlow was built with AI assistance (Claude, via Claude Code). This document
records where AI was used, how its output was checked, and what had to be
corrected afterwards.

The prompts that drove each stage are recorded verbatim in [PROMPTS.md](PROMPTS.md).

## Where AI was used

**Initial project scaffolding** — creating the Vite + React + Tailwind project,
the folder structure, `README.md`, `.gitignore`, and verifying `npm run dev`.

**Component generation** — the component tree in `src/components/`, including
the presentational primitives in `src/components/ui/` (`Button`, `Field`,
`Modal`, `SegmentedControl`, `Badge`, `Notice`, `IconButton`) and the feature
components (`TaskCard`, `TaskForm`, `FilterBar`, `StatsGrid`, `EmptyState`).

**Implementation suggestions** — the split between `useTasks` (owns the task
collection), `useLocalStorage` (owns persistence), and the pure helpers in
`src/lib/`, which keeps filtering, sorting and validation testable in isolation
and out of the components.

**Debugging** — diagnosing failures during development, including a slow npm
install traced to registry latency rather than a bad configuration, and several
test failures traced to the tests rather than the application (see below).

**Accessibility review** — auditing semantics, keyboard behaviour, focus
management, ARIA wiring and colour contrast, then implementing the fixes.

**Test creation** — the Vitest and React Testing Library suite in
`src/App.test.jsx`, `src/lib/validation.test.js` and `src/lib/taskUtils.test.js`.

**Code review** — a structured review of the generated code across duplication,
component size, accessibility, state management, naming, storage handling,
validation, re-renders, responsive design and error handling.

## Generated code was reviewed, not accepted blindly

Output was treated as a draft to be checked, not as a finished answer. Concretely:

- **Claims were verified against the running app before being believed.** The
  code review reported four bugs only after each was reproduced in a browser —
  focus landing on `<body>` after a delete, a live region that stayed silent on
  a repeated message, an announcement carrying the raw untrimmed title, and a
  storage key being written on a first visit.

- **Performance claims were measured, not asserted.** The `TaskCard`
  memoisation was benchmarked against an un-memoised build: 400 tasks, 12 search
  keystrokes, 500 ms → 38 ms.

- **Tooling that disagreed with the code was investigated rather than obeyed.**
  A contrast audit initially reported six failures. The failures were in the
  audit, not the app: Tailwind v4 emits `oklch()`/`oklab()` colours, and the
  checker was parsing those components as RGB. It was rewritten to resolve
  colours through a canvas. A focus-indicator check failed for a similar reason
  — programmatic `.focus()` does not trigger `:focus-visible`, so the check was
  rewritten to use real keyboard tabbing.

- **Failing tests were triaged before anything was changed.** Six of the first
  112 tests failed. All six were defects in the tests; the application was
  correct in each case. They were fixed as test bugs and reported as such rather
  than "fixed" by loosening assertions.

- **The test suite was checked for whether it can fail at all.** Nine mutations
  of the covered behaviour — no-op add, no-op toggle, no-op delete, disabled
  title check, ignored search term, ignored status filter, discarded stored
  data, and two removed guards — were each caught by the suite.

- **A destructive suggestion was deliberately not acted on.** Setup found a
  stray `.git` in the home directory causing `git status` to report the entire
  home folder. It was reported, not deleted, because removing a `.git` is not
  reversible. A dedicated repository was initialised in the project folder
  instead.

## Manual Improvements and Corrections

Every item below is a change made *after* reviewing AI-generated code. Each is
traceable to a commit.

### After the formal code review — commit `58f96f8`

| Files | Correction and reason |
| ----- | --------------------- |
| `src/components/ErrorBoundary.jsx` (new), `src/main.jsx` | No error boundary existed anywhere. All the resilience work sat at the data layer, so any render-time throw blanked the page to white and the user's tasks appeared lost even though they were intact in storage. |
| `src/components/ui/Modal.jsx`, `src/App.jsx` | The dialog restored focus to its opener, but deleting a task destroys that task's own delete button. `focus()` on a detached node silently does nothing, so focus fell to `<body>`. Now checks `isConnected` and falls back to a nominated element. |
| `src/components/TaskCard.jsx`, `src/App.jsx` | Every card re-rendered on every search keystroke. `TaskCard` is now memoised, and `handleToggle` takes the task instead of an id so it no longer depends on the `tasks` array — that dependency would have defeated the memo. |
| `src/hooks/useAnnouncer.js` (new), `src/App.jsx` | `aria-live` only fires on content change, so adding two tasks with the same title announced once. Separately, announcements used the raw draft title and read back untrimmed spacing instead of the stored value. |

### Found while implementing accessibility — commit `beb7344`

| Files | Correction and reason |
| ----- | --------------------- |
| `src/components/ConfirmDialog.jsx`, `src/components/ui/Modal.jsx` | Making the confirm message the dialog's accessible description caused it to render **twice**. `Modal` gained an optional icon slot so the dialog keeps its alert glyph without repeating the text. |
| `src/components/ui/Button.jsx` | Disabled buttons used an opacity wash over a coloured fill, which dropped below contrast minimums and read as "loading" rather than "unavailable". Changed to a solid grey. |
| `src/lib/constants.js` | The selected priority pill used white text on amber, which measures roughly 3:1 and fails AA. Changed to dark text on amber. |
| `src/components/*` (8 light-mode occurrences) | `text-slate-400` measures 2.8:1 on white and was used for body text and every card's edit and delete icon. The 8 light-mode uses were replaced with `slate-500`/`slate-600`. Dark-mode uses of `slate-400` were left alone — on a `slate-900`/`slate-950` background it has ample contrast. One deliberate exception remains: `disabled:text-slate-400` in `Button.jsx`, since WCAG 1.4.3 exempts inactive controls. |
| `src/components/ui/SegmentedControl.jsx` | Had `role="radiogroup"` but not the matching keyboard behaviour — every option was a tab stop and arrow keys did nothing. Implemented roving tabindex with arrow, Home and End keys. |
| `src/components/ui/Modal.jsx` | No focus trap: Tab and Shift+Tab walked out of an open dialog onto the page behind it. |

### Found while hardening validation — commit `b6fec50`

| Files | Correction and reason |
| ----- | --------------------- |
| `src/lib/taskUtils.js` | The due-date check was a format regex only, so `2026-02-30` passed and `Date` silently rolled it forward — the card displayed "Mar 2", a date the user never entered. Replaced with a real calendar-date check. |
| `src/lib/taskUtils.js` | `Boolean(raw.completed)` read a hand-edited `"completed": "false"` as completed, because the string is truthy. Changed to a strict `=== true`. |
| `src/lib/taskUtils.js` | Duplicate ids in stored data collided as React keys, so completing one task struck through another. Ids are now reissued on collision. |
| `src/hooks/useLocalStorage.js` | Write failures were swallowed by an empty `catch`, leaving the user working in an app that had quietly stopped saving. Now surfaced through `status.writeFailed`. |
| `src/lib/validation.js` | The control-character regexes were first written with literal control bytes embedded in the file. Rewritten as `\uXXXX` escapes, with a scoped lint suppression and a comment explaining why matching those characters is the point. |

### Scaffolding cleanup — commits `224705e`, `e4255d7`

| Files | Correction and reason |
| ----- | --------------------- |
| `public/icons.svg`, `src/assets/react.svg` | Template leftovers. Removed after grepping to confirm nothing referenced them. |
| `src/pages/`, `src/assets/` | Empty placeholder directories from the scaffold. Removed once it was settled that the app has no routing and no local asset imports, so the tree matches the documented structure. |

### Test defects — commit `b933b93`

| Files | Correction and reason |
| ----- | --------------------- |
| `src/lib/taskUtils.test.js`, `src/App.test.jsx` | Fixture notes read `"include Q2 revenue"`, and `"revenue"` contains `"venue"`, so a title search correctly matched two tasks. The search was right; the test data was careless. Changed to `"income"`. |
| `src/App.test.jsx` | `getByText` matches an element's own text nodes, but the priority badge splits the screen-reader prefix from the visible label, so `"Priority: High"` never belonged to a single element. Switched to `toHaveTextContent`. |
| `src/App.test.jsx` | A remount test rendered a second `<App />` without unmounting the first, putting two copies in the document. It now unmounts first. |

## Known issues still open

The code review raised more than was fixed. These were left deliberately, to
keep each change set scoped, and remain outstanding:

- No cross-tab synchronisation — two open tabs will overwrite each other's
  storage (`src/hooks/useLocalStorage.js`).
- The task checkbox is a 20 px target, under the 24 × 24 px WCAG 2.2 minimum
  (`src/components/TaskCard.jsx`).
- Tasks stay single-column from 640 px to 1280 px; `xl:grid-cols-2` could be
  `lg:` (`src/components/TaskList.jsx`).
- Two near-identical `ConfirmDialog` instances in `src/App.jsx`, and
  pluralisation inlined in five places.
- Three unreachable validation branches, kept in place because `maxLength` on
  the inputs caps the value before validation sees it (`src/lib/validation.js`).
