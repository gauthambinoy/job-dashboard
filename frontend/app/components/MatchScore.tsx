'use client';

interface MatchScoreProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export default function MatchScore({ score, size = 'md', showLabel = false }: MatchScoreProps) {
  const getColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-rose-400';
  };

  const sizeConfig = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <span className={`${sizeConfig[size]} font-semibold tabular-nums ${getColor(score)}`}>
      {Math.round(score)}%
    </span>
  );
}
