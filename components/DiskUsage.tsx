'use client';

import { Fragment } from 'react';
import type { MetricSnapshot } from '@/types/metrics';
import { formatBytes, formatPercent } from '@/lib/format';

interface Props {
  snapshots: MetricSnapshot[];
}

export default function DiskUsage({ snapshots }: Props) {
  const latest = snapshots[snapshots.length - 1];
  const partitions = latest?.disk ?? [];

  if (partitions.length === 0) {
    return <span className="text-gray-500 text-sm">No disk data</span>;
  }

  return (
    <div className="grid gap-y-2 w-full" style={{ gridTemplateColumns: '3.5rem 1fr auto' }}>
      {partitions.map(partition => (
        <Fragment key={partition.mount}>
          <span
            className="text-xs text-gray-500 font-mono self-center truncate"
            title={`${partition.mount} — ${formatBytes(partition.used)} / ${formatBytes(partition.total)} (${formatPercent(partition.percentUsed)})`}
          >
            {partition.mount}
          </span>
          <div className="self-center h-1.5 rounded-full bg-gray-800 overflow-hidden mx-1">
            <div
              className="h-full rounded-full bg-amber-500"
              style={{ width: `${Math.min(100, partition.percentUsed)}%` }}
            />
          </div>
          <span className="text-xs text-gray-400 font-mono text-right self-center whitespace-nowrap">
            {formatBytes(partition.used)} / {formatBytes(partition.total)} · {formatPercent(partition.percentUsed, 0)}
          </span>
        </Fragment>
      ))}
    </div>
  );
}
