import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Home, BarChart3, Calendar, Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavigationProps {
  activeTab: 'home' | 'dashboard' | 'calendar';
  onTabChange: (tab: 'home' | 'dashboard' | 'calendar') => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const navItems = [
    { id: 'home', label: 'Journal', icon: Home },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
  ] as const;

  return (
    <nav className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-card border-b border-border">
      <div className="flex items-center gap-2">
        <div className="text-2xl">✨</div>
        <h1 className="text-xl font-bold bg-gradient-warm bg-clip-text text-transparent">
          Mood Journal
        </h1>
      </div>

      <div className="flex items-center gap-2">
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant={activeTab === item.id ? "default" : "ghost"}
            onClick={() => onTabChange(item.id)}
            className={cn(
              "gap-2 transition-all duration-200",
              activeTab === item.id && "bg-gradient-warm shadow-soft"
            )}
          >
            <item.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{item.label}</span>
          </Button>
        ))}
        
        <div className="h-4 w-px bg-border mx-2" />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="h-9 w-9 p-0"
          aria-label="Toggle theme"
        >
          {isDark ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>
      </div>
    </nav>
  );
}