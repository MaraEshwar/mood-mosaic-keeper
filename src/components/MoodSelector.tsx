import { useState } from 'react';
import { MOODS, type MoodValue } from '@/lib/moodData';
import { cn } from '@/lib/utils';

interface MoodSelectorProps {
  selectedMood?: MoodValue;
  onMoodSelect: (mood: MoodValue, emoji: string) => void;
  className?: string;
}

export function MoodSelector({ selectedMood, onMoodSelect, className }: MoodSelectorProps) {
  const [hoveredMood, setHoveredMood] = useState<MoodValue | null>(null);

  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="text-lg font-semibold text-center">How are you feeling today?</h3>
      
      <div className="flex justify-center gap-4 flex-wrap">
        {MOODS.map((mood) => (
          <button
            key={mood.value}
            onClick={() => onMoodSelect(mood.value, mood.emoji)}
            onMouseEnter={() => setHoveredMood(mood.value)}
            onMouseLeave={() => setHoveredMood(null)}
            className={cn(
              "group relative p-4 rounded-2xl transition-all duration-300",
              "hover:scale-110 hover:shadow-mood",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              selectedMood === mood.value
                ? "bg-gradient-warm shadow-mood scale-105"
                : "bg-card hover:bg-gradient-calm",
              hoveredMood === mood.value && selectedMood !== mood.value && "animate-bounce-gentle"
            )}
            aria-label={`Select ${mood.name} mood`}
          >
            <div className="text-4xl md:text-5xl transition-transform duration-200 group-hover:scale-125">
              {mood.emoji}
            </div>
            
            <div className={cn(
              "absolute -bottom-8 left-1/2 transform -translate-x-1/2",
              "text-sm font-medium px-2 py-1 rounded-lg bg-card shadow-soft",
              "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
              "pointer-events-none"
            )}>
              {mood.name}
            </div>
          </button>
        ))}
      </div>
      
      {selectedMood && (
        <div className="text-center animate-scale-in">
          <p className="text-muted-foreground">
            You selected: <span className="font-semibold text-foreground">
              {MOODS.find(m => m.value === selectedMood)?.name}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}