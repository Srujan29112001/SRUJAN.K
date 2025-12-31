'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface UseSpeechSynthesisOptions {
    rate?: number;
    pitch?: number;
    volume?: number;
    voiceName?: string;
}

export function useSpeechSynthesis(options: UseSpeechSynthesisOptions = {}) {
    const { rate = 1, pitch = 1, volume = 1, voiceName } = options;
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isSupported, setIsSupported] = useState(false);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    // Check if speech synthesis is supported
    useEffect(() => {
        setIsSupported('speechSynthesis' in window);
    }, []);

    // Load available voices
    useEffect(() => {
        if (!isSupported) return;

        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            setVoices(availableVoices);
        };

        loadVoices();

        // Voices may load asynchronously
        window.speechSynthesis.onvoiceschanged = loadVoices;

        return () => {
            window.speechSynthesis.onvoiceschanged = null;
        };
    }, [isSupported]);

    // Get the best voice (prefer Indian English male voices)
    const getVoice = useCallback(() => {
        if (voiceName) {
            const namedVoice = voices.find(v => v.name === voiceName);
            if (namedVoice) return namedVoice;
        }

        // Try to find an Indian English voice (en-IN)
        const indianVoices = voices.filter(v => v.lang === 'en-IN' || v.lang.startsWith('en-IN'));

        // Look for male Indian voices (names often contain "Male", "Ravi", "Prabhat", etc.)
        const maleIndianVoice = indianVoices.find(v =>
            v.name.toLowerCase().includes('male') ||
            v.name.toLowerCase().includes('ravi') ||
            v.name.toLowerCase().includes('prabhat') ||
            v.name.toLowerCase().includes('kumar') ||
            !v.name.toLowerCase().includes('female')
        );
        if (maleIndianVoice) return maleIndianVoice;

        // Fallback to any Indian English voice
        if (indianVoices.length > 0) return indianVoices[0];

        // Try to find any male English voice
        const englishVoices = voices.filter(v => v.lang.startsWith('en'));
        const maleEnglishVoice = englishVoices.find(v =>
            v.name.toLowerCase().includes('male') ||
            v.name.toLowerCase().includes('david') ||
            v.name.toLowerCase().includes('james') ||
            v.name.toLowerCase().includes('daniel') ||
            v.name.toLowerCase().includes('guy') ||
            !v.name.toLowerCase().includes('female') &&
            !v.name.toLowerCase().includes('samantha') &&
            !v.name.toLowerCase().includes('karen') &&
            !v.name.toLowerCase().includes('victoria')
        );
        if (maleEnglishVoice) return maleEnglishVoice;

        // Fallback to any English voice
        if (englishVoices.length > 0) return englishVoices[0];

        // Fallback to any voice
        return voices[0] || null;
    }, [voices, voiceName]);

    // Clean text for better TTS output
    const cleanTextForSpeech = useCallback((text: string): string => {
        return text
            // Remove markdown formatting
            .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
            .replace(/\*(.*?)\*/g, '$1') // Italic
            .replace(/`(.*?)`/g, '$1') // Inline code
            .replace(/```[\s\S]*?```/g, '') // Code blocks
            .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Links - keep text
            .replace(/#{1,6}\s/g, '') // Headers
            // Remove URLs
            .replace(/https?:\/\/[^\s]+/g, '')
            // Clean up special characters (but keep basic punctuation for natural pauses)
            .replace(/[•◦▪▫●○■□★☆→←↑↓↔↕➜➔➤🎯🚀💡✨🔊🎤⚡]/g, '')
            .replace(/[|\\/<>{}[\]@#$%^&*~_]/g, '')
            // Clean up multiple spaces and newlines
            .replace(/\n+/g, '. ')
            .replace(/\s+/g, ' ')
            // Clean up multiple periods
            .replace(/\.{2,}/g, '.')
            .replace(/\.\s*\./g, '.')
            .trim();
    }, []);

    // Speak text
    const speak = useCallback((text: string) => {
        if (!isSupported || !text) return;

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        // Clean the text for better TTS
        const cleanedText = cleanTextForSpeech(text);
        if (!cleanedText) return;

        const utterance = new SpeechSynthesisUtterance(cleanedText);
        utterance.rate = rate;
        utterance.pitch = pitch;
        utterance.volume = volume;

        const voice = getVoice();
        if (voice) {
            utterance.voice = voice;
        }

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
    }, [isSupported, rate, pitch, volume, getVoice, cleanTextForSpeech]);

    // Stop speaking
    const stop = useCallback(() => {
        if (!isSupported) return;
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    }, [isSupported]);

    // Pause speaking
    const pause = useCallback(() => {
        if (!isSupported) return;
        window.speechSynthesis.pause();
    }, [isSupported]);

    // Resume speaking
    const resume = useCallback(() => {
        if (!isSupported) return;
        window.speechSynthesis.resume();
    }, [isSupported]);

    return {
        speak,
        stop,
        pause,
        resume,
        isSpeaking,
        isSupported,
        voices,
    };
}

export default useSpeechSynthesis;
