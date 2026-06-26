'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

export type Theme = 'dark' | 'light';

interface ThemeValue {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeValue>({
  theme: 'dark',
  toggle: () => {},
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

function applyTheme(t: Theme) {
  if (typeof document === 'undefined') return;
  const el = document.documentElement;
  if (t === 'light') el.classList.add('light');
  else el.classList.remove('light');
  el.style.colorScheme = t;
}

/**
 * Inline script string for the document head — sets the theme class BEFORE
 * first paint so there's no dark→light flash on load.
 */
export const themeNoFlashScript = `(function(){try{var t=localStorage.getItem('theme');if(t==='light'){document.documentElement.classList.add('light');document.documentElement.style.colorScheme='light';}else{document.documentElement.style.colorScheme='dark';}}catch(e){}})();`;

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');

  // Read persisted choice on mount (the no-flash script already applied the class).
  useEffect(() => {
    let stored: Theme = 'dark';
    try {
      stored = (localStorage.getItem('theme') as Theme) || 'dark';
    } catch {
      /* noop */
    }
    setThemeState(stored);
    applyTheme(stored);
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    try {
      localStorage.setItem('theme', t);
    } catch {
      /* noop */
    }
    applyTheme(t);
  }, []);

  const toggle = useCallback(() => {
    setThemeState((prev) => {
      const next: Theme = prev === 'light' ? 'dark' : 'light';
      try {
        localStorage.setItem('theme', next);
      } catch {
        /* noop */
      }
      applyTheme(next);
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggle, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
