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
const fitClass = (value: string, scale: 'hero' | 'featured' | 'compact') => {
  const len = value.length;
  if (scale === 'hero') {
    if (len <= 8) return 'text-[2.75rem] md:text-6xl';
    if (len <= 11) return 'text-[2.15rem] md:text-5xl';
    if (len <= 14) return 'text-[1.75rem] md:text-4xl';
    return 'text-[1.45rem] md:text-3xl';
  }
  if (scale === 'featured') {
    if (len <= 7) return 'text-[2rem] md:text-[2.5rem]';
    if (len <= 10) return 'text-[1.6rem] md:text-[2rem]';
    if (len <= 13) return 'text-[1.3rem] md:text-[1.65rem]';
    return 'text-[1.1rem] md:text-[1.4rem]';
  }
  if (len <= 7) return 'text-[1.5rem] md:text-[1.75rem]';
  if (len <= 11) return 'text-[1.25rem] md:text-[1.5rem]';
  return 'text-[1.05rem] md:text-[1.25rem]';
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
  size,
  className,
}) => {
  const resolved: CardSize = size ?? (featured ? 'featured' : 'compact');
  const gradient = variantGradient[variant];
  const accentVar = variantAccentVar[variant];
  const isNegative = typeof trend === 'string' && trend.trim().startsWith('-');
  const TrendIcon = isNegative ? ArrowDownRight : ArrowUpRight;

  /* Blocos coloridos com profundidade (hero e featured) */
  if (resolved === 'hero' || resolved === 'featured') {
    const isHero = resolved === 'hero';
    return (
      <div
        className={cn(
          'block-3d group animate-pop-in text-white',
          gradient,
          isHero ? 'p-5 md:p-8' : 'p-4 md:p-6',
          className
        )}
        style={{ ['--shadow-tint' as string]: `var(${accentVar})` }}
      >
        <div className={cn('relative flex flex-col', isHero ? 'gap-5 md:gap-8' : 'gap-3 md:gap-5')}>
          <div className="flex items-start justify-between gap-3">
            <p className={cn(
              'font-semibold uppercase tracking-[0.16em] text-white/85',
              isHero ? 'text-[11px] md:text-sm' : 'text-[10px] md:text-xs'
            )}>
              {title}
            </p>
            <div className={cn('on-block-chip backdrop-blur-md border border-white/25', isHero ? 'w-11 h-11 md:w-14 md:h-14' : 'w-9 h-9 md:w-11 md:h-11')}>
              <Icon className={isHero ? 'w-5 h-5 md:w-6 md:h-6' : 'w-[18px] h-[18px]'} strokeWidth={2.2} />
            </div>
          </div>

          <div className="min-w-0">
            <h3 className={cn('num value-fit font-extrabold', fitClass(value, isHero ? 'hero' : 'featured'))}>
              {value}
            </h3>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {subValue && (
                <p className={cn('text-white/85 leading-snug', isHero ? 'text-xs md:text-sm' : 'text-[11px] md:text-xs')}>
                  {subValue}
                </p>
              )}
              {trend && (
                <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold on-block-chip backdrop-blur-md border border-white/25">
                  <TrendIcon className="w-3 h-3" />
                  {trend}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* Compacto: vidro com barra de acento e tile gradiente */
  return (
    <div
      className={cn(
        'card-3d group animate-pop-in p-3.5 md:p-4 pl-4 md:pl-5',
        className
      )}
    >
      <span
        aria-hidden
        className="absolute left-0 top-3 bottom-3 w-1 rounded-full"
        style={{ background: `linear-gradient(180deg, hsl(var(${accentVar}) / 0.7), hsl(var(${accentVar})))` }}
      />

      <div className="flex items-center justify-between gap-2.5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground truncate">
          {title}
        </p>
        <div className={cn('icon-tile w-8 h-8 md:w-9 md:h-9', gradient)}>
          <Icon className="w-4 h-4" strokeWidth={2.2} />
        </div>
      </div>

      <h3 className={cn('num value-fit font-bold text-foreground mt-2', fitClass(value, 'compact'))}>
        {value}
      </h3>

      <div className="mt-2.5 space-y-1.5">
        <div className="track h-1">
          <span
            className="w-2/3 transition-all duration-500"
            style={{ background: `linear-gradient(90deg, hsl(var(${accentVar}) / 0.5), hsl(var(${accentVar})))` }}
          />
        </div>
        <div className="flex items-center justify-between gap-2">
          {subValue && (
            <p className="text-[10px] md:text-[11px] text-muted-foreground leading-snug truncate">{subValue}</p>
          )}
          {trend && (
            <span
              className={cn(
                'inline-flex items-center gap-0.5 text-[10px] font-semibold flex-shrink-0',
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
