import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const ThemeToggle = () => {
  const [dark, setDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // System changes always win — clears any manual override
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      setDark(e.matches);
      localStorage.removeItem('theme');
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  return (
    <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle dark mode">
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
};
