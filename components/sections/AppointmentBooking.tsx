'use client';

import { useRef, useEffect, forwardRef, useImperativeHandle, useState } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import dynamic from 'next/dynamic';

// Dynamic import for Cal.com embed to avoid SSR issues
const CalEmbed = dynamic(() => import('@/components/ui/CalEmbed').then(m => m.CalEmbed), {
    ssr: false,
    loading: () => (
        <div className="w-full min-h-[600px] rounded-2xl border border-cyan-900/30 bg-[#0a0a0f] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
                <p className="font-mono text-sm text-white/40">Loading calendar...</p>
            </div>
        </div>
    ),
});

gsap.registerPlugin(ScrollTrigger);

export interface AppointmentBookingHandle {
    scrollToBooking: () => void;
}

interface MeetingType {
    id: string;
    name: string;
    duration: string;
    description: string;
    icon: string;
    calLink: string;
}

const meetingTypes: MeetingType[] = [
    {
        id: 'discovery',
        name: 'Discovery Call',
        duration: '15 min',
        description: 'Quick intro to discuss your needs and see if we\'re a good fit.',
        icon: '👋',
        calLink: 'k-srujan-jyhlkq/15min',
    },
    {
        id: 'project',
        name: 'Project Discussion',
        duration: '30 min',
        description: 'Dive into your project requirements, timeline, and budget.',
        icon: '📋',
        calLink: 'k-srujan-jyhlkq/30min',
    },
];

interface AppointmentBookingProps {
    className?: string;
}

export const AppointmentBooking = forwardRef<AppointmentBookingHandle, AppointmentBookingProps>(
    function AppointmentBooking({ className = '' }, ref) {
        const sectionRef = useRef<HTMLDivElement>(null);
        const [selectedMeeting, setSelectedMeeting] = useState<string | null>(null);
        const [showCalendar, setShowCalendar] = useState(false);

        // Form state
        const [formData, setFormData] = useState({
            name: '',
            email: '',
            message: '',
        });
        const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

        // Handle form input changes
        const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target;
            setFormData(prev => ({ ...prev, [name]: value }));
        };

        // Handle form submission
        const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();

            if (!formData.name || !formData.email || !formData.message) {
                return;
            }

            setFormStatus('loading');

            try {
                const response = await fetch('/api/contact-form', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                });

                if (response.ok) {
                    setFormStatus('success');
                    setFormData({ name: '', email: '', message: '' });
                    // Reset after 5 seconds
                    setTimeout(() => setFormStatus('idle'), 5000);
                } else {
                    setFormStatus('error');
                    setTimeout(() => setFormStatus('idle'), 5000);
                }
            } catch {
                setFormStatus('error');
                setTimeout(() => setFormStatus('idle'), 5000);
            }
        };

        // Expose scroll method to parent
        useImperativeHandle(ref, () => ({
            scrollToBooking: () => {
                sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            },
        }));

        useEffect(() => {
            // Animations handled by Framer Motion for reliability
        }, []);

        const handleMeetingSelect = (meetingId: string) => {
            setSelectedMeeting(meetingId);
            setShowCalendar(true);
        };

        const selectedMeetingData = meetingTypes.find(m => m.id === selectedMeeting);

        return (
            <section
                ref={sectionRef}
                id="booking"
                className={`relative py-20 pb-16 md:pb-32 px-4 overflow-hidden ${className}`}
                style={{ background: 'linear-gradient(180deg, #0a0a0f 0%, #0a0f1a 100%)' }}
            >
                {/* Background - Animated gradient */}
                <div className="absolute inset-0 opacity-20">
                    <div
                        className="absolute inset-0"
                        style={{
                            background: 'radial-gradient(ellipse at 30% 50%, rgba(6, 182, 212, 0.3) 0%, transparent 50%), radial-gradient(ellipse at 70% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)',
                        }}
                    />
                    {/* Animated circles */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-cyan-400/10 animate-pulse" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-cyan-400/10" style={{ animation: 'pulse 3s ease-in-out infinite' }} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full border border-blue-400/20" style={{ animation: 'pulse 2s ease-in-out infinite' }} />
                </div>

                {/* Grid pattern */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
                        `,
                        backgroundSize: '100px 100px',
                    }}
                />

                <div className="max-w-6xl mx-auto relative z-10">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16 booking-content"
                    >
                        {/* Section badge - boxed style */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="inline-block mb-8"
                        >
                            <span className="px-4 py-2 border border-cyan-400/50 rounded font-mono text-xs text-cyan-400 uppercase tracking-[0.3em]">
                                Schedule a Meeting
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
                            Get in Touch
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-base md:text-lg text-white/60 max-w-2xl mx-auto"
                        >
                            Ready to bring your project to life? Schedule a call to discuss your ideas.
                        </motion.p>
                    </motion.div>

                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="max-w-xl mx-auto mb-16 booking-content"
                    >
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {/* Success Message */}
                            {formStatus === 'success' && (
                                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-center">
                                    ✓ Message sent successfully! I'll get back to you soon.
                                </div>
                            )}

                            {/* Error Message */}
                            {formStatus === 'error' && (
                                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-center">
                                    Failed to send message. Please try again.
                                </div>
                            )}

                            {/* Name */}
                            <div className="group relative">
                                <label
                                    htmlFor="ai-name"
                                    className="mb-2 block font-mono text-xs uppercase tracking-wider text-text-muted"
                                >
                                    Name
                                </label>
                                <input
                                    type="text"
                                    id="ai-name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    disabled={formStatus === 'loading'}
                                    required
                                    className="w-full rounded-lg border border-white/10 bg-bg-surface px-4 py-3 text-white placeholder-text-muted transition-all duration-300 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                                    placeholder="Your name"
                                />
                            </div>

                            {/* Email */}
                            <div className="group relative">
                                <label
                                    htmlFor="ai-email"
                                    className="mb-2 block font-mono text-xs uppercase tracking-wider text-text-muted"
                                >
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="ai-email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    disabled={formStatus === 'loading'}
                                    required
                                    className="w-full rounded-lg border border-white/10 bg-bg-surface px-4 py-3 text-white placeholder-text-muted transition-all duration-300 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                                    placeholder="your@email.com"
                                />
                            </div>

                            {/* Message */}
                            <div className="group relative">
                                <label
                                    htmlFor="ai-message"
                                    className="mb-2 block font-mono text-xs uppercase tracking-wider text-text-muted"
                                >
                                    Message
                                </label>
                                <textarea
                                    id="ai-message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleInputChange}
                                    disabled={formStatus === 'loading'}
                                    required
                                    rows={5}
                                    className="w-full resize-none rounded-lg border border-white/10 bg-bg-surface px-4 py-3 text-white placeholder-text-muted transition-all duration-300 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                                    placeholder="Tell me about your project..."
                                />
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={formStatus === 'loading'}
                                className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-lg transition-all duration-300 hover:from-cyan-400 hover:to-blue-400 hover:shadow-lg hover:shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {formStatus === 'loading' ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    'Send Message'
                                )}
                            </button>
                        </form>

                        {/* Or divider */}
                        <div className="flex items-center gap-4 my-8">
                            <div className="flex-1 h-px bg-white/10"></div>
                            <span className="font-mono text-xs text-text-muted uppercase">Or schedule a call</span>
                            <div className="flex-1 h-px bg-white/10"></div>
                        </div>
                    </motion.div>


                    {/* Meeting Types */}
                    <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-12 booking-content">
                        {meetingTypes.map((meeting, i) => (
                            <motion.button
                                key={meeting.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                onClick={() => handleMeetingSelect(meeting.id)}
                                className={`relative p-6 rounded-2xl text-left transition-all duration-300
                         border backdrop-blur-sm group
                         ${selectedMeeting === meeting.id
                                        ? 'bg-primary/20 border-primary/50 shadow-lg shadow-primary/20'
                                        : 'bg-bg-surface/50 border-cyan-900/30 hover:border-primary/30'
                                    }`}
                            >
                                {/* Icon */}
                                <span className="text-4xl mb-4 block">{meeting.icon}</span>

                                {/* Name & Duration */}
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className={`font-display font-bold text-lg
                               ${selectedMeeting === meeting.id ? 'text-primary-light' : 'text-text-primary'}`}>
                                        {meeting.name}
                                    </h3>
                                    <span className={`px-2 py-1 rounded font-mono text-xs
                                 ${selectedMeeting === meeting.id
                                            ? 'bg-primary/30 text-primary-light'
                                            : 'bg-cyan-400/10 text-cyan-400'
                                        }`}>
                                        {meeting.duration}
                                    </span>
                                </div>

                                {/* Description */}
                                <p className="text-sm text-text-muted mb-4">
                                    {meeting.description}
                                </p>

                                {/* Select indicator */}
                                <div className={`flex items-center gap-2 font-mono text-xs
                              ${selectedMeeting === meeting.id ? 'text-primary-light' : 'text-cyan-400'}
                              group-hover:translate-x-1 transition-transform`}>
                                    <span>Select</span>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>

                                {/* Selected checkmark */}
                                {selectedMeeting === meeting.id && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute top-4 right-4 w-6 h-6 bg-primary rounded-full
                             flex items-center justify-center"
                                    >
                                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </motion.div>
                                )}

                                {/* Hover glow */}
                                <div
                                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 
                           transition-opacity pointer-events-none"
                                    style={{
                                        background: 'radial-gradient(ellipse at center, rgba(109, 100, 163, 0.1) 0%, transparent 70%)',
                                    }}
                                />
                            </motion.button>
                        ))}
                    </div>

                    {/* Calendar Embed / CTA */}
                    {showCalendar && selectedMeetingData ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="booking-content max-w-4xl mx-auto"
                        >
                            {/* Header */}
                            <div className="text-center mb-6">
                                <h3 className="font-display text-2xl font-bold text-white mb-2">
                                    <span className="text-2xl mr-2">{selectedMeetingData.icon}</span>
                                    Book Your {selectedMeetingData.name}
                                </h3>
                                <p className="text-white/60 text-sm">
                                    Select a time that works for you • Your timezone is auto-detected
                                </p>
                            </div>

                            {/* Cal.com Inline Embed */}
                            <CalEmbed
                                key={selectedMeetingData.calLink}
                                calLink={selectedMeetingData.calLink}
                                onBookingSuccess={() => {
                                    console.log('Booking successful!');
                                    // Could add a success toast here
                                }}
                            />

                            {/* Change selection button */}
                            <div className="mt-6 text-center">
                                <button
                                    onClick={() => {
                                        setShowCalendar(false);
                                        setSelectedMeeting(null);
                                    }}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg
                                               bg-white/5 border border-white/10 hover:border-cyan-400/30
                                               font-mono text-[10px] sm:text-xs text-white/60 hover:text-white
                                               transition-all duration-300"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    Choose a different meeting type
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center booking-content"
                        >
                            <p className="font-mono text-sm text-text-muted">
                                👆 Select a meeting type above to proceed with booking
                            </p>
                        </motion.div>
                    )}

                    {/* Alternative contact */}
                    <div className="mt-12 text-center booking-content">
                        <p className="text-text-muted mb-4">
                            Prefer email? Reach out directly at{' '}
                            <a href="mailto:srujan.hardik@gmail.com" className="text-cyan-400 hover:text-cyan-300">
                                srujan.hardik@gmail.com
                            </a>
                        </p>
                        <div className="flex items-center justify-center gap-4">
                            <a
                                href="https://linkedin.com/in/srujan"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-3 rounded-lg bg-bg-surface border border-cyan-900/30 
                         hover:border-cyan-400/30 transition-colors"
                            >
                                <svg className="w-5 h-5 text-text-secondary" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                </svg>
                            </a>
                            <a
                                href="https://twitter.com/srujan"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-3 rounded-lg bg-bg-surface border border-cyan-900/30 
                         hover:border-cyan-400/30 transition-colors"
                            >
                                <svg className="w-5 h-5 text-text-secondary" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                            </a>
                            <a
                                href="https://github.com/srujan"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-3 rounded-lg bg-bg-surface border border-cyan-900/30 
                         hover:border-cyan-400/30 transition-colors"
                            >
                                <svg className="w-5 h-5 text-text-secondary" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Payment Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 }}
                        className="mt-12 max-w-2xl mx-auto booking-content"
                    >
                        <a
                            href="/support"
                            className="group relative block overflow-hidden rounded-2xl border-2 border-cyan-500/30 bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5 p-8 backdrop-blur-sm transition-all duration-500 hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/20"
                        >
                            {/* Animated gradient background */}
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                            {/* Content */}
                            <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                                {/* Icon */}
                                <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <svg
                                        className="w-8 h-8 text-cyan-400 group-hover:animate-pulse"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.5}
                                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>

                                {/* Text Content */}
                                <div className="flex-1">
                                    <h4 className="font-display text-xl font-bold text-white mb-2">
                                        💳 Make a Payment
                                    </h4>
                                    <p className="text-sm text-text-secondary leading-relaxed">
                                        Complete your project payment or support my work. All transactions are secure and processed safely.
                                    </p>
                                </div>

                                {/* CTA Button */}
                                <div className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-sm transition-all duration-300 group-hover:shadow-lg group-hover:shadow-cyan-500/25 group-hover:scale-105">
                                    <span className="text-lg">$</span>
                                    Pay Now
                                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>

                            {/* Decorative corner accents */}
                            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-cyan-500/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-tr-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                        </a>
                    </motion.div>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-10 left-10 font-mono text-xs text-primary/20">
                    <p>{'// BOOKING MODULE'}</p>
                    <p>{'// CAL.COM INTEGRATION'}</p>
                </div>
            </section>
        );
    }
);

export default AppointmentBooking;
