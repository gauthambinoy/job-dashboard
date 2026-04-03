'use client';

interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
}

export default function DashboardCard({
  title,
  value,
  subtitle,
  icon,
  className = '',
  trend,
}: DashboardCardProps) {
  return (
    <div className={`
      relative
      bg-gradient-to-br from-white to-light-100
      rounded-card border border-gray-100
      p-6
      shadow-card
      hover:shadow-card-hover
      hover:-translate-y-1
      transition-all duration-300
      group
      overflow-hidden
      animate-fade-in-scale
      ${className}
    `}>
      {/* Gradient accent background */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-bl-3xl pointer-events-none" />

      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-label text-neutral-500 font-semibold uppercase tracking-wide">{title}</p>
          <p className="text-4xl font-bold text-dark-900 mt-3 font-mono animate-count-up">{value}</p>
          {subtitle && <p className="text-small text-neutral-400 mt-2 animate-fade-in-smooth">{subtitle}</p>}
        </div>
        {icon && (
          <div className="
            flex items-center justify-center
            w-14 h-14
            rounded-lg
            bg-gradient-to-br from-primary-600 to-primary-700
            text-white
            ml-4
            shadow-md
            group-hover:shadow-lg
            group-hover:scale-110
            transition-all duration-300
            text-2xl
            animate-icon-scale
          ">
            {icon}
          </div>
        )}
      </div>
      {trend && (
        <div className={`
          mt-4 flex items-center gap-2 text-small font-semibold
          px-3 py-2
          rounded-lg
          animate-stagger-fade-in
          ${trend.direction === 'up'
            ? 'text-success-500 bg-success-500/10'
            : 'text-danger-500 bg-danger-500/10'
          }
        `}>
          <span className={`text-lg animate-icon-rotate ${trend.direction === 'up' ? '↑' : '↓'}`}>
            {trend.direction === 'up' ? '↑' : '↓'}
          </span>
          {trend.value}% vs last week
        </div>
      )}
    </div>
  );
}
