'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { getLenis } from '@/lib/lenis';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// The site is presented as discrete, nav-controlled "pages" (a single-page
// view-switcher, not separate routes — so every smart feature keeps its exact
// component tree, props, providers and APIs). Each page is one full view.
export type PageId =
  | 'home'        // Hero + Journey
  | 'skills'
  | 'projects'
  | 'blog'
  | 'testimonials'
  | 'ai'          // AI Chat + Neural Map (Knowledge Graph)
  | 'resume'
  | 'contact';

export const PAGE_IDS: PageId[] = [
  'home',
  'skills',
  'projects',
  'blog',
  'testimonials',
  'ai',
  'resume',
  'contact',
];

// Legacy section anchors (used by deep links and in-content links) → page.
const ANCHOR_TO_PAGE: Record<string, PageId> = {
  hero: 'home',
  about: 'home',
  journey: 'home',
  skills: 'skills',
  'skills-content': 'skills',
  projects: 'projects',
  blog: 'blog',
  testimonials: 'testimonials',
  'testimonials-content': 'testimonials',
  chat: 'ai',
  knowledge: 'ai',
  'knowledge-graph': 'ai',
  neural: 'ai',
  resume: 'resume',
  contact: 'contact',
  booking: 'contact',
};

/** Resolve a hash / anchor id (with or without leading #) to a page, or null. */
export function resolveHashToPage(hash: string): PageId | null {
  const h = (hash || '').replace(/^#/, '').trim().toLowerCase();
  if (!h) return null;
  if ((PAGE_IDS as string[]).includes(h)) return h as PageId;
  return ANCHOR_TO_PAGE[h] ?? null;
}

interface PageNavValue {
  page: PageId;
  /** Switch the active page. Optional anchorId scrolls to an element on it. */
  goTo: (page: PageId, anchorId?: string) => void;
}

const PageNavContext = createContext<PageNavValue>({
  page: 'home',
  // Fallback for any use outside the provider (e.g. a different route): send
  // the user to the main app at the matching view.
  goTo: (page) => {
    if (typeof window !== 'undefined') window.location.href = `/#${page}`;
  },
});

export function usePageNav() {
  return useContext(PageNavContext);
}

export function PageNavProvider({
  children,
  initialPage = 'home',
}: {
  children: ReactNode;
  initialPage?: PageId;
}) {
  const [page, setPage] = useState<PageId>(initialPage);
  const pendingAnchor = useRef<string | null>(null);

  const goTo = useCallback((next: PageId, anchorId?: string) => {
    pendingAnchor.current = anchorId ? anchorId.replace(/^#/, '') : null;
    // Reflect the page in the URL for deep-linking / back-forward, without
    // letting the browser jump-scroll to an element with that id.
    try {
      window.history.pushState(null, '', `#${next}`);
    } catch {
      /* noop */
    }
    setPage(next);
  }, []);

  // Sync from the URL hash on mount and on back/forward navigation.
  useEffect(() => {
    const apply = () => {
      const p = resolveHashToPage(window.location.hash);
      if (p) setPage(p);
    };
    apply();
    window.addEventListener('popstate', apply);
    window.addEventListener('hashchange', apply);
    return () => {
      window.removeEventListener('popstate', apply);
      window.removeEventListener('hashchange', apply);
    };
  }, []);

  // On every page change: reset scroll (or jump to a pending anchor) and
  // re-measure scroll-driven animations now that the content height changed.
  useEffect(() => {
    const anchorId = pendingAnchor.current;
    pendingAnchor.current = null;

    const doScroll = () => {
      const lenis = getLenis();
      const el = anchorId ? document.getElementById(anchorId) : null;
      if (lenis) {
        if (el) lenis.scrollTo(el, { offset: -80, immediate: true, force: true });
        else lenis.scrollTo(0, { immediate: true, force: true });
        lenis.resize();
      } else if (typeof window !== 'undefined') {
        if (el) el.scrollIntoView();
        else window.scrollTo(0, 0);
      }
    };

    const raf = requestAnimationFrame(doScroll);
    const t = setTimeout(() => {
      try {
        ScrollTrigger.refresh();
      } catch {
        /* noop */
      }
      // Heavy / dynamic pages settle their height a beat late — re-run the
      // anchor jump once more so e.g. chat → booking lands precisely.
      if (anchorId) doScroll();
    }, 160);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, [page]);

  return (
    <PageNavContext.Provider value={{ page, goTo }}>
      {children}
    </PageNavContext.Provider>
  );
}
