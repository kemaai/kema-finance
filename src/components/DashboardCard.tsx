import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type CardVariant = 'orange' | 'green' | 'blue' | 'red' | 'amber' | 'purple' | 'teal' | 'neutral';

interface DashboardCardProps {
  title: string;
  value: string;
  subValue?: string;
  icon: LucideIcon;
  /** @deprecated Use `variant` instead. Kept for backward compatibility. */
  iconColor?: string;
  variant?: CardVariant;
  trend?: string;
  trendColor?: string;
  /** Larger, hero treatment for the bento's featured block */
  featured?: boolean;
  className?: string;
}

const variantStyles: Record<CardVariant, {
  border: string;
  bg: string;
  iconBg: string;
  iconText: string;
  valueText: string;
  accentBar: string;
  glow: string;
}> = {
  orange: {
    border: 'border-orange-500/25 hover:border-orange-500/50',
    bg: 'bg-gradient-to-br from-orange-500/[0.12] via-orange-500/[0.04] to-transparent',
    iconBg: 'bg-orange-500/15 text-orange-500 dark:text-orange-400',
    iconText: 'text-orange-500 dark:text-orange-400',
    valueText: 'text-foreground',
    accentBar: 'bg-orange-500',
    glow: 'shadow-[0_0_0_0_transparent] hover:shadow-[0_12px_36px_-12px_rgb(249_115_22_/_0.45)]',
  },
  green: {
    border: 'border-emerald-500/25 hover:border-emerald-500/50',
    bg: 'bg-gradient-to-br from-emerald-500/[0.12] via-emerald-500/[0.04] to-transparent',
    iconBg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    iconText: 'text-emerald-600 dark:text-emerald-400',
    valueText: 'text-foreground',
    accentBar: 'bg-emerald-500',
    glow: 'hover:shadow-[0_12px_36px_-12px_rgb(16_185_129_/_0.45)]',
  },
  blue: {
    border: 'border-blue-500/25 hover:border-blue-500/50',
    bg: 'bg-gradient-to-br from-blue-500/[0.12] via-blue-500/[0.04] to-transparent',
    iconBg: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
    iconText: 'text-blue-600 dark:text-blue-400',
    valueText: 'text-foreground',
    accentBar: 'bg-blue-500',
    glow: 'hover:shadow-[0_12px_36px_-12px_rgb(59_130_246_/_0.45)]',
  },
  red: {
    border: 'border-red-500/25 hover:border-red-500/50',
    bg: 'bg-gradient-to-br from-red-500/[0.12] via-red-500/[0.04] to-transparent',
    iconBg: 'bg-red-500/15 text-red-600 dark:text-red-400',
    iconText: 'text-red-600 dark:text-red-400',
    valueText: 'text-foreground',
    accentBar: 'bg-red-500',
    glow: 'hover:shadow-[0_12px_36px_-12px_rgb(239_68_68_/_0.45)]',
  },
  amber: {
    border: 'border-amber-500/25 hover:border-amber-500/50',
    bg: 'bg-gradient-to-br from-amber-500/[0.12] via-amber-500/[0.04] to-transparent',
    iconBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    iconText: 'text-amber-600 dark:text-amber-400',
    valueText: 'text-foreground',
    accentBar: 'bg-amber-500',
    glow: 'hover:shadow-[0_12px_36px_-12px_rgb(245_158_11_/_0.45)]',
  },
  purple: {
    border: 'border-purple-500/25 hover:border-purple-500/50',
    bg: 'bg-gradient-to-br from-purple-500/[0.12] via-purple-500/[0.04] to-transparent',
    iconBg: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
    iconText: 'text-purple-600 dark:text-purple-400',
    valueText: 'text-foreground',
    accentBar: 'bg-purple-500',
    glow: 'hover:shadow-[0_12px_36px_-12px_rgb(168_85_247_/_0.45)]',
  },
  teal: {
    border: 'border-teal/30 hover:border-teal/60',
    bg: 'bg-gradient-to-br from-teal/[0.14] via-teal/[0.05] to-transparent',
    iconBg: 'bg-teal/15 text-teal',
    iconText: 'text-teal',
    valueText: 'text-foreground',
    accentBar: 'bg-teal',
    glow: 'hover:shadow-[0_12px_36px_-12px_hsl(var(--teal)/0.5)]',
  },
  neutral: {
    border: 'border-border hover:border-primary/40',
    bg: '',
    iconBg: 'bg-muted text-foreground',
    iconText: 'text-muted-foreground',
    valueText: 'text-foreground',
    accentBar: 'bg-primary',
    glow: '',
  },
};

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  subValue,
  icon: Icon,
  variant = 'neutral',
  trend,
  trendColor = 'text-emerald-400',
  featured = false,
  className,
}) => {
  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        'card-tech group relative overflow-hidden border',
        featured ? 'p-5 md:p-6' : 'p-4 md:p-5',
        styles.border,
        styles.bg,
        styles.glow,
        className
      )}
    >
      {/* Soft radial glow in the corner */}
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute -top-10 -right-10 h-24 w-24 rounded-full opacity-20 blur-2xl transition-opacity duration-300 group-hover:opacity-35',
          styles.accentBar
        )}
      />

      <div className="relative flex flex-col gap-3">
        <div
          className={cn(
            'rounded-2xl flex items-center justify-center flex-shrink-0',
            featured ? 'w-12 h-12' : 'w-10 h-10',
            styles.iconBg
          )}
        >
          <Icon className={cn(featured ? 'w-5 h-5' : 'w-[18px] h-[18px]')} strokeWidth={2.2} />
        </div>

        <div className="min-w-0">
          <p className="text-muted-foreground text-[11px] md:text-xs font-medium uppercase tracking-wider truncate">
            {title}
          </p>
          <h3
            className={cn(
              'num font-bold mt-1 mb-0.5 truncate',
              featured ? 'text-2xl md:text-4xl' : 'text-xl md:text-2xl',
              styles.valueText
            )}
          >
            {value}
          </h3>
          {subValue && (
            <p className="text-muted-foreground text-[11px] md:text-xs leading-snug break-words">
              {subValue}
            </p>
          )}
          {trend && (
            <p className={cn('text-xs font-semibold mt-1.5', trendColor)}>{trend}</p>
          )}
        </div>
      </div>
    </div>
  );
};
