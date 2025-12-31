'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';

export interface ChatMessage {
    id: string;
    type: 'user' | 'bot' | 'system';
    content: string;
    timestamp: Date;
    isTyping?: boolean;
    hasBeenSpoken?: boolean;
}

interface TerminalChatProps {
    messages: ChatMessage[];
    onSendMessage: (message: string) => void;
    onVoiceSpeakingChange?: (isSpeaking: boolean) => void;
    isLoading?: boolean;
    quickPrompts?: string[];
    className?: string;
    oocMode?: boolean;
    onOocModeChange?: (enabled: boolean) => void;
    awrtcMode?: boolean;
    onAwrtcModeChange?: (enabled: boolean) => void;
}

export function TerminalChat({
    messages,
    onSendMessage,
    onVoiceSpeakingChange,
    isLoading = false,
    quickPrompts = [],
    className = '',
    oocMode = false,
    onOocModeChange,
    awrtcMode = false,
    onAwrtcModeChange,
}: TerminalChatProps) {
    const [input, setInput] = useState('');
    const [commandHistory, setCommandHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [voiceEnabled, setVoiceEnabled] = useState(false);
    const [spokenMessageIds, setSpokenMessageIds] = useState<Set<string>>(new Set());
    const [isTypingActive, setIsTypingActive] = useState(false);
    const [stopTypingTrigger, setStopTypingTrigger] = useState(0);
    const [lastTypingMessageId, setLastTypingMessageId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const { speak, stop, isSpeaking, isSupported } = useSpeechSynthesis({ rate: 1, pitch: 1 });

    // Check if any message is currently typing and reset stop trigger for new messages
    useEffect(() => {
        const typingMessage = messages.find(m => m.isTyping);
        if (typingMessage) {
            // Only set typing active if this is a NEW message (different ID) 
            // This prevents re-enabling typing after STOP was pressed
            if (typingMessage.id !== lastTypingMessageId) {
                setIsTypingActive(true);
                setLastTypingMessageId(typingMessage.id);
                setStopTypingTrigger(0); // Reset so new message gets full typing animation
            }
            // If same message, don't re-enable isTypingActive (respects STOP button)
        }
    }, [messages, lastTypingMessageId]);

    // Handle typing complete
    const handleTypingComplete = useCallback(() => {
        setIsTypingActive(false);
    }, []);

    // Handle stop typing
    const handleStopTyping = useCallback(() => {
        setStopTypingTrigger(prev => prev + 1);
        setIsTypingActive(false);
    }, []);

    // Speak new bot messages when voice is enabled (starts immediately, not after typing)
    useEffect(() => {
        if (!voiceEnabled || !isSupported) return;

        const lastMessage = messages[messages.length - 1];
        if (
            lastMessage &&
            lastMessage.type === 'bot' &&
            !spokenMessageIds.has(lastMessage.id)
        ) {
            // Start speaking immediately when bot message appears
            speak(lastMessage.content);
            setSpokenMessageIds(prev => new Set(prev).add(lastMessage.id));
        }
    }, [messages, voiceEnabled, isSupported, speak, spokenMessageIds]);

    // Stop speaking when voice is disabled
    useEffect(() => {
        if (!voiceEnabled && isSpeaking) {
            stop();
        }
    }, [voiceEnabled, isSpeaking, stop]);

    // Notify parent when voice speaking state changes (for avatar sync)
    useEffect(() => {
        onVoiceSpeakingChange?.(isSpeaking);
    }, [isSpeaking, onVoiceSpeakingChange]);

    // Auto-scroll to bottom (within chat only, not page)
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, [messages]);

    // Focus input on mount
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // Determine if input should be disabled
    const isInputDisabled = isLoading || isTypingActive;

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isInputDisabled) return;

        setCommandHistory(prev => [...prev, input]);
        setHistoryIndex(-1);
        onSendMessage(input.trim());
        setInput('');
    }, [input, isInputDisabled, onSendMessage]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (commandHistory.length > 0) {
                const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
                setHistoryIndex(newIndex);
                setInput(commandHistory[commandHistory.length - 1 - newIndex] || '');
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex > 0) {
                const newIndex = historyIndex - 1;
                setHistoryIndex(newIndex);
                setInput(commandHistory[commandHistory.length - 1 - newIndex] || '');
            } else if (historyIndex === 0) {
                setHistoryIndex(-1);
                setInput('');
            }
        }
    }, [commandHistory, historyIndex]);

    const handleQuickPrompt = useCallback((prompt: string) => {
        if (!isInputDisabled) {
            onSendMessage(prompt);
        }
    }, [isInputDisabled, onSendMessage]);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    return (
        <div className={`flex flex-col h-full w-full max-w-full bg-bg-base/80 backdrop-blur-sm border border-cyan-900/30 rounded-lg overflow-hidden ${className}`}>
            {/* Terminal Header */}
            <div className="flex items-center gap-2 px-4 py-2 bg-bg-surface border-b border-cyan-900/30">
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <span className="font-mono text-xs text-cyan-400/60 ml-2">
                    srujan-ai@terminal ~ v1.0
                </span>
                <div className="ml-auto flex items-center gap-3">
                    {/* Voice Toggle Button */}
                    {isSupported && (
                        <button
                            onClick={() => setVoiceEnabled(!voiceEnabled)}
                            className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-mono transition-colors ${voiceEnabled
                                ? 'bg-cyan-400/20 text-cyan-400 border border-cyan-400/50'
                                : 'bg-transparent text-text-muted hover:text-cyan-400 border border-transparent hover:border-cyan-400/30'
                                }`}
                            title={voiceEnabled ? 'Disable voice' : 'Enable voice'}
                        >
                            {/* Speaker Icon */}
                            <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                {voiceEnabled ? (
                                    <>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8 8 0 010 11.9M6.5 8.5H4a1 1 0 00-1 1v5a1 1 0 001 1h2.5l4.5 4V4.5l-4.5 4z" />
                                    </>
                                ) : (
                                    <>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                                    </>
                                )}
                            </svg>
                            <span className="hidden sm:inline">{voiceEnabled ? 'Voice On' : 'Voice Off'}</span>
                            {isSpeaking && (
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                            )}
                        </button>
                    )}
                    <div className={`w-2 h-2 rounded-full ${isLoading || isTypingActive ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`} />
                    <span className="font-mono text-xs text-text-muted">
                        {isLoading ? 'processing' : isTypingActive ? 'typing...' : 'ready'}
                    </span>
                </div>
            </div>

            {/* Messages Area */}
            <div
                data-lenis-prevent
                className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-cyan-900/30 scrollbar-track-transparent"
            >
                {/* Welcome message - Mobile responsive */}
                {messages.length === 0 && (
                    <div className="font-mono text-sm p-3 sm:p-4 border border-cyan-500/30 rounded-lg bg-cyan-500/5">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                            <span className="text-white font-bold">SRUJAN AI</span>
                            <span className="text-cyan-400/60 text-xs">- Digital Twin Interface v1.0</span>
                        </div>
                        <p className="text-text-secondary text-xs sm:text-sm leading-relaxed">
                            Welcome! I&apos;m an AI representation of Srujan.
                            Feel free to discuss anything — projects, ideas, or questions you have in mind.
                        </p>
                    </div>
                )}

                <AnimatePresence>
                    {messages.map((message) => (
                        <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="font-mono text-sm"
                        >
                            {message.type === 'user' ? (
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2 text-text-muted text-xs mb-1">
                                        <span className="text-green-400">user@visitor</span>
                                        <span>~</span>
                                        <span>{formatTime(message.timestamp)}</span>
                                    </div>
                                    <div className="flex">
                                        <span className="text-green-400 mr-2">$</span>
                                        <span className="text-text-primary">{message.content}</span>
                                    </div>
                                </div>
                            ) : message.type === 'bot' ? (
                                <div className="flex flex-col pl-4 border-l-2 border-cyan-500/30">
                                    <div className="flex items-center gap-2 text-text-muted text-xs mb-1">
                                        <span className="text-cyan-400">srujan@ai</span>
                                        <span>~</span>
                                        <span>{formatTime(message.timestamp)}</span>
                                    </div>
                                    <div className="text-text-secondary whitespace-pre-wrap">
                                        {message.isTyping ? (
                                            <TypewriterText
                                                text={message.content}
                                                onComplete={handleTypingComplete}
                                                stopTrigger={stopTypingTrigger}
                                            />
                                        ) : (
                                            message.content
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-yellow-400/70 text-xs">
                                    [SYSTEM] {message.content}
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Loading indicator */}
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2 font-mono text-sm text-cyan-400"
                    >
                        <span>Processing</span>
                        <span className="inline-flex">
                            <span className="animate-pulse">.</span>
                            <span className="animate-pulse" style={{ animationDelay: '0.2s' }}>.</span>
                            <span className="animate-pulse" style={{ animationDelay: '0.4s' }}>.</span>
                        </span>
                    </motion.div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts - Horizontally scrollable on mobile */}
            {quickPrompts.length > 0 && messages.length < 3 && (
                <div className="px-4 py-2 border-t border-cyan-900/20">
                    <p className="font-mono text-xs text-text-muted mb-2">Quick prompts:</p>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-cyan-900/30 scrollbar-track-transparent">
                        {quickPrompts.map((prompt, i) => (
                            <button
                                key={i}
                                onClick={() => handleQuickPrompt(prompt)}
                                disabled={isInputDisabled}
                                className="px-3 py-1.5 font-mono text-xs text-cyan-400 bg-cyan-400/10 
                         border border-cyan-400/30 rounded hover:bg-cyan-400/20 
                         hover:border-cyan-400/50 transition-colors disabled:opacity-50
                         disabled:cursor-not-allowed whitespace-nowrap flex-shrink-0"
                            >
                                {prompt}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input Area - Mobile responsive */}
            <form onSubmit={handleSubmit} className="p-3 sm:p-4 border-t border-cyan-900/30 bg-bg-surface/50">
                {/* Mode toggles row - always visible on mobile */}
                <div className="flex items-center gap-2 mb-2 font-mono">
                    {/* ASA Toggle Button */}
                    <button
                        type="button"
                        onClick={() => onOocModeChange?.(!oocMode)}
                        className={`px-2 py-1 font-mono text-xs rounded transition-all border ${oocMode
                            ? 'bg-purple-500/30 text-purple-300 border-purple-400/50 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                            : 'bg-transparent text-text-muted hover:text-purple-400 border-transparent hover:border-purple-400/30'
                            }`}
                        title={oocMode ? 'ASA Mode ON - Avatar Special Actions enabled' : 'ASA Mode OFF - Normal chat mode'}
                    >
                        ASA
                    </button>
                    {/* AWRTC Toggle Button */}
                    <button
                        type="button"
                        onClick={() => onAwrtcModeChange?.(!awrtcMode)}
                        className={`px-2 py-1 font-mono text-xs rounded transition-all border ${awrtcMode
                            ? 'bg-cyan-500/30 text-cyan-300 border-cyan-400/50 shadow-[0_0_10px_rgba(34,211,238,0.3)]'
                            : 'bg-transparent text-text-muted hover:text-cyan-400 border-transparent hover:border-cyan-400/30'
                            }`}
                        title={awrtcMode ? 'AWRTC (beta) ON - AI responses trigger contextual actions' : 'AWRTC (beta) OFF - No automatic actions'}
                    >
                        AWRTC<span className="text-[8px] ml-0.5 opacity-70">β</span>
                    </button>
                    <span className="font-mono text-[10px] text-text-muted/50 ml-auto hidden sm:inline">
                        {oocMode ? <span className="text-purple-400">ASA ON</span> : ''}
                        {oocMode && awrtcMode ? ' • ' : ''}
                        {awrtcMode ? <span className="text-cyan-400">AWRTC β ON</span> : ''}
                    </span>
                </div>
                {/* Input and send button row */}
                <div className="flex items-center gap-2 font-mono">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={isTypingActive ? 'Wait for response...' : oocMode ? 'Type action trigger word...' : 'Type your message...'}
                        disabled={isInputDisabled}
                        className="flex-1 min-w-0 bg-transparent border border-cyan-900/30 rounded px-3 py-2 outline-none text-sm text-text-primary
                     placeholder:text-text-muted/50 disabled:opacity-50 focus:border-cyan-400/50"
                    />
                    {isTypingActive ? (
                        <button
                            type="button"
                            onClick={handleStopTyping}
                            className="px-3 sm:px-4 py-2 font-mono text-xs text-white bg-red-500 rounded
                         hover:bg-red-400 transition-colors flex items-center gap-1.5 flex-shrink-0"
                        >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                <rect x="6" y="6" width="12" height="12" rx="1" />
                            </svg>
                            <span className="hidden sm:inline">STOP</span>
                        </button>
                    ) : (
                        <button
                            type="submit"
                            disabled={!input.trim() || isInputDisabled}
                            className="px-3 sm:px-4 py-2 font-mono text-xs text-black bg-cyan-400 rounded
                         hover:bg-cyan-300 transition-colors disabled:opacity-50
                         disabled:cursor-not-allowed disabled:hover:bg-cyan-400 flex-shrink-0"
                        >
                            SEND
                        </button>
                    )}
                </div>
                <p className="mt-2 font-mono text-[10px] text-text-muted/50">
                    {isTypingActive ? (
                        <span className="text-yellow-400">AI is typing... Press STOP to skip</span>
                    ) : (
                        <span>Press Enter to send</span>
                    )}
                </p>
            </form>
        </div>
    );
}

// Typewriter effect component with stop capability
function TypewriterText({
    text,
    speed = 20,
    onComplete,
    stopTrigger = 0,
}: {
    text: string;
    speed?: number;
    onComplete?: () => void;
    stopTrigger?: number;
}) {
    const [displayedText, setDisplayedText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isStopped, setIsStopped] = useState(false);

    // Handle stop trigger from parent - truncate at current position
    useEffect(() => {
        if (stopTrigger > 0 && currentIndex < text.length && !isStopped) {
            // Keep current displayed text, just stop the animation
            setDisplayedText(prev => prev + '...'); // Add ellipsis to show truncation
            setIsStopped(true);
            onComplete?.();
        }
    }, [stopTrigger, text.length, currentIndex, isStopped, onComplete]);

    useEffect(() => {
        if (isStopped) return;

        if (currentIndex < text.length) {
            const timeout = setTimeout(() => {
                setDisplayedText(prev => prev + text[currentIndex]);
                setCurrentIndex(prev => prev + 1);
            }, speed);

            return () => clearTimeout(timeout);
        } else if (currentIndex === text.length && text.length > 0) {
            onComplete?.();
        }
    }, [currentIndex, text, speed, isStopped, onComplete]);

    useEffect(() => {
        setDisplayedText('');
        setCurrentIndex(0);
        setIsStopped(false);
    }, [text]);

    return (
        <>
            {displayedText}
            {currentIndex < text.length && !isStopped && (
                <span className="inline-block w-2 h-4 bg-cyan-400 animate-pulse ml-0.5" />
            )}
        </>
    );
}

export default TerminalChat;

