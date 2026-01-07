
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface QuinzenaFilterProps {
  selectedMonth: Date;
  selectedQuinzena: 'primeira' | 'segunda' | 'todas';
  onMonthChange: (month: Date) => void;
  onQuinzenaChange: (quinzena: 'primeira' | 'segunda' | 'todas') => void;
}

export const QuinzenaFilter: React.FC<QuinzenaFilterProps> = ({
  selectedMonth,
  selectedQuinzena,
  onMonthChange,
  onQuinzenaChange,
}) => {
  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const goToPreviousMonth = () => {
    const prevMonth = new Date(selectedMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    onMonthChange(prevMonth);
  };

  const goToNextMonth = () => {
    const nextMonth = new Date(selectedMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    onMonthChange(nextMonth);
  };

  const goToCurrentMonth = () => {
    onMonthChange(new Date());
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center card-tech p-4">
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="icon"
          onClick={goToPreviousMonth}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="min-w-[180px] text-center">
          <span className="text-lg font-semibold capitalize">
            {formatMonth(selectedMonth)}
          </span>
        </div>
        
        <Button 
          variant="outline" 
          size="icon"
          onClick={goToNextMonth}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <Button 
        variant="outline" 
        onClick={goToCurrentMonth}
        className="whitespace-nowrap"
      >
        Mês Atual
      </Button>

      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Quinzena:</label>
        <Select value={selectedQuinzena} onValueChange={onQuinzenaChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas</SelectItem>
            <SelectItem value="primeira">1ª (01-15)</SelectItem>
            <SelectItem value="segunda">2ª (16-30)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
