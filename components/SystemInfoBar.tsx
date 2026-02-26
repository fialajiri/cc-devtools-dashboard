'use client';

import { useEffect, useState } from 'react';
import type { SystemInfo } from '@/types/metrics';

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  const parts: string[] = [];
  if (d > 0) parts.push(`${d}d`);
  if (d > 0 || h > 0) parts.push(`${h}h`);
  if (d > 0 || h > 0 || m > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(' ');
}

export default function SystemInfoBar({ systemInfo }: { systemInfo: SystemInfo | null }) {
  const [liveUptime, setLiveUptime] = useState<number | null>(null);

  useEffect(() => {
    if (!systemInfo) return;
    const base = Math.floor(systemInfo.uptime);
    let elapsed = 0;
    const id = setInterval(() => {
      elapsed += 1;
      setLiveUptime(base + elapsed);
    }, 1000);
    return () => clearInterval(id);
  }, [systemInfo]);

  if (!systemInfo) return null;

  const uptime = liveUptime ?? Math.floor(systemInfo.uptime);

  return (
    <div className="text-xs text-gray-500 mb-2">
      {systemInfo.hostname} · {systemInfo.os} · {systemInfo.arch} · {systemInfo.nodeVersion} · {formatUptime(uptime)}
    </div>
  );
}
