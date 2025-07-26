
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
      "bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-border",
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-muted-foreground text-xs md:text-sm font-medium mb-1 md:mb-2 truncate">{title}</p>
          <h3 className="text-xl md:text-3xl font-bold text-foreground mb-1 truncate">{value}</h3>
          {subValue && (
            <p className="text-muted-foreground text-xs md:text-sm truncate">{subValue}</p>
          )}
          {trend && (
            <p className={`text-xs md:text-sm font-medium mt-1 md:mt-2 ${trendColor}`}>{trend}</p>
          )}
        </div>
        <div className={cn(
          "w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ml-2 shadow-sm",
          iconColor
        )}>
          <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
        </div>
      </div>
    </div>
  );
};
