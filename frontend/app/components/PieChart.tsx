'use client';

interface PieChartProps {
  matchPercentage: number;
  missingSkills?: number;
}

export default function PieChart({ matchPercentage, missingSkills }: PieChartProps) {
  const circumference = 2 * Math.PI * 45; // radius = 45
  const matchOffset = circumference - (matchPercentage / 100) * circumference;

  const getColor = (percentage: number) => {
    if (percentage >= 80) return '#10B981'; // success-500
    if (percentage >= 60) return '#F59E0B'; // warning-500
    return '#EF4444'; // danger-500
  };

  const getStatusText = (percentage: number) => {
    if (percentage >= 80) return 'Excellent match!';
    if (percentage >= 60) return 'Good match';
    return 'Skills gap detected';
  };

  const getStatusBg = (percentage: number) => {
    if (percentage >= 80) return 'bg-success-50';
    if (percentage >= 60) return 'bg-warning-50';
    return 'bg-danger-50';
  };

  const getStatusText2 = (percentage: number) => {
    if (percentage >= 80) return 'text-success-600';
    if (percentage >= 60) return 'text-warning-600';
    return 'text-danger-600';
  };

  return (
    <div className="flex flex-col items-center gap-6 animate-fade-in-scale">
      <div className="relative">
        {/* Glow effect */}
        <div className="absolute inset-0 blur-xl opacity-30 rounded-full animate-parallax-float" style={{
          background: getColor(matchPercentage)
        }} />

        <svg width="240" height="240" viewBox="0 0 120 120" className="transform -rotate-90 drop-shadow-lg animate-chart-line">
          {/* Background circle */}
          <circle
            cx="60"
            cy="60"
            r="45"
            fill="none"
            stroke="#f3f4f6"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <circle
            cx="60"
            cy="60"
            r="45"
            fill="none"
            stroke={getColor(matchPercentage)}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={matchOffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out animate-chart-line"
            filter="drop-shadow(0 0 8px rgba(0,0,0,0.1))"
          />
          {/* Center text */}
          <text
            x="60"
            y="68"
            textAnchor="middle"
            className="font-mono font-bold fill-dark-900 animate-counter-number"
            fontSize="28"
            fontWeight="700"
          >
            {matchPercentage}%
          </text>
        </svg>
      </div>

      {/* Status text */}
      <div className={`
        text-center
        px-4 py-3
        rounded-lg
        animate-stagger-fade-in
        ${getStatusBg(matchPercentage)}
        ${getStatusText2(matchPercentage)}
      `}>
        <p className="text-small font-medium">Skills Match</p>
        <p className="text-xs font-semibold mt-1">
          {getStatusText(matchPercentage)}
        </p>
      </div>

      {/* Legend */}
      <div className="space-y-2.5 w-full">
        <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-gray-50 animate-stagger-fade-in hover:shadow-md transition-all duration-300">
          <div className="w-4 h-4 rounded-full animate-badge-glow" style={{ backgroundColor: getColor(matchPercentage) }} />
          <span className="text-small font-medium text-neutral-700 flex-1">Match</span>
          <span className="text-small font-bold text-dark-900 animate-counter-number">{matchPercentage}%</span>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-gray-50 animate-stagger-fade-in hover:shadow-md transition-all duration-300" style={{ animationDelay: '0.1s' }}>
          <div className="w-4 h-4 rounded-full bg-gray-300" />
          <span className="text-small font-medium text-neutral-700 flex-1">Missing</span>
          <span className="text-small font-bold text-dark-900 animate-counter-number">{100 - matchPercentage}%</span>
        </div>
      </div>
    </div>
  );
}
