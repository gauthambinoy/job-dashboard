'use client';

import React from 'react';

interface FunnelStage {
  label: string;
  count: number;
  color?: string;
}

interface ConversionFunnelProps {
  stages: FunnelStage[];
  className?: string;
}

const getGradientColor = (index: number, total: number): string => {
  // Gradient from primary-600 to success-500 to warning-500
  const colors = [
    'from-primary-600 to-primary-500',
    'from-primary-500 to-success-500',
    'from-success-500 to-warning-500',
    'from-warning-500 to-danger-500',
  ];
  return colors[Math.min(index, colors.length - 1)];
};

export default function ConversionFunnel({ stages, className = '' }: ConversionFunnelProps) {
  const maxCount = Math.max(...stages.map(s => s.count), 1);

  const calculatePercentage = (currentCount: number, previousCount?: number): string => {
    if (previousCount === undefined) return '100.0';
    return ((currentCount / previousCount) * 100).toFixed(1);
  };

  const overallConversionRateStr = stages.length > 1
    ? ((stages[stages.length - 1].count / stages[0].count) * 100).toFixed(1)
    : '0';
  const overallConversionRate = parseFloat(overallConversionRateStr);

  return (
    <div className={`
      bg-gradient-to-br from-white to-light-100
      rounded-card border border-gray-100
      p-6 md:p-8
      shadow-card
      hover:shadow-card-hover
      transition-all duration-300
      animate-fade-in-scale
      ${className}
    `}>
      <div className="mb-8 animate-stagger-fade-in">
        <h3 className="text-subhead font-bold text-dark-900 mb-2">Conversion Funnel</h3>
        <p className="text-small text-neutral-500">Track your job application journey</p>
      </div>

      <div className="space-y-4">
        {stages.map((stage, index) => {
          const width = (stage.count / maxCount) * 100;
          const conversionRateStr = index > 0 ? calculatePercentage(stage.count, stages[index - 1].count) : '100.0';
          const conversionRate = parseFloat(conversionRateStr);
          const gradientClass = getGradientColor(index, stages.length);

          return (
            <div key={stage.label} className="space-y-2.5 animate-stagger-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-50 text-primary-600 font-bold text-label animate-badge-glow">
                    {index + 1}
                  </div>
                  <div>
                    <span className="text-small font-semibold text-dark-900">{stage.label}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-body font-bold text-dark-900 font-mono animate-counter-number">{stage.count}</span>
                  {index > 0 && (
                    <span className={`
                      text-xs font-semibold
                      px-2 py-1 rounded
                      animate-badge-appear
                      ${conversionRate >= 50 ? 'bg-success-50 text-success-600' : 'bg-warning-50 text-warning-600'}
                    `}>
                      {conversionRateStr}%
                    </span>
                  )}
                </div>
              </div>

              <div className="h-12 bg-gray-100 rounded-lg overflow-hidden shadow-inner">
                <div
                  className={`
                    h-full bg-gradient-to-r ${gradientClass}
                    flex items-center justify-center
                    transition-all duration-500 ease-out
                    shadow-md
                    hover:shadow-lg
                    animate-chart-bar
                  `}
                  style={{ width: `${width}%`, animationDelay: `${index * 100}ms` }}
                >
                  {width > 15 && (
                    <span className="text-xs font-bold text-white drop-shadow-lg animate-fade-in-smooth">
                      {width.toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary stats */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-primary-50 rounded-lg border border-primary-100 animate-stagger-fade-in hover:shadow-md transition-all duration-300">
            <p className="text-label text-primary-600 font-semibold uppercase tracking-wide">Total Start</p>
            <p className="text-2xl font-bold text-primary-700 mt-2 font-mono animate-counter-number">{stages[0]?.count || 0}</p>
          </div>
          <div className="p-4 bg-accent-500/10 rounded-lg border border-accent-200 animate-stagger-fade-in hover:shadow-md transition-all duration-300" style={{ animationDelay: '0.05s' }}>
            <p className="text-label text-accent-600 font-semibold uppercase tracking-wide">Final Step</p>
            <p className="text-2xl font-bold text-accent-700 mt-2 font-mono animate-counter-number">{stages[stages.length - 1]?.count || 0}</p>
          </div>
          <div className={`
            p-4 rounded-lg border
            animate-stagger-fade-in hover:shadow-md transition-all duration-300
            ${overallConversionRate >= 20
              ? 'bg-success-50 border-success-100'
              : 'bg-warning-50 border-warning-100'
            }
          `} style={{ animationDelay: '0.1s' }}>
            <p className={`text-label font-semibold uppercase tracking-wide ${
              overallConversionRate >= 20 ? 'text-success-600' : 'text-warning-600'
            }`}>Conversion</p>
            <p className={`text-2xl font-bold mt-2 font-mono animate-counter-number ${
              overallConversionRate >= 20 ? 'text-success-700' : 'text-warning-700'
            }`}>{overallConversionRateStr}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
