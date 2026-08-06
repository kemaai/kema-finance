import React from 'react';
import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export type CardVariant = 'orange' | 'green' | 'blue' | 'red' | 'amber' | 'purple' | 'teal' | 'neutral';
export type CardSize = 'hero' | 'featured' | 'compact';

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
  /** @deprecated use `size="featured"` */
  featured?: boolean;
  size?: CardSize;
  className?: string;
}

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

/** Escala tipográfica que se adapta ao comprimento do valor — nada é cortado. */
const fitClass = (value: string) => {
  const len = value.length;
  if (len <= 6) return 'text-[1.7rem] md:text-[1.9rem]';
  if (len <= 9) return 'text-[1.45rem] md:text-[1.65rem]';
  if (len <= 12) return 'text-[1.2rem] md:text-[1.35rem]';
  return 'text-[1.05rem] md:text-[1.15rem]';
};

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  subValue,
  icon: Icon,
  variant = 'neutral',
  trend,
  trendColor,
  className,
}) => {
  const solid = variantGradient[variant];
  const accentVar = variantAccentVar[variant];
  const isNegative = typeof trend === 'string' && trend.trim().startsWith('-');
  const TrendIcon = isNegative ? ArrowDownRight : ArrowUpRight;

  return (
    <div className={cn('card-flat animate-pop-in p-3.5 md:p-4 flex flex-col', className)}>
      <div className="flex items-start gap-2.5">
        <div className={cn('icon-tile w-9 h-9 md:w-10 md:h-10 dark:rounded-full', solid)}>
          <Icon className="w-[18px] h-[18px]" strokeWidth={2.2} />
        </div>
        <p className="text-[13px] font-medium leading-tight text-foreground/80 pt-0.5">
          {title}
        </p>
      </div>

      <h3
        className={cn('num value-fit font-bold mt-3', fitClass(value))}
        style={{ color: `hsl(var(${accentVar}))` }}
      >
        {value}
      </h3>

      <div className="mt-1.5 flex items-center justify-between gap-2">
        {subValue && (
          <p className="text-[11px] md:text-xs text-muted-foreground leading-snug">{subValue}</p>
        )}
        {trend && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 text-[10px] font-semibold flex-shrink-0',
              isNegative ? 'text-destructive' : 'text-primary',
              trendColor
            )}
          >
            <TrendIcon className="w-3 h-3" />
            {trend}
          </span>
        )}
      </div>
    </div>
  );
};
