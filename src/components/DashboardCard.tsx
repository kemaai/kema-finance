
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
      "relative group rounded-xl p-4 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] min-h-[100px]",
      className
    )}>
      {/* Content */}
      <div className="relative h-full flex flex-col">
        {/* Header with icon and title */}
        <div className="flex items-center gap-2 mb-3">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0",
            iconColor
          )}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
              {title}
            </p>
          </div>
        </div>
        
        {/* Value section */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="w-full">
            <h3 className="text-lg lg:text-xl font-bold text-foreground leading-tight break-all">
              {value}
            </h3>
          </div>
          
          {subValue && (
            <p className="text-muted-foreground text-xs leading-tight break-all mt-1">
              {subValue}
            </p>
          )}
          
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <div className={cn(
                "text-xs font-semibold px-2 py-1 rounded-md bg-opacity-10 whitespace-nowrap",
                trendColor.includes('green') ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20',
                trendColor
              )}>
                {trend}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
