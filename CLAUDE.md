# CLAUDE.md

We are building app described in @SPEC.md. Read the file for general architectural tasks, tech stack or application architecture.

Whenever working with any third-party library or something similar, you MUST look up the official documentation to ensure that you're working with up-to date information.
Use the DocsExplorer subagent for efficient documentation lookup.

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev        # Start dev server
pnpm build      # Production build
pnpm lint       # Run ESLint
```

No test suite is configured.

## Architecture

Next.js 16 App Router project (TypeScript, React 19, Tailwind CSS v4). The `@/*` alias maps to the project root.

**Stack:**
- **Routing/rendering**: Next.js App Router — pages in `app/`, layouts via `app/layout.tsx`
- **Styling**: Tailwind CSS v4 (imported via `@import "tailwindcss"` in `globals.css`; theme tokens defined with `@theme inline`)
- **Charts**: Recharts v3
- **System data**: `systeminformation` package for reading host metrics (CPU, memory, etc.)

**Key files:**
- `app/layout.tsx` — root layout with Geist fonts and global CSS
- `app/page.tsx` — home page (currently the Create Next App starter)
- `app/globals.css` — global styles and Tailwind v4 theme tokens
- `next.config.ts` — Next.js config (empty defaults)
- `eslint.config.mjs` — ESLint flat config using `eslint-config-next` core-web-vitals + TypeScript rules

**systeminformation note:** This package reads host OS metrics at runtime and is Node.js-only. Any code using it must run server-side (Server Components, Route Handlers, or Server Actions) — never in client components.
