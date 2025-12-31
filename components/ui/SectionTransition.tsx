'use client';

import { useRef, useEffect, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface SectionHeaderProps {
    number: string;
    label: string;
    title: string;
    subtitle?: string;
    align?: 'left' | 'center';
}

export function SectionHeader({
    number,
    label,
    title,
    subtitle,
    align = 'center'
}: SectionHeaderProps) {
    return (
        <div className={`mb-12 md:mb-16 ${align === 'center' ? 'text-center' : 'text-left'}`}>
            {/* Section badge */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className={`inline-flex items-center gap-3 mb-6 ${align === 'center' ? 'mx-auto' : ''}`}
            >
                <span className="font-mono text-xs text-purple-400/80 tracking-widest">{number}</span>
                <span className="w-12 h-px bg-gradient-to-r from-purple-400/50 to-transparent" />
                <span className="font-mono text-xs text-white/50 uppercase tracking-widest">{label}</span>
            </motion.div>

            {/* Main title */}
            <motion.h2
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4"
            >
                {title}
            </motion.h2>

            {/* Subtitle */}
            {subtitle && (
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="font-serif text-lg md:text-xl text-white/50 max-w-2xl mx-auto italic"
                >
                    {subtitle}
                </motion.p>
            )}
        </div>
    );
}

interface SectionWrapperProps {
    children: ReactNode;
    id: string;
    className?: string;
    enableZoomTransition?: boolean;
}

export function SectionWrapper({
    children,
    id,
    className = '',
    enableZoomTransition = true
}: SectionWrapperProps) {
    const sectionRef = useRef<HTMLElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!enableZoomTransition || !sectionRef.current || !contentRef.current) return;

        const ctx = gsap.context(() => {
            // Zoom-in entrance effect
            gsap.fromTo(contentRef.current,
                {
                    scale: 0.9,
                    opacity: 0,
                },
                {
                    scale: 1,
                    opacity: 1,
                    duration: 1,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top 80%',
                        end: 'top 30%',
                        scrub: 1,
                    },
                }
            );

            // Zoom-out exit effect
            ScrollTrigger.create({
                trigger: sectionRef.current,
                start: 'bottom 70%',
                end: 'bottom top',
                scrub: 1,
                animation: gsap.to(contentRef.current, {
                    scale: 0.95,
                    opacity: 0.5,
                }),
            });
        }, sectionRef);

        return () => ctx.revert();
    }, [enableZoomTransition]);

    return (
        <section
            ref={sectionRef}
            id={id}
            className={`relative py-20 md:py-32 overflow-hidden ${className}`}
        >
            <div ref={contentRef}>
                {children}
            </div>
        </section>
    );
}

export default SectionHeader;
