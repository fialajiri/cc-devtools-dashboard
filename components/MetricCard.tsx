import type { ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export default function MetricCard({ title, subtitle, children }: MetricCardProps) {
  return (
    <div className="bg-gray-900 rounded-xl p-5 border border-gray-800/60">
      <div className="mb-3">
        <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider">{title}</h2>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
