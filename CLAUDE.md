# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install      # install dependencies
npm run dev      # start dev server at http://localhost:5173
npm run build    # production build (output to dist/)
```

There is no test suite or linter configured yet.

## Architecture

This is a single-page React app exported from Figma Make. All application logic lives in one file: **`src/app/App.tsx`**.

### Data model

All state is in-memory via `useState` — nothing persists across page refresh. The core type is `Application`:

```ts
interface Application {
  id: string;
  company: string;
  role: string;
  location: string;
  salary?: string;
  dateAdded: string;        // ISO date string "YYYY-MM-DD"
  tags: WorkType[];         // "Remote" | "Hybrid" | "On-site"
  status: Status;           // drives which kanban column the card lives in
  priority?: Priority;      // "high" | "medium" | "low"
}
```

`COLUMNS` (also in `App.tsx`) is the authoritative ordered list of pipeline stages: `wishlist → applied → phone_screen → interview → offer → rejected`. Each column carries its accent/glow/dim colors — these are used for the left border on cards, the column header dot, the drop-target highlight, and the count badge.

### Component structure

Everything is in `App.tsx` with three internal sub-components at the bottom of the file:
- `AppCard` — individual kanban card; draggable via native HTML5 DnD
- `StatPill` — header stat (Applied / Interviewing / Offers)
- `Field` — thin label wrapper used inside the add-application modal

### Styling

- **Tailwind v4** via `@tailwindcss/vite` (no `tailwind.config.js` — config is in CSS)
- CSS variables defined in `src/styles/theme.css` and mapped to Tailwind tokens via `@theme inline`
- Primary brand color: `#b4ff57` (lime green), background: `#08080c` (near-black) — dark-only theme
- Body font: **Outfit** (sans); monospace accents: **DM Mono** — loaded from Google Fonts in `src/styles/fonts.css`
- Column accent colors and work-type badge colors are defined as plain objects in `App.tsx`, not in CSS

### Path alias

`@` resolves to `src/` (configured in `vite.config.ts`). Use `@/app/components/ui/...` to import shadcn components.

### shadcn/ui components

A full set of shadcn primitives is pre-installed under `src/app/components/ui/`. None are currently used by `App.tsx` (Figma Make generated plain HTML elements instead), but they are available to pull in — prefer them over raw elements when adding new interactive UI.

### Figma asset imports

`vite.config.ts` registers a custom plugin that resolves `figma:asset/<filename>` imports to `src/assets/<filename>`. Use this pattern if adding images from the original Figma file.
