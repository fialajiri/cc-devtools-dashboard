# Technical Specification – Dev Tools Dashboard

## 1. Overview

A real-time system monitoring web application that displays live CPU, memory, disk, and network metrics in a clean developer-friendly dashboard. Metrics are streamed from a Node.js backend to the browser using Server-Sent Events (SSE) and rendered with interactive charts.

### Core Features

- Real-time CPU usage (overall + per-core)
- Memory usage (total, used, free, percentage)
- Disk usage per partition (used, free, total)
- Network throughput (bytes in/out per second)
- System info panel (OS, hostname, uptime, Node version)
- Live updating line charts with rolling 60-second history
- Auto-reconnect if SSE connection drops

### Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Framework  | Next.js 16.1 (App Router)           |
| Runtime    | Node.js 20+                         |
| Language   | TypeScript                          |
| Styling    | TailwindCSS                         |
| Charts     | Recharts                            |
| System API | `systeminformation` npm package     |
| Streaming  | Server-Sent Events (SSE)            |

---

## 2. Architecture

### 2.1 High-Level Architecture

```
Browser (Next.js frontend)
    │
    │  SSE connection  (GET /api/metrics/stream)
    ▼
Next.js Route Handler (Node.js)
    │
    │  polls every 1s
    ▼
systeminformation + os module
    (CPU, memory, disk, network, system info)
```

- **Frontend:** Next.js App Router with React client components for live charts
- **Backend:** Next.js Route Handler acting as an SSE endpoint
- **Data source:** Node.js `os` module + `systeminformation` package
- **Transport:** SSE — lightweight, uni-directional, no WebSocket overhead

### 2.2 Application Layers

**Presentation layer**
- Next.js pages and React client components
- TailwindCSS for layout and styling
- Recharts for animated, live-updating line charts

**API / streaming layer**
- Single SSE route handler that pushes metric snapshots every second
- One lightweight REST endpoint for static system info (polled once on load)

**Data collection layer**
- `lib/metrics.ts` — wraps `systeminformation` and `os` into typed snapshot functions

---

## 3. Functional Requirements

### 3.1 Metrics Collection

Every **1 second**, the backend collects and emits a `MetricSnapshot`:

```typescript
type MetricSnapshot = {
  timestamp: number;
  cpu: {
    overall: number;       // 0–100 percentage
    cores: number[];       // per-core percentages
  };
  memory: {
    total: number;         // bytes
    used: number;
    free: number;
    percentUsed: number;
  };
  network: {
    bytesIn: number;       // bytes/sec since last tick
    bytesOut: number;
  };
  disk: DiskUsage[];
};

type DiskUsage = {
  fs: string;
  mount: string;
  total: number;
  used: number;
  free: number;
  percentUsed: number;
};
```

### 3.2 System Info (static, fetched once)

```typescript
type SystemInfo = {
  hostname: string;
  os: string;
  platform: string;
  arch: string;
  nodeVersion: string;
  uptime: number;          // seconds, refreshed every 10s
};
```

### 3.3 Frontend Behaviour

- On mount, open an SSE connection to `/api/metrics/stream`
- Maintain a rolling buffer of the **last 60 snapshots** (60 seconds of history)
- On each incoming event, append to buffer and re-render charts
- Display current values prominently (large number + sparkline)
- Auto-reconnect with exponential backoff if connection drops
- Show a "Connecting…" / "Reconnecting…" badge when disconnected

---

## 4. Non-Functional Requirements

| Concern         | Requirement                                                      |
|-----------------|------------------------------------------------------------------|
| Performance     | SSE payload < 1 KB per tick; no DB, no persistence              |
| Latency         | Chart updates feel instant (< 100 ms from collection to render) |
| Reliability     | Auto-reconnect on disconnect; graceful degradation if a metric fails |
| Maintainability | Typed snapshots; metric collection isolated in `lib/metrics.ts` |
| UX              | Dark theme, responsive grid, no page reloads                    |

---

## 5. API Design

### 5.1 `GET /api/metrics/stream`

SSE endpoint. Keeps the connection open and emits events every second.

**Response headers:**
```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

**Event format:**
```
event: metric
data: {"timestamp":1700000000000,"cpu":{"overall":42.3,"cores":[38,45,...]},...}

```

Each event is a JSON-serialized `MetricSnapshot`.

**Behaviour:**
- Starts polling `systeminformation` immediately on connection open
- Clears the interval and closes the stream when the client disconnects

### 5.2 `GET /api/metrics/system`

Returns static system info. Called once on dashboard load.

**Response 200:**
```json
{
  "hostname": "dev-machine",
  "os": "macOS 14.2",
  "platform": "darwin",
  "arch": "arm64",
  "nodeVersion": "v20.11.0",
  "uptime": 86400
}
```

---

## 6. Data Collection Layer

**File:** `lib/metrics.ts`

```typescript
import si from 'systeminformation';
import os from 'os';

export async function getMetricSnapshot(): Promise<MetricSnapshot>
export async function getSystemInfo(): Promise<SystemInfo>
```

### CPU

Use `si.currentLoad()` for overall load and per-core breakdown. Note: `systeminformation` returns CPU load as a percentage already — no manual delta calculation needed.

### Memory

Use `os.totalmem()` / `os.freemem()` (synchronous, cheap).

### Disk

Use `si.fsSize()` — returns an array of partitions with size/used/available.

### Network

Use `si.networkStats()` — returns cumulative bytes; compute delta between ticks manually:

```typescript
let prevNet = await si.networkStats();
// on each tick:
const curr = await si.networkStats();
const bytesIn  = curr[0].rx_bytes - prevNet[0].rx_bytes;
const bytesOut = curr[0].tx_bytes - prevNet[0].tx_bytes;
prevNet = curr;
```

---

## 7. Frontend – Pages & Components

### 7.1 Routes

| Route | Description                  |
|-------|------------------------------|
| `/`   | Main dashboard (only route)  |

### 7.2 Component Tree

```
app/page.tsx  (server component — minimal shell)
└── components/Dashboard.tsx  (client, owns SSE connection + state)
    ├── components/SystemInfoBar.tsx       (hostname, OS, uptime)
    ├── components/MetricCard.tsx          (reusable card wrapper)
    │   ├── components/CpuGauge.tsx        (overall % + per-core bars)
    │   ├── components/MemoryGauge.tsx     (used/total bar)
    │   ├── components/DiskUsage.tsx       (per-partition bars)
    │   └── components/NetworkChart.tsx    (in/out line chart)
    └── components/ConnectionBadge.tsx     (connected / reconnecting)
```

### 7.3 Component Details

#### `Dashboard.tsx`
- `"use client"`
- Manages SSE connection via `useEffect` + `EventSource`
- Holds state: `snapshots: MetricSnapshot[]` (capped at 60), `systemInfo`, `status`
- Passes slices of state down to child components

#### `MetricCard.tsx`
- Reusable wrapper: title, optional subtitle, dark card background
- Accepts `children`

#### `CpuGauge.tsx`
- Large current percentage number
- Recharts `AreaChart` with 60-point rolling history
- Per-core progress bars below the chart

#### `MemoryGauge.tsx`
- Used / Total in human-readable units (GB)
- Recharts `AreaChart` for history
- Progress bar for at-a-glance usage

#### `NetworkChart.tsx`
- Recharts `LineChart` with two series: bytes in (green) + bytes out (blue)
- Y-axis formatted as KB/s or MB/s depending on magnitude

#### `DiskUsage.tsx`
- One progress bar per partition
- Shows mount point, used/total, percentage

#### `SystemInfoBar.tsx`
- Horizontal bar at the top: hostname | OS | arch | Node version | uptime (live counter)

#### `ConnectionBadge.tsx`
- Green dot + "Live" when connected
- Amber dot + "Reconnecting…" when disconnected

---

## 8. State Management

No external state library needed. A single `useState` in `Dashboard.tsx` holds all data:

```typescript
const [snapshots, setSnapshots] = useState<MetricSnapshot[]>([]);
const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
const [status, setStatus] = useState<'connecting' | 'live' | 'reconnecting'>('connecting');
```

On each SSE event:
```typescript
setSnapshots(prev => [...prev.slice(-59), newSnapshot]);
```

---

## 9. Styling

- **Theme:** Dark background (`gray-950` / `gray-900` cards), accent colors per metric
- **Layout:** CSS Grid — 2-column on desktop, 1-column on mobile
- **Colors:**
  - CPU → `violet`
  - Memory → `sky`
  - Network in → `emerald`, out → `blue`
  - Disk → `amber`
- **Typography:** Monospace numbers for live metrics (`font-mono`)
- No external UI library — pure Tailwind utility classes

---

## 10. Error Handling

| Scenario                     | Handling                                                      |
|------------------------------|---------------------------------------------------------------|
| SSE disconnect               | Auto-reconnect with 1s, 2s, 4s backoff; update badge         |
| `systeminformation` failure  | Log error server-side; emit partial snapshot with nulls       |
| Missing metric field         | Components render `—` placeholder instead of crashing        |
| Browser SSE not supported    | Fallback message; unlikely given target audience (devs)       |

---

## 11. Development Workflow

1. `npx create-next-app@latest devtools-dashboard --typescript --tailwind --app` (installs Next.js 16.1)
2. Install dependencies: `npm install systeminformation recharts`
3. Build `lib/metrics.ts` — metric collection functions
4. Implement `app/api/metrics/stream/route.ts` — SSE handler
5. Implement `app/api/metrics/system/route.ts` — system info
6. Build `Dashboard.tsx` with SSE hook and state
7. Build individual metric components (start with `CpuGauge`, `MemoryGauge`)
8. Add `NetworkChart` and `DiskUsage`
9. Wire up `SystemInfoBar` and `ConnectionBadge`
10. Polish: dark theme, responsive grid, number formatting utilities

---

## 12. Project Structure

```
devtools-dashboard/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── api/
│       └── metrics/
│           ├── stream/route.ts
│           └── system/route.ts
├── components/
│   ├── Dashboard.tsx
│   ├── SystemInfoBar.tsx
│   ├── MetricCard.tsx
│   ├── CpuGauge.tsx
│   ├── MemoryGauge.tsx
│   ├── NetworkChart.tsx
│   ├── DiskUsage.tsx
│   └── ConnectionBadge.tsx
├── lib/
│   └── metrics.ts
├── types/
│   └── metrics.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```