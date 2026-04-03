'use client';

interface SalaryDisplayProps {
  min?: number;
  max?: number;
  currency?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function SalaryDisplay({
  min,
  max,
  currency = 'EUR',
  className = '',
  size = 'md'
}: SalaryDisplayProps) {
  const currencySymbols: Record<string, string> = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'INR': '₹',
  };

  const symbol = currencySymbols[currency] || '$';

  const formatSalary = (value: number): string => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return `${value}`;
  };

  const sizeStyles = {
    sm: 'text-small font-semibold',
    md: 'text-body font-bold text-lg',
    lg: 'text-2xl font-bold',
  };

  if (!min && !max) {
    return <span className={`text-neutral-500 text-small ${className}`}>Not specified</span>;
  }

  const salaryText = min && max
    ? `${formatSalary(min)} - ${formatSalary(max)}`
    : min
    ? `From ${formatSalary(min)}`
    : `Up to ${formatSalary(max!)}`;

  return (
    <div className={`
      inline-flex items-baseline gap-1
      ${sizeStyles[size]}
      font-mono
      animate-fade-in-smooth
      ${className}
    `}>
      <span className="text-success-600 font-bold animate-icon-scale">{symbol}</span>
      <span className="bg-gradient-to-r from-primary-600 to-success-600 bg-clip-text text-transparent animate-gradient-text">
        {salaryText}
      </span>
      <span className="text-neutral-500 text-small font-normal animate-fade-in-smooth">{currency}</span>
    </div>
  );
}
