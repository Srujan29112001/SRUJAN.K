'use client';

import { useRef, useEffect, useLayoutEffect } from 'react';
import dynamic from 'next/dynamic';
import { CustomCursor } from '@/components/ui/CustomCursor';
import { AINavigation } from '@/components/ui/AINavigation';
import { MotionProvider } from '@/components/ui/ResponsiveMotion';

// Dynamic imports for heavy components
const AIHero = dynamic(() => import('@/components/sections/AIHero'), { ssr: false });
const ProjectCalculator = dynamic(
    () => import('@/components/sections/ProjectCalculator').then(m => m.ProjectCalculator),
    { ssr: false }
);

export default function AIAssistantPage() {
    const calculatorRef = useRef<{ scrollToCalculator: () => void }>(null);

    // Force scroll to top BEFORE paint using useLayoutEffect
    useLayoutEffect(() => {
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
    }, []);

    // Force scroll to top on page load with aggressive correction
    useEffect(() => {
        const scrollToTop = () => {
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
        };

        scrollToTop();
        requestAnimationFrame(() => {
            scrollToTop();
            requestAnimationFrame(scrollToTop);
        });

        const delays = [10, 50, 100, 150, 200, 300, 400, 500, 750, 1000, 1500, 2000, 2500, 3000];
        const timers = delays.map(delay => setTimeout(scrollToTop, delay));

        let checkCount = 0;
        const maxChecks = 50;
        const scrollChecker = setInterval(() => {
            checkCount++;
            if (window.scrollY > 10) {
                scrollToTop();
            }
            if (checkCount >= maxChecks) {
                clearInterval(scrollChecker);
            }
        }, 60);

        return () => {
            timers.forEach(t => clearTimeout(t));
            clearInterval(scrollChecker);
        };
    }, []);

    return (
        <MotionProvider>
            <CustomCursor />
            <AINavigation />

            <main className="bg-[#0a0a0f] pb-48 sm:pb-24 md:pb-0">
                {/* Hero Section */}
                <AIHero />

                {/* Project Calculator Section */}
                <ProjectCalculator ref={calculatorRef} />

                {/* Simple Footer */}
                <footer className="py-16 sm:py-12 md:py-8 px-4 sm:px-6 border-t border-white/10 bg-[#0a0a0f] min-h-[120px] flex items-center">
                    <div className="max-w-6xl mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
                        <p className="font-mono text-[10px] sm:text-xs text-white/50 md:text-white/40 text-center md:text-left">
                            © {new Date().getFullYear()} Srujan. All rights reserved.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 md:gap-4">
                            <a
                                href="/"
                                className="font-mono text-[10px] sm:text-xs text-white/50 md:text-white/40 hover:text-white/80 transition-colors active:scale-95"
                            >
                                Back to Portfolio
                            </a>
                            <span className="text-white/20 hidden sm:inline">|</span>
                            <a
                                href="mailto:contact@srujan.dev"
                                className="font-mono text-[10px] sm:text-xs text-white/50 md:text-white/40 hover:text-white/80 transition-colors break-all active:scale-95"
                            >
                                contact@srujan.dev
                            </a>
                        </div>
                    </div>
                </footer>
            </main>
        </MotionProvider>
    );
}
