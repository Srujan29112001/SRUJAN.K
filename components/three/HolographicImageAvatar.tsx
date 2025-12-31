'use client';

import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface HolographicImageAvatarProps {
    isThinking?: boolean;
    isSpeaking?: boolean;
    className?: string;
}

export function HolographicImageAvatar({
    isThinking = false,
    isSpeaking = false,
    className = ''
}: HolographicImageAvatarProps) {
    const [glitchActive, setGlitchActive] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Random glitch effect when thinking
    useEffect(() => {
        if (isThinking) {
            const glitchInterval = setInterval(() => {
                setGlitchActive(true);
                setTimeout(() => setGlitchActive(false), 100 + Math.random() * 150);
            }, 300 + Math.random() * 500);
            return () => clearInterval(glitchInterval);
        }
    }, [isThinking]);

    return (
        <div
            ref={containerRef}
            className={`relative w-full h-full flex items-center justify-center overflow-hidden ${className}`}
        >
            {/* Background glow */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse at center, rgba(6, 182, 212, 0.15) 0%, transparent 60%)',
                }}
            />

            {/* Holographic container */}
            <motion.div
                className="relative"
                animate={{
                    scale: isSpeaking ? [1, 1.02, 1] : 1,
                }}
                transition={{
                    duration: 0.3,
                    repeat: isSpeaking ? Infinity : 0,
                    repeatType: 'reverse',
                }}
            >
                {/* Main image with holographic effects */}
                <div className="relative w-64 h-80 md:w-80 md:h-96">
                    {/* Cyan color shift layer */}
                    <motion.div
                        className="absolute inset-0 overflow-hidden rounded-2xl"
                        style={{
                            mixBlendMode: 'screen',
                            opacity: 0.6,
                        }}
                        animate={{
                            x: glitchActive ? [-3, 3, -2, 0] : 0,
                        }}
                        transition={{ duration: 0.1 }}
                    >
                        <Image
                            src="/images/avatar/srujan-avatar.jpg"
                            alt="Srujan Avatar"
                            fill
                            className="object-cover object-top rounded-2xl"
                            style={{
                                filter: 'hue-rotate(180deg) saturate(2)',
                            }}
                            priority
                        />
                    </motion.div>

                    {/* Main image */}
                    <motion.div
                        className="absolute inset-0 overflow-hidden rounded-2xl"
                        animate={{
                            x: glitchActive ? [2, -2, 1, 0] : 0,
                            opacity: glitchActive ? [1, 0.8, 1] : 1,
                        }}
                        transition={{ duration: 0.1 }}
                    >
                        <Image
                            src="/images/avatar/srujan-avatar.jpg"
                            alt="Srujan Avatar"
                            fill
                            className="object-cover object-top rounded-2xl"
                            style={{
                                filter: 'contrast(1.1) brightness(1.05)',
                            }}
                            priority
                        />
                    </motion.div>

                    {/* Purple/magenta color shift layer */}
                    <motion.div
                        className="absolute inset-0 overflow-hidden rounded-2xl"
                        style={{
                            mixBlendMode: 'overlay',
                            opacity: 0.4,
                        }}
                        animate={{
                            x: glitchActive ? [3, -3, 2, 0] : 0,
                        }}
                        transition={{ duration: 0.1 }}
                    >
                        <Image
                            src="/images/avatar/srujan-avatar.jpg"
                            alt="Srujan Avatar"
                            fill
                            className="object-cover object-top rounded-2xl"
                            style={{
                                filter: 'hue-rotate(-60deg) saturate(1.5)',
                            }}
                            priority
                        />
                    </motion.div>

                    {/* Scan lines overlay */}
                    <div
                        className="absolute inset-0 rounded-2xl pointer-events-none z-10"
                        style={{
                            background: `repeating-linear-gradient(
                                0deg,
                                transparent,
                                transparent 2px,
                                rgba(0, 0, 0, 0.1) 2px,
                                rgba(0, 0, 0, 0.1) 4px
                            )`,
                        }}
                    />

                    {/* Moving scan line */}
                    <motion.div
                        className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent z-20 rounded-2xl"
                        animate={{
                            top: ['0%', '100%'],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'linear',
                        }}
                    />

                    {/* Holographic border glow */}
                    <div
                        className="absolute inset-0 rounded-2xl pointer-events-none"
                        style={{
                            boxShadow: `
                                0 0 20px rgba(6, 182, 212, 0.3),
                                0 0 40px rgba(6, 182, 212, 0.2),
                                inset 0 0 20px rgba(6, 182, 212, 0.1)
                            `,
                            border: '1px solid rgba(6, 182, 212, 0.3)',
                        }}
                    />

                    {/* Corner brackets */}
                    <div className="absolute top-2 left-2 w-6 h-6 border-l-2 border-t-2 border-cyan-400/60 rounded-tl" />
                    <div className="absolute top-2 right-2 w-6 h-6 border-r-2 border-t-2 border-cyan-400/60 rounded-tr" />
                    <div className="absolute bottom-2 left-2 w-6 h-6 border-l-2 border-b-2 border-cyan-400/60 rounded-bl" />
                    <div className="absolute bottom-2 right-2 w-6 h-6 border-r-2 border-b-2 border-cyan-400/60 rounded-br" />
                </div>

                {/* Floating particles */}
                <div className="absolute inset-0 pointer-events-none">
                    {[...Array(20)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-cyan-400 rounded-full"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                            }}
                            animate={{
                                y: [0, -20, 0],
                                opacity: [0.3, 0.8, 0.3],
                                scale: [1, 1.5, 1],
                            }}
                            transition={{
                                duration: 2 + Math.random() * 2,
                                repeat: Infinity,
                                delay: Math.random() * 2,
                            }}
                        />
                    ))}
                </div>
            </motion.div>

            {/* Holographic rings */}
            <motion.div
                className="absolute w-72 h-72 md:w-96 md:h-96 border border-cyan-400/20 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
                className="absolute w-80 h-80 md:w-[420px] md:h-[420px] border border-purple-400/15 rounded-full"
                animate={{ rotate: -360 }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            />

            {/* Status indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-cyan-400/30">
                <motion.div
                    className={`w-2 h-2 rounded-full ${isThinking
                            ? 'bg-yellow-400'
                            : isSpeaking
                                ? 'bg-green-400'
                                : 'bg-cyan-400'
                        }`}
                    animate={{
                        scale: isThinking || isSpeaking ? [1, 1.3, 1] : 1,
                        opacity: isThinking || isSpeaking ? [1, 0.5, 1] : 1,
                    }}
                    transition={{
                        duration: 0.5,
                        repeat: isThinking || isSpeaking ? Infinity : 0,
                    }}
                />
                <span className="text-xs font-mono text-cyan-400/80 uppercase tracking-wider">
                    {isThinking ? 'Processing...' : isSpeaking ? 'Speaking...' : 'Online'}
                </span>
            </div>

            {/* AI Label */}
            <div className="absolute top-4 left-4 font-mono text-xs text-cyan-400/50">
                <p>{'// HOLOGRAM v2.0'}</p>
                <p>AI_AVATAR: ACTIVE</p>
            </div>

            {/* Data stream effect when thinking */}
            <AnimatePresence>
                {isThinking && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute top-4 right-4 font-mono text-[10px] text-cyan-400/40 text-right"
                    >
                        {['ANALYZING...', 'PROCESSING...', 'COMPUTING...'].map((text, i) => (
                            <motion.p
                                key={i}
                                animate={{ opacity: [0.3, 1, 0.3] }}
                                transition={{ duration: 1, delay: i * 0.3, repeat: Infinity }}
                            >
                                {text}
                            </motion.p>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default HolographicImageAvatar;
