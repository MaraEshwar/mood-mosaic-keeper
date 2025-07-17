import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getMoodStats, getMoodEntries, exportToCSV } from '@/lib/moodData';
import { Download, TrendingUp, Calendar, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MoodChart } from './MoodChart';

export function Dashboard() {
  const { toast } = useToast();
  
  const stats = useMemo(() => getMoodStats(), []);
  const entries = useMemo(() => getMoodEntries(), []);

  const handleExport = () => {
    try {
      const csvData = exportToCSV();
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mood-journal-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Export successful! 📥",
        description: "Your mood data has been downloaded as a CSV file.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const getRandomQuote = (mood?: string) => {
    const quotes = {
      happy: [
        "Happiness is not something ready made. It comes from your own actions. - Dalai Lama",
        "The purpose of our lives is to be happy. - Dalai Lama",
        "Happiness is a warm puppy. - Charles M. Schulz"
      ],
      sad: [
        "The way sadness works is one of the strange riddles of the world. - Lemony Snicket",
        "Every human walks around with a certain kind of sadness. - R.J. Palacio",
        "Sadness flies away on the wings of time. - Jean de La Fontaine"
      ],
      angry: [
        "Anger is an acid that can do more harm to the vessel in which it is stored than to anything on which it is poured. - Mark Twain",
        "For every minute you remain angry, you give up sixty seconds of peace of mind. - Ralph Waldo Emerson"
      ],
      love: [
        "Being deeply loved by someone gives you strength, while loving someone deeply gives you courage. - Lao Tzu",
        "Love is composed of a single soul inhabiting two bodies. - Aristotle"
      ],
      neutral: [
        "Peace comes from within. Do not seek it without. - Buddha",
        "Sometimes the most productive thing you can do is relax. - Mark Black"
      ]
    };

    const moodQuotes = mood ? quotes[mood as keyof typeof quotes] || quotes.neutral : quotes.neutral;
    return moodQuotes[Math.floor(Math.random() * moodQuotes.length)];
  };

  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">Start Your Journey</h3>
        <p className="text-muted-foreground mb-6">
          Begin tracking your mood to see insights and patterns over time.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEntries}</div>
            <p className="text-xs text-muted-foreground">
              {stats.recentStreak > 0 ? `${stats.recentStreak} day streak!` : 'Keep going!'}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Common Mood</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {stats.mostCommonMood ? (
              <>
                <div className="text-2xl font-bold flex items-center gap-2">
                  <span>{stats.mostCommonMood.emoji}</span>
                  <span className="capitalize">{stats.mostCommonMood.mood}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.mostCommonMood.count} times
                </p>
              </>
            ) : (
              <div className="text-2xl font-bold">-</div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentStreak}</div>
            <p className="text-xs text-muted-foreground">
              consecutive days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <MoodChart entries={entries} />

      {/* Daily Quote */}
      <Card className="shadow-soft bg-gradient-calm">
        <CardHeader>
          <CardTitle className="text-lg">Daily Inspiration</CardTitle>
        </CardHeader>
        <CardContent>
          <blockquote className="italic text-muted-foreground">
            "{getRandomQuote(stats.mostCommonMood?.mood)}"
          </blockquote>
        </CardContent>
      </Card>

      {/* Export Button */}
      <div className="flex justify-center">
        <Button onClick={handleExport} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Data
        </Button>
      </div>
    </div>
  );
}