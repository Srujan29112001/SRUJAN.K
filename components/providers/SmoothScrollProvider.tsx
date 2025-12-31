'use client';

import { useEffect, ReactNode, createContext, useContext, useState } from 'react';
import Lenis from 'lenis';
import { initLenis, destroyLenis, getLenis } from '@/lib/lenis';

interface SmoothScrollContextType {
  lenis: Lenis | null;
}

const SmoothScrollContext = createContext<SmoothScrollContextType>({
  lenis: null,
});

export function useSmoothScroll() {
  return useContext(SmoothScrollContext);
}

interface SmoothScrollProviderProps {
  children: ReactNode;
}

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    // Disable browser's automatic scroll restoration
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    // Scroll to top on page load/refresh
    window.scrollTo(0, 0);

    // Initialize Lenis
    const lenisInstance = initLenis();
    setLenis(lenisInstance);

    // Add Lenis class to html element
    document.documentElement.classList.add('lenis');

    // Handle window resize to refresh Lenis
    const handleResize = () => {
      lenisInstance.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.documentElement.classList.remove('lenis');
      destroyLenis();
    };
  }, []);

  return (
    <SmoothScrollContext.Provider value={{ lenis }}>
      {children}
    </SmoothScrollContext.Provider>
  );
}
