import { useState, useEffect } from 'react';

export function useTheme() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('app_theme');
    return saved ? saved === 'dark' : true;
  });
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>(() => {
    return (localStorage.getItem('app_fontSize') as 'sm' | 'md' | 'lg') || 'md';
  });
  const [highContrast, setHighContrast] = useState(() => {
    return localStorage.getItem('app_highContrast') === 'true';
  });

  useEffect(() => {
    const root = document.documentElement;
    
    // Theme
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('app_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('app_theme', 'light');
    }

    // High Contrast
    if (highContrast) {
      root.classList.add('high-contrast');
      localStorage.setItem('app_highContrast', 'true');
    } else {
      root.classList.remove('high-contrast');
      localStorage.setItem('app_highContrast', 'false');
    }

    // Font Size
    if (fontSize === 'sm') root.style.fontSize = '14px';
    else if (fontSize === 'md') root.style.fontSize = '16px';
    else if (fontSize === 'lg') root.style.fontSize = '18px';
    localStorage.setItem('app_fontSize', fontSize);

  }, [isDarkMode, highContrast, fontSize]);

  return { isDarkMode, setIsDarkMode, fontSize, setFontSize, highContrast, setHighContrast };
}
