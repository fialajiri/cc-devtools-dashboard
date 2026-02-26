'use client';

import { Fragment, useId, useMemo } from 'react';
import type { MetricSnapshot } from '@/types/metrics';
import { formatPercent } from '@/lib/format';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  YAxis,
  type TooltipContentProps,
} from 'recharts';

interface Props {
  snapshots: MetricSnapshot[];
}

function CpuTooltip({ active, payload }: TooltipContentProps<number, string>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs font-mono text-violet-400">
      {formatPercent(payload[0].value)}
    </div>
  );
}

export default function CpuGauge({ snapshots }: Props) {
  const gradientId = useId();
  const latest = snapshots[snapshots.length - 1];
  const data = useMemo(() => snapshots.map(s => ({ value: s.cpu.overall })), [snapshots]);
  const cores = latest?.cpu.cores.slice(0, 8) ?? [];

  return (
    <div className="flex flex-col gap-3 w-full">
      <span className="font-mono text-2xl text-violet-400">
        {formatPercent(latest?.cpu.overall)}
      </span>

      <div className="h-20">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="30%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <YAxis domain={[0, 100]} hide allowDataOverflow />
            <Tooltip content={CpuTooltip} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#8b5cf6"
              strokeWidth={1.5}
              fill={`url(#${gradientId})`}
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {cores.length > 0 && (
        <div className="grid gap-y-1 grid-cols-[3.5rem_1fr_2.5rem]">
          {cores.map((pct, i) => (
            <Fragment key={i}>
              <span className="text-xs text-gray-500 font-mono self-center">
                {`Core ${i}`}
              </span>
              <div className="self-center h-1.5 rounded-full bg-gray-800 overflow-hidden mx-1">
                <div
                  role="progressbar"
                  aria-valuenow={Math.round(pct)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Core ${i} usage`}
                  className="h-full rounded-full bg-violet-500"
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>
              <span className="text-xs text-gray-400 font-mono text-right self-center">
                {formatPercent(pct, 0)}
              </span>
            </Fragment>
          ))}
        </div>
      )}
    </div>
  );
}
