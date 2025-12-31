'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TerminalChat, ChatMessage } from '@/components/ui/TerminalChat';
import { quickResponses } from '@/data/ai-persona';

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
    const sectionRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        // Animations handled by Framer Motion for reliability
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

            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.baseVx = (Math.random() - 0.5) * 0.5;
                this.baseVy = (Math.random() - 0.5) * 0.5;
                this.vx = this.baseVx;
                this.vy = this.baseVy;
                this.size = Math.random() * 1.7 + 0.5;
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
            }

            draw() {
                ctx!.beginPath();
                ctx!.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx!.fillStyle = 'rgba(6, 182, 212, 0.55)';
                ctx!.fill();
            }
        }

        const initParticles = () => {
            width = canvas.width = section.offsetWidth;
            height = canvas.height = section.offsetHeight;
            const area = width * height;
            const particleCount = Math.floor(area / 3000);
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

    const generateResponse = useCallback(async (userMessage: string): Promise<string> => {
        const lowerMessage = userMessage.toLowerCase();

        // ONLY intercept UI-related actions (scrolling to sections)
        // Everything else goes to the API for RAG-powered responses
        if (lowerMessage.includes('estimate') || lowerMessage.includes('cost') || lowerMessage.includes('price') || lowerMessage.includes('budget')) {
            onEstimateRequest?.();
            // Still call API for a rich response, but also trigger UI action
        }

        if (lowerMessage.includes('book') || lowerMessage.includes('meet') || lowerMessage.includes('call') || lowerMessage.includes('schedule') || lowerMessage.includes('consultation')) {
            onBookingRequest?.();
            // Still call API for a rich response, but also trigger UI action
        }

        // ALL queries go to the API for RAG-powered responses
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    offlineMode: oocMode, // When ASA mode is ON, force offline/RAG-only mode
                }),
            });

            if (response.ok) {
                const data = await response.json();
                return data.response;
            }
        } catch {
            // API not available, use fallback
        }

        // Fallback response (only if API fails completely)
        return `Thanks for your message! To give you the best answer, I'd recommend:\n\n1. Check out the **Project Calculator** below for cost estimates\n2. **Book a consultation** to discuss your specific needs\n3. Or ask me about specific topics like my skills, projects, or approach to problem-solving.\n\nHow can I help you today?`;
    }, [onEstimateRequest, onBookingRequest, oocMode]);

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

        // Show loading
        setIsLoading(true);
        setIsThinking(true);

        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1500));

        // Generate response
        const responseText = await generateResponse(content);

        // AWRTC: Detect and trigger contextual action based on response
        if (awrtcMode) {
            const contextAction = detectContextAction(responseText);
            if (contextAction) {
                setSpecialAction(contextAction);
            }
        }

        // Add bot response
        const botMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            type: 'bot',
            content: responseText,
            timestamp: new Date(),
            isTyping: true,
        };

        setMessages(prev => [...prev, botMessage]);
        setIsLoading(false);
        setIsThinking(false);
        setIsSpeaking(true); // Start speaking animation

        // After typing animation, mark as complete and stop speaking
        // Using a generous buffer to ensure this fires after TypewriterText completes
        // The typewriter runs at 20ms per character, so we add extra buffer for safety
        const typingDuration = responseText.length * 25 + 1000; // More generous timing
        setTimeout(() => {
            setMessages(prev =>
                prev.map(msg =>
                    msg.id === botMessage.id ? { ...msg, isTyping: false } : msg
                )
            );
            setIsSpeaking(false); // Stop speaking animation
        }, typingDuration);
    }, [generateResponse, oocMode, awrtcMode, detectContextAction]);

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

            {/* Section header */}
            <div className="max-w-6xl mx-auto mb-12 text-center relative z-10">
                {/* Section badge - boxed style */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="inline-block mb-8"
                >
                    <span className="px-4 py-2 border border-cyan-400/50 rounded font-mono text-xs text-cyan-400 uppercase tracking-[0.3em]">
                        AI Chat
                    </span>
                </motion.div>

                <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className="relative font-display text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 uppercase tracking-tight"
                    style={{
                        textShadow: '0 0 80px rgba(6, 182, 212, 0.5), 0 0 120px rgba(6, 182, 212, 0.3), 0 0 160px rgba(6, 182, 212, 0.2)'
                    }}
                >
                    Have a Conversation
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-base md:text-lg text-white/60 max-w-2xl mx-auto"
                >
                    I'm an AI representation of Srujan — feel free to discuss projects, explore ideas, or ask me anything you'd like to know.
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

            {/* Special Actions Guide */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                className="max-w-6xl mx-auto mt-12"
            >
                <div className="bg-black/40 backdrop-blur-sm rounded-2xl border border-cyan-500/20 p-6">
                    <h3 className="text-xl font-bold text-cyan-400 mb-2 flex items-center gap-2">
                        <span className="text-2xl">✨</span>
                        Avatar Special Actions
                        <span className="text-xs font-normal text-gray-400 ml-2">Try these trigger words!</span>
                    </h3>

                    {/* ASA Usage Instructions */}
                    <div className="mb-3 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                        <p className="text-sm text-gray-300">
                            <span className="text-purple-400 font-semibold">ASA Mode:</span> Click the{' '}
                            <span className="px-1.5 py-0.5 bg-purple-500/30 text-purple-300 rounded text-xs font-mono">ASA</span>{' '}
                            button (<span className="text-purple-300">Avatar Special Action</span>) to manually trigger actions.
                            When <span className="text-purple-300">ASA is ON</span>, type any trigger word below to make the avatar perform that action.
                        </p>
                    </div>

                    {/* AWRTC Usage Instructions */}
                    <div className="mb-4 p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                        <p className="text-sm text-gray-300">
                            <span className="text-cyan-400 font-semibold">AWRTC Mode <span className="text-[10px] opacity-70">(beta version)</span>:</span> Click the{' '}
                            <span className="px-1.5 py-0.5 bg-cyan-500/30 text-cyan-300 rounded text-xs font-mono">AWRTCβ</span>{' '}
                            button (<span className="text-cyan-300">Action With Respect To Context</span>) for intelligent mode.
                            When enabled, the avatar automatically performs contextual actions based on the AI response —
                            syncing animations, text, and voice for a seamless experience.
                        </p>
                        <p className="text-xs text-cyan-400/60 mt-2 italic">
                            ⚠️ This feature is currently in beta and under active development. Some contextual triggers may not work as expected.
                            Full functionality and additional action mappings will be expanded in future updates.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Physical Actions */}
                        <div className="space-y-3 p-4 bg-purple-500/5 rounded-xl border border-purple-500/10">
                            <h4 className="text-sm font-semibold text-purple-400 uppercase tracking-wider">🎭 Physical Actions</h4>
                            <div className="space-y-2 text-xs">
                                <div><span className="text-cyan-300 font-medium">Backflip:</span> <span className="text-gray-400">backflip, flip</span></div>
                                <div><span className="text-cyan-300 font-medium">Walking:</span> <span className="text-gray-400">walk, approach, come here, step forward, move closer, coming, strut, stroll</span></div>
                                <div><span className="text-cyan-300 font-medium">Waving:</span> <span className="text-gray-400">wave, hi, hello, hey there, greet, bye, goodbye, see ya, hands up</span></div>
                                <div><span className="text-cyan-300 font-medium">Looking:</span> <span className="text-gray-400">look, search, gaze, horizon, distance, far away, where, find, watch, spot, see that</span></div>
                            </div>
                        </div>

                        {/* Dance Moves */}
                        <div className="space-y-3 p-4 bg-pink-500/5 rounded-xl border border-pink-500/10">
                            <h4 className="text-sm font-semibold text-pink-400 uppercase tracking-wider">💃 Dance Moves</h4>
                            <div className="space-y-2 text-xs">
                                <div><span className="text-cyan-300 font-medium">Shuffle:</span> <span className="text-gray-400">shuffle, shuffling, melbourne shuffle</span></div>
                                <div><span className="text-cyan-300 font-medium">Silly (DJ Bravo):</span> <span className="text-gray-400">silly, champion, bravo, goofy, funny dance, clown</span></div>
                                <div><span className="text-cyan-300 font-medium">Wave Dance:</span> <span className="text-gray-400">wave dance, waving, liquid, popping, robot dance, flow</span></div>
                                <div><span className="text-cyan-300 font-medium">Breakdance:</span> <span className="text-gray-400">breakdance, break dance, bboy, breaking, windmill, headspin, hip hop dance</span></div>
                            </div>
                        </div>

                        {/* Emotions */}
                        <div className="space-y-3 p-4 bg-yellow-500/5 rounded-xl border border-yellow-500/10">
                            <h4 className="text-sm font-semibold text-yellow-400 uppercase tracking-wider">😊 Emotions</h4>
                            <div className="space-y-2 text-xs">
                                <div><span className="text-cyan-300 font-medium">Excited:</span> <span className="text-gray-400">excited, thrilled, giddy, overjoyed, elated, yay, woohoo, yippee, ecstatic, so happy, cant wait</span></div>
                                <div><span className="text-cyan-300 font-medium">Shy:</span> <span className="text-gray-400">shy, bashful, timid, embarrassed, awkward, nervous, flustered, humble, modest</span></div>
                                <div><span className="text-cyan-300 font-medium">Chill:</span> <span className="text-gray-400">chill, relax, happy, lazy, bored, vibe, groove, carefree, laid back, casual</span></div>
                                <div><span className="text-cyan-300 font-medium">Glad:</span> <span className="text-gray-400">glad, feeling good, content, grateful, thankful, blessed, relieved, peaceful, at ease</span></div>
                            </div>
                        </div>

                        {/* Reactions */}
                        <div className="space-y-3 p-4 bg-green-500/5 rounded-xl border border-green-500/10">
                            <h4 className="text-sm font-semibold text-green-400 uppercase tracking-wider">😱 Reactions</h4>
                            <div className="space-y-2 text-xs">
                                <div><span className="text-cyan-300 font-medium">Scared:</span> <span className="text-gray-400">scare, boo, freak out, spook, startle</span></div>
                                <div><span className="text-cyan-300 font-medium">Terrified:</span> <span className="text-gray-400">ghost, haunted, terrified, run away, flee, panic, horror, petrified, terror</span></div>
                                <div><span className="text-cyan-300 font-medium">Shocked:</span> <span className="text-gray-400">shocked, surprise, omg, wtf, gross, ew, weird, react</span></div>
                                <div><span className="text-cyan-300 font-medium">Surprised:</span> <span className="text-gray-400">gasp, whoa, wow, no way, really, oh my, unbelievable, amazing, incredible</span></div>
                            </div>
                        </div>

                        {/* Expressions */}
                        <div className="space-y-3 p-4 bg-orange-500/5 rounded-xl border border-orange-500/10">
                            <h4 className="text-sm font-semibold text-orange-400 uppercase tracking-wider">🤔 Expressions</h4>
                            <div className="space-y-2 text-xs">
                                <div><span className="text-cyan-300 font-medium">Confused:</span> <span className="text-gray-400">confused, puzzled, bewildered, lost, huh, what?, dont understand, perplexed, baffled</span></div>
                                <div><span className="text-cyan-300 font-medium">Suspicious:</span> <span className="text-gray-400">suspicious, doubt, skeptic, hmm, fishy, shady, sus, trust, lying</span></div>
                                <div><span className="text-cyan-300 font-medium">Disappointed:</span> <span className="text-gray-400">disappointed, let down, sad, upset, failed, bummed, dejected, disheartened, unhappy</span></div>
                                <div><span className="text-cyan-300 font-medium">Irritated:</span> <span className="text-gray-400">irritated, annoyed, agitated, frustrated, bothered, fed up, ugh, wicked, ticked off</span></div>
                            </div>
                        </div>

                        {/* Positive Gestures */}
                        <div className="space-y-3 p-4 bg-blue-500/5 rounded-xl border border-blue-500/10">
                            <h4 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">👍 Gestures</h4>
                            <div className="space-y-2 text-xs">
                                <div><span className="text-cyan-300 font-medium">Thumbs Up:</span> <span className="text-gray-400">thumbs up, like it, love it, approve, 👍, good work, agree, yes!, right on</span></div>
                                <div><span className="text-cyan-300 font-medium">OK Sign:</span> <span className="text-gray-400">ok, okay, perfect, great job, good job, nice, well done, excellent, 👌</span></div>
                                <div><span className="text-cyan-300 font-medium">Smirk:</span> <span className="text-gray-400">smirk, pleased, satisfied, proud, nailed it, got it, smug, sly, clever</span></div>
                                <div><span className="text-cyan-300 font-medium">Laughing:</span> <span className="text-gray-400">lol, lmao, rofl, haha, laugh, hilarious, xd, 😂, dying</span></div>
                            </div>
                        </div>

                        {/* Romantic */}
                        <div className="space-y-3 p-4 bg-red-500/5 rounded-xl border border-red-500/10">
                            <h4 className="text-sm font-semibold text-red-400 uppercase tracking-wider">💕 Romantic</h4>
                            <div className="space-y-2 text-xs">
                                <div><span className="text-cyan-300 font-medium">Blushing:</span> <span className="text-gray-400">blush, flattered, cute, adorable, aww, flirt, compliment, love you, handsome, beautiful</span></div>
                                <div><span className="text-cyan-300 font-medium">Kissing:</span> <span className="text-gray-400">kiss, smooch, mwah, peck, muah, xoxo</span></div>
                            </div>
                        </div>

                        {/* Wild */}
                        <div className="space-y-3 p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                            <h4 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">🤪 Wild</h4>
                            <div className="space-y-2 text-xs">
                                <div><span className="text-cyan-300 font-medium">Zombie:</span> <span className="text-gray-400">zombie, angry, scream, rage</span></div>
                                <div><span className="text-cyan-300 font-medium">Dizzy:</span> <span className="text-gray-400">drunk, dizzy, tipsy, wasted, spinning</span></div>
                            </div>
                        </div>
                    </div>
                </div>
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
