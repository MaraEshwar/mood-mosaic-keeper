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

export const STORAGE_KEY = 'mood-journal-entries';

export const saveMoodEntry = (entry: MoodEntry): void => {
  const entries = getMoodEntries();
  const existingIndex = entries.findIndex(e => e.date === entry.date);
  
  if (existingIndex >= 0) {
    entries[existingIndex] = entry;
  } else {
    entries.push(entry);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};

export const getMoodEntries = (): MoodEntry[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const getMoodEntryByDate = (date: string): MoodEntry | undefined => {
  const entries = getMoodEntries();
  return entries.find(entry => entry.date === date);
};

export const deleteMoodEntry = (date: string): void => {
  const entries = getMoodEntries();
  const filtered = entries.filter(entry => entry.date !== date);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

export const exportToCSV = (): string => {
  const entries = getMoodEntries();
  const headers = ['Date', 'Mood', 'Emoji', 'Note'];
  const rows = entries.map(entry => [
    entry.date,
    entry.mood,
    entry.moodEmoji,
    `"${entry.note.replace(/"/g, '""')}"` // Escape quotes for CSV
  ]);
  
  return [headers, ...rows].map(row => row.join(',')).join('\n');
};

export const getMoodStats = () => {
  const entries = getMoodEntries();
  
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