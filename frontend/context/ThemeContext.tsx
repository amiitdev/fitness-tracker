import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { themes, defaultTheme, type Theme } from '../constants/themes';
import { useAuth } from './AuthContext';

console.log('[THEME] ThemeContext.tsx loaded');

interface ThemeContextType {
  theme: Theme;
  currentThemeKey: string;
  setTheme: (key: string) => void;
  themeOptions: { key: string; name: string; color: string }[];
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const themeOptionList = Object.values(themes).map(t => ({
  key: t.key,
  name: t.name,
  color: t.colors.primary,
}));

export function ThemeProvider({ children }: { children: ReactNode }) {
  console.log('[THEME] ThemeProvider() rendering');
  const { user, updateUser } = useAuth();
  const [currentThemeKey, setCurrentThemeKey] = useState('dark1');

  useEffect(() => {
    console.log('[THEME] useEffect - user theme:', user?.preferredTheme);
    if (user?.preferredTheme) {
      setCurrentThemeKey(user.preferredTheme);
    }
  }, [user?.preferredTheme]);

  const setTheme = useCallback(async (key: string) => {
    console.log('[THEME] setTheme() called:', key);
    setCurrentThemeKey(key);
    if (user) {
      try {
        await updateUser({ preferredTheme: key });
      } catch (err) {
        console.log('[THEME] setTheme error:', err);
      }
    }
  }, [user, updateUser]);

  const theme = themes[currentThemeKey] || defaultTheme;

  return (
    <ThemeContext.Provider value={{ theme, currentThemeKey, setTheme, themeOptions: themeOptionList }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
