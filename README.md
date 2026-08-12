# FlyRank App

A React single-page application scaffolded with Vite and styled with Tailwind CSS.

> **Status:** project scaffold only. The toolchain, folder structure, and dev server
> are set up — no application features have been built yet.

## Tech stack

| Layer      | Choice                              |
| ---------- | ----------------------------------- |
| UI library | React 19                            |
| Language   | JavaScript (JSX) — no TypeScript    |
| Build tool | Vite                                |
| Styling    | Tailwind CSS v4 (`@tailwindcss/vite`) |
| Linting    | oxlint                              |

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

| Command           | What it does                                  |
| ----------------- | --------------------------------------------- |
| `npm run dev`     | Start the Vite dev server with hot reload     |
| `npm run build`   | Produce a production build in `dist/`         |
| `npm run preview` | Serve the production build locally            |
| `npm run lint`    | Lint the project with oxlint                  |

## Project structure

```
FlyRank-App/
├── public/              # Static files served as-is at the site root
├── src/
│   ├── assets/          # Images, icons, fonts imported by components
│   ├── components/      # Reusable presentational components
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Helpers, API clients, shared utilities
│   ├── pages/           # Route-level / screen components
│   ├── App.jsx          # Root component
│   ├── main.jsx         # Entry point — mounts App into #root
│   └── index.css        # Tailwind import + global base styles
├── index.html           # HTML shell Vite injects the bundle into
├── vite.config.js       # Vite + React + Tailwind plugin config
├── .oxlintrc.json       # Lint rules
├── .gitignore
└── package.json
```

`src/components`, `src/hooks`, `src/lib`, and `src/pages` are currently empty and
hold a `.gitkeep` so git tracks them. Delete the `.gitkeep` once real files land.

## Styling

Tailwind v4 is wired in through the official Vite plugin, so there is no
`tailwind.config.js` and no PostCSS config. Everything starts from a single line
in `src/index.css`:

```css
@import "tailwindcss";
```

Customise design tokens (fonts, colours, spacing) in the `@theme` block of that
same file rather than in a separate config file.
