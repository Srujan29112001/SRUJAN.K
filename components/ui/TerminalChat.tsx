'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';

// =============================================================================
// BYOK (Bring Your Own Key) — visitors chat using THEIR OWN API key.
// Stored only in the visitor's browser (localStorage); sent only with their
// chat messages; never persisted server-side.
// =============================================================================

export interface ByokConfig {
    provider: string;
    key: string;
    model?: string;
}

const BYOK_STORAGE_KEY = 'srujan-chat-byok';

export const BYOK_PROVIDERS: Array<{ id: string; label: string; keyHint: string; freeHint?: string }> = [
    { id: 'gemini', label: 'Google Gemini', keyHint: 'AIza…', freeHint: 'free at aistudio.google.com' },
    { id: 'groq', label: 'Groq', keyHint: 'gsk_…', freeHint: 'free at console.groq.com' },
    { id: 'huggingface', label: 'Hugging Face', keyHint: 'hf_…', freeHint: 'free at hf.co/settings/tokens' },
    { id: 'openai', label: 'OpenAI', keyHint: 'sk-…' },
    { id: 'anthropic', label: 'Anthropic Claude', keyHint: 'sk-ant-…' },
    { id: 'deepseek', label: 'DeepSeek', keyHint: 'sk-…' },
    { id: 'zai', label: 'Z.ai (GLM)', keyHint: '…' },
];

export function getByokConfig(): ByokConfig | null {
    try {
        const raw = localStorage.getItem(BYOK_STORAGE_KEY);
        if (!raw) return null;
        const cfg = JSON.parse(raw) as ByokConfig;
        return cfg.key && cfg.provider ? cfg : null;
    } catch {
        return null;
    }
}

export function saveByokConfig(cfg: ByokConfig | null): void {
    try {
        if (cfg) localStorage.setItem(BYOK_STORAGE_KEY, JSON.stringify(cfg));
        else localStorage.removeItem(BYOK_STORAGE_KEY);
    } catch { /* private browsing etc. */ }
}

export interface ChatMessage {
    id: string;
    type: 'user' | 'bot' | 'system';
    content: string;
    timestamp: Date;
    isTyping?: boolean;       // legacy: client-side typewriter for non-streamed messages
    isStreaming?: boolean;    // server-streamed: content grows in real time, render with cursor
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
    // BYOK panel state
    const [byokOpen, setByokOpen] = useState(false);
    const [byokProvider, setByokProvider] = useState('gemini');
    const [byokKey, setByokKey] = useState('');
    const [byokModel, setByokModel] = useState('');
    const [byokSaved, setByokSaved] = useState<ByokConfig | null>(null);
    const [spokenMessageIds, setSpokenMessageIds] = useState<Set<string>>(new Set());
    const [isTypingActive, setIsTypingActive] = useState(false);
    const [stopTypingTrigger, setStopTypingTrigger] = useState(0);
    const [lastTypingMessageId, setLastTypingMessageId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const { speak, stop, isSpeaking, isSupported } = useSpeechSynthesis({ rate: 1, pitch: 1 });

    // Check if any message is currently typing OR streaming and reset stop trigger for new messages
    useEffect(() => {
        const liveMessage = messages.find(m => m.isTyping || m.isStreaming);
        if (liveMessage) {
            // Only set typing active if this is a NEW message (different ID)
            // This prevents re-enabling typing after STOP was pressed
            if (liveMessage.id !== lastTypingMessageId) {
                setIsTypingActive(true);
                setLastTypingMessageId(liveMessage.id);
                setStopTypingTrigger(0); // Reset so new message gets full typing animation
            }
            // If same message, don't re-enable isTypingActive (respects STOP button)
        } else {
            // No live message — clear typing state so the header shows "ready"
            if (isTypingActive) setIsTypingActive(false);
        }
    }, [messages, lastTypingMessageId, isTypingActive]);

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
    const scrollToBottom = useCallback(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    // Also scroll when the last message's content changes during streaming
    const lastContent = messages[messages.length - 1]?.content;
    useEffect(() => {
        scrollToBottom();
    }, [lastContent, scrollToBottom]);

    // Focus input on mount
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // Load saved BYOK config on mount
    useEffect(() => {
        const cfg = getByokConfig();
        if (cfg) {
            setByokSaved(cfg);
            setByokProvider(cfg.provider);
            setByokKey(cfg.key);
            setByokModel(cfg.model || '');
        }
    }, []);

    const handleByokSave = useCallback(() => {
        const key = byokKey.trim();
        if (!key) return;
        const cfg: ByokConfig = { provider: byokProvider, key, ...(byokModel.trim() ? { model: byokModel.trim() } : {}) };
        saveByokConfig(cfg);
        setByokSaved(cfg);
        setByokOpen(false);
    }, [byokProvider, byokKey, byokModel]);

    const handleByokClear = useCallback(() => {
        saveByokConfig(null);
        setByokSaved(null);
        setByokKey('');
        setByokModel('');
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
                    {/* BYOK API Key Button */}
                    <button
                        onClick={() => setByokOpen(!byokOpen)}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-mono transition-colors border ${byokSaved
                            ? 'bg-emerald-400/15 text-emerald-400 border-emerald-400/40'
                            : 'bg-amber-400/15 text-amber-400 border-amber-400/40 animate-pulse'
                            }`}
                        title={byokSaved ? `Connected: ${byokSaved.provider}` : 'Add your API key to chat'}
                    >
                        <span>🔑</span>
                        <span className="hidden sm:inline">
                            {byokSaved ? BYOK_PROVIDERS.find(p => p.id === byokSaved.provider)?.label || byokSaved.provider : 'Add API Key'}
                        </span>
                    </button>
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

            {/* BYOK Key Panel */}
            <AnimatePresence>
                {byokOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden border-b border-cyan-900/30 bg-bg-surface/80"
                    >
                        <div className="p-4 space-y-3">
                            <p className="font-mono text-[11px] text-text-secondary leading-relaxed">
                                Chat runs on <span className="text-cyan-400">your own API key</span> — pick a provider,
                                paste a key, done. The key stays in your browser and is only used for your messages.
                                Gemini &amp; Groq have generous free tiers.
                            </p>
                            <div className="grid sm:grid-cols-2 gap-2">
                                <select
                                    value={byokProvider}
                                    onChange={e => setByokProvider(e.target.value)}
                                    className="bg-bg-base border border-cyan-900/40 rounded px-3 py-2 text-xs text-text-primary font-mono outline-none focus:border-cyan-400/50"
                                >
                                    {BYOK_PROVIDERS.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.label}{p.freeHint ? ` (${p.freeHint})` : ''}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    value={byokModel}
                                    onChange={e => setByokModel(e.target.value)}
                                    placeholder="Model (optional — sensible default used)"
                                    className="bg-bg-base border border-cyan-900/40 rounded px-3 py-2 text-xs text-text-primary font-mono outline-none focus:border-cyan-400/50 placeholder:text-text-muted/50"
                                />
                            </div>
                            <input
                                type="password"
                                value={byokKey}
                                onChange={e => setByokKey(e.target.value)}
                                placeholder={`API key (${BYOK_PROVIDERS.find(p => p.id === byokProvider)?.keyHint || '…'})`}
                                className="w-full bg-bg-base border border-cyan-900/40 rounded px-3 py-2 text-xs text-text-primary font-mono outline-none focus:border-cyan-400/50 placeholder:text-text-muted/50"
                            />
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleByokSave}
                                    disabled={!byokKey.trim()}
                                    className="px-4 py-1.5 rounded bg-cyan-400 text-black font-mono text-xs font-bold hover:bg-cyan-300 transition-colors disabled:opacity-40"
                                >
                                    SAVE &amp; CONNECT
                                </button>
                                {byokSaved && (
                                    <button
                                        onClick={handleByokClear}
                                        className="px-4 py-1.5 rounded border border-red-400/40 text-red-400 font-mono text-xs hover:bg-red-400/10 transition-colors"
                                    >
                                        DISCONNECT
                                    </button>
                                )}
                                <button
                                    onClick={() => setByokOpen(false)}
                                    className="ml-auto px-3 py-1.5 text-text-muted font-mono text-xs hover:text-white transition-colors"
                                >
                                    close
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

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
                        {!byokSaved && (
                            <p className="mt-3 text-amber-400/90 text-[11px] sm:text-xs leading-relaxed border-t border-cyan-900/30 pt-3">
                                ⚡ This chat runs on <b>your</b> API key — tap the <span className="px-1.5 py-0.5 bg-amber-400/15 border border-amber-400/40 rounded">🔑 Add API Key</span> button
                                above, pick your favourite AI provider (Gemini &amp; Groq are free), and start talking.
                            </p>
                        )}
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
                                        {message.isStreaming ? (
                                            // Server-streamed: just render content + live cursor.
                                            // Content is updated in parent state as deltas arrive.
                                            <>
                                                {message.content}
                                                <span className="inline-block w-2 h-4 bg-cyan-400 animate-pulse ml-0.5 align-middle" />
                                            </>
                                        ) : message.isTyping ? (
                                            <TypewriterText
                                                text={message.content}
                                                onComplete={handleTypingComplete}
                                                stopTrigger={stopTypingTrigger}
                                                onTextUpdate={scrollToBottom}
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
    onTextUpdate,
}: {
    text: string;
    speed?: number;
    onComplete?: () => void;
    stopTrigger?: number;
    onTextUpdate?: () => void;
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
                const nextChar = text[currentIndex];
                setDisplayedText(prev => prev + nextChar);
                setCurrentIndex(prev => prev + 1);
                // Scroll every 10 characters or on newlines for smooth UX
                if ((currentIndex + 1) % 10 === 0 || nextChar === '\n') {
                    onTextUpdate?.();
                }
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

