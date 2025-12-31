'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { X, Calendar, Clock, ArrowLeft, Share2, ExternalLink } from 'lucide-react';
import { BlogPost } from '@/data/blog';
import { cn } from '@/lib/utils';
import { useSmoothScroll } from '@/components/providers/SmoothScrollProvider';

// Medium profile URL
const MEDIUM_URL = 'https://medium.com/@srujan29112001';

interface BlogModalProps {
    post: BlogPost | null;
    isOpen: boolean;
    onClose: () => void;
}

export function BlogModal({ post, isOpen, onClose }: BlogModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const { lenis } = useSmoothScroll();

    useEffect(() => {
        if (isOpen && post) {
            // Disable smooth scroll when modal is open
            lenis?.stop();
            document.body.style.overflow = 'hidden';

            // Animate in
            const ctx = gsap.context(() => {
                gsap.fromTo(
                    modalRef.current,
                    { opacity: 0 },
                    { opacity: 1, duration: 0.3, ease: 'power2.out' }
                );
                gsap.fromTo(
                    contentRef.current,
                    { scale: 0.95, opacity: 0, y: 20 },
                    { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.2)', delay: 0.1 }
                );
            }, modalRef);

            return () => {
                ctx.revert();
                lenis?.start();
            };
        } else {
            // Re-enable smooth scroll when modal closes
            lenis?.start();
            document.body.style.overflow = '';
        }
    }, [isOpen, post, lenis]);

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    if (!isOpen || !post) return null;

    // Parse markdown-like content into paragraphs and headers
    const renderContent = (content: string) => {
        const lines = content.trim().split('\n');
        const elements: JSX.Element[] = [];
        let currentParagraph: string[] = [];

        const flushParagraph = () => {
            if (currentParagraph.length > 0) {
                const text = currentParagraph.join(' ').trim();
                if (text) {
                    elements.push(
                        <p key={elements.length} className="text-white/70 leading-relaxed mb-4 text-sm sm:text-base lg:text-lg">
                            {text.split('**').map((part, i) =>
                                i % 2 === 1 ? <strong key={i} className="text-white font-semibold">{part}</strong> : part
                            )}
                        </p>
                    );
                }
                currentParagraph = [];
            }
        };

        lines.forEach((line, index) => {
            const trimmed = line.trim();

            if (trimmed.startsWith('## ')) {
                flushParagraph();
                elements.push(
                    <h2 key={elements.length} className="text-lg sm:text-xl font-bold text-white mt-8 mb-4">
                        {trimmed.replace('## ', '')}
                    </h2>
                );
            } else if (trimmed.startsWith('- ')) {
                flushParagraph();
                elements.push(
                    <li key={elements.length} className="text-white/70 ml-6 mb-2 list-disc text-sm sm:text-base lg:text-lg">
                        {trimmed.replace('- ', '').split('**').map((part, i) =>
                            i % 2 === 1 ? <strong key={i} className="text-white font-semibold">{part}</strong> : part
                        )}
                    </li>
                );
            } else if (/^\d+\.\s/.test(trimmed)) {
                flushParagraph();
                elements.push(
                    <li key={elements.length} className="text-white/70 ml-6 mb-2 list-decimal text-sm sm:text-base lg:text-lg">
                        {trimmed.replace(/^\d+\.\s/, '').split('**').map((part, i) =>
                            i % 2 === 1 ? <strong key={i} className="text-white font-semibold">{part}</strong> : part
                        )}
                    </li>
                );
            } else if (trimmed === '') {
                flushParagraph();
            } else {
                currentParagraph.push(trimmed);
            }
        });

        flushParagraph();
        return elements;
    };

    return (
        <div
            ref={modalRef}
            className="fixed inset-0 z-[9999] overflow-y-auto"
        >
            {/* Backdrop - Click to close */}
            <div
                className="fixed inset-0 bg-black/90 backdrop-blur-md -z-10"
                onClick={onClose}
            />

            {/* Modal Content - Scrollable */}
            <div className="min-h-screen flex items-start sm:items-center justify-center px-2 sm:px-4 md:px-6 pt-16 pb-48 sm:pt-4 sm:pb-12 md:py-0">
                <div
                    ref={contentRef}
                    data-lenis-prevent
                    className="relative w-full max-w-4xl my-2 sm:my-auto bg-black/95 border border-cyan-500/30 rounded-lg sm:rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.15)] custom-scrollbar"
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="fixed top-4 right-4 sm:top-24 sm:right-8 md:right-12 z-[10000] p-3 sm:p-4 rounded-full bg-cyan-500 hover:bg-cyan-400 transition-all duration-300 border-2 border-white shadow-2xl hover:shadow-cyan-500/80 hover:scale-110 group"
                        aria-label="Close modal"
                    >
                        <X className="w-6 h-6 sm:w-7 sm:h-7 text-white group-hover:rotate-90 transition-transform duration-300 stroke-[3]" />
                    </button>

                    {/* Hero Image */}
                    <div className="relative w-full aspect-video sm:aspect-video overflow-hidden rounded-t-lg sm:rounded-t-2xl">
                        <Image
                            src={post.image}
                            alt={post.title}
                            fill
                            className="object-cover"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                        {/* Tags and Meta container - stacked on mobile, side-by-side on desktop */}
                        <div className="absolute bottom-3 sm:bottom-6 left-3 sm:left-6 right-3 sm:right-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 sm:gap-0">
                            {/* Tags */}
                            <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                {post.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-mono font-medium bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            {/* Meta */}
                            <div className="flex items-center gap-2 sm:gap-4 text-[10px] sm:text-xs font-mono text-white/70">
                                <span className="flex items-center gap-1 sm:gap-1.5 bg-black/50 backdrop-blur-md px-2 sm:px-3 py-1 rounded-full border border-white/10">
                                    <Calendar className="w-3 h-3" />
                                    {post.date}
                                </span>
                                <span className="flex items-center gap-1 sm:gap-1.5 bg-black/50 backdrop-blur-md px-2 sm:px-3 py-1 rounded-full border border-white/10">
                                    <Clock className="w-3 h-3" />
                                    {post.readTime}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Article Content */}
                    <div className="p-4 sm:p-6 md:p-8 lg:p-10">
                        {/* Title */}
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-white mb-3 sm:mb-4">
                            {post.title}
                        </h1>

                        {/* Summary */}
                        <p className="text-base sm:text-lg text-white/60 leading-relaxed mb-4 sm:mb-6">
                            {post.summary}
                        </p>

                        {/* Divider */}
                        <div
                            className="h-1 w-24 rounded-full mb-8"
                            style={{ backgroundColor: post.color }}
                        />

                        {/* Article Body */}
                        <article className="prose prose-invert max-w-none">
                            {renderContent(post.content)}
                        </article>

                        {/* Read Full Article on Medium Button */}
                        <div className="mt-10 flex justify-center">
                            <a
                                href={post.link !== '#' ? post.link : MEDIUM_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold text-lg hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40"
                            >
                                Read Full Article on Medium
                                <ExternalLink className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                            </a>
                        </div>

                        {/* Author Section */}
                        <div className="mt-10 pt-8 border-t border-white/10">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-12 h-12 rounded-full flex items-center justify-center"
                                        style={{ backgroundColor: post.color + '20' }}
                                    >
                                        <span className="font-bold text-lg" style={{ color: post.color }}>KS</span>
                                    </div>
                                    <div>
                                        <div className="text-white font-semibold">K Srujan</div>
                                        <div className="text-white/50 text-sm">AI/ML Engineer</div>
                                    </div>
                                </div>
                                <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors text-sm">
                                    <Share2 className="w-4 h-4" />
                                    Share
                                </button>
                            </div>
                        </div>
                    </div>
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
        // Delay clearing the post to allow exit animation
        setTimeout(() => setSelectedPost(null), 300);
    };

    return {
        selectedPost,
        isOpen,
        openModal,
        closeModal,
    };
}
