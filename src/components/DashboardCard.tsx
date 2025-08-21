
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
      "relative group bg-white/80 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-lg border border-white/20 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:bg-white/90 dark:bg-slate-800/80 dark:border-slate-700/50 dark:hover:bg-slate-800/90",
      className
    )}>
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      {/* Content */}
      <div className="relative flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <div className={cn(
              "w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300",
              iconColor
            )}>
              <Icon className="w-5 h-5 md:w-6 md:h-6 text-white drop-shadow-sm" />
            </div>
            <div className="h-8 w-px bg-gradient-to-b from-border/20 to-transparent"></div>
          </div>
          
          <p className="text-muted-foreground text-xs md:text-sm font-medium mb-2 truncate uppercase tracking-wide">
            {title}
          </p>
          
          <div className="space-y-1">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground truncate bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
              {value}
            </h3>
            
            {subValue && (
              <p className="text-muted-foreground text-xs md:text-sm truncate">
                {subValue}
              </p>
            )}
            
            {trend && (
              <div className="flex items-center gap-1">
                <div className={cn("text-xs md:text-sm font-semibold px-2 py-1 rounded-full bg-opacity-10", trendColor)}>
                  {trend}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>
  );
};
