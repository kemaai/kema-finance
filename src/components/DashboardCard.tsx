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
  trendColor = 'text-green-400',
  className
}) => {
  return (
    <div className={cn(
      "card-tech p-4 transition-all duration-300",
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-muted-foreground text-xs font-medium mb-1.5 truncate md:whitespace-normal md:overflow-visible md:break-words">{title}</p>
          <h3 className="text-lg lg:text-2xl font-bold text-foreground mb-0.5 truncate md:whitespace-normal md:overflow-visible md:break-words tabular-nums font-serif rounded-md opacity-90 md:text-base">{value}</h3>
          {subValue && (
            <p className="text-muted-foreground text-[11px] md:text-xs truncate md:whitespace-normal md:overflow-visible md:break-words">{subValue}</p>
          )}
          {trend && (
            <p className={`text-xs font-medium mt-1 ${trendColor}`}>{trend}</p>
          )}
        </div>
        <div className={cn(
          "w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0 ml-2 text-sm",
          iconColor
        )}>
          <Icon className="w-5 h-5 text-primary-foreground" />
        </div>
      </div>
    </div>
  );
};
