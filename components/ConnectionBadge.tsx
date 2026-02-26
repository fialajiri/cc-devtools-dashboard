type Status = 'connecting' | 'live' | 'reconnecting';

const config: Record<Status, { dot: string; label: string }> = {
  live: { dot: 'bg-emerald-400 animate-pulse', label: 'Live' },
  connecting: { dot: 'bg-amber-400', label: 'Connecting…' },
  reconnecting: { dot: 'bg-amber-400 animate-pulse', label: 'Reconnecting…' },
};

export default function ConnectionBadge({ status }: { status: Status }) {
  const { dot, label } = config[status];
  return (
    <span className="flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full bg-gray-800">
      <span className={`size-2 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
