import type { ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  children: ReactNode;
}

export default function MetricCard({ title, children }: MetricCardProps) {
  return (
    <div className="bg-gray-900 rounded-xl p-5 border border-gray-800/60">
      <div className="mb-3">
        <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider">{title}</h2>
      </div>
      {children}
    </div>
  );
}
