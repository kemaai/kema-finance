
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardCardProps {
  title: string;
  value: string;
  subValue?: string;
  icon: LucideIcon;
  iconColor: string;
  trend?: string;
  trendColor?: string;
  className?: string;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  subValue,
  icon: Icon,
  iconColor,
  trend,
  trendColor = 'text-green-500',
  className
}) => {
  return (
    <div className={cn(
      "relative group bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:bg-white/95 dark:bg-slate-800/90 dark:border-slate-700/50 dark:hover:bg-slate-800/95 min-h-[140px]",
      className
    )}>
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      {/* Content */}
      <div className="relative h-full flex flex-col">
        {/* Header with icon and title */}
        <div className="flex items-center gap-3 mb-4">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 flex-shrink-0",
            iconColor
          )}>
            <Icon className="w-6 h-6 text-white drop-shadow-sm" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-muted-foreground text-sm font-medium uppercase tracking-wide leading-tight">
              {title}
            </p>
          </div>
        </div>
        
        {/* Value section */}
        <div className="flex-1 flex flex-col justify-center space-y-2">
          <div className="w-full">
            <h3 className="text-2xl lg:text-3xl font-bold text-foreground bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text leading-tight break-all">
              {value}
            </h3>
          </div>
          
          {subValue && (
            <p className="text-muted-foreground text-sm leading-tight break-all">
              {subValue}
            </p>
          )}
          
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <div className={cn(
                "text-sm font-semibold px-3 py-1 rounded-full bg-opacity-10 whitespace-nowrap",
                trendColor.includes('green') ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20',
                trendColor
              )}>
                {trend}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>
  );
};
