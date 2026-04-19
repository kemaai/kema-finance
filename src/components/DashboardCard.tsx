import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type CardVariant = 'orange' | 'green' | 'blue' | 'red' | 'amber' | 'purple' | 'neutral';

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
  className?: string;
}

const variantStyles: Record<CardVariant, {
  border: string;
  bg: string;
  iconBg: string;
  iconText: string;
  valueText: string;
  accentBar: string;
}> = {
  orange: {
    border: 'border-orange-500/30 hover:border-orange-500/60',
    bg: 'bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-transparent',
    iconBg: 'bg-orange-500/15',
    iconText: 'text-orange-400',
    valueText: 'text-orange-400',
    accentBar: 'bg-orange-500',
  },
  green: {
    border: 'border-emerald-500/30 hover:border-emerald-500/60',
    bg: 'bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent',
    iconBg: 'bg-emerald-500/15',
    iconText: 'text-emerald-400',
    valueText: 'text-emerald-400',
    accentBar: 'bg-emerald-500',
  },
  blue: {
    border: 'border-blue-500/30 hover:border-blue-500/60',
    bg: 'bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent',
    iconBg: 'bg-blue-500/15',
    iconText: 'text-blue-400',
    valueText: 'text-blue-400',
    accentBar: 'bg-blue-500',
  },
  red: {
    border: 'border-red-500/30 hover:border-red-500/60',
    bg: 'bg-gradient-to-br from-red-500/10 via-red-500/5 to-transparent',
    iconBg: 'bg-red-500/15',
    iconText: 'text-red-400',
    valueText: 'text-red-400',
    accentBar: 'bg-red-500',
  },
  amber: {
    border: 'border-amber-500/30 hover:border-amber-500/60',
    bg: 'bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent',
    iconBg: 'bg-amber-500/15',
    iconText: 'text-amber-400',
    valueText: 'text-amber-400',
    accentBar: 'bg-amber-500',
  },
  purple: {
    border: 'border-purple-500/30 hover:border-purple-500/60',
    bg: 'bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent',
    iconBg: 'bg-purple-500/15',
    iconText: 'text-purple-400',
    valueText: 'text-purple-400',
    accentBar: 'bg-purple-500',
  },
  neutral: {
    border: 'border-border hover:border-primary/40',
    bg: '',
    iconBg: 'bg-muted',
    iconText: 'text-foreground',
    valueText: 'text-foreground',
    accentBar: 'bg-primary',
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
  className,
}) => {
  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        'card-tech relative overflow-hidden p-4 transition-all duration-300 border',
        styles.border,
        styles.bg,
        className
      )}
    >
      {/* Top accent bar */}
      <div className={cn('absolute top-0 left-0 right-0 h-0.5 opacity-70', styles.accentBar)} />

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0', styles.iconBg)}>
              <Icon className={cn('w-3.5 h-3.5', styles.iconText)} />
            </div>
            <p className="text-muted-foreground text-xs font-medium truncate md:whitespace-normal md:overflow-visible md:break-words">
              {title}
            </p>
          </div>
          <h3
            className={cn(
              'text-lg lg:text-2xl font-bold mb-0.5 truncate md:whitespace-normal md:overflow-visible md:break-words tabular-nums font-serif rounded-md md:text-base',
              styles.valueText
            )}
          >
            {value}
          </h3>
          {subValue && (
            <p className="text-muted-foreground text-[11px] md:text-xs truncate md:whitespace-normal md:overflow-visible md:break-words">
              {subValue}
            </p>
          )}
          {trend && (
            <p className={cn('text-xs font-medium mt-1', trendColor)}>{trend}</p>
          )}
        </div>
      </div>
    </div>
  );
};
