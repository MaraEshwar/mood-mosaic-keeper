import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MoodSelector } from './MoodSelector';
import { saveMoodEntry, getMoodEntryByDate, type MoodValue, type MoodEntry } from '@/lib/moodData';
import { format } from 'date-fns';
import { Save, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface JournalFormProps {
  selectedDate?: string; // YYYY-MM-DD format
  onSave?: () => void;
}

export function JournalForm({ selectedDate, onSave }: JournalFormProps) {
  const today = selectedDate || format(new Date(), 'yyyy-MM-dd');
  const [selectedMood, setSelectedMood] = useState<MoodValue | undefined>();
  const [selectedMoodEmoji, setSelectedMoodEmoji] = useState<string>('');
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load existing entry for the selected date
  useEffect(() => {
    const existingEntry = getMoodEntryByDate(today);
    if (existingEntry) {
      setSelectedMood(existingEntry.mood as MoodValue);
      setSelectedMoodEmoji(existingEntry.moodEmoji);
      setNote(existingEntry.note);
    } else {
      // Reset form for new date
      setSelectedMood(undefined);
      setSelectedMoodEmoji('');
      setNote('');
    }
  }, [today]);

  const handleMoodSelect = (mood: MoodValue, emoji: string) => {
    setSelectedMood(mood);
    setSelectedMoodEmoji(emoji);
  };

  const handleSave = async () => {
    if (!selectedMood) {
      toast({
        title: "Please select a mood",
        description: "Choose how you're feeling before saving your entry.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const entry: MoodEntry = {
        id: `${today}-${Date.now()}`,
        date: today,
        mood: selectedMood,
        moodEmoji: selectedMoodEmoji,
        note: note.trim(),
        timestamp: Date.now()
      };

      saveMoodEntry(entry);
      
      toast({
        title: "Entry saved! ✨",
        description: `Your mood and thoughts for ${format(new Date(today), 'MMMM d, yyyy')} have been recorded.`,
      });

      onSave?.();
    } catch (error) {
      toast({
        title: "Failed to save entry",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isToday = today === format(new Date(), 'yyyy-MM-dd');
  const displayDate = format(new Date(today), 'EEEE, MMMM d, yyyy');

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-soft">
      <CardHeader className="text-center space-y-2">
        <CardTitle className="text-2xl font-bold bg-gradient-warm bg-clip-text text-transparent">
          {isToday ? "Today's Entry" : "Journal Entry"}
        </CardTitle>
        <p className="text-muted-foreground">{displayDate}</p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <MoodSelector
          selectedMood={selectedMood}
          onMoodSelect={handleMoodSelect}
        />
        
        <div className="space-y-3">
          <label htmlFor="journal-note" className="block text-lg font-semibold">
            What happened today? 
            <span className="text-muted-foreground font-normal text-base ml-2">
              Share your thoughts...
            </span>
          </label>
          
          <Textarea
            id="journal-note"
            placeholder="Describe your day, feelings, experiences, or anything on your mind..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="min-h-[120px] resize-none focus:ring-primary"
            rows={6}
          />
          
          <div className="text-sm text-muted-foreground text-right">
            {note.length} characters
          </div>
        </div>
        
        <Button
          onClick={handleSave}
          disabled={!selectedMood || isLoading}
          className="w-full bg-gradient-warm hover:opacity-90 transition-opacity"
          size="lg"
        >
          {isLoading ? (
            <>
              <Sparkles className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Entry
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}