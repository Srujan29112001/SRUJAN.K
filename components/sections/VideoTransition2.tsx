'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { isNavigating, setVideoPlaying } from '@/lib/navigationState';

gsap.registerPlugin(ScrollTrigger);

// Video Overlay Portal Component - renders at body level
function VideoOverlay({
    isVisible,
    videoSrc,
    onComplete,
    showSkip
}: {
    isVisible: boolean;
    videoSrc: string;
    onComplete: () => void;
    showSkip: boolean;
}) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isVisible && videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play().catch(err => {
                console.error('Video play error:', err);
                onComplete();
            });
        } else if (!isVisible && videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
        }
    }, [isVisible, onComplete]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleEnded = () => onComplete();
        const handleError = () => onComplete();

        video.addEventListener('ended', handleEnded);
        video.addEventListener('error', handleError);

        return () => {
            video.removeEventListener('ended', handleEnded);
            video.removeEventListener('error', handleError);
        };
    }, [onComplete]);

    if (!mounted) return null;

    const overlayContent = (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 2147483647,
                backgroundColor: '#000',
                display: isVisible ? 'block' : 'none',
                pointerEvents: isVisible ? 'auto' : 'none',
            }}
        >
            <video
                ref={videoRef}
                src={videoSrc}
                muted
                playsInline
                preload="auto"
                style={{
                    width: '100vw',
                    height: '100vh',
                    objectFit: 'cover',
                    display: 'block',
                }}
            />
            {showSkip && isVisible && (
                <button
                    onClick={onComplete}
                    className="fixed top-4 right-4 sm:top-6 sm:right-6 md:top-8 md:right-8 px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 bg-white/10 hover:bg-white/20 border border-white/30 hover:border-white/50 text-white text-xs sm:text-sm md:text-base font-mono cursor-pointer transition-all duration-300 rounded-full backdrop-blur-md active:scale-95 shadow-lg"
                    style={{
                        zIndex: 2147483647,
                    }}
                >
                    <span className="inline-flex items-center gap-1.5 sm:gap-2">
                        SKIP <span className="text-sm sm:text-base">→</span>
                    </span>
                </button>
            )}
        </div>
    );

    return createPortal(overlayContent, document.body);
}

export function VideoTransition2() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const isPlayingRef = useRef(false);
    const hasTriggeredRef = useRef(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const directionRef = useRef<'down' | 'up'>('down');
    const targetScrollRef = useRef(0);
    const [showVideo, setShowVideo] = useState(false);

    const lockScroll = useCallback(() => {
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
    }, []);

    const unlockScroll = useCallback(() => {
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
    }, []);

    const completeTransition = useCallback(() => {
        console.log('VideoTransition2: Completing, target:', targetScrollRef.current);

        setShowVideo(false);
        unlockScroll();

        requestAnimationFrame(() => {
            window.scrollTo(0, targetScrollRef.current);
        });

        isPlayingRef.current = false;

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        setTimeout(() => {
            hasTriggeredRef.current = false;
            ScrollTrigger.refresh();
        }, 1000);

        setVideoPlaying(false);
    }, [unlockScroll]);

    const playVideo = useCallback((direction: 'down' | 'up') => {
        if (isPlayingRef.current || hasTriggeredRef.current) return;
        if (document.body.style.overflow === 'hidden') return;
        if (isNavigating()) return;

        // Calculate target FIRST - get fresh values each time using getBoundingClientRect
        if (direction === 'down') {
            const blog = document.getElementById('blog');
            if (blog) {
                const rect = blog.getBoundingClientRect();
                targetScrollRef.current = rect.top + window.scrollY;
                console.log('VideoTransition2: DOWN target =', targetScrollRef.current);
            } else {
                console.error('Cannot find #blog');
                return;
            }
        } else {
            // Scroll UP - go to exit/bottom of Projects section
            const projects = document.getElementById('projects');
            if (projects) {
                const rect = projects.getBoundingClientRect();
                const projectsBottom = rect.bottom + window.scrollY;
                targetScrollRef.current = projectsBottom - window.innerHeight + 100;
                console.log('VideoTransition2: UP target =', targetScrollRef.current);
            } else {
                console.error('Cannot find #projects');
                return;
            }
        }

        hasTriggeredRef.current = true;
        isPlayingRef.current = true;
        directionRef.current = direction;

        setVideoPlaying(true);
        lockScroll();
        setShowVideo(true);

        timeoutRef.current = setTimeout(completeTransition, 15000);
    }, [completeTransition, lockScroll]);

    useEffect(() => {
        const section = sectionRef.current;
        const content = contentRef.current;
        if (!section || !content) return;

        let lastProgress = 0;
        let lastScrollY = window.scrollY;

        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: section,
                    start: 'top top',
                    end: '+=1200',
                    pin: true,
                    scrub: 0.5,
                    anticipatePin: 1,
                    invalidateOnRefresh: true, // Recalculate on refresh
                    onUpdate: (self) => {
                        const currentScrollY = window.scrollY;
                        const scrollingDown = currentScrollY > lastScrollY;
                        lastScrollY = currentScrollY;

                        if (scrollingDown && lastProgress < 0.85 && self.progress >= 0.85) {
                            playVideo('down');
                        }

                        if (!scrollingDown && lastProgress > 0.15 && self.progress <= 0.15) {
                            playVideo('up');
                        }

                        lastProgress = self.progress;
                    },
                    onEnterBack: () => {
                        if (!isPlayingRef.current) hasTriggeredRef.current = false;
                    },
                    onLeave: () => {
                        if (!isPlayingRef.current) hasTriggeredRef.current = false;
                    }
                }
            });

            tl.fromTo(content,
                { scale: 1, filter: 'blur(0px)', opacity: 1 },
                { scale: 2, filter: 'blur(20px)', opacity: 0, duration: 1, ease: 'power2.inOut' }
            );
        }, section);

        // Watch Projects section for size changes (category switch, expand/collapse)
        const projects = document.getElementById('projects');
        let resizeTimeout: NodeJS.Timeout;

        const resizeObserver = new ResizeObserver(() => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (!isPlayingRef.current) {
                    hasTriggeredRef.current = false;
                    ScrollTrigger.refresh();
                    console.log('VideoTransition2: Projects size changed, refreshed ScrollTrigger');
                }
            }, 300);
        });

        if (projects) {
            resizeObserver.observe(projects);
        }

        return () => {
            ctx.revert();
            resizeObserver.disconnect();
            clearTimeout(resizeTimeout);
            unlockScroll();
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [playVideo, unlockScroll]);

    return (
        <>
            <section
                ref={sectionRef}
                id="video-transition-2"
                className="relative h-screen overflow-hidden bg-black"
                style={{ marginTop: '-1px', marginBottom: '-1px' }}
            >
                <div
                    ref={contentRef}
                    className="absolute inset-0 flex items-center justify-center px-4"
                    style={{ transformOrigin: 'center center' }}
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a12] via-black to-[#0a0a12]" />
                    <div className="relative z-10 text-center">
                        <div className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-cyan-400/50 mb-3 sm:mb-4">
                            FASTEN SEATBELTS
                        </div>
                        <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white/20 tracking-tight">
                            PREPARING FOR TAKEOFF
                        </h2>
                    </div>
                </div>
            </section>

            <VideoOverlay
                isVisible={showVideo}
                videoSrc="/videos/video1.mp4"
                onComplete={completeTransition}
                showSkip={showVideo}
            />
        </>
    );
}
