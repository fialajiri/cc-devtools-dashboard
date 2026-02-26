'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { MetricSnapshot, SystemInfo } from '@/types/metrics';
import ConnectionBadge from './ConnectionBadge';
import CpuGauge from './CpuGauge';
import DiskUsage from './DiskUsage';
import MemoryGauge from './MemoryGauge';
import MetricCard from './MetricCard';
import NetworkChart from './NetworkChart';
import SystemInfoBar from './SystemInfoBar';

const RETRY_DELAYS = [1000, 2000, 4000, 8000];

export default function Dashboard() {
  const [snapshots, setSnapshots] = useState<MetricSnapshot[]>([]);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [status, setStatus] = useState<'connecting' | 'live' | 'reconnecting'>('connecting');

  const esRef = useRef<EventSource | null>(null);
  const retryRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const connectRef = useRef<() => void>(() => {});

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
      timeoutRef.current = setTimeout(() => connectRef.current(), delay);
    };
  }, []);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  useEffect(() => {
    fetch('/api/metrics/system')
      .then(r => r.json())
      .then(setSystemInfo)
      .catch(() => {/* system info is non-critical */});

    timeoutRef.current = setTimeout(connect, 0);

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

      <SystemInfoBar systemInfo={systemInfo} />

      <main className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <MetricCard title="CPU">
          <CpuGauge snapshots={snapshots} />
        </MetricCard>

        <MetricCard title="Memory">
          <MemoryGauge snapshots={snapshots} />
        </MetricCard>

        <MetricCard title="Network">
          <NetworkChart snapshots={snapshots} />
        </MetricCard>

        <MetricCard title="Disk">
          <DiskUsage snapshots={snapshots} />
        </MetricCard>
      </main>
    </div>
  );
}
