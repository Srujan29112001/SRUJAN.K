'use client';

import { useState, useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { X } from 'lucide-react';

export function SupportPopup() {
    const [isVisible, setIsVisible] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);
    const popupRef = useRef<HTMLDivElement>(null);
    const hasTriggered = useRef(false);

    useEffect(() => {
        // Use IntersectionObserver instead of ScrollTrigger
        // This triggers based on ACTUAL VISIBILITY, not scroll position
        // This works correctly with pinned/scrolljacked sections

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    // Only trigger when element is actually visible AND intersecting
                    if (entry.isIntersecting && !hasTriggered.current && !isDismissed) {
                        hasTriggered.current = true;
                        setIsVisible(true);
                    }
                });
            },
            {
                // Trigger when 50% of the element is visible
                threshold: 0.5,
                // No root means viewport
                root: null,
            }
        );

        // Wait for DOM to be ready, then observe the testimonials header
        const checkAndObserve = () => {
            const target = document.querySelector('.testimonials-header');
            if (target) {
                observer.observe(target);
            } else {
                // Retry after a short delay if element not found yet
                setTimeout(checkAndObserve, 500);
            }
        };

        checkAndObserve();

        return () => {
            observer.disconnect();
        };
    }, [isDismissed]);

    // Animate popup entrance/exit
    useEffect(() => {
        if (!popupRef.current) return;

        if (isVisible) {
            gsap.fromTo(
                popupRef.current,
                {
                    opacity: 0,
                    y: 50,
                    scale: 0.9,
                },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.5,
                    ease: 'back.out(1.7)',
                }
            );
        }
    }, [isVisible]);

    const handleDismiss = () => {
        gsap.to(popupRef.current, {
            opacity: 0,
            y: 20,
            scale: 0.95,
            duration: 0.3,
            ease: 'power2.in',
            onComplete: () => {
                setIsVisible(false);
                setIsDismissed(true);
            },
        });
    };

    if (!isVisible || isDismissed) return null;

    return (
        <div
            ref={popupRef}
            className="fixed bottom-72 right-4 left-4 sm:left-auto sm:bottom-6 sm:right-6 z-[100] max-w-sm opacity-0"
        >
            {/* Popup Card */}
            <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-white/10 bg-bg-elevated/95 backdrop-blur-xl shadow-2xl shadow-black/50">
                {/* Animated gradient border effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 opacity-50" />

                {/* Glow effect */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl" />

                {/* Close button */}
                <button
                    onClick={handleDismiss}
                    className="absolute top-3 right-3 z-20 p-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors group"
                    aria-label="Dismiss"
                >
                    <X className="w-4 h-4 text-text-muted group-hover:text-white transition-colors" />
                </button>

                {/* Content */}
                <div className="relative z-10 p-4 sm:p-5 md:p-6">
                    {/* Icon */}
                    <div className="mb-3 sm:mb-4 inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20">
                        <svg
                            className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400 animate-pulse"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
                        </svg>
                    </div>

                    {/* Text */}
                    <h4 className="font-display text-base sm:text-lg font-semibold text-white mb-1.5 sm:mb-2">
                        Enjoyed exploring?
                    </h4>
                    <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mb-4 sm:mb-5">
                        If my work inspired you or added value, consider fueling continued innovation in AI & robotics.
                    </p>

                    {/* CTA Button */}
                    <a
                        href="/support"
                        className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 sm:px-5 sm:py-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium text-sm transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/25 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <span className="text-base sm:text-lg font-bold">$</span>
                        Support My Work
                    </a>

                    {/* Secondary dismiss text */}
                    <button
                        onClick={handleDismiss}
                        className="mt-2.5 sm:mt-3 w-full text-center text-xs text-text-muted hover:text-text-secondary transition-colors"
                    >
                        Maybe later
                    </button>
                </div>
            </div>
        </div>
    );
}
