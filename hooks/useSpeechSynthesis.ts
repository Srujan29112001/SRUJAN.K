'use client';

/**
 * =============================================================================
 * SPEECH SYNTHESIS v3 — reliable, streaming, better-sounding browser TTS
 * =============================================================================
 * v2 fixed Chrome's long-utterance + voiceschanged bugs with a sentence-chunk
 * queue, keepalive, and a generation counter. v3 adds what the chat needs:
 *
 *   1. STREAMING — speak sentences AS the LLM types them, instead of waiting
 *      for the whole reply. startStream() → feedStream(textSoFar) on every
 *      reveal → endStream(finalText). isSpeaking stays true across the whole
 *      stream (even while waiting for the next sentence) so the avatar GIF
 *      sync is untouched.
 *   2. BETTER VOICE — scoring strongly prefers high-quality "Online/Natural/
 *      Neural" Indian-English MALE voices (e.g. Microsoft Prabhat Online,
 *      Google हिन्दी) over the flat robotic local ones.
 *   3. PRONUNCIATION — acronyms the engine mangles (AI, LLM, GPT, RAG, ROS,
 *      DRDO, IIIT, GenAI, EEG, BCI…) are expanded to spaced letters so they're
 *      spelled out correctly. Spaces (not periods) avoid breaking sentence
 *      splitting.
 * =============================================================================
 */

import { useCallback, useEffect, useRef, useState } from 'react';

interface UseSpeechSynthesisOptions {
    rate?: number;
    pitch?: number;
    volume?: number;
    voiceName?: string;
}

// Acronyms / tokens the TTS engine commonly mispronounces. Spelled with spaces
// so each letter is read out and so the inserted gaps never look like sentence
// terminators (which would fragment the chunk/stream boundaries).
const PRONUNCIATION: Array<[RegExp, string | ((...m: string[]) => string)]> = [
    [/\bGen\s?AI\b/gi, 'Gen A I'],
    [/\bLLMs\b/g, 'L L Ms'],
    [/\bLLM\b/g, 'L L M'],
    [/\bGPT-?(\d(?:\.\d)?)\b/g, (_m, d) => `G P T ${d}`],
    [/\bGPT\b/g, 'G P T'],
    [/\bAPIs\b/g, 'A P Is'],
    [/\bAPI\b/g, 'A P I'],
    [/\bRAG\b/g, 'rag'],
    [/\bYOLOv?(\d+)?\b/g, (_m, d) => (d ? `Yolo v${d}` : 'Yolo')],
    [/\bROS\s?2\b/g, 'R O S two'],
    [/\bROS\b/g, 'R O S'],
    [/\bDRDL\b/g, 'D R D L'],
    [/\bDRDO\b/g, 'D R D O'],
    [/\bIIIT\b/g, 'I I I T'],
    [/\bBCI\b/g, 'B C I'],
    [/\bEEG\b/g, 'E E G'],
    [/\bMLOps\b/g, 'M L Ops'],
    [/\bUI\s?\/\s?UX\b/g, 'U I, U X'],
    [/\bUX\b/g, 'U X'],
    [/\bUI\b/g, 'U I'],
    [/\bIoT\b/g, 'I O T'],
    [/\bAGI\b/g, 'A G I'],
    [/\bAI\b/g, 'A I'],
    [/\bRAPIDS\b/g, 'Rapids'],
    [/\bcuML\b/g, 'C U M L'],
    [/\b3D\b/g, '3 D'],
    [/\bJEE\b/g, 'J E E'],
];

function applyPronunciation(text: string): string {
    let out = text;
    for (const [re, rep] of PRONUNCIATION) {
        out = typeof rep === 'function'
            ? out.replace(re, rep as (...m: string[]) => string)
            : out.replace(re, rep);
    }
    return out;
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
    const stripped = text
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/`(.*?)`/g, '$1')
        .replace(/```[\s\S]*?```/g, '')
        .replace(/\[(.*?)\]\(.*?\)/g, '$1')
        .replace(/#{1,6}\s/g, '')
        .replace(/https?:\/\/[^\s]+/g, '')
        .replace(/_\([^)]*\)_/g, '')
        .replace(/[•◦▪▫●○■□★☆→←↑↓↔↕➜➔➤🎯🚀💡✨🔊🎤⚡🔑]/g, '')
        .replace(/[|\\/<>{}[\]@#$%^&*~_]/g, ' ');
    // expand acronyms BEFORE collapsing whitespace so the spaced letters survive
    return applyPronunciation(stripped)
        .replace(/\n+/g, '. ')
        .replace(/\s+/g, ' ')
        .replace(/\.{2,}/g, '.')
        .replace(/\.\s*\./g, '.')
        .trim();
}

/** Largest prefix of `cleaned` that ends on a real sentence terminator. */
function completeSentences(cleaned: string): string {
    const m = cleaned.match(/^[\s\S]*[.!?](?=\s|$)/);
    return m ? m[0] : '';
}

export function useSpeechSynthesis(options: UseSpeechSynthesisOptions = {}) {
    const { rate = 1, pitch = 1, volume = 1, voiceName } = options;
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isSupported, setIsSupported] = useState(false);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const queueRef = useRef<string[]>([]);
    const speakingRef = useRef(false);
    const keepaliveRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const genRef = useRef(0);

    // Streaming state
    const streamActiveRef = useRef(false);   // a feed-as-you-type stream is open
    const chainRunningRef = useRef(false);    // an utterance chain is in flight
    const spokenLenRef = useRef(0);           // chars of cleaned text already queued
    const streamVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
    const audioConfirmedRef = useRef(false);  // has any audio actually started?

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

    /** Pick the best available voice — prefers natural Indian-English male. */
    const pickVoice = useCallback((): SpeechSynthesisVoice | null => {
        const list = window.speechSynthesis.getVoices();
        if (list.length === 0) return null;

        if (voiceName) {
            const named = list.find(v => v.name === voiceName);
            if (named) return named;
        }
        const score = (v: SpeechSynthesisVoice): number => {
            let s = 0;
            const name = v.name.toLowerCase();
            const lang = v.lang.toLowerCase();
            if (lang === 'en-in' || lang === 'hi-in') s += 50;
            else if (lang.startsWith('en')) s += 28;
            // quality engine matters most for "not robotic"
            if (/natural|neural/.test(name)) s += 45;
            else if (/online|premium|enhanced|wavenet/.test(name)) s += 30;
            if (/google/.test(name)) s += 12;
            // explicit Indian male voices on Windows / Chrome
            if (/prabhat|ravi|hemant|madhur/.test(name)) s += 30;
            if (/\bmale\b|guy|david|mark|james|daniel|aaron/.test(name)) s += 8;
            if (/female|samantha|karen|victoria|zira|susan|heera|kalpana|swara|neerja|aria|jenny/.test(name)) s -= 14;
            if (v.localService) s += 1;
            return s;
        };
        return [...list].sort((a, b) => score(b) - score(a))[0] || null;
    }, [voiceName]);

    const speakNext = useCallback((gen: number, voice: SpeechSynthesisVoice | null) => {
        if (gen !== genRef.current) return;
        const next = queueRef.current.shift();
        if (next === undefined) {
            // Streaming and momentarily out of text → pause the chain but keep
            // isSpeaking true so the avatar stays in its speaking state.
            if (streamActiveRef.current) { chainRunningRef.current = false; return; }
            speakingRef.current = false;
            chainRunningRef.current = false;
            setIsSpeaking(false);
            stopKeepalive();
            return;
        }
        chainRunningRef.current = true;
        const u = new SpeechSynthesisUtterance(next);
        u.rate = rate;
        u.pitch = pitch;
        u.volume = volume;
        if (voice) u.voice = voice;
        u.onstart = () => { audioConfirmedRef.current = true; };
        u.onend = () => speakNext(gen, voice);
        u.onerror = () => speakNext(gen, voice);
        window.speechSynthesis.speak(u);

        // Watchdog: until we've confirmed audio once, if the chosen voice never
        // starts, retry this chunk with the browser default voice.
        if (voice && !audioConfirmedRef.current) {
            setTimeout(() => {
                if (!audioConfirmedRef.current && gen === genRef.current && !window.speechSynthesis.speaking) {
                    window.speechSynthesis.cancel();
                    queueRef.current.unshift(next);
                    streamVoiceRef.current = null;
                    setTimeout(() => speakNext(gen, null), 60);
                }
            }, 1500);
        }
    }, [rate, pitch, volume, stopKeepalive]);

    /** Speak a complete piece of text at once (non-streaming / offline path). */
    const speak = useCallback((text: string) => {
        if (!isSupported || !text) return;
        const gen = ++genRef.current;
        window.speechSynthesis.cancel();
        streamActiveRef.current = false;
        chainRunningRef.current = false;
        audioConfirmedRef.current = false;
        const cleaned = cleanTextForSpeech(text);
        if (!cleaned) return;

        queueRef.current = chunkText(cleaned);
        speakingRef.current = true;
        setIsSpeaking(true);
        startKeepalive();

        const voice = pickVoice();
        setTimeout(() => speakNext(gen, voice), 80);
    }, [isSupported, pickVoice, speakNext, startKeepalive]);

    // ---- Streaming API: speak sentences as they arrive ----

    /** Open a voice stream for a message about to be typed out. */
    const startStream = useCallback(() => {
        if (!isSupported) return;
        const gen = ++genRef.current;
        window.speechSynthesis.cancel();
        queueRef.current = [];
        spokenLenRef.current = 0;
        streamActiveRef.current = true;
        chainRunningRef.current = false;
        audioConfirmedRef.current = false;
        speakingRef.current = true;
        setIsSpeaking(true);
        startKeepalive();
        streamVoiceRef.current = pickVoice();
        void gen;
    }, [isSupported, pickVoice, startKeepalive]);

    /** Feed the cumulative revealed text; enqueues any newly-complete sentences. */
    const feedStream = useCallback((textSoFar: string) => {
        if (!isSupported || !streamActiveRef.current) return;
        const cleaned = cleanTextForSpeech(textSoFar);
        const ready = completeSentences(cleaned);
        if (ready.length <= spokenLenRef.current) return;
        const fresh = ready.slice(spokenLenRef.current);
        spokenLenRef.current = ready.length;
        const chunks = chunkText(fresh);
        if (chunks.length === 0) return;
        queueRef.current.push(...chunks);
        if (!chainRunningRef.current) speakNext(genRef.current, streamVoiceRef.current);
    }, [isSupported, speakNext]);

    /** Close the stream: flush the trailing (possibly unterminated) text. */
    const endStream = useCallback((finalText: string) => {
        if (!isSupported || !streamActiveRef.current) return;
        const cleaned = cleanTextForSpeech(finalText);
        if (cleaned.length > spokenLenRef.current) {
            queueRef.current.push(...chunkText(cleaned.slice(spokenLenRef.current)));
            spokenLenRef.current = cleaned.length;
        }
        streamActiveRef.current = false;
        if (!chainRunningRef.current) {
            if (queueRef.current.length > 0) {
                speakNext(genRef.current, streamVoiceRef.current);
            } else {
                speakingRef.current = false;
                setIsSpeaking(false);
                stopKeepalive();
            }
        }
    }, [isSupported, speakNext, stopKeepalive]);

    const stop = useCallback(() => {
        if (!isSupported) return;
        genRef.current++;
        queueRef.current = [];
        speakingRef.current = false;
        streamActiveRef.current = false;
        chainRunningRef.current = false;
        spokenLenRef.current = 0;
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

    useEffect(() => () => {
        queueRef.current = [];
        stopKeepalive();
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
    }, [stopKeepalive]);

    return { speak, startStream, feedStream, endStream, stop, pause, resume, isSpeaking, isSupported, voices };
}

export default useSpeechSynthesis;
