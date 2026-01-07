
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SiteMonthFilterProps {
  selectedMonth: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onCurrentMonth: () => void;
}

export const SiteMonthFilter: React.FC<SiteMonthFilterProps> = ({
  selectedMonth,
  onPreviousMonth,
  onNextMonth,
  onCurrentMonth,
}) => {
  const isCurrentMonth = format(selectedMonth, 'MM/yyyy') === format(new Date(), 'MM/yyyy');

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPreviousMonth}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <h2 className="text-lg font-semibold min-w-[140px] text-center">
          {format(selectedMonth, 'MMMM yyyy', { locale: ptBR })}
        </h2>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onNextMonth}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {!isCurrentMonth && (
        <Button
          variant="outline"
          size="sm"
          onClick={onCurrentMonth}
          className="text-orange-500 hover:text-orange-400 border-orange-500/30 hover:border-orange-500/50"
        >
          Mês Atual
        </Button>
      )}
    </div>
  );
};
