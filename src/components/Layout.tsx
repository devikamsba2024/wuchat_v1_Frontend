'use client';

import { useState, useEffect } from 'react';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or default to system preference
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

  return (
    <div className="min-h-screen">
      {/* Top Yellow Ribbon */}
      <div className="w-full h-8 bg-[var(--wsu-yellow)]"></div>
      
      <Header onThemeToggle={toggleTheme} isDark={isDark} />
      <main>
        {children}
      </main>
      
      {/* Bottom Yellow Ribbon */}
      <div className="w-full h-8 bg-[var(--wsu-yellow)]"></div>
    </div>
  );
}
