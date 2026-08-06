import React from 'react';
import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';
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

/** Each legacy variant maps to one of the soft-UI accent gradients. */
const variantGradient: Record<CardVariant, string> = {
  orange: 'grad-orange',
  green: 'grad-green',
  blue: 'grad-blue',
  red: 'grad-pink',
  amber: 'grad-orange',
  purple: 'grad-violet',
  teal: 'grad-teal',
  neutral: 'grad-blue',
};

const variantAccentVar: Record<CardVariant, string> = {
  orange: '--accent-orange',
  green: '--accent-green',
  blue: '--accent-blue',
  red: '--accent-pink',
  amber: '--accent-orange',
  purple: '--accent-violet',
  teal: '--accent-green',
  neutral: '--accent-blue',
};

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  subValue,
  icon: Icon,
  variant = 'neutral',
  trend,
  trendColor,
  featured = false,
  className,
}) => {
  const gradient = variantGradient[variant];
  const accentVar = variantAccentVar[variant];
  const isNegative = typeof trend === 'string' && trend.trim().startsWith('-');
  const TrendIcon = isNegative ? ArrowDownRight : ArrowUpRight;

  /* Featured: full-bleed gradient card (top KPI row of the reference) */
  if (featured) {
    return (
      <div
        className={cn(
          'block group relative overflow-hidden animate-pop-in p-5 md:p-7 text-white',
          gradient,
          className
        )}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 -right-14 h-56 w-56 rounded-full bg-white/15 blur-2xl"
        />
        <div className="relative flex flex-col gap-4 md:gap-6">
          <div className="flex items-start justify-between gap-3">
            <p className="text-[11px] md:text-xs font-semibold uppercase tracking-[0.14em] text-white/85">{title}</p>
            <div className="on-block-chip w-10 h-10 md:w-11 md:h-11">
              <Icon className="w-5 h-5" strokeWidth={2.2} />
            </div>
          </div>
          <div className="min-w-0">
            <h3 className="num text-4xl md:text-6xl font-extrabold leading-none truncate">{value}</h3>
            {subValue && <p className="text-xs md:text-sm text-white/85 mt-3 leading-snug break-words">{subValue}</p>}
            {trend && (
              <span className="inline-flex items-center gap-1 mt-3 rounded-full px-2.5 py-1 text-[11px] font-semibold on-block-chip">
                <TrendIcon className="w-3 h-3" />
                {trend}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* Standard: white card, left accent bar, gradient icon tile */
  return (
    <div
      className={cn(
        'card-tech group relative overflow-hidden animate-pop-in p-4 md:p-5 pl-5 md:pl-6',
        className
      )}
    >
      <span
        aria-hidden
        className="absolute left-0 top-4 bottom-4 w-1.5 rounded-full"
        style={{ background: `hsl(var(${accentVar}))` }}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground truncate">
            {title}
          </p>
          <h3 className="num text-2xl md:text-[1.75rem] font-bold leading-tight text-foreground mt-1.5 truncate">
            {value}
          </h3>
        </div>
        <div className={cn('icon-tile w-10 h-10 md:w-11 md:h-11', gradient)}>
          <Icon className="w-[18px] h-[18px]" strokeWidth={2.2} />
        </div>
      </div>

      <div className="mt-3 space-y-2">
        <div className="track">
          <span
            className="w-2/3 transition-all duration-500"
            style={{ background: `linear-gradient(90deg, hsl(var(${accentVar}) / 0.55), hsl(var(${accentVar})))` }}
          />
        </div>
        <div className="flex items-center justify-between gap-2">
          {subValue && (
            <p className="text-[11px] md:text-xs text-muted-foreground leading-snug truncate">{subValue}</p>
          )}
          {trend && (
            <span
              className={cn(
                'inline-flex items-center gap-0.5 text-[11px] font-semibold flex-shrink-0',
                isNegative ? 'text-destructive' : 'text-emerald-600 dark:text-emerald-400',
                trendColor
              )}
            >
              <TrendIcon className="w-3 h-3" />
              {trend}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
