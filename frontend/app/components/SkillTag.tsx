'use client';

interface SkillTagProps {
  skill: string;
  variant?: 'skill' | 'nice-to-have' | 'outline';
  onRemove?: () => void;
  className?: string;
}

export default function SkillTag({
  skill,
  variant = 'skill',
  onRemove,
  className = ''
}: SkillTagProps) {
  const variantConfig = {
    skill: {
      bg: 'bg-blue-500/10',
      text: 'text-blue-400',
      border: 'border border-blue-500/20',
      hover: 'hover:bg-blue-500/20 hover:border-blue-500/30',
    },
    'nice-to-have': {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      border: 'border border-emerald-500/20',
      hover: 'hover:bg-emerald-500/20 hover:border-emerald-500/30',
    },
    outline: {
      bg: 'bg-white/[0.03]',
      text: 'text-gray-400',
      border: 'border border-white/[0.08]',
      hover: 'hover:bg-white/[0.06] hover:border-white/[0.12]',
    },
  };

  const config = variantConfig[variant];

  return (
    <span className={`
      inline-flex items-center gap-1.5
      px-2.5 py-1
      rounded-full
      text-xs font-medium
      ${config.bg}
      ${config.text}
      ${config.border}
      ${config.hover}
      transition-colors duration-200
      ${className}
    `}>
      {skill}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-0.5 hover:opacity-60 transition-opacity duration-200 text-xs leading-none"
          aria-label={`Remove ${skill}`}
        >
          &times;
        </button>
      )}
    </span>
  );
}
