'use client';

import { useEffect, useState } from 'react';
import type { SystemInfo } from '@/types/metrics';
import { formatUptime } from '@/lib/format';

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
