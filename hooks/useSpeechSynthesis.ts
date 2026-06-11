'use client';

/**
 * =============================================================================
 * SPEECH SYNTHESIS v2 — reliable browser TTS
 * =============================================================================
 * The old implementation spoke one giant utterance, which hits two notorious
 * browser bugs:
 *   1. Chrome silently kills utterances longer than ~15s of audio.
 *   2. getVoices() is empty until the async `voiceschanged` event, so early
 *      calls picked no/default voices inconsistently.
 *
 * v2 fixes both:
 *   - sentence-level CHUNK QUEUE: text is split into ≤~220-char chunks at
 *     sentence boundaries; chunks chain via onend → nothing exceeds Chrome's
 *     limit, and isSpeaking stays true across the whole queue (avatar sync)
 *   - KEEPALIVE: while speaking, speechSynthesis.resume() fires every 5s —
 *     the documented workaround for Chrome's random pause bug
 *   - voices resolved lazily at speak time, with a one-time async wait for
 *     `voiceschanged` when the list is still empty
 * =============================================================================
 */

import { useCallback, useEffect, useRef, useState } from 'react';

interface UseSpeechSynthesisOptions {
    rate?: number;
    pitch?: number;
    volume?: number;
    voiceName?: string;
}

/** Split cleaned text into speakable chunks at sentence boundaries. */
function chunkText(text: string, maxLen = 220): string[] {
    const sentences = text.match(/[^.!?]+[.!?]+[\s]*|[^.!?]+$/g) || [text];
    const chunks: string[] = [];
    let current = '';
    for (const s of sentences) {
        if ((current + s).length > maxLen && current) {
            chunks.push(current.trim());
            current = s;
        } else {
            current += s;
        }
        // a single overlong sentence: hard-split on commas/spaces
        while (current.length > maxLen * 1.6) {
            const cut = current.lastIndexOf(',', maxLen) > 40
                ? current.lastIndexOf(',', maxLen) + 1
                : current.lastIndexOf(' ', maxLen);
            chunks.push(current.slice(0, cut).trim());
            current = current.slice(cut);
        }
    }
    if (current.trim()) chunks.push(current.trim());
    return chunks.filter(Boolean);
}

function cleanTextForSpeech(text: string): string {
    return text
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/`(.*?)`/g, '$1')
        .replace(/```[\s\S]*?```/g, '')
        .replace(/\[(.*?)\]\(.*?\)/g, '$1')
        .replace(/#{1,6}\s/g, '')
        .replace(/https?:\/\/[^\s]+/g, '')
        .replace(/_\([^)]*\)_/g, '') // italic side-notes like _(running offline …)_
        .replace(/[•◦▪▫●○■□★☆→←↑↓↔↕➜➔➤🎯🚀💡✨🔊🎤⚡🔑]/g, '')
        .replace(/[|\\/<>{}[\]@#$%^&*~_]/g, ' ')
        .replace(/\n+/g, '. ')
        .replace(/\s+/g, ' ')
        .replace(/\.{2,}/g, '.')
        .replace(/\.\s*\./g, '.')
        .trim();
}

export function useSpeechSynthesis(options: UseSpeechSynthesisOptions = {}) {
    const { rate = 1, pitch = 1, volume = 1, voiceName } = options;
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isSupported, setIsSupported] = useState(false);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const queueRef = useRef<string[]>([]);
    const speakingRef = useRef(false);
    const keepaliveRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        setIsSupported(typeof window !== 'undefined' && 'speechSynthesis' in window);
    }, []);

    useEffect(() => {
        if (!isSupported) return;
        const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
        loadVoices();
        window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
        return () => window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    }, [isSupported]);

    // Chrome pause-bug keepalive — runs only while the queue is active
    const startKeepalive = useCallback(() => {
        if (keepaliveRef.current) return;
        keepaliveRef.current = setInterval(() => {
            if (speakingRef.current && window.speechSynthesis.speaking) {
                window.speechSynthesis.resume();
            }
        }, 5000);
    }, []);

    const stopKeepalive = useCallback(() => {
        if (keepaliveRef.current) {
            clearInterval(keepaliveRef.current);
            keepaliveRef.current = null;
        }
    }, []);

    /** Resolve the best voice; waits once for async voice loading if needed. */
    const resolveVoice = useCallback(async (): Promise<SpeechSynthesisVoice | null> => {
        let list = window.speechSynthesis.getVoices();
        if (list.length === 0) {
            list = await new Promise<SpeechSynthesisVoice[]>(resolve => {
                const timer = setTimeout(() => resolve(window.speechSynthesis.getVoices()), 1200);
                window.speechSynthesis.addEventListener('voiceschanged', () => {
                    clearTimeout(timer);
                    resolve(window.speechSynthesis.getVoices());
                }, { once: true });
            });
        }
        if (list.length === 0) return null;

        if (voiceName) {
            const named = list.find(v => v.name === voiceName);
            if (named) return named;
        }
        const score = (v: SpeechSynthesisVoice): number => {
            let s = 0;
            const name = v.name.toLowerCase();
            if (v.lang === 'en-IN') s += 50;
            else if (v.lang.startsWith('en')) s += 30;
            // prefer the higher-quality engine voices
            if (/natural|neural|online|premium|enhanced/.test(name)) s += 20;
            if (/google/.test(name)) s += 8;
            if (/female|samantha|karen|victoria|zira|susan/.test(name)) s -= 10;
            if (/male|ravi|prabhat|david|guy|james|daniel/.test(name)) s += 6;
            if (v.localService) s += 2; // no network flakiness
            return s;
        };
        return [...list].sort((a, b) => score(b) - score(a))[0] || null;
    }, [voiceName]);

    const speakNext = useCallback((voice: SpeechSynthesisVoice | null) => {
        const next = queueRef.current.shift();
        if (next === undefined) {
            speakingRef.current = false;
            setIsSpeaking(false);
            stopKeepalive();
            return;
        }
        const u = new SpeechSynthesisUtterance(next);
        u.rate = rate;
        u.pitch = pitch;
        u.volume = volume;
        if (voice) u.voice = voice;
        u.onend = () => speakNext(voice);
        u.onerror = (e) => {
            // 'interrupted'/'canceled' happen on stop() — don't continue the queue
            if (e.error === 'interrupted' || e.error === 'canceled') {
                speakingRef.current = false;
                setIsSpeaking(false);
                stopKeepalive();
                return;
            }
            speakNext(voice); // skip the bad chunk, keep going
        };
        window.speechSynthesis.speak(u);
    }, [rate, pitch, volume, stopKeepalive]);

    /** Speak text (chunked + queued). Replaces anything currently speaking. */
    const speak = useCallback(async (text: string) => {
        if (!isSupported || !text) return;
        window.speechSynthesis.cancel();
        const cleaned = cleanTextForSpeech(text);
        if (!cleaned) return;

        queueRef.current = chunkText(cleaned);
        speakingRef.current = true;
        setIsSpeaking(true);
        startKeepalive();

        const voice = await resolveVoice();
        // a cancel() needs a beat before speak() works reliably in Chrome
        setTimeout(() => {
            if (speakingRef.current) speakNext(voice);
        }, 60);
    }, [isSupported, resolveVoice, speakNext, startKeepalive]);

    const stop = useCallback(() => {
        if (!isSupported) return;
        queueRef.current = [];
        speakingRef.current = false;
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        stopKeepalive();
    }, [isSupported, stopKeepalive]);

    const pause = useCallback(() => {
        if (isSupported) window.speechSynthesis.pause();
    }, [isSupported]);

    const resume = useCallback(() => {
        if (isSupported) window.speechSynthesis.resume();
    }, [isSupported]);

    // cleanup on unmount
    useEffect(() => () => {
        queueRef.current = [];
        stopKeepalive();
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
    }, [stopKeepalive]);

    return { speak, stop, pause, resume, isSpeaking, isSupported, voices };
}

export default useSpeechSynthesis;
