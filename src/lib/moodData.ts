import { supabase } from "@/integrations/supabase/client";

export interface MoodEntry {
  id: string;
  date: string; // YYYY-MM-DD format
  mood: string;
  moodEmoji: string;
  note: string;
  timestamp: number;
}

export const MOODS = [
  { emoji: '😀', name: 'Happy', value: 'happy' },
  { emoji: '😢', name: 'Sad', value: 'sad' },
  { emoji: '😠', name: 'Angry', value: 'angry' },
  { emoji: '😍', name: 'Love', value: 'love' },
  { emoji: '😐', name: 'Neutral', value: 'neutral' },
] as const;

export type MoodValue = typeof MOODS[number]['value'];

export const saveMoodEntry = async (entry: MoodEntry): Promise<void> => {
  // Check if there's already an entry for this date
  const { data: existingEntry } = await supabase
    .from('mood_entries')
    .select('*')
    .eq('date', entry.date)
    .maybeSingle();

  if (existingEntry) {
    // Update existing entry
    const { error } = await supabase
      .from('mood_entries')
      .update({ 
        mood: entry.mood, 
        note: entry.note 
      })
      .eq('id', existingEntry.id);
    
    if (error) throw error;
  } else {
    // Create new entry
    const { error } = await supabase
      .from('mood_entries')
      .insert({ 
        mood: entry.mood, 
        note: entry.note, 
        date: entry.date 
      });
    
    if (error) throw error;
  }
};

export const getMoodEntries = async (): Promise<MoodEntry[]> => {
  const { data, error } = await supabase
    .from('mood_entries')
    .select('*')
    .order('date', { ascending: false });
  
  if (error) throw error;
  
  return data?.map(entry => ({
    id: entry.id,
    mood: entry.mood,
    moodEmoji: MOODS.find(m => m.value === entry.mood)?.emoji || '😐',
    note: entry.note || '',
    date: entry.date,
    timestamp: new Date(entry.created_at).getTime(),
  })) || [];
};

export const getMoodEntryByDate = async (date: string): Promise<MoodEntry | undefined> => {
  const { data, error } = await supabase
    .from('mood_entries')
    .select('*')
    .eq('date', date)
    .maybeSingle();
  
  if (error) throw error;
  
  return data ? {
    id: data.id,
    mood: data.mood,
    moodEmoji: MOODS.find(m => m.value === data.mood)?.emoji || '😐',
    note: data.note || '',
    date: data.date,
    timestamp: new Date(data.created_at).getTime(),
  } : undefined;
};

export const deleteMoodEntry = async (date: string): Promise<void> => {
  const { error } = await supabase
    .from('mood_entries')
    .delete()
    .eq('date', date);
  
  if (error) throw error;
};

export const exportToCSV = async (): Promise<string> => {
  const entries = await getMoodEntries();
  const headers = ['Date', 'Mood', 'Emoji', 'Note'];
  const rows = entries.map(entry => [
    entry.date,
    entry.mood,
    entry.moodEmoji,
    `"${entry.note.replace(/"/g, '""')}"` // Escape quotes for CSV
  ]);
  
  return [headers, ...rows].map(row => row.join(',')).join('\n');
};

export const getMoodStats = async () => {
  const entries = await getMoodEntries();
  
  if (entries.length === 0) {
    return {
      totalEntries: 0,
      mostCommonMood: null,
      moodDistribution: {},
      recentStreak: 0
    };
  }

  // Count mood distribution
  const moodCounts = entries.reduce((acc, entry) => {
    acc[entry.mood] = (acc[entry.mood] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Find most common mood
  const mostCommonMood = Object.entries(moodCounts)
    .sort(([,a], [,b]) => b - a)[0];

  // Calculate recent streak (consecutive days with entries)
  const sortedEntries = entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  let streak = 0;
  const today = new Date();
  
  for (let i = 0; i < sortedEntries.length; i++) {
    const entryDate = new Date(sortedEntries[i].date);
    const expectedDate = new Date(today);
    expectedDate.setDate(today.getDate() - i);
    
    if (entryDate.toDateString() === expectedDate.toDateString()) {
      streak++;
    } else {
      break;
    }
  }

  return {
    totalEntries: entries.length,
    mostCommonMood: mostCommonMood ? {
      mood: mostCommonMood[0],
      count: mostCommonMood[1],
      emoji: MOODS.find(m => m.value === mostCommonMood[0])?.emoji || '😐'
    } : null,
    moodDistribution: moodCounts,
    recentStreak: streak
  };
};