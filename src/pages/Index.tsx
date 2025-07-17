import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { JournalForm } from '@/components/JournalForm';
import { Dashboard } from '@/components/Dashboard';
import { Calendar } from '@/components/Calendar';

const Index = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'dashboard' | 'calendar'>('home');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSave = () => {
    // Force refresh of dashboard and calendar when new entry is saved
    setRefreshKey(prev => prev + 1);
  };

  const handleDateSelect = (date: string) => {
    // When date is selected from calendar, switch to journal view
    setActiveTab('home');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="max-w-4xl mx-auto p-4">
            <JournalForm onSave={handleSave} />
          </div>
        );
      case 'dashboard':
        return (
          <div className="max-w-6xl mx-auto p-4">
            <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-warm bg-clip-text text-transparent">
              Your Mood Insights
            </h2>
            <Dashboard key={refreshKey} />
          </div>
        );
      case 'calendar':
        return (
          <div className="max-w-4xl mx-auto p-4">
            <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-warm bg-clip-text text-transparent">
              Mood Calendar
            </h2>
            <Calendar key={refreshKey} onDateSelect={handleDateSelect} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="pb-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;
