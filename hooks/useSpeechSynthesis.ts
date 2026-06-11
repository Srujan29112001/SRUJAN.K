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
    // Generation counter: each speak() starts a new generation. Stale events
    // from CANCELLED utterances (which fire asynchronously AFTER the next
    // queue starts) are ignored instead of killing the new queue — this was
    // the bug that muted every message after the first.
    const genRef = useRef(0);

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

    /** Pick the best voice from whatever is loaded RIGHT NOW (no waiting). */
    const pickVoice = useCallback((): SpeechSynthesisVoice | null => {
        const list = window.speechSynthesis.getVoices();
        if (list.length === 0) return null; // default voice still speaks

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

    const speakNext = useCallback((gen: number, voice: SpeechSynthesisVoice | null) => {
        if (gen !== genRef.current) return; // a newer speak()/stop() superseded us
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
        u.onend = () => speakNext(gen, voice);
        u.onerror = () => {
            // Stale-generation events (late 'interrupted' from a cancelled
            // queue) are filtered by the gen check; current-generation errors
            // just skip the chunk and continue.
            speakNext(gen, voice);
        };
        window.speechSynthesis.speak(u);

        // Watchdog (first chunk only): if audio hasn't started in 1.5s, the
        // chosen voice may be broken on this device — retry once with the
        // browser default voice.
        if (voice) {
            let started = false;
            u.onstart = () => { started = true; };
            setTimeout(() => {
                if (!started && gen === genRef.current && !window.speechSynthesis.speaking) {
                    window.speechSynthesis.cancel();
                    queueRef.current.unshift(next);
                    setTimeout(() => speakNext(gen, null), 60);
                }
            }, 1500);
        }
    }, [rate, pitch, volume, stopKeepalive]);

    /** Speak text (chunked + queued). Replaces anything currently speaking. */
    const speak = useCallback((text: string) => {
        if (!isSupported || !text) return;
        const gen = ++genRef.current; // invalidate any previous queue's events
        window.speechSynthesis.cancel();
        const cleaned = cleanTextForSpeech(text);
        if (!cleaned) return;

        queueRef.current = chunkText(cleaned);
        speakingRef.current = true;
        setIsSpeaking(true);
        startKeepalive();

        const voice = pickVoice();
        // a cancel() needs a beat before speak() works reliably in Chrome
        setTimeout(() => speakNext(gen, voice), 80);
    }, [isSupported, pickVoice, speakNext, startKeepalive]);

    const stop = useCallback(() => {
        if (!isSupported) return;
        genRef.current++; // invalidate in-flight utterance events
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
