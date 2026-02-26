'use client';

import type { MetricSnapshot } from '@/types/metrics';
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  type TooltipContentProps,
} from 'recharts';

interface Props {
  snapshots: MetricSnapshot[];
}

function formatSpeed(bytes: number): string {
  if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB/s';
  return (bytes / 1024).toFixed(1) + ' KB/s';
}

function NetworkTooltip({ active, payload }: TooltipContentProps<number, string>) {
  if (!active || !payload?.length) return null;
  const bytesIn = payload.find(p => p.dataKey === 'bytesIn')?.value ?? 0;
  const bytesOut = payload.find(p => p.dataKey === 'bytesOut')?.value ?? 0;
  return (
    <div className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs font-mono space-y-0.5">
      <div className="text-emerald-400">↓ {formatSpeed(bytesIn)}</div>
      <div className="text-blue-400">↑ {formatSpeed(bytesOut)}</div>
    </div>
  );
}

export default function NetworkChart({ snapshots }: Props) {
  const latest = snapshots[snapshots.length - 1];
  const data = snapshots.map(s => ({ bytesIn: s.network.bytesIn, bytesOut: s.network.bytesOut }));

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex gap-4 font-mono text-sm">
        <span className="text-emerald-400">
          ↓ {latest ? formatSpeed(latest.network.bytesIn) : '—'}
        </span>
        <span className="text-blue-400">
          ↑ {latest ? formatSpeed(latest.network.bytesOut) : '—'}
        </span>
      </div>

      <div className="h-20">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <Tooltip content={NetworkTooltip} />
            <Line
              type="monotone"
              dataKey="bytesIn"
              stroke="#10b981"
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="bytesOut"
              stroke="#3b82f6"
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
