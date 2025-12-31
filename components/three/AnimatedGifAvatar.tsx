'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Avatar emotion states
type AvatarEmotion =
    | 'idle'
    | 'talking'
    | 'thinking'
    | 'excited'
    | 'confused'
    | 'shy'
    | 'surprised'
    | 'happy'
    | 'thumbsUp'
    | 'waving';

// Array of mix GIFs to randomly cycle through during idle conversation
const idleMixGifs = [
    '/Gifs/closeup(head)/metaperson_mix.gif',
    '/Gifs/closeup(head)/metaperson_mix_2.gif',
    '/Gifs/closeup(head)/metaperson_mix_3.gif',
    '/Gifs/closeup(head)/metaperson_mix_4.gif',
    '/Gifs/closeup(head)/metaperson_mix_5.gif',
    '/Gifs/full view(head to toe)/metaperson_waving.gif',
];

// GIF mappings for different states
const headGifs: Record<AvatarEmotion, string> = {
    idle: '/Gifs/closeup(head)/metaperson_mix.gif', // This will be overridden by random selection
    talking: '/Gifs/closeup(head)/metaperson_talking.gif',
    thinking: '/Gifs/closeup(head)/metaperson_confused.gif',
    excited: '/Gifs/closeup(head)/metaperson_excited.gif',
    confused: '/Gifs/closeup(head)/metaperson_confused.gif',
    shy: '/Gifs/closeup(head)/metaperson_shy.gif',
    surprised: '/Gifs/closeup(head)/metaperson_surprised.gif',
    happy: '/Gifs/closeup(head)/metaperson_glad.gif',
    thumbsUp: '/Gifs/closeup(head)/metaperson_thumbs_up.gif',
    waving: '/Gifs/closeup(head)/metaperson_ok.gif',
};

const fullBodyGifs: Record<AvatarEmotion, string> = {
    idle: '/Gifs/full view(head to toe)/metaperson_idle.gif',
    talking: '/Gifs/full view(head to toe)/metaperson_reacting.gif',
    thinking: '/Gifs/full view(head to toe)/metaperson_looking.gif',
    excited: '/Gifs/full view(head to toe)/metaperson_excited.gif',
    confused: '/Gifs/full view(head to toe)/metaperson_dizzy_idle.gif',
    shy: '/Gifs/full view(head to toe)/metaperson_shy.gif',
    surprised: '/Gifs/full view(head to toe)/metaperson_reacting.gif',
    happy: '/Gifs/full view(head to toe)/metaperson_happy_idle.gif',
    thumbsUp: '/Gifs/full view(head to toe)/metaperson_waving.gif',
    waving: '/Gifs/full view(head to toe)/metaperson_waving.gif',
};

interface AnimatedGifAvatarProps {
    isThinking?: boolean;
    isSpeaking?: boolean;
    hasConversation?: boolean;
    emotion?: AvatarEmotion;
    viewMode?: 'head' | 'fullBody';
    specialAction?: 'backflip' | 'zombie' | 'scared' | 'dizzy' | 'shocked' | 'terrified' | 'chill' | 'shy' | 'excited' | 'looking' | 'walking' | 'shuffle' | 'silly' | 'wave' | 'breakdance' | 'blushing' | 'kissing' | 'smirk' | 'disappointed' | 'surprised' | 'suspicious' | 'okSign' | 'irritated' | 'laughing' | 'thumbsUp' | 'glad' | 'confused' | 'waving' | null;
    onSpecialActionComplete?: () => void;
    className?: string;
}

// Special action GIFs
const specialActionGifs: Record<string, string> = {
    backflip: '/Gifs/full view(head to toe)/metaperson_run_to_flip.gif',
    zombie: '/Gifs/full view(head to toe)/metaperson_zombie_scream.gif',
    scared: '/Gifs/full view(head to toe)/metaperson_dodging_back.gif',
    dizzy: '/Gifs/full view(head to toe)/metaperson_dizzy_idle.gif',
    shocked: '/Gifs/full view(head to toe)/metaperson_reacting.gif',
    terrified: '/Gifs/full view(head to toe)/metaperson_running.gif',
    chill: '/Gifs/full view(head to toe)/metaperson_happy_idle.gif',
    shy: '/Gifs/full view(head to toe)/metaperson_shy.gif',
    excited: '/Gifs/full view(head to toe)/metaperson_excited.gif',
    looking: '/Gifs/full view(head to toe)/metaperson_looking.gif',
    walking: '/Gifs/full view(head to toe)/metaperson_walk.gif',
    shuffle: '/Gifs/full view(head to toe)/metaperson_shuffling.gif',
    silly: '/Gifs/full view(head to toe)/metaperson_silly_dancing.gif',
    wave: '/Gifs/full view(head to toe)/metaperson_wave_dance.gif',
    breakdance: '/Gifs/full view(head to toe)/metaperson_breakdance.gif',
    blushing: '/Gifs/closeup(head)/metaperson_shy.gif',
    kissing: '/Gifs/closeup(head)/metaperson_kissing.gif',
    smirk: '/Gifs/closeup(head)/metaperson_excited.gif',
    disappointed: '/Gifs/closeup(head)/metaperson_disappointed.gif',
    surprised: '/Gifs/closeup(head)/metaperson_surprised.gif',
    suspicious: '/Gifs/closeup(head)/metaperson_suspicious.gif',
    okSign: '/Gifs/closeup(head)/metaperson_ok.gif',
    irritated: '/Gifs/closeup(head)/metaperson_wicked.gif',
    laughing: '/Gifs/closeup(head)/metaperson_xd.gif',
    thumbsUp: '/Gifs/closeup(head)/metaperson_thumbs_up.gif',
    glad: '/Gifs/closeup(head)/metaperson_glad.gif',
    confused: '/Gifs/closeup(head)/metaperson_confused.gif',
    waving: '/Gifs/full view(head to toe)/metaperson_waving.gif',
};

export function AnimatedGifAvatar({
    isThinking = false,
    isSpeaking = false,
    hasConversation = false,
    emotion,
    viewMode = 'head',
    specialAction = null,
    onSpecialActionComplete,
    className = ''
}: AnimatedGifAvatarProps) {
    const [currentEmotion, setCurrentEmotion] = useState<AvatarEmotion>('idle');
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [currentIdleGifIndex, setCurrentIdleGifIndex] = useState(0);
    const [isPlayingSpecialAction, setIsPlayingSpecialAction] = useState(false);
    const [specialActionKey, setSpecialActionKey] = useState(0);
    const specialActionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Handle special actions (like backflip)
    useEffect(() => {
        if (specialAction) {
            setSpecialActionKey(prev => prev + 1); // Force fresh GIF load

            // Clear any existing timeout
            if (specialActionTimeoutRef.current) {
                clearTimeout(specialActionTimeoutRef.current);
            }

            // Action-specific durations
            const actionDurations: Record<string, number> = {
                backflip: 2000,
                zombie: 2000,
                scared: 2000,
                dizzy: 3000,
                shocked: 3200,
                terrified: 3000,
                chill: 3500,
                shy: 5000,
                excited: 3500,
                looking: 3000,
                walking: 3000,
                shuffle: 4000,
                silly: 5000,
                wave: 15500,
                breakdance: 5000,
                blushing: 3000,
                kissing: 3000,
                smirk: 3000,
                disappointed: 3000,
                surprised: 3000,
                suspicious: 3000,
                okSign: 3000,
                irritated: 3000,
                laughing: 3000,
                thumbsUp: 3000,
                glad: 3000,
                confused: 3000,
                waving: 3000,
            };
            const duration = actionDurations[specialAction] || 2000;

            // Play the special action, then reset
            specialActionTimeoutRef.current = setTimeout(() => {
                onSpecialActionComplete?.();
            }, duration);

            return () => {
                if (specialActionTimeoutRef.current) {
                    clearTimeout(specialActionTimeoutRef.current);
                }
            };
        }
    }, [specialAction, onSpecialActionComplete]);

    // Get random idle GIF index (different from current)
    const getRandomIdleIndex = useCallback(() => {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * idleMixGifs.length);
        } while (newIndex === currentIdleGifIndex && idleMixGifs.length > 1);
        return newIndex;
    }, [currentIdleGifIndex]);

    // Cycle through idle GIFs when conversation is active and avatar is idle
    useEffect(() => {
        if (hasConversation && currentEmotion === 'idle' && !isThinking && !isSpeaking) {
            // Change idle GIF every 5-8 seconds randomly
            const interval = setInterval(() => {
                setCurrentIdleGifIndex(getRandomIdleIndex());
            }, 5000 + Math.random() * 3000);

            return () => clearInterval(interval);
        }
    }, [hasConversation, currentEmotion, isThinking, isSpeaking, getRandomIdleIndex]);

    // Determine emotion based on props
    useEffect(() => {
        let newEmotion: AvatarEmotion = 'idle';

        if (emotion) {
            newEmotion = emotion;
        } else if (isThinking) {
            newEmotion = 'thinking';
        } else if (isSpeaking) {
            newEmotion = 'talking';
        }

        if (newEmotion !== currentEmotion) {
            setIsTransitioning(true);
            setTimeout(() => {
                setCurrentEmotion(newEmotion);
                setIsTransitioning(false);
            }, 150);
        }
    }, [isThinking, isSpeaking, emotion, currentEmotion]);

    // Get the current GIF
    const currentGif = useMemo(() => {
        // Special actions take priority (like backflip)
        if (specialAction) {
            // Add cache-buster to force fresh GIF load (prevents looping)
            return `${specialActionGifs[specialAction]}?t=${specialActionKey}`;
        }

        // Before conversation starts, show full body idle
        if (!hasConversation && currentEmotion === 'idle') {
            return '/Gifs/full view(head to toe)/metaperson_idle.gif';
        }

        // During conversation idle, cycle through mix GIFs
        if (hasConversation && currentEmotion === 'idle') {
            return idleMixGifs[currentIdleGifIndex];
        }

        // For other emotions, use the mapped GIFs
        return viewMode === 'head'
            ? headGifs[currentEmotion]
            : fullBodyGifs[currentEmotion];
    }, [currentEmotion, viewMode, hasConversation, currentIdleGifIndex, specialAction, specialActionKey]);

    return (
        <div className={`relative w-full h-full overflow-hidden ${className}`}>
            {/* Simple dark gradient background */}
            <div
                className="absolute inset-0"
                style={{
                    background: 'linear-gradient(180deg, #0a0a0f 0%, #0f0a1a 100%)',
                }}
            />

            {/* Full-size Avatar GIF - zoomed in to hide watermark */}
            <motion.div
                className="absolute inset-0"
                animate={{
                    scale: isSpeaking ? [1, 1.01, 1] : 1,
                }}
                transition={{
                    duration: 0.8,
                    repeat: isSpeaking ? Infinity : 0,
                    repeatType: 'reverse',
                }}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentGif}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="w-full h-full flex items-start justify-center overflow-hidden"
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={currentGif}
                            alt="AI Avatar"
                            className="w-full object-cover"
                            style={{
                                height: '105%',
                                objectPosition: 'center top',
                            }}
                        />
                    </motion.div>
                </AnimatePresence>
            </motion.div>
        </div>
    );
}

export default AnimatedGifAvatar;
