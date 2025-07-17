import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getMoodEntries, getMoodEntryByDate, type MoodEntry, MOODS } from '@/lib/moodData';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { JournalForm } from './JournalForm';

interface CalendarProps {
  onDateSelect?: (date: string) => void;
}

export function Calendar({ onDateSelect }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showJournalDialog, setShowJournalDialog] = useState(false);
  
  const entries = useMemo(() => getMoodEntries(), []);
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Add padding days for calendar grid
  const startDay = monthStart.getDay(); // 0 = Sunday
  const paddingDays = Array.from({ length: startDay }, (_, i) => {
    const date = new Date(monthStart);
    date.setDate(date.getDate() - (startDay - i));
    return date;
  });

  const endDay = monthEnd.getDay(); // 0 = Sunday
  const paddingEndDays = Array.from({ length: 6 - endDay }, (_, i) => {
    const date = new Date(monthEnd);
    date.setDate(date.getDate() + (i + 1));
    return date;
  });

  const allDays = [...paddingDays, ...monthDays, ...paddingEndDays];

  const getEntryForDate = (date: Date): MoodEntry | undefined => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return entries.find(entry => entry.date === dateStr);
  };

  const handleDateClick = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    setSelectedDate(dateStr);
    setShowJournalDialog(true);
    onDateSelect?.(dateStr);
  };

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const today = new Date();

  return (
    <>
      <Card className="shadow-soft">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{format(currentDate, 'MMMM yyyy')}</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevMonth}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextMonth}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {allDays.map((date, index) => {
              const entry = getEntryForDate(date);
              const isCurrentMonth = isSameMonth(date, currentDate);
              const isToday = isSameDay(date, today);
              const isPast = date < today;
              const isFuture = date > today;
              
              return (
                <button
                  key={index}
                  onClick={() => handleDateClick(date)}
                  disabled={!isCurrentMonth}
                  className={cn(
                    "relative p-2 h-12 text-sm transition-all duration-200",
                    "hover:bg-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1",
                    !isCurrentMonth && "text-muted-foreground opacity-40",
                    isToday && "bg-primary text-primary-foreground font-bold",
                    entry && !isToday && "bg-gradient-calm",
                    isFuture && isCurrentMonth && "text-muted-foreground opacity-60"
                  )}
                >
                  <span className="relative z-10">
                    {format(date, 'd')}
                  </span>
                  
                  {entry && (
                    <div className="absolute top-1 right-1 text-lg leading-none">
                      {entry.moodEmoji}
                    </div>
                  )}
                  
                  {isToday && !entry && (
                    <div className="absolute inset-0 rounded-lg border-2 border-primary animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
          
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Click on any date to add or view your mood entry
          </div>
        </CardContent>
      </Card>

      <Dialog open={showJournalDialog} onOpenChange={setShowJournalDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Journal Entry</DialogTitle>
          </DialogHeader>
          
          {selectedDate && (
            <JournalForm
              selectedDate={selectedDate}
              onSave={() => {
                setShowJournalDialog(false);
                // Force re-render by updating currentDate
                setCurrentDate(new Date(currentDate));
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}