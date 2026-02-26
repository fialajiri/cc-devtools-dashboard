Create a `SPEC.md` technical specification file for a **real-time developer tools dashboard** — a browser-based system monitor similar to `htop`. The app streams live CPU, memory, disk, and network metrics from a Node.js backend to the browser using Server-Sent Events (SSE), updating every second with a rolling 60-second chart history.

The tech stack is: **Next.js 16.1** (App Router), **TypeScript**, **TailwindCSS**, **Recharts** for charts, and the **`systeminformation`** npm package for collecting system metrics on the backend.

The spec should cover: project overview and core features, architecture (SSE streaming flow), TypeScript types for the metric payloads, both API endpoints (`/api/metrics/stream` and `/api/metrics/system`), the full component tree with descriptions, state management approach, dark theme styling guidelines, error handling, and a step-by-step development workflow.

Be specific and prescriptive — all decisions should already be made so the spec can be handed directly to an AI coding agent to implement without ambiguity. Output only the contents of `SPEC.md`.
