'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { MetricSnapshot, SystemInfo } from '@/types/metrics';
import ConnectionBadge from './ConnectionBadge';
import MetricCard from './MetricCard';

const RETRY_DELAYS = [1000, 2000, 4000, 8000];

export default function Dashboard() {
  const [snapshots, setSnapshots] = useState<MetricSnapshot[]>([]);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [status, setStatus] = useState<'connecting' | 'live' | 'reconnecting'>('connecting');

  const esRef = useRef<EventSource | null>(null);
  const retryRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = useCallback(() => {
    setStatus(retryRef.current === 0 ? 'connecting' : 'reconnecting');

    const es = new EventSource('/api/metrics/stream');
    esRef.current = es;

    es.addEventListener('metric', (e: MessageEvent) => {
      const snapshot = JSON.parse(e.data) as MetricSnapshot;
      setSnapshots(prev => [...prev.slice(-59), snapshot]);
      setStatus('live');
      retryRef.current = 0;
    });

    es.onerror = () => {
      es.close();
      const delay = RETRY_DELAYS[Math.min(retryRef.current, RETRY_DELAYS.length - 1)];
      retryRef.current += 1;
      setStatus('reconnecting');
      timeoutRef.current = setTimeout(connect, delay);
    };
  }, []);

  useEffect(() => {
    fetch('/api/metrics/system')
      .then(r => r.json())
      .then(setSystemInfo)
      .catch(() => {/* system info is non-critical */});

    connect();

    return () => {
      esRef.current?.close();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [connect]);

  const latest = snapshots[snapshots.length - 1];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 md:p-6">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold">Dev Tools Dashboard</h1>
        <ConnectionBadge status={status} />
      </header>

      {systemInfo && (
        <div className="text-xs text-gray-500 mb-2">
          {systemInfo.hostname} · {systemInfo.os} · {systemInfo.arch}
        </div>
      )}

      <main className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <MetricCard title="CPU">
          <span className="font-mono text-violet-400 text-2xl">
            {latest ? `${latest.cpu.overall.toFixed(1)}%` : '—'}
          </span>
        </MetricCard>

        <MetricCard title="Memory">
          <span className="font-mono text-sky-400 text-2xl">
            {latest ? `${latest.memory.percentUsed.toFixed(1)}%` : '—'}
          </span>
        </MetricCard>

        <MetricCard title="Network">
          <span className="text-gray-500 text-sm">Network chart coming soon</span>
        </MetricCard>

        <MetricCard title="Disk">
          <span className="text-gray-500 text-sm">Disk usage coming soon</span>
        </MetricCard>
      </main>
    </div>
  );
}
