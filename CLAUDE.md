# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Personal dashboard app built with Next.js 16, TypeScript, and Tailwind CSS v4. Shows a live clock with greeting, a random motivational quote, and a localStorage-backed task list.

## Commands

- `npm run dev` — start dev server (http://localhost:3000)
- `npm run build` — production build (uses Turbopack)
- `npm run lint` — run ESLint

## Architecture

- **Next.js App Router** with `src/` directory structure
- **`src/app/`** — layout, global styles, and the single page route (`/`)
- **`src/components/`** — three client components:
  - `Clock.tsx` — live time display with time-of-day greeting, updates every second
  - `Quote.tsx` — picks a random quote on mount from a static array
  - `TaskList.tsx` — CRUD task list persisted to `localStorage` under key `dashboard-tasks`
- All interactive components are `"use client"` — the page itself is a server component that composes them
- Dark theme only, using CSS custom properties defined in `globals.css` and exposed via Tailwind's `@theme inline`

## Notes

- Next.js 16 may differ from training data — check `node_modules/next/dist/docs/` when unsure about APIs
- Tailwind v4 uses `@import "tailwindcss"` and `@theme inline` instead of the v3 `tailwind.config.js` approach
