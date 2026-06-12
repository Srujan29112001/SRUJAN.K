'use client';

import { useEffect } from 'react';
import { ScrollTrigger } from '@/lib/gsap';

// The sections around the new transitions mount via next/dynamic (ssr:false)
// and even mutate height at runtime (chat Command Center expands, ResumeGate
// swaps form/result). Nothing on the page refreshes ScrollTrigger after those
// layout shifts, so pinned triggers measured early end up at stale positions.
// This watches the document height and refreshes — debounced, shared across
// instances, and never while the user is inside a pin or a video transition
// has locked scroll (refreshing mid-pin causes a visible jump).

let lastRefreshAt = 0;

export function usePinFriendlyRefresh(isActive: () => boolean) {
    useEffect(() => {
        let timer: ReturnType<typeof setTimeout> | null = null;
        let lastHeight = document.body.scrollHeight;

        const requestRefresh = () => {
            if (timer) clearTimeout(timer);
            timer = setTimeout(() => {
                timer = null;
                if (isActive()) return; // user is inside this pin — don't jump them
                if (document.body.style.overflow === 'hidden') return; // video transition lock
                if (Date.now() - lastRefreshAt < 500) return; // another instance just did it
                lastRefreshAt = Date.now();
                ScrollTrigger.refresh();
            }, 450);
        };

        const observer = new ResizeObserver(() => {
            const h = document.body.scrollHeight;
            if (Math.abs(h - lastHeight) < 8) return;
            lastHeight = h;
            requestRefresh();
        });
        observer.observe(document.body);

        return () => {
            observer.disconnect();
            if (timer) clearTimeout(timer);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
}
