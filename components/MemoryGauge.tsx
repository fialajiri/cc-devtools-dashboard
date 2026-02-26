'use client';

import type { MetricSnapshot } from '@/types/metrics';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  type TooltipContentProps,
} from 'recharts';

interface Props {
  snapshots: MetricSnapshot[];
}

function formatBytes(bytes: number) {
  return (bytes / 1024 ** 3).toFixed(1) + ' GB';
}

function MemTooltip({ active, payload }: TooltipContentProps<number, string>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs font-mono text-sky-400">
      {payload[0].value?.toFixed(1)}%
    </div>
  );
}

export default function MemoryGauge({ snapshots }: Props) {
  const latest = snapshots[snapshots.length - 1];
  const data = snapshots.map(s => ({ value: s.memory.percentUsed }));
  const pct = latest ? Math.min(100, latest.memory.percentUsed) : 0;

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-2xl text-sky-400">
          {latest ? `${latest.memory.percentUsed.toFixed(1)}%` : '—'}
        </span>
        {latest && (
          <span className="text-xs text-gray-500 font-mono">
            {formatBytes(latest.memory.used)} / {formatBytes(latest.memory.total)}
          </span>
        )}
      </div>

      <div className="h-20">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="memGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="30%" stopColor="#0ea5e9" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Tooltip content={MemTooltip} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#0ea5e9"
              strokeWidth={1.5}
              fill="url(#memGradient)"
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {latest && (
        <div className="flex flex-col gap-1">
          <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-sky-500 transition-[width] duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-600 font-mono">
            <span>0</span>
            <span>{formatBytes(latest.memory.total)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
