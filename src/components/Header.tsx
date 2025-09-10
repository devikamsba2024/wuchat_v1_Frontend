'use client';

import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-react';

interface HeaderProps {
  onThemeToggle?: () => void;
  isDark?: boolean;
}

export default function Header({ onThemeToggle, isDark = false }: HeaderProps) {


  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Main Header */}
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="text-2xl font-heading font-bold text-[var(--wsu-black)]">
            WU Assistant
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onThemeToggle}
            className="text-[var(--wsu-black)] hover:bg-gray-100 h-8 px-3"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </header>
  );
}
