# Development prompts

The prompts used to build TaskFlow, in the order they were issued.

Each is reproduced **verbatim** as it was sent — original wording, punctuation,
line breaks and typos included. Nothing here has been cleaned up, reworded or
reconstructed after the fact. Where a message contained planning notes as well
as the operative brief, the whole message is shown and the split is noted.

## Summary

| # | Stage | Resulting commit |
| - | ----- | ---------------- |
| 1 | Project setup | `224705e`, `e4255d7` |
| 2 | Main application implementation | `ffbe195` |
| 3 | *(incidental)* open the app in a browser | — |
| 4 | Validation and error handling | `b6fec50` |
| 5 | Accessibility and colour design | `beb7344` |
| 6 | Code review | — (review only, no code changed) |
| 7 | Manual refactoring | `58f96f8` |
| 8 | Testing | `b933b93` |
| 9 | This document | — |

---

## 1. Project setup

```
Create a new React application using Vite in this repo - https://github.com/haffey041707/FlyRank-App.git so afirst add files read to code in mac and in this repo 

Use:

* React
* JavaScript
* Vite
* Tailwind CSS

Do not build the full application yet.

First:

* initialize the project
* install dependencies
* create a clean project structure
* create README.md
* create .gitignore
* make sure npm run dev works

Then show me the project structure and confirm the application runs.
```

**Produced:** Vite + React 19 + Tailwind v4 scaffold, folder structure, README,
`.gitignore`, verified dev server. Commits `224705e` and `e4255d7`.

---

## 2. Main application implementation

The message opened with planning notes before the operative brief; everything
from `Build a complete React task management application called TaskFlow.`
onward is the actual instruction.

```
⸻

Step 2 — Build the actual app and wait for push 

Use a simple complete app. I recommend TaskFlow — Smart Task Manager because it is easy to finish professionally and different enough from your previous settings experiment.

Paste:

Build a complete React task management application called TaskFlow.

Required features:

* Add task
* Edit task
* Delete task
* Mark task complete
* Priority: Low, Medium, High
* Due date
* Search tasks
* Filter by status
* Filter by priority
* Clear completed tasks
* Task statistics
* Save tasks to localStorage
* Restore tasks after refresh

UI requirements:

* Modern professional dashboard
* Responsive mobile and desktop layout
* Clean cards
* Smooth transitions
* Good spacing and typography
* Empty state
* Confirmation before deleting

Use reusable React components.

Do not put the entire application inside App.jsx.

After implementation, run the project and verify that the main task flow works.
```

**Produced:** the full application — `useTasks` / `useLocalStorage` hooks, pure
helpers in `lib/`, presentational primitives in `components/ui/`, and a thin
`App.jsx`. Commit `ffbe195`.

---

## 3. Open the app in a browser *(incidental)*

Not one of the assignment stages, but it was issued here and is included so the
order is complete.

```
open the system oin browser
```

**Produced:** no code changes; the running dev server was opened at
`http://localhost:5173/`.

---

## 4. Validation and error handling

```
Review the TaskFlow application and improve its form validation and resilience.

Add:

* Task title cannot be empty
* Trim whitespace
* Prevent obviously invalid task data
* Handle corrupted localStorage without crashing
* Fall back to empty task data if storage is invalid
* Show useful error messages
* Disable invalid submissions
* Handle missing due dates correctly

After implementation, explain exactly what edge cases you handled.
```

**Produced:** `lib/validation.js` as a shared rule set for both the form and the
storage reader; real calendar-date checking; zero-width and control-character
stripping; duplicate-id repair; surfaced storage-write failures. Commit
`b6fec50`.

---

## 5. Accessibility and colour design

```
Improve the application for accessibility. Ui color design more professional neatly 

Check and implement:

* Semantic HTML
* Accessible form labels
* Keyboard navigation
* Visible focus states
* Accessible buttons
* aria-label for icon-only buttons where needed
* Proper form error announcements
* Sufficient color contrast
* Screen-reader-friendly status messages

Do not change functionality unnecessarily.

Report the accessibility improvements you made.
```

**Produced:** modal focus trap, ARIA radiogroup keyboard pattern, skip link,
heading outline repair, `IconButton` with a required label, live-region
announcements, a `:focus-visible` baseline, and an indigo brand scale with
AA-verified contrast. Commit `beb7344`.

---

## 6. Code review

```
Review all code you generated for this React application as a senior frontend developer.

Do not change anything yet.

Identify specific problems in:

* duplicated code
* overly large components
* accessibility
* state management
* naming
* localStorage handling
* validation
* unnecessary re-renders
* responsive design
* error handling

Give me a list of concrete issues with the relevant file names.
```

**Produced:** a written review only — no code was changed, as instructed. Four
of the findings were confirmed by probing the running app before being reported.

---

## 7. Manual refactoring

```
Now pick at least 3 real issues from the review and fix them.

You can either edit them specifically based on your own review.

For example:

I reviewed the generated code and I want to manually improve these three areas:

1. Move localStorage logic out of App.jsx into a reusable storage utility.
2. Split the large task form/list logic into smaller components.
3. Improve accessible error feedback for the task form.

Apply only these specific refactors.

Do not redesign unrelated parts of the application.

Afterward, explain exactly which files changed and why.

These become your manual improvements evidence.
```

**Produced:** four fixes chosen from the review's own priority list — an error
boundary, the lost-focus-after-delete bug, `TaskCard` memoisation (measured
500 ms → 38 ms), and corrected screen-reader announcements. Commit `58f96f8`.

---

## 8. Testing

```
Add tests using Vitest and React Testing Library.

Test at least:

* Adding a task
* Empty title validation
* Marking a task completed
* Deleting a task
* Filtering tasks
* Restoring tasks from localStorage
* Corrupted localStorage fallback

Run all tests.

Fix genuine failures.

Report the final test results
```

**Produced:** 112 tests across three files, all passing. Six initial failures
were traced to defects in the tests rather than the app and fixed; the suite was
then mutation-tested to confirm it can actually fail. Commit `b933b93`.

---

## 9. This document

```
Create a file named PROMPTS.md.

Document the main prompts used during development in chronological order.

Include:

* project setup prompt
* main application implementation prompt
* validation/error handling prompt
* accessibility prompt
* code review prompt
* manual refactoring prompt
* testing prompt

Use the actual prompts from this development session. Do not invent prompts.
```
