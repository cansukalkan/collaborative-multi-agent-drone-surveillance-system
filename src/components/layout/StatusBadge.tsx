import React from 'react';

interface StatusBadgeProps {
  status: string;
  variant?: 'green' | 'amber' | 'red' | 'cyan' | 'blue' | 'gray';
  size?: 'sm' | 'md';
  pulse?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant,
  size = 'md',
  pulse = false,
}) => {
  // Infer variant if not provided
  let computedVariant = variant;
  if (!computedVariant) {
    const s = status.toUpperCase();
    if (['ONLINE', 'ACTIVE', 'CONNECTED', 'CONFIRMED', 'OPTIMAL', 'RUNNING'].includes(s)) {
      computedVariant = 'green';
    } else if (['DEGRADED', 'WARNING', 'TENTATIVE', 'IDLE', 'PAUSED'].includes(s)) {
      computedVariant = 'amber';
    } else if (['OFFLINE', 'ERROR', 'CRITICAL', 'DISCONNECTED', 'LOST', 'ABORTED'].includes(s)) {
      computedVariant = 'red';
    } else if (['RETURNING', 'HOVERING', 'SCANNING'].includes(s)) {
      computedVariant = 'cyan';
    } else {
      computedVariant = 'blue';
    }
  }

  const colorStyles = {
    green: 'bg-emerald-950/80 text-emerald-400 border-emerald-500/30',
    amber: 'bg-amber-950/80 text-amber-400 border-amber-500/30',
    red: 'bg-rose-950/80 text-rose-400 border-rose-500/30',
    cyan: 'bg-cyan-950/80 text-cyan-400 border-cyan-500/30',
    blue: 'bg-blue-950/80 text-blue-400 border-blue-500/30',
    gray: 'bg-slate-900 text-slate-400 border-slate-700',
  }[computedVariant || 'gray'];

  const dotStyles = {
    green: 'bg-emerald-400',
    amber: 'bg-amber-400',
    red: 'bg-rose-400',
    cyan: 'bg-cyan-400',
    blue: 'bg-blue-400',
    gray: 'bg-slate-400',
  }[computedVariant || 'gray'];

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono uppercase tracking-wider rounded border font-medium ${
        size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      } ${colorStyles}`}
    >
      <span className="relative flex h-2 w-2">
        {pulse && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotStyles}`}
          />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${dotStyles}`} />
      </span>
      {status}
    </span>
  );
};

