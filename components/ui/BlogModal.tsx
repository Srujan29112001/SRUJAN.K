'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { X, Share2, ExternalLink } from 'lucide-react';
import { blogPosts, type BlogPost } from '@/data/blog';
import { useSmoothScroll } from '@/components/providers/SmoothScrollProvider';

const MEDIUM_URL = 'https://medium.com/@srujan29112001';
const pad = (i: number) => String(i + 1).padStart(3, '0');
const dateline = (p: BlogPost) =>
    `${p.date} · ${p.dispatchLabel ?? 'Field Note'} · ${p.readTime.replace(' read', '')}`.toUpperCase();

interface BlogModalProps {
    post: BlogPost | null;
    isOpen: boolean;
    onClose: () => void;
}

/**
 * THE PAGE, OPENED — the blog article sub-page as a bound-notebook reading
 * sheet: a manuscript with §-marked sections, a drop-cap, a pasted-in plate,
 * a reading-progress hairline, a wax-stamp sign-off, and serial "turn to"
 * navigation between dispatches. Token-driven so it flips dark↔cream.
 */
export function BlogModal({ post, isOpen, onClose }: BlogModalProps) {
    const { lenis } = useSmoothScroll();
    const modalRef = useRef<HTMLDivElement>(null);
    const sheetRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [current, setCurrent] = useState<BlogPost | null>(post);
    const [progress, setProgress] = useState(0);

    // Keep the open article in sync when a new one is launched from the section.
    useEffect(() => { if (post) setCurrent(post); }, [post]);

    const index = current ? blogPosts.findIndex((p) => p.id === current.id) : -1;

    // Open: lock scroll + "open the book" flourish.
    useEffect(() => {
        if (isOpen && post) {
            lenis?.stop();
            document.body.style.overflow = 'hidden';
            const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
            const ctx = gsap.context(() => {
                gsap.fromTo(modalRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' });
                if (!reduce) {
                    gsap.fromTo(
                        sheetRef.current,
                        { rotateX: 14, y: 50, opacity: 0, transformPerspective: 1400, transformOrigin: 'center top' },
                        { rotateX: 0, y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', delay: 0.05 }
                    );
                }
            }, modalRef);
            return () => { ctx.revert(); lenis?.start(); };
        } else {
            lenis?.start();
            document.body.style.overflow = '';
        }
    }, [isOpen, post, lenis]);

    // Escape to close the book.
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    if (!isOpen || !current) return null;

    const onScroll = () => {
        const el = scrollRef.current;
        if (!el) return;
        const max = el.scrollHeight - el.clientHeight;
        setProgress(max > 0 ? Math.min(1, el.scrollTop / max) : 0);
    };

    const turnToDispatch = (i: number) => {
        if (i < 0 || i >= blogPosts.length) return;
        const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        const swap = () => { setCurrent(blogPosts[i]); scrollRef.current?.scrollTo({ top: 0 }); setProgress(0); };
        if (reduce || !sheetRef.current) { swap(); return; }
        gsap.timeline()
            .to(sheetRef.current, { rotateY: -8, x: -20, opacity: 0.2, duration: 0.22, ease: 'power3.in', transformPerspective: 1400 })
            .add(swap)
            .fromTo(sheetRef.current, { rotateY: 8, x: 20, opacity: 0.2 }, { rotateY: 0, x: 0, opacity: 1, duration: 0.3, ease: 'power3.out' });
    };

    // ── Manuscript renderer — restyles the markdown-ish content ───────────────
    const renderContent = (content: string) => {
        const lines = content.trim().split('\n');
        const elements: JSX.Element[] = [];
        let paragraph: string[] = [];
        let sectionCount = 0;
        let firstParagraph = true;

        const inkBold = (text: string, key: number | string) =>
            text.split('**').map((part, i) =>
                i % 2 === 1
                    ? <strong key={`${key}-${i}`} className="font-semibold text-cyan-400">{part}</strong>
                    : <span key={`${key}-${i}`}>{part}</span>
            );

        const flush = () => {
            if (!paragraph.length) return;
            const text = paragraph.join(' ').trim();
            if (text) {
                const isFirst = firstParagraph;
                firstParagraph = false;
                elements.push(
                    <p
                        key={elements.length}
                        className={`text-text-secondary leading-[1.85] mb-5 text-[15px] sm:text-base ${isFirst
                            ? 'first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:font-display first-letter:font-bold first-letter:text-5xl sm:first-letter:text-6xl first-letter:leading-[0.7] first-letter:text-cyan-400'
                            : ''
                            }`}
                    >
                        {inkBold(text, elements.length)}
                    </p>
                );
            }
            paragraph = [];
        };

        lines.forEach((line) => {
            const t = line.trim();
            if (t.startsWith('## ')) {
                flush();
                sectionCount += 1;
                elements.push(
                    <div key={elements.length} className="mt-10 mb-5 flex items-baseline gap-3">
                        <span className="font-mono text-xs text-cyan-400 tabular-nums shrink-0 pt-1">§ {pad(sectionCount - 1)}</span>
                        <h2 className="font-display text-lg sm:text-xl font-bold text-text-primary uppercase tracking-tight leading-tight">
                            {t.replace('## ', '')}
                            <span className="block mt-2.5 h-[2px] w-10 bg-cyan-400" />
                        </h2>
                    </div>
                );
            } else if (t.startsWith('- ')) {
                flush();
                elements.push(
                    <p key={elements.length} className="flex gap-3 text-text-secondary leading-relaxed mb-2.5 text-[15px] sm:text-base pl-1">
                        <span className="text-cyan-400 select-none shrink-0">—</span>
                        <span>{inkBold(t.replace('- ', ''), elements.length)}</span>
                    </p>
                );
            } else if (/^\d+\.\s/.test(t)) {
                flush();
                const num = t.match(/^(\d+)\./)?.[1] ?? '';
                elements.push(
                    <p key={elements.length} className="flex gap-3 text-text-secondary leading-relaxed mb-2.5 text-[15px] sm:text-base pl-1">
                        <span className="font-mono text-cyan-400 tabular-nums select-none shrink-0">{num.padStart(2, '0')}</span>
                        <span>{inkBold(t.replace(/^\d+\.\s/, ''), elements.length)}</span>
                    </p>
                );
            } else if (t === '') {
                flush();
            } else {
                paragraph.push(t);
            }
        });
        flush();
        return elements;
    };

    const hairline = 'var(--hairline, rgba(255,255,255,0.1))';

    return (
        <div ref={modalRef} className="fixed inset-0 z-[9999]">
            {/* scrim */}
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

            {/* reading-progress hairline */}
            <div className="fixed top-0 left-0 right-0 h-[3px] z-[10001] bg-transparent">
                <div className="h-full bg-cyan-400 origin-left" style={{ transform: `scaleX(${progress})` }} />
            </div>

            {/* close — "close the book" */}
            <button
                onClick={onClose}
                aria-label="Close the book"
                className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[10002] w-11 h-11 rounded-full bg-cyan-500 text-black border-2 border-white/80 shadow-2xl flex items-center justify-center hover:scale-110 hover:bg-cyan-400 transition-all"
            >
                <X className="w-5 h-5 stroke-[3]" />
            </button>

            {/* scrollable reading column */}
            <div
                ref={scrollRef}
                onScroll={onScroll}
                data-lenis-prevent
                className="relative h-full overflow-y-auto custom-scrollbar"
            >
                <div className="min-h-full flex items-start justify-center px-3 sm:px-6 pt-14 pb-32 sm:py-16">
                    <article
                        ref={sheetRef}
                        data-blogmodal
                        className="relative w-full max-w-3xl rounded-2xl border bg-bg-surface shadow-2xl px-5 sm:px-10 md:px-14 py-10 sm:py-14"
                        style={{
                            borderColor: hairline,
                            backgroundImage: 'repeating-linear-gradient(transparent 0 31px, rgba(120,120,120,0.08) 31px 32px)',
                        }}
                    >
                        {/* ── HEADER (dateline block) ──────────────────────────── */}
                        <div className="flex items-start justify-between gap-4">
                            <span className="font-mono text-2xl sm:text-3xl font-bold tabular-nums text-text-primary leading-none">
                                Dispatch No.&nbsp;{pad(Math.max(0, index))}
                            </span>
                        </div>
                        <p className="mt-3 font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] text-text-muted">{dateline(current)}</p>

                        <h1 className="mt-5 font-display text-3xl sm:text-4xl md:text-5xl font-bold text-text-primary leading-[1.05]">
                            {current.title}
                        </h1>
                        <div className="mt-4 h-[2px] w-14 bg-cyan-400" />
                        <p className="mt-4 italic text-base sm:text-lg text-text-secondary leading-relaxed">{current.summary}</p>

                        {/* ── PLATE ────────────────────────────────────────────── */}
                        <div className="relative my-9 sm:my-10 mx-auto w-[88%] sm:w-[78%]" style={{ transform: 'rotate(-1.2deg)' }}>
                            <div className="relative aspect-[16/10] overflow-hidden rounded-[2px] border-4 border-bg-elevated shadow-xl" data-article-body>
                                <Image src={current.image} alt={current.title} fill className="object-cover" sizes="(max-width:768px) 80vw, 600px" />
                                <div className="absolute inset-0 mix-blend-soft-light opacity-30" style={{ backgroundColor: current.color }} />
                            </div>
                            <div
                                className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 rotate-[6deg] rounded-[1px]"
                                style={{ backgroundColor: 'rgba(150,140,125,0.4)', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }}
                            />
                            <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-wider text-text-muted">
                                Plate 1 — {current.dispatchLabel ?? current.tags[0]}
                            </p>
                        </div>

                        {/* ── BODY (manuscript) ────────────────────────────────── */}
                        <div data-article-body className="prose-none">
                            {renderContent(current.content)}
                        </div>

                        {/* ── SIGN-OFF ─────────────────────────────────────────── */}
                        <div className="mt-12 pt-8 border-t" style={{ borderColor: hairline }}>
                            <p className="italic text-text-secondary">— logged by Srujan, {current.date}</p>

                            <div className="mt-6 flex items-center justify-between flex-wrap gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-14 h-14 rounded-full border-2 border-cyan-400/50 flex items-center justify-center shrink-0">
                                        <span className="font-display font-bold text-cyan-400">KS</span>
                                    </div>
                                    <div>
                                        <div className="text-text-primary font-semibold">K Srujan</div>
                                        <div className="text-text-muted text-sm">Gen-AI / Robotics</div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        if (typeof navigator !== 'undefined' && navigator.share) {
                                            navigator.share({ title: current.title, url: MEDIUM_URL }).catch(() => { });
                                        }
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 rounded-full border font-mono text-xs uppercase tracking-wider text-text-secondary hover:text-cyan-400 transition-colors"
                                    style={{ borderColor: hairline }}
                                >
                                    <Share2 className="w-4 h-4" /> Share
                                </button>
                            </div>

                            {/* tag stamps */}
                            <div className="mt-6 flex flex-wrap gap-2">
                                {current.tags.map((tag) => (
                                    <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full border border-cyan-400/40 font-mono text-[10px] uppercase tracking-wider text-cyan-400">
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            {/* archival seal CTA */}
                            <div className="mt-8 flex justify-center">
                                <a
                                    href={current.link !== '#' ? current.link : MEDIUM_URL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group inline-flex items-center gap-3 px-7 py-3.5 rounded-full bg-cyan-500 text-black font-display font-semibold text-sm uppercase tracking-wider hover:bg-cyan-400 transition-colors"
                                >
                                    Filed on Medium
                                    <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                                </a>
                            </div>
                        </div>

                        {/* ── TURN TO (serial reading) ─────────────────────────── */}
                        <div className="mt-10 pt-6 border-t grid grid-cols-2 gap-4" style={{ borderColor: hairline }}>
                            <button
                                onClick={() => turnToDispatch(index - 1)}
                                disabled={index <= 0}
                                className="text-left group disabled:opacity-30 disabled:pointer-events-none"
                            >
                                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-text-muted">← Turn back</span>
                                {index > 0 && (
                                    <p className="mt-1 font-display text-sm font-bold text-text-secondary group-hover:text-cyan-400 transition-colors line-clamp-1">
                                        No. {pad(index - 1)} — {blogPosts[index - 1].title}
                                    </p>
                                )}
                            </button>
                            <button
                                onClick={() => turnToDispatch(index + 1)}
                                disabled={index >= blogPosts.length - 1}
                                className="text-right group disabled:opacity-30 disabled:pointer-events-none"
                            >
                                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-text-muted">Turn to →</span>
                                {index < blogPosts.length - 1 && (
                                    <p className="mt-1 font-display text-sm font-bold text-text-secondary group-hover:text-cyan-400 transition-colors line-clamp-1">
                                        No. {pad(index + 1)} — {blogPosts[index + 1].title}
                                    </p>
                                )}
                            </button>
                        </div>
                    </article>
                </div>
            </div>
        </div>
    );
}

// Hook for managing blog modal state
export function useBlogModal() {
    const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    const openModal = (post: BlogPost) => {
        setSelectedPost(post);
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
        setTimeout(() => setSelectedPost(null), 300);
    };

    return { selectedPost, isOpen, openModal, closeModal };
}
