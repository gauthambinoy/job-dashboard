'use client';

interface StatusBadgeProps {
  status: string;
  className?: string;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, className = '', size = 'md' }: StatusBadgeProps) {
  const statusConfig: Record<string, {
    bg: string;
    text: string;
    label: string;
    border: string;
  }> = {
    'saved': {
      bg: 'bg-gray-500/15',
      text: 'text-gray-400',
      border: 'border border-gray-500/30',
      label: 'Saved',
    },
    'applied': {
      bg: 'bg-blue-500/15',
      text: 'text-blue-400',
      border: 'border border-blue-500/30',
      label: 'Applied',
    },
    'pending_response': {
      bg: 'bg-yellow-500/15',
      text: 'text-yellow-400',
      border: 'border border-yellow-500/30',
      label: 'Pending',
    },
    'interviewing': {
      bg: 'bg-purple-500/15',
      text: 'text-purple-400',
      border: 'border border-purple-500/30',
      label: 'Interviewing',
    },
    'rejected': {
      bg: 'bg-rose-500/15',
      text: 'text-rose-400',
      border: 'border border-rose-500/30',
      label: 'Rejected',
    },
    'offered': {
      bg: 'bg-emerald-500/15',
      text: 'text-emerald-400',
      border: 'border border-emerald-500/30',
      label: 'Offered',
    },
  };

  const config = statusConfig[status.toLowerCase()] || statusConfig['saved'];
  const paddings = size === 'sm' ? 'px-2 py-0.5' : 'px-2.5 py-1';
  const textSize = size === 'sm' ? 'text-xs' : 'text-xs';

  return (
    <span className={`
      inline-flex items-center
      ${paddings}
      rounded-full
      ${textSize} font-medium
      ${config.bg}
      ${config.text}
      ${config.border}
      transition-colors duration-200
      ${className}
    `}>
      {config.label}
    </span>
  );
}
