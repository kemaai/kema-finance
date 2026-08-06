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

/** Each legacy variant maps to one of the vivid solid blocks. */
const variantBlock: Record<CardVariant, string> = {
  orange: 'block-peach',
  green: 'block-lime',
  blue: 'block-blue',
  red: 'block-coral',
  amber: 'block-peach',
  purple: 'block-violet',
  teal: 'block-teal',
  neutral: 'block-ink',
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
  const blockClass = featured ? 'block-ink' : variantBlock[variant];

  return (
    <div
      className={cn(
        'block group relative overflow-hidden animate-pop-in',
        featured ? 'p-5 md:p-8' : 'p-4 md:p-5',
        blockClass,
        className
      )}
    >
      {/* Oversized soft light in the corner */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-current opacity-[0.08] blur-2xl transition-opacity duration-300 group-hover:opacity-[0.16]"
      />

      <div className={cn('relative flex flex-col', featured ? 'gap-5 md:gap-8' : 'gap-4')}>
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              'font-medium uppercase tracking-[0.16em] opacity-70 truncate',
              featured ? 'text-xs' : 'text-[10px] md:text-[11px]'
            )}
          >
            {title}
          </p>
          <div
            className={cn(
              'on-block-chip flex-shrink-0',
              featured ? 'w-11 h-11' : 'w-8 h-8'
            )}
          >
            <Icon className={cn(featured ? 'w-5 h-5' : 'w-4 h-4')} strokeWidth={2.2} />
          </div>
        </div>

        <div className="min-w-0">
          <h3
            className={cn(
              'num font-bold leading-none truncate',
              featured ? 'text-4xl md:text-6xl' : 'text-2xl md:text-3xl'
            )}
          >
            {value}
          </h3>
          {subValue && (
            <p
              className={cn(
                'opacity-75 leading-snug break-words',
                featured ? 'text-sm mt-3' : 'text-[11px] md:text-xs mt-2'
              )}
            >
              {subValue}
            </p>
          )}
          {trend && (
            <span
              className={cn(
                'inline-flex items-center mt-3 rounded-full px-2.5 py-1 text-[11px] font-semibold on-block-chip',
                trendColor
              )}
            >
              {trend}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
