# Repository Guidelines

## Project Structure & Module Organization

This is a Next.js 14 application for planning DSA study dependencies. Keep application routes in `src/app/`; page-level UI belongs alongside its route (for example, `src/app/login/page.tsx`). Reusable React UI lives in `src/components/`, while domain types, graph algorithms, seed data, and Supabase helpers belong in `src/lib/`. Database schema and related maintenance scripts are in `supabase/`. Global styles and Tailwind directives are in `src/app/globals.css`.

Use the `@/*` TypeScript alias for imports from `src`, such as `@/lib/types`.

## Build, Test, and Development Commands

- `npm install` installs project dependencies.
- `npm run dev` starts the local Next.js development server at `http://localhost:3000`.
- `npm run lint` runs the configured Next.js lint check.
- `npm run build` creates a production build and performs type/build validation.
- `npm run start` serves a completed production build.

Run `npm run lint` and `npm run build` before submitting changes. No automated test runner is configured currently; verify changed user flows locally, especially graph filtering, prerequisite locking, and authentication/sync behavior when relevant.

## Coding Style & Naming Conventions

Write TypeScript with strict typing; `tsconfig.json` enables `strict`. Use functional React components, PascalCase component filenames (`GraphCanvas.tsx`), camelCase variables/functions, and descriptive type names. Follow the existing formatting style: two-space indentation, semicolons, and single quotes in configuration and source files where established. Prefer Tailwind utility classes for component styling and keep shared domain logic out of route components.

## Data, Security & Configuration

Supabase credentials are supplied through `.env.local`; use `.env.example` as the template. Never commit real keys or user data. Apply intentional changes to `supabase/schema.sql`, preserving row-level-security expectations and per-user data isolation.

## Commit & Pull Request Guidelines

Recent history uses concise, imperative subjects that describe the outcome, such as `Fix edge connection rendering` or `Add persistent LeetCode handle account linking`. Keep commits focused and use a similar `Add`, `Fix`, `Update`, or `Enforce` style.

Pull requests should explain the user-visible change, note schema/environment changes, link the relevant issue when available, and include screenshots or a short recording for UI/graph changes. State the commands run and any manual verification performed.
