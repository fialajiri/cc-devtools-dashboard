# Claude Code Prompts – Dev Tools Dashboard

---

### 1. Types & Data Collection Layer
```
Create the TypeScript metric types and the data collection layer that reads CPU, memory, disk, and network stats from the system.
```

---

### 2. API Endpoints
```
Create the two API endpoints — the SSE streaming endpoint and the static system info endpoint.
```

---

### 3. Dashboard Shell & Layout
```
Create the main Dashboard client component with the SSE connection, state management, and reconnect logic. Add the MetricCard wrapper and set up the responsive grid layout. Mount everything in the homepage.
```

---

### 4. System Info Bar & Connection Badge
```
Create the SystemInfoBar and ConnectionBadge components and wire them into the Dashboard.
```

---

### 5. CPU & Memory Gauges
```
Create the CpuGauge and MemoryGauge components with live charts and progress bars and add them to the dashboard grid.
```

---

### 6. Network Chart & Disk Usage
```
Create the NetworkChart and DiskUsage components and add them to the dashboard grid.
```

---

### 7. Number Formatting & Error Handling
```
Create a formatting utility for bytes, percentages, and uptime. Apply it across all components and add "—" fallbacks for any missing metric values.
```

---

### 8. Final Polish
```
Make the layout responsive for mobile, add tooltips to all charts, and set the page title and favicon. Do a final pass on spacing and color consistency.
```