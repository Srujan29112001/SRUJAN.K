'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TerminalChat, ChatMessage } from '@/components/ui/TerminalChat';

// Dynamic import for GIF-based avatar
const AnimatedGifAvatar = dynamic(
    () => import('@/components/three/AnimatedGifAvatar').then(m => m.AnimatedGifAvatar),
    { ssr: false, loading: () => <AvatarPlaceholder /> }
);

gsap.registerPlugin(ScrollTrigger);

// Placeholder while avatar loads
function AvatarPlaceholder() {
    return (
        <div className="w-full h-full flex items-center justify-center">
            <div className="relative w-32 h-32">
                <div className="absolute inset-0 rounded-full bg-cyan-400/20 animate-ping" />
                <div className="absolute inset-4 rounded-full bg-cyan-400/30 animate-pulse" />
                <div className="absolute inset-8 rounded-full bg-cyan-400/40" />
            </div>
        </div>
    );
}

interface HolographicChatProps {
    onEstimateRequest?: () => void;
    onBookingRequest?: () => void;
}

export function HolographicChat({ onEstimateRequest, onBookingRequest }: HolographicChatProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isVoiceSpeaking, setIsVoiceSpeaking] = useState(false);
    const [specialAction, setSpecialAction] = useState<'backflip' | 'zombie' | 'scared' | 'dizzy' | 'shocked' | 'terrified' | 'chill' | 'shy' | 'excited' | 'looking' | 'walking' | 'shuffle' | 'silly' | 'wave' | 'breakdance' | 'blushing' | 'kissing' | 'smirk' | 'disappointed' | 'surprised' | 'suspicious' | 'okSign' | 'irritated' | 'laughing' | 'thumbsUp' | 'glad' | 'confused' | 'waving' | null>(null);
    const [oocMode, setOocMode] = useState(false);
    const [awrtcMode, setAwrtcMode] = useState(false);
    const [chatSessionId, setChatSessionId] = useState<string | null>(null);
    const sectionRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [commandCenterOpen, setCommandCenterOpen] = useState(false);

    // Initialize session ID from sessionStorage or generate new one
    useEffect(() => {
        const storedSessionId = sessionStorage.getItem('chatSessionId');
        if (storedSessionId) {
            setChatSessionId(storedSessionId);
        }
    }, []);

    // Interactive Particle Background
    useEffect(() => {
        const canvas = canvasRef.current;
        const section = sectionRef.current;
        if (!canvas || !section) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = canvas.width;
        let height = canvas.height;
        let animationFrameId: number;
        let particles: Particle[] = [];

        // Mouse tracking
        let mouseX = -1000;
        let mouseY = -1000;
        let lastScrollY = window.scrollY;
        let scrollVelocity = 0;
        const MOUSE_RADIUS = 150;

        class Particle {
            x: number;
            y: number;
            baseVx: number;
            baseVy: number;
            vx: number;
            vy: number;
            size: number;
            baseSize: number;
            twinkleSpeed: number;
            twinklePhase: number;
            brightness: number;
            isBright: boolean; // Some stars are brighter

            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.baseVx = (Math.random() - 0.5) * 0.3; // Slower for stars
                this.baseVy = (Math.random() - 0.5) * 0.3;
                this.vx = this.baseVx;
                this.vy = this.baseVy;
                this.isBright = Math.random() > 0.85; // 15% are bright stars
                this.baseSize = this.isBright ? Math.random() * 2 + 1.5 : Math.random() * 1.5 + 0.3;
                this.size = this.baseSize;
                this.twinkleSpeed = Math.random() * 0.05 + 0.02; // Varied twinkle speeds
                this.twinklePhase = Math.random() * Math.PI * 2; // Random starting phase
                this.brightness = Math.random() * 0.5 + 0.5;
            }

            update() {
                const dx = this.x - mouseX;
                const dy = this.y - mouseY;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < MOUSE_RADIUS && dist > 0) {
                    const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
                    const angle = Math.atan2(dy, dx);
                    this.vx = this.baseVx + Math.cos(angle) * force * 2;
                    this.vy = this.baseVy + Math.sin(angle) * force * 2;
                } else {
                    this.vx += (this.baseVx - this.vx) * 0.05;
                    this.vy += (this.baseVy - this.vy) * 0.05;
                }

                this.vy += scrollVelocity * 0.01;

                this.x += this.vx;
                this.y += this.vy;

                if (this.x < 0) this.x = width;
                if (this.x > width) this.x = 0;
                if (this.y < 0) this.y = height;
                if (this.y > height) this.y = 0;

                // Twinkle effect - oscillate size and brightness
                this.twinklePhase += this.twinkleSpeed;
                const twinkle = Math.sin(this.twinklePhase) * 0.5 + 0.5; // 0 to 1
                this.size = this.baseSize * (0.7 + twinkle * 0.6);
                this.brightness = 0.4 + twinkle * 0.6;
            }

            draw() {
                // Glow effect for bright stars
                if (this.isBright) {
                    const gradient = ctx!.createRadialGradient(
                        this.x, this.y, 0,
                        this.x, this.y, this.size * 3
                    );
                    gradient.addColorStop(0, `rgba(255, 255, 255, ${this.brightness})`);
                    gradient.addColorStop(0.3, `rgba(255, 255, 255, ${this.brightness * 0.3})`);
                    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                    ctx!.beginPath();
                    ctx!.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
                    ctx!.fillStyle = gradient;
                    ctx!.fill();
                }

                // Star core
                ctx!.beginPath();
                ctx!.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx!.fillStyle = `rgba(255, 255, 255, ${this.brightness})`;
                ctx!.fill();
            }
        }

        const initParticles = () => {
            width = canvas.width = section.offsetWidth;
            height = canvas.height = section.offsetHeight;
            const area = width * height;
            const particleCount = Math.floor(area / 2500); // More stars
            particles = Array.from({ length: particleCount }, () => new Particle());
        };

        const handleMouseMove = (e: MouseEvent) => {
            const rect = section.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
        };

        const handleMouseLeave = () => {
            mouseX = -1000;
            mouseY = -1000;
        };

        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            scrollVelocity = currentScrollY - lastScrollY;
            lastScrollY = currentScrollY;
            setTimeout(() => { scrollVelocity *= 0.9; }, 50);
        };

        const animate = () => {
            ctx.clearRect(0, 0, width, height);
            scrollVelocity *= 0.95;
            particles.forEach((p) => { p.update(); p.draw(); });
            animationFrameId = requestAnimationFrame(animate);
        };

        section.addEventListener('mousemove', handleMouseMove);
        section.addEventListener('mouseleave', handleMouseLeave);
        window.addEventListener('scroll', handleScroll, { passive: true });

        const resizeObserver = new ResizeObserver(() => { initParticles(); });
        resizeObserver.observe(section);
        initParticles();
        animate();

        return () => {
            resizeObserver.disconnect();
            cancelAnimationFrame(animationFrameId);
            section.removeEventListener('mousemove', handleMouseMove);
            section.removeEventListener('mouseleave', handleMouseLeave);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);


    // AWRTC: Detect contextual action based on AI response content
    const detectContextAction = useCallback((responseText: string): typeof specialAction => {
        const lower = responseText.toLowerCase();

        // Excitement/Positive responses
        if (lower.includes('excited') || lower.includes('amazing') || lower.includes('fantastic') ||
            lower.includes('wonderful') || lower.includes('great news') || lower.includes("can't wait")) {
            return 'excited';
        }

        // Happy/Glad responses
        if (lower.includes('happy to help') || lower.includes('glad') || lower.includes('pleasure') ||
            lower.includes('delighted') || lower.includes('welcome')) {
            return 'glad';
        }

        // Laughing/Humor responses
        if (lower.includes('haha') || lower.includes('funny') || lower.includes('joke') ||
            lower.includes('hilarious') || lower.includes('laugh')) {
            return 'laughing';
        }

        // Thinking/Confused context
        if (lower.includes('let me think') || lower.includes('interesting question') ||
            lower.includes('hmm') || lower.includes('good question')) {
            return 'confused';
        }

        // Approval/Thumbs up  
        if (lower.includes('absolutely') || lower.includes('definitely') || lower.includes('of course') ||
            lower.includes('great idea') || lower.includes('excellent choice') || lower.includes('perfect')) {
            return 'thumbsUp';
        }

        // Greeting/Hello
        if (lower.includes('hello') || lower.includes('hi there') || lower.includes('hey!') ||
            lower.includes('welcome') || lower.includes('nice to meet')) {
            return 'waving';
        }

        // Grateful/Thankful
        if (lower.includes('thank you') || lower.includes('appreciate') || lower.includes('grateful')) {
            return 'smirk';
        }

        // Surprise
        if (lower.includes('wow') || lower.includes('incredible') || lower.includes('impressive') ||
            lower.includes('amazing')) {
            return 'surprised';
        }

        // Disappointment/Sorry
        if (lower.includes('sorry') || lower.includes('unfortunately') || lower.includes('apologize') ||
            lower.includes("can't help") || lower.includes('not possible')) {
            return 'disappointed';
        }

        // Shy/Humble
        if (lower.includes('flattered') || lower.includes('too kind') || lower.includes('humble')) {
            return 'blushing';
        }

        // Chill/Relaxed
        if (lower.includes('no worries') || lower.includes('take your time') || lower.includes('relax') ||
            lower.includes('no rush') || lower.includes('easy')) {
            return 'chill';
        }

        return null; // No specific action detected
    }, []);

    /**
     * Stream a response from /api/chat?stream=1 (SSE) and reveal it at typewriter
     * pace into `botMessageId`. Resolves when the full text has been REVEALED to
     * the user (not just received from the network), so the avatar stays in sync.
     *
     * Architecture:
     *   - Network buffer: `fullText` grows as SSE deltas arrive (fast, network-bound).
     *   - Display buffer: a ticker advances `displayedLength` at ~20ms/char, slicing
     *     `fullText` for the visible message content.
     *   - First visible char → flip thinking→speaking on avatar.
     *   - All visible + network done → flip speaking off, clear isStreaming, resolve.
     *
     * SSE events: meta, chunk, done, error.
     */
    const streamResponse = useCallback(async (userMessage: string, botMessageId: string): Promise<string> => {
        const lower = userMessage.toLowerCase();
        if (lower.includes('estimate') || lower.includes('cost') || lower.includes('price') || lower.includes('budget')) {
            onEstimateRequest?.();
        }
        if (lower.includes('book') || lower.includes('meet') || lower.includes('schedule') || lower.includes('consultation')) {
            onBookingRequest?.();
        }

        let response: Response;
        try {
            response = await fetch('/api/chat?stream=1', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'text/event-stream' },
                body: JSON.stringify({
                    message: userMessage,
                    offlineMode: oocMode,
                    sessionId: chatSessionId || undefined,
                }),
            });
        } catch {
            return "Couldn't reach the server. Try again in a moment.";
        }

        if (!response.ok || !response.body) {
            try {
                const data = await response.json();
                return data.response || "Hit an error reaching the AI service.";
            } catch {
                return "Hit an error reaching the AI service.";
            }
        }

        return new Promise<string>((resolve) => {
            let fullText = '';
            let displayedLength = 0;
            let networkDone = false;
            let firstCharShown = false;

            // Display pace: ~20ms per char with 2 chars per tick = ~100 chars/sec.
            // Matches the original typewriter feel that the avatar GIFs were tuned to.
            const TICK_MS = 20;
            const CHARS_PER_TICK = 2;

            const ticker = setInterval(() => {
                if (displayedLength < fullText.length) {
                    displayedLength = Math.min(displayedLength + CHARS_PER_TICK, fullText.length);
                    const visible = fullText.slice(0, displayedLength);
                    setMessages(prev =>
                        prev.map(m => m.id === botMessageId ? { ...m, content: visible } : m)
                    );
                    if (!firstCharShown) {
                        firstCharShown = true;
                        setIsLoading(false);
                        setIsThinking(false);
                        setIsSpeaking(true); // avatar starts talking exactly when user sees first char
                    }
                } else if (networkDone) {
                    // All received text has been revealed — wind down
                    clearInterval(ticker);
                    setMessages(prev =>
                        prev.map(m =>
                            m.id === botMessageId
                                ? { ...m, isStreaming: false, content: fullText }
                                : m,
                        ),
                    );
                    setIsSpeaking(false);
                    resolve(fullText);
                }
                // else: caught up but stream still flowing — keep avatar speaking, idle this tick
            }, TICK_MS);

            // SSE reader runs concurrently — fills fullText as deltas arrive.
            (async () => {
                const reader = response.body!.getReader();
                const decoder = new TextDecoder();
                let buffer = '';
                try {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;
                        // Normalise CRLF → LF so SSE event splitting works regardless of line endings
                        buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, '\n');

                        const events = buffer.split('\n\n');
                        buffer = events.pop() || '';

                        for (const ev of events) {
                            const lines = ev.split('\n');
                            const eventLine = lines.find(l => l.startsWith('event:'))?.slice(6).trim();
                            const dataLine = lines.find(l => l.startsWith('data:'))?.slice(5).trim();
                            if (!eventLine || !dataLine) continue;

                            try {
                                const data = JSON.parse(dataLine);
                                if (eventLine === 'meta') {
                                    if (data.sessionId && data.sessionId !== chatSessionId) {
                                        setChatSessionId(data.sessionId);
                                        sessionStorage.setItem('chatSessionId', data.sessionId);
                                    }
                                } else if (eventLine === 'chunk' && typeof data.delta === 'string') {
                                    fullText += data.delta;
                                } else if (eventLine === 'error') {
                                    fullText += `\n\n_(error: ${data.message || 'unknown'})_`;
                                }
                            } catch { /* skip malformed event */ }
                        }
                    }
                } catch (e) {
                    console.error('Stream read error:', e);
                    if (!fullText) fullText = "Connection dropped mid-response. Try again.";
                } finally {
                    networkDone = true;
                }
            })();
        });
    }, [onEstimateRequest, onBookingRequest, oocMode, chatSessionId]);

    const handleSendMessage = useCallback(async (content: string) => {
        const lowerContent = content.toLowerCase();

        // Only check for special actions when OOC mode is enabled
        if (oocMode) {
            // === DANCE MOVES (check first - more specific) ===

            // Wave dance action (check BEFORE waving - more specific)
            if (lowerContent.includes('wave dance') || lowerContent.includes('liquid') ||
                lowerContent.includes('popping') || lowerContent.includes('robot dance') || lowerContent.includes('flow')) {
                setSpecialAction('wave');
                return;
            }

            // Shuffle dance action
            if (lowerContent.includes('shuffle') || lowerContent.includes('shuffling') || lowerContent.includes('melbourne')) {
                setSpecialAction('shuffle');
                return;
            }

            // Silly dance action (DJ Bravo champion style)
            if (lowerContent.includes('silly') || lowerContent.includes('champion') || lowerContent.includes('bravo') ||
                lowerContent.includes('goofy') || lowerContent.includes('funny dance') || lowerContent.includes('clown')) {
                setSpecialAction('silly');
                return;
            }

            // Breakdance action
            if (lowerContent.includes('breakdance') || lowerContent.includes('break dance') || lowerContent.includes('bboy') ||
                lowerContent.includes('breaking') || lowerContent.includes('windmill') || lowerContent.includes('headspin') ||
                lowerContent.includes('hip hop dance')) {
                setSpecialAction('breakdance');
                return;
            }

            // === PHYSICAL ACTIONS ===

            // Backflip action - added 'flip' as standalone trigger
            if (lowerContent.includes('backflip') || lowerContent.includes('back flip') ||
                lowerContent === 'flip' || lowerContent.includes('do a flip') || lowerContent.includes('flip')) {
                setSpecialAction('backflip');
                return;
            }

            // Walking action
            if (lowerContent.includes('walk') || lowerContent.includes('approach') || lowerContent.includes('come here') ||
                lowerContent.includes('step forward') || lowerContent.includes('move closer') || lowerContent.includes('coming') ||
                lowerContent.includes('strut') || lowerContent.includes('stroll')) {
                setSpecialAction('walking');
                return;
            }

            // Looking action
            if (lowerContent.includes('look') || lowerContent.includes('search') || lowerContent.includes('gaze') ||
                lowerContent.includes('horizon') || lowerContent.includes('distance') || lowerContent.includes('far away') ||
                lowerContent.includes('where') || lowerContent.includes('find') || lowerContent.includes('watch') ||
                lowerContent.includes('spot') || lowerContent.includes('see that')) {
                setSpecialAction('looking');
                return;
            }

            // Waving action (full body)
            if (lowerContent.includes('wave') || lowerContent === 'hi' || lowerContent.startsWith('hi ') ||
                lowerContent.endsWith(' hi') || lowerContent.includes('hello') || lowerContent.includes('hey there') ||
                lowerContent.includes('greet') || lowerContent.includes('bye') || lowerContent.includes('goodbye') ||
                lowerContent.includes('see ya') || lowerContent.includes('hands up')) {
                setSpecialAction('waving');
                return;
            }

            // === WILD ACTIONS ===

            // Zombie action
            if (lowerContent.includes('zombie') || lowerContent.includes('angry') ||
                lowerContent.includes('scream') || lowerContent.includes('rage')) {
                setSpecialAction('zombie');
                return;
            }

            // Dizzy action
            if (lowerContent.includes('drunk') || lowerContent.includes('dizzy') || lowerContent.includes('tipsy') ||
                lowerContent.includes('wasted') || lowerContent.includes('spinning')) {
                setSpecialAction('dizzy');
                return;
            }

            // === REACTIONS ===

            // Scared action
            if (lowerContent.includes('scare') || lowerContent.includes('boo') || lowerContent.includes('freak out') ||
                lowerContent.includes('spook') || lowerContent.includes('startle')) {
                setSpecialAction('scared');
                return;
            }

            // Terrified action
            if (lowerContent.includes('ghost') || lowerContent.includes('haunted') || lowerContent.includes('terrified') ||
                lowerContent.includes('run away') || lowerContent.includes('flee') || lowerContent.includes('panic') ||
                lowerContent.includes('horror') || lowerContent.includes('petrified') || lowerContent.includes('terror')) {
                setSpecialAction('terrified');
                return;
            }

            // Shocked action
            if (lowerContent.includes('shocked') || lowerContent.includes('omg') || lowerContent.includes('wtf') ||
                lowerContent.includes('gross') || lowerContent.includes('ew') || lowerContent.includes('weird') ||
                lowerContent.includes('react')) {
                setSpecialAction('shocked');
                return;
            }

            // Surprised action
            if (lowerContent.includes('gasp') || lowerContent.includes('whoa') || lowerContent.includes('wow') ||
                lowerContent.includes('no way') || lowerContent.includes('really') || lowerContent.includes('oh my') ||
                lowerContent.includes('unbelievable') || lowerContent.includes('amazing') || lowerContent.includes('incredible')) {
                setSpecialAction('surprised');
                return;
            }

            // === EXPRESSIONS ===

            // Confused action
            if (lowerContent.includes('confused') || lowerContent.includes('puzzled') || lowerContent.includes('bewildered') ||
                lowerContent.includes('lost') || lowerContent.includes('huh') || lowerContent.includes('what?') ||
                lowerContent.includes('dont understand') || lowerContent.includes('perplexed') || lowerContent.includes('baffled')) {
                setSpecialAction('confused');
                return;
            }

            // Suspicious action
            if (lowerContent.includes('suspicious') || lowerContent.includes('doubt') || lowerContent.includes('skeptic') ||
                lowerContent.includes('hmm') || lowerContent.includes('fishy') || lowerContent.includes('shady') ||
                lowerContent.includes('sus') || lowerContent.includes('trust') || lowerContent.includes('lying')) {
                setSpecialAction('suspicious');
                return;
            }

            // Disappointed action
            if (lowerContent.includes('disappointed') || lowerContent.includes('let down') || lowerContent.includes('sad') ||
                lowerContent.includes('upset') || lowerContent.includes('failed') || lowerContent.includes('bummed') ||
                lowerContent.includes('dejected') || lowerContent.includes('disheartened') || lowerContent.includes('unhappy')) {
                setSpecialAction('disappointed');
                return;
            }

            // Irritated action
            if (lowerContent.includes('irritated') || lowerContent.includes('annoyed') || lowerContent.includes('agitated') ||
                lowerContent.includes('frustrated') || lowerContent.includes('bothered') || lowerContent.includes('fed up') ||
                lowerContent.includes('ugh') || lowerContent.includes('wicked') || lowerContent.includes('ticked off')) {
                setSpecialAction('irritated');
                return;
            }

            // === EMOTIONS ===

            // Excited action
            if (lowerContent.includes('excited') || lowerContent.includes('thrilled') || lowerContent.includes('giddy') ||
                lowerContent.includes('overjoyed') || lowerContent.includes('elated') || lowerContent.includes('yay') ||
                lowerContent.includes('woohoo') || lowerContent.includes('yippee') || lowerContent.includes('ecstatic') ||
                lowerContent.includes('so happy') || lowerContent.includes('cant wait')) {
                setSpecialAction('excited');
                return;
            }

            // Shy action
            if (lowerContent.includes('shy') || lowerContent.includes('bashful') || lowerContent.includes('timid') ||
                lowerContent.includes('embarrassed') || lowerContent.includes('awkward') || lowerContent.includes('nervous') ||
                lowerContent.includes('flustered') || lowerContent.includes('humble') || lowerContent.includes('modest')) {
                setSpecialAction('shy');
                return;
            }

            // Chill action
            if (lowerContent.includes('chill') || lowerContent.includes('relax') || lowerContent.includes('lazy') ||
                lowerContent.includes('bored') || lowerContent.includes('vibe') || lowerContent.includes('groove') ||
                lowerContent.includes('carefree') || lowerContent.includes('laid back') || lowerContent.includes('casual')) {
                setSpecialAction('chill');
                return;
            }

            // Glad action
            if (lowerContent.includes('glad') || lowerContent.includes('feeling good') || lowerContent.includes('content') ||
                lowerContent.includes('grateful') || lowerContent.includes('thankful') || lowerContent.includes('blessed') ||
                lowerContent.includes('relieved') || lowerContent.includes('peaceful') || lowerContent.includes('at ease')) {
                setSpecialAction('glad');
                return;
            }

            // === GESTURES ===

            // Thumbs up action
            if (lowerContent.includes('thumbs up') || lowerContent.includes('like it') || lowerContent.includes('love it') ||
                lowerContent.includes('approve') || lowerContent.includes('👍') || lowerContent.includes('good work') ||
                lowerContent.includes('agree') || lowerContent.includes('yes!') || lowerContent.includes('right on')) {
                setSpecialAction('thumbsUp');
                return;
            }

            // OK sign action
            if (lowerContent === 'ok' || lowerContent === 'okay' || lowerContent.includes('perfect') ||
                lowerContent.includes('great job') || lowerContent.includes('good job') || lowerContent.includes('nice') ||
                lowerContent.includes('well done') || lowerContent.includes('excellent') || lowerContent.includes('👌')) {
                setSpecialAction('okSign');
                return;
            }

            // Smirk action
            if (lowerContent.includes('smirk') || lowerContent.includes('pleased') || lowerContent.includes('satisfied') ||
                lowerContent.includes('proud') || lowerContent.includes('nailed it') || lowerContent.includes('got it') ||
                lowerContent.includes('smug') || lowerContent.includes('sly') || lowerContent.includes('clever')) {
                setSpecialAction('smirk');
                return;
            }

            // Laughing action
            if (lowerContent.includes('lol') || lowerContent.includes('lmao') || lowerContent.includes('rofl') ||
                lowerContent.includes('haha') || lowerContent.includes('laugh') || lowerContent.includes('hilarious') ||
                lowerContent.includes('xd') || lowerContent.includes('😂') || lowerContent.includes('dying')) {
                setSpecialAction('laughing');
                return;
            }

            // === ROMANTIC ===

            // Blushing action
            if (lowerContent.includes('blush') || lowerContent.includes('flattered') || lowerContent.includes('cute') ||
                lowerContent.includes('adorable') || lowerContent.includes('aww') || lowerContent.includes('flirt') ||
                lowerContent.includes('compliment') || lowerContent.includes('love you') || lowerContent.includes('handsome') ||
                lowerContent.includes('beautiful')) {
                setSpecialAction('blushing');
                return;
            }

            // Kissing action
            if (lowerContent.includes('kiss') || lowerContent.includes('smooch') || lowerContent.includes('mwah') ||
                lowerContent.includes('peck') || lowerContent.includes('muah') || lowerContent.includes('xoxo')) {
                setSpecialAction('kissing');
                return;
            }
        } // End of oocMode block

        // Normal chat handling (when OOC mode is OFF or no action matched)
        // Add user message
        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            type: 'user',
            content,
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMessage]);

        // Avatar enters thinking pose while waiting for the first token.
        // streamResponse's ticker flips thinking→speaking on first visible char,
        // and speaking→idle when the typewriter finishes draining the buffer.
        setIsLoading(true);
        setIsThinking(true);
        setIsSpeaking(false);

        // Push an empty bot message that the ticker will fill at typewriter pace
        const botMessageId = (Date.now() + 1).toString();
        const botMessage: ChatMessage = {
            id: botMessageId,
            type: 'bot',
            content: '',
            timestamp: new Date(),
            isStreaming: true,
        };
        setMessages(prev => [...prev, botMessage]);

        // streamResponse resolves when the full text has been REVEALED to the user
        // (not just received from the network), keeping avatar GIFs in sync with
        // what's actually appearing on screen.
        const finalText = await streamResponse(content, botMessageId);

        // AWRTC: pick a contextual avatar action from the final response
        if (awrtcMode) {
            const contextAction = detectContextAction(finalText);
            if (contextAction) setSpecialAction(contextAction);
        }
    }, [streamResponse, oocMode, awrtcMode, detectContextAction]);

    const quickPrompts = [
        "What projects have you worked on?",
        "Tell me about your skills",
        "Estimate my project",
        "Book a consultation",
    ];

    return (
        <section
            ref={sectionRef}
            id="chat"
            className="relative min-h-screen py-20 px-4 overflow-x-hidden bg-black"
        >
            {/* Interactive Particle Background */}
            <canvas ref={canvasRef} className="absolute inset-0 z-[1] opacity-60 pointer-events-none" />

            {/* Vignette Overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.5)_100%)] pointer-events-none z-[2]" />

            {/* Section header — matches the canonical pattern used by Skills, Projects,
                 Testimonials, Contact, etc. Pill badge + large display title + secondary subtitle. */}
            <div className="max-w-6xl mx-auto mb-12 sm:mb-16 md:mb-20 text-center relative z-10">
                {/* Blue glow behind (mix-blend-screen so it brightens, not muddies) */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] h-[300px] sm:h-[400px] bg-blue-600/20 blur-[120px] rounded-full -z-20 pointer-events-none mix-blend-screen" />

                {/* Section badge - pill style */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="inline-block bg-black/50 px-4 sm:px-6 py-2 border border-cyan-500/30 rounded-full backdrop-blur-md"
                >
                    <span className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-cyan-400">
                        AI Chat
                    </span>
                </motion.div>

                <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className="mt-4 sm:mt-5 md:mt-6 font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white tracking-tight px-2"
                >
                    HAVE A CONVERSATION
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mx-auto mt-3 sm:mt-4 max-w-xl text-sm sm:text-base md:text-lg text-text-secondary px-4"
                >
                    I&apos;m an AI representation of Srujan — discuss projects, explore ideas, or ask me anything.
                    <span className="block mt-2 text-cyan-400/80 italic text-xs sm:text-sm">
                        Srujan personally reviews all interactions to ensure a seamless follow-up.
                    </span>
                </motion.p>
            </div>


            {/* Main content grid */}
            <div className="max-w-6xl w-full mx-auto grid lg:grid-cols-2 gap-8 items-stretch relative z-10 overflow-hidden">
                {/* Holographic Avatar */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="relative aspect-square max-h-[500px] sm:max-h-[550px] lg:max-h-none lg:aspect-auto lg:min-h-[600px] mx-auto w-full overflow-hidden rounded-[2.5rem]"
                >
                    {/* Blue Metallic Glow Background - Hidden on mobile to prevent overflow */}
                    <div className="hidden lg:block absolute -inset-6 bg-gradient-to-br from-cyan-500/40 via-blue-500/30 to-cyan-400/40 blur-3xl rounded-[3rem]" />
                    <div className="hidden lg:block absolute -inset-3 bg-gradient-to-tr from-blue-600/30 via-cyan-400/20 to-blue-500/30 blur-2xl rounded-[2.5rem]" />

                    {/* Avatar Container */}
                    <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden">
                        {/* GIF-based Animated Avatar */}
                        <AnimatedGifAvatar
                            isThinking={isThinking}
                            isSpeaking={isSpeaking || isVoiceSpeaking}
                            hasConversation={messages.length > 0}
                            viewMode="head"
                            specialAction={specialAction}
                            onSpecialActionComplete={() => setSpecialAction(null)}
                        />
                    </div>
                </motion.div>

                {/* Terminal Chat */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                    className="h-[500px] lg:h-[600px] min-w-0 w-full max-w-full"
                >
                    <TerminalChat
                        messages={messages}
                        onSendMessage={handleSendMessage}
                        onVoiceSpeakingChange={setIsVoiceSpeaking}
                        isLoading={isLoading}
                        quickPrompts={quickPrompts}
                        className="h-full"
                        oocMode={oocMode}
                        onOocModeChange={setOocMode}
                        awrtcMode={awrtcMode}
                        onAwrtcModeChange={setAwrtcMode}
                    />
                </motion.div>
            </div>

            {/* 🎮 Avatar Command Center — Gamified Collapsible */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                className="max-w-6xl mx-auto mt-12"
            >
                {/* Unlock Button / Header */}
                <button
                    onClick={() => setCommandCenterOpen(!commandCenterOpen)}
                    className="w-full group relative overflow-hidden rounded-2xl border-2 transition-all duration-500"
                    style={{
                        borderColor: commandCenterOpen ? 'rgba(6, 182, 212, 0.4)' : 'rgba(168, 85, 247, 0.3)',
                        background: commandCenterOpen
                            ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.08), rgba(59, 130, 246, 0.05))'
                            : 'linear-gradient(135deg, rgba(168, 85, 247, 0.08), rgba(236, 72, 153, 0.05))',
                    }}
                >
                    {/* Animated scanning line */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div
                            className="absolute h-px w-full opacity-40"
                            style={{
                                background: 'linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.8), transparent)',
                                animation: 'scanLine 3s ease-in-out infinite',
                                top: '50%',
                            }}
                        />
                    </div>

                    <div className="relative z-10 p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-4">
                        {/* Left — Icon + Title */}
                        <div className="flex items-center gap-3 flex-1">
                            <div className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 ${commandCenterOpen ? 'bg-cyan-500/20 border border-cyan-400/30' : 'bg-purple-500/20 border border-purple-400/30'}`}>
                                <span className="text-2xl">{commandCenterOpen ? '🎮' : '🔒'}</span>
                                {!commandCenterOpen && (
                                    <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-purple-400 animate-ping" />
                                )}
                            </div>
                            <div className="text-left">
                                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                                    Avatar Command Center
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider ${commandCenterOpen ? 'bg-cyan-400/20 text-cyan-400' : 'bg-purple-400/20 text-purple-400 animate-pulse'}`}>
                                        {commandCenterOpen ? '✦ UNLOCKED' : '⬡ TAP TO UNLOCK'}
                                    </span>
                                </h3>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {commandCenterOpen ? '27 actions loaded • ASA & AWRTC modes available' : 'Discover 27 secret avatar actions & dance moves'}
                                </p>
                            </div>
                        </div>

                        {/* Right — XP Bar + Chevron */}
                        <div className="flex items-center gap-4">
                            <div className="hidden sm:block">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-mono text-[10px] text-gray-500 uppercase">Power Level</span>
                                    <span className="font-mono text-[10px] text-cyan-400 font-bold">MAX</span>
                                </div>
                                <div className="w-32 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full bg-gradient-to-r from-purple-500 via-cyan-400 to-emerald-400" style={{ width: '100%', animation: 'shimmer 2s ease-in-out infinite' }} />
                                </div>
                            </div>
                            <motion.div animate={{ rotate: commandCenterOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
                                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </motion.div>
                        </div>
                    </div>
                </button>

                {/* Collapsible Content */}
                <AnimatePresence>
                    {commandCenterOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.4, ease: 'easeInOut' }}
                            className="overflow-hidden"
                        >
                            <div className="pt-4 space-y-4">
                                {/* Mode Instructions */}
                                <div className="grid sm:grid-cols-2 gap-3">
                                    <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                                        <p className="text-sm text-gray-300">
                                            <span className="text-purple-400 font-semibold">ASA Mode:</span> Click{' '}
                                            <span className="px-1.5 py-0.5 bg-purple-500/30 text-purple-300 rounded text-xs font-mono">ASA</span>{' '}
                                            to manually trigger actions. Type any trigger word when ON.
                                        </p>
                                    </div>
                                    <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                                        <p className="text-sm text-gray-300">
                                            <span className="text-cyan-400 font-semibold">AWRTC Mode <span className="text-[10px] opacity-70">(beta)</span>:</span> Click{' '}
                                            <span className="px-1.5 py-0.5 bg-cyan-500/30 text-cyan-300 rounded text-xs font-mono">AWRTCβ</span>{' '}
                                            for auto contextual actions synced to AI responses.
                                        </p>
                                    </div>
                                </div>

                                {/* Actions Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {[
                                        { title: '🎭 Physical', color: 'purple', items: [['Backflip', 'backflip, flip'], ['Walking', 'walk, approach, come here, strut'], ['Waving', 'wave, hi, hello, greet, bye'], ['Looking', 'look, search, gaze, where, find']] },
                                        { title: '💃 Dance', color: 'pink', items: [['Shuffle', 'shuffle, melbourne shuffle'], ['Silly', 'silly, champion, bravo, goofy'], ['Wave Dance', 'wave dance, liquid, popping, flow'], ['Breakdance', 'breakdance, bboy, windmill']] },
                                        { title: '😊 Emotions', color: 'yellow', items: [['Excited', 'excited, thrilled, yay, woohoo'], ['Shy', 'shy, bashful, nervous, humble'], ['Chill', 'chill, relax, vibe, groove'], ['Glad', 'glad, grateful, thankful, blessed']] },
                                        { title: '😱 Reactions', color: 'green', items: [['Scared', 'scare, boo, freak out, spook'], ['Terrified', 'ghost, haunted, panic, terror'], ['Shocked', 'shocked, omg, wtf, gross'], ['Surprised', 'gasp, whoa, wow, no way']] },
                                        { title: '🤔 Expressions', color: 'orange', items: [['Confused', 'confused, puzzled, huh, lost'], ['Suspicious', 'suspicious, doubt, hmm, sus'], ['Disappointed', 'sad, upset, let down, bummed'], ['Irritated', 'irritated, annoyed, frustrated, ugh']] },
                                        { title: '👍 Gestures', color: 'blue', items: [['Thumbs Up', 'thumbs up, like it, approve, 👍'], ['OK Sign', 'ok, perfect, great job, 👌'], ['Smirk', 'smirk, pleased, proud, smug'], ['Laughing', 'lol, lmao, haha, 😂']] },
                                        { title: '💕 Romantic', color: 'red', items: [['Blushing', 'blush, cute, adorable, flirt'], ['Kissing', 'kiss, smooch, mwah, xoxo']] },
                                        { title: '🤪 Wild', color: 'emerald', items: [['Zombie', 'zombie, angry, scream, rage'], ['Dizzy', 'drunk, dizzy, tipsy, spinning']] },
                                    ].map((cat, i) => (
                                        <motion.div
                                            key={cat.title}
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className={`space-y-2 p-4 rounded-xl border bg-${cat.color}-500/5 border-${cat.color}-500/10`}
                                            style={{ background: `rgba(var(--${cat.color}), 0.03)`, borderColor: `rgba(var(--${cat.color}), 0.1)` }}
                                        >
                                            <h4 className={`text-xs font-semibold text-${cat.color}-400 uppercase tracking-wider`}>{cat.title}</h4>
                                            <div className="space-y-1.5 text-xs">
                                                {cat.items.map(([name, triggers]) => (
                                                    <div key={name}><span className="text-cyan-300 font-medium">{name}:</span> <span className="text-gray-500">{triggers}</span></div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Background decorations */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* Grid */}
                <div
                    className="absolute inset-0 opacity-5"
                    style={{
                        backgroundImage: `
              linear-gradient(rgba(6, 182, 212, 0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(6, 182, 212, 0.5) 1px, transparent 1px)
            `,
                        backgroundSize: '100px 100px',
                    }}
                />
            </div>
        </section>
    );
}

export default HolographicChat;
