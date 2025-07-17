import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';
import { type MoodEntry, MOODS } from '@/lib/moodData';
import { format, subDays, eachDayOfInterval } from 'date-fns';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title);

interface MoodChartProps {
  entries: MoodEntry[];
}

export function MoodChart({ entries }: MoodChartProps) {
  const pieData = useMemo(() => {
    const moodCounts = entries.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const colors = {
      happy: '#22c55e',     // green
      sad: '#3b82f6',       // blue  
      angry: '#ef4444',     // red
      love: '#ec4899',      // pink
      neutral: '#6b7280'    // gray
    };

    return {
      labels: Object.keys(moodCounts).map(mood => {
        const moodObj = MOODS.find(m => m.value === mood);
        return `${moodObj?.emoji} ${moodObj?.name}`;
      }),
      datasets: [
        {
          data: Object.values(moodCounts),
          backgroundColor: Object.keys(moodCounts).map(mood => colors[mood as keyof typeof colors] || colors.neutral),
          borderWidth: 2,
          borderColor: '#ffffff',
        },
      ],
    };
  }, [entries]);

  const lineData = useMemo(() => {
    // Get last 30 days
    const endDate = new Date();
    const startDate = subDays(endDate, 29);
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const moodScore = {
      angry: 1,
      sad: 2,
      neutral: 3,
      happy: 4,
      love: 5
    };

    const dataPoints = days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const entry = entries.find(e => e.date === dayStr);
      return {
        date: format(day, 'MMM d'),
        score: entry ? moodScore[entry.mood as keyof typeof moodScore] : null
      };
    });

    return {
      labels: dataPoints.map(d => d.date),
      datasets: [
        {
          label: 'Mood Trend',
          data: dataPoints.map(d => d.score),
          borderColor: 'hsl(340 85% 60%)',
          backgroundColor: 'hsl(340 85% 60% / 0.1)',
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          spanGaps: true,
        },
      ],
    };
  }, [entries]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        min: 0.5,
        max: 5.5,
        ticks: {
          stepSize: 1,
          callback: function(value: any) {
            const labels = ['', '😠 Angry', '😢 Sad', '😐 Neutral', '😀 Happy', '😍 Love'];
            return labels[value] || '';
          }
        }
      }
    }
  };

  if (entries.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Mood Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <Pie data={pieData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Mood Trend (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <Line data={lineData} options={lineOptions} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}