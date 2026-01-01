'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { useIsMobile } from '@/hooks/useMediaQuery';

// Dynamic import for 3D component
const Scene = dynamic(() => import('@/components/three/Scene').then((m) => m.Scene), {
  ssr: false,
});
const ContactGlobe = dynamic(
  () => import('@/components/three/ContactGlobe').then((m) => m.ContactGlobe),
  { ssr: false }
);

export function Contact() {
  const sectionRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const isMobile = useIsMobile();
  const router = useRouter();
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Section animations
      gsap.from('.contact-header', {
        opacity: 0,
        y: 60,
        duration: 1,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      });

      gsap.from('.contact-form', {
        opacity: 0,
        x: -60,
        duration: 0.8,
        scrollTrigger: {
          trigger: '.contact-content',
          start: 'top 70%',
          toggleActions: 'play none none reverse',
        },
      });

      gsap.from('.contact-info', {
        opacity: 0,
        x: 60,
        duration: 0.8,
        delay: 0.2,
        scrollTrigger: {
          trigger: '.contact-content',
          start: 'top 70%',
          toggleActions: 'play none none reverse',
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Submit to Google Apps Script
      const response = await fetch(
        'https://script.google.com/macros/s/AKfycbxGqvenx1Ny55beJZJ9kr_tHKDwlMeSJTH0XgZjrZ53wrEL7-mO3Ll8z2DVAg0EzzRxPA/exec',
        {
          method: 'POST',
          mode: 'no-cors', // Required for Google Apps Script
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formState.name,
            email: formState.email,
            message: formState.message,
          }),
        }
      );

      // With no-cors mode, we can't read the response, so we assume success
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormState({ name: '', email: '', message: '' });

      // Reset success message after 5 seconds
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (error) {
      console.error('Form submission error:', error);
      setIsSubmitting(false);
      // Show error state briefly
      alert('Failed to send message. Please try again.');
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormState((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative overflow-hidden bg-bg-base py-16 sm:py-20 md:py-24 lg:py-32"
    >
      <div className="container-custom px-4 sm:px-6">
        {/* Section header */}
        <div className="contact-header mb-12 sm:mb-16 md:mb-20 text-center relative">
          {/* Blue Glow Effect */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-blue-600/20 blur-[120px] rounded-full -z-20 pointer-events-none mix-blend-screen" />

          <div className="inline-block bg-black/50 px-4 sm:px-6 py-2 border border-cyan-500/30 rounded-full backdrop-blur-md">
            <span className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-cyan-400">
              Get in Touch
            </span>
          </div>
          <h2 className="mt-4 sm:mt-5 md:mt-6 font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white tracking-tight px-2">
            LET'S CONNECT
          </h2>
          <p className="mx-auto mt-3 sm:mt-4 max-w-xl text-sm sm:text-base md:text-lg text-text-secondary px-4">
            Have a project in mind? Let's discuss how AI and robotics can solve your
            challenges.
          </p>
        </div>

        {/* Content grid */}
        <div className="contact-content grid gap-8 sm:gap-10 md:gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Form */}
          <div className="contact-form">
            {/* Photo/Video Box */}
            <div
              className="relative mb-6 sm:mb-8 aspect-square w-full max-w-sm mx-auto overflow-hidden rounded-xl sm:rounded-2xl border border-white/10 bg-bg-surface group cursor-pointer"
              onMouseEnter={(e) => {
                const video = e.currentTarget.querySelector('video');
                if (video) {
                  video.play();
                }
              }}
              onMouseLeave={(e) => {
                const video = e.currentTarget.querySelector('video');
                if (video) {
                  video.pause();
                  video.currentTime = 0;
                }
              }}
            >
              {/* Photo - visible by default */}
              <img
                src="/images/srujan-photo.png"
                alt="K Srujan"
                className="absolute inset-0 w-full h-full object-contain transition-opacity duration-500 group-hover:opacity-0"
              />

              {/* Video - plays on hover */}
              <video
                src="/videos/srujan-intro.mp4"
                className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                muted
                loop
                playsInline
              />

              {/* Glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </div>

            {/* Hire Me for Projects Card */}
            <Link
              href="/ai-assistant"
              className="relative z-20 group overflow-hidden rounded-xl sm:rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-4 sm:p-5 md:p-6 backdrop-blur-sm transition-all duration-500 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/10 block cursor-pointer mb-6 sm:mb-8 active:scale-[0.98]"
            >
              {/* Animated gradient background */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              {/* Content */}
              <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                {/* Animated Icon */}
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400 group-hover:animate-pulse"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>

                {/* Text Content */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-display text-base sm:text-lg font-semibold text-white mb-1">
                    Hire Me for Projects
                  </h4>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    Ready to collaborate? Chat with my AI assistant to discuss your project, get a rough estimate, or schedule a meeting.
                  </p>
                </div>

                {/* CTA Button Visual */}
                <div className="flex-shrink-0 inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium text-xs sm:text-sm transition-all duration-300 group-hover:shadow-lg group-hover:shadow-cyan-500/25 group-hover:scale-105">
                  <span className="text-base sm:text-lg">💬</span>
                  <span className="hidden xs:inline">Chat with AI</span>
                  <span className="xs:hidden">Chat</span>
                </div>
              </div>

              {/* Decorative corner accent */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-cyan-500/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </Link>

            <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
              {/* Name */}
              <div className="group relative">
                <label
                  htmlFor="name"
                  className="mb-1.5 sm:mb-2 block font-mono text-[10px] sm:text-xs uppercase tracking-wider text-text-muted"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formState.name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-white/10 bg-bg-surface px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white placeholder-text-muted transition-all duration-300 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Your name"
                />
              </div>

              {/* Email */}
              <div className="group relative">
                <label
                  htmlFor="email"
                  className="mb-1.5 sm:mb-2 block font-mono text-[10px] sm:text-xs uppercase tracking-wider text-text-muted"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formState.email}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-white/10 bg-bg-surface px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white placeholder-text-muted transition-all duration-300 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="your@email.com"
                />
              </div>

              {/* Message */}
              <div className="group relative">
                <label
                  htmlFor="message"
                  className="mb-1.5 sm:mb-2 block font-mono text-[10px] sm:text-xs uppercase tracking-wider text-text-muted"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formState.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full resize-none rounded-lg border border-white/10 bg-bg-surface px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white placeholder-text-muted transition-all duration-300 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Share your thoughts or feedback..."
                />
              </div>

              {/* Submit */}
              <MagneticButton
                type="submit"
                variant="primary"
                size="lg"
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="h-5 w-5 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Sending...
                  </span>
                ) : isSubmitted ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Message Sent!
                  </span>
                ) : (
                  'Send Message'
                )}
              </MagneticButton>
            </form>
          </div>

          {/* Info + 3D */}
          <div className="contact-info flex flex-col justify-between">
            {/* Contact info */}
            <div className="mb-8 sm:mb-10 md:mb-12 space-y-6 sm:space-y-8">
              {/* Availability */}
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-green-500" />
                </span>
                <span className="font-mono text-xs sm:text-sm text-text-secondary">
                  Available for new projects
                </span>
              </div>

              {/* Email */}
              <div>
                <h3 className="mb-1.5 sm:mb-2 font-mono text-[10px] sm:text-xs uppercase tracking-wider text-text-muted">
                  Email
                </h3>
                <a
                  href="mailto:srujan.hardik@gmail.com"
                  className="text-sm sm:text-base md:text-lg text-white transition-colors hover:text-primary break-all"
                >
                  srujan.hardik@gmail.com
                </a>
              </div>

              {/* Location */}
              <div>
                <h3 className="mb-1.5 sm:mb-2 font-mono text-[10px] sm:text-xs uppercase tracking-wider text-text-muted">
                  Location
                </h3>
                <p className="text-sm sm:text-base md:text-lg text-white">India</p>
              </div>

              {/* Social links */}
              <div>
                <h3 className="mb-3 sm:mb-4 font-mono text-[10px] sm:text-xs uppercase tracking-wider text-text-muted">
                  Connect
                </h3>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {/* GitHub */}
                  <a
                    href="https://github.com/srujan29112001"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full border border-white/10 bg-bg-surface transition-all duration-300 hover:border-primary hover:bg-primary/10 hover:scale-110 active:scale-95 group"
                    title="GitHub"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-text-secondary group-hover:text-primary transition-colors" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                  </a>

                  {/* Hugging Face */}
                  <a
                    href="https://huggingface.co/Srujan29"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full border border-white/10 bg-bg-surface transition-all duration-300 hover:border-yellow-400 hover:bg-yellow-400/10 hover:scale-110 active:scale-95 group"
                    title="Hugging Face"
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none">
                      {/* Face */}
                      <circle cx="12" cy="11" r="7" className="text-text-secondary group-hover:text-yellow-400 transition-colors" fill="currentColor" />
                      {/* Left hand */}
                      <ellipse cx="5.5" cy="14" rx="2.5" ry="2" className="text-text-secondary group-hover:text-yellow-500 transition-colors" fill="currentColor" />
                      {/* Right hand */}
                      <ellipse cx="18.5" cy="14" rx="2.5" ry="2" className="text-text-secondary group-hover:text-yellow-500 transition-colors" fill="currentColor" />
                      {/* Left eye */}
                      <ellipse cx="9.5" cy="10" rx="1" ry="1.2" fill="#1a1a2e" />
                      {/* Right eye */}
                      <ellipse cx="14.5" cy="10" rx="1" ry="1.2" fill="#1a1a2e" />
                      {/* Smile */}
                      <path d="M9 13.5C9.5 14.5 10.5 15 12 15C13.5 15 14.5 14.5 15 13.5" stroke="#1a1a2e" strokeWidth="1" strokeLinecap="round" fill="none" />
                      {/* Cheeks */}
                      <circle cx="8" cy="12.5" r="1" fill="#ff9999" opacity="0.6" />
                      <circle cx="16" cy="12.5" r="1" fill="#ff9999" opacity="0.6" />
                    </svg>
                  </a>

                  {/* Medium */}
                  <a
                    href="https://medium.com/@srujan.hardik"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full border border-white/10 bg-bg-surface transition-all duration-300 hover:border-white hover:bg-white/10 hover:scale-110 active:scale-95 group"
                    title="Medium"
                  >
                    <svg className="w-5 h-5 text-text-secondary group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
                    </svg>
                  </a>

                  {/* LinkedIn */}
                  <a
                    href="https://www.linkedin.com/in/k-srujan2/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full border border-white/10 bg-bg-surface transition-all duration-300 hover:border-blue-500 hover:bg-blue-500/10 hover:scale-110 active:scale-95 group"
                    title="LinkedIn"
                  >
                    <svg className="w-5 h-5 text-text-secondary group-hover:text-blue-500 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </a>

                  {/* Instagram */}
                  <a
                    href="https://www.instagram.com/srujan29_/?igshid=YTQwZjQ0NmI0OA%3D%3D#"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full border border-white/10 bg-bg-surface transition-all duration-300 hover:border-pink-500 hover:bg-pink-500/10 hover:scale-110 active:scale-95 group"
                    title="Instagram"
                  >
                    <svg className="w-5 h-5 text-text-secondary group-hover:text-pink-500 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>

                  {/* X (Twitter) */}
                  <a
                    href="https://x.com/srujan2911"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full border border-white/10 bg-bg-surface transition-all duration-300 hover:border-white hover:bg-white/10 hover:scale-110 active:scale-95 group"
                    title="X (Twitter)"
                  >
                    <svg className="w-5 h-5 text-text-secondary group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>

                  {/* Gmail */}
                  <a
                    href="mailto:srujan.hardik@gmail.com"
                    className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full border border-white/10 bg-bg-surface transition-all duration-300 hover:border-red-500 hover:bg-red-500/10 hover:scale-110 active:scale-95 group"
                    title="Gmail"
                  >
                    <svg className="w-5 h-5 text-text-secondary group-hover:text-red-500 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 010 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
                    </svg>
                  </a>

                  {/* Fiverr */}
                  <a
                    href="https://www.fiverr.com/s/7YZ8qaa"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full border border-white/10 bg-bg-surface transition-all duration-300 hover:border-[#1DBF73] hover:bg-[#1DBF73]/10 hover:scale-110 active:scale-95 group"
                    title="Fiverr"
                  >
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                      {/* Green circle background */}
                      <circle cx="12" cy="12" r="10" className="text-text-secondary group-hover:text-[#1DBF73] transition-colors" fill="currentColor" />
                      {/* fi text - stylized */}
                      <path d="M8 16V10.5C8 9.12 8.9 8 10.5 8H11V10H10.5C10.2 10 10 10.3 10 10.5V11H11.5V13H10V16H8ZM12.5 16V11H14.5V16H12.5ZM13.5 10C12.95 10 12.5 9.55 12.5 9C12.5 8.45 12.95 8 13.5 8C14.05 8 14.5 8.45 14.5 9C14.5 9.55 14.05 10 13.5 10Z" fill="white" />
                    </svg>
                  </a>

                  {/* DEV.to */}
                  <a
                    href="https://dev.to/k_srujan_9e8d040967e550f2"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full border border-white/10 bg-bg-surface transition-all duration-300 hover:border-white hover:bg-white/10 hover:scale-110 active:scale-95 group"
                    title="DEV.to"
                  >
                    <span className="text-xs font-bold text-text-secondary group-hover:text-white transition-colors tracking-tight">DEV</span>
                  </a>

                  {/* Phone */}
                  <a
                    href="tel:+919100725768"
                    className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full border border-white/10 bg-bg-surface transition-all duration-300 hover:border-green-400 hover:bg-green-400/10 hover:scale-110 active:scale-95 group"
                    title="Phone"
                  >
                    <svg className="w-5 h-5 text-text-secondary group-hover:text-green-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </a>

                  {/* Ko-fi */}
                  <a
                    href="https://ko-fi.com/srujan"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full border border-white/10 bg-bg-surface transition-all duration-300 hover:border-[#FF5E5B] hover:bg-[#FF5E5B]/10 hover:scale-110 active:scale-95 group"
                    title="Ko-fi"
                  >
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                      {/* Cup body */}
                      <path d="M5 8C5 7.44772 5.44772 7 6 7H15C15.5523 7 16 7.44772 16 8V13C16 15.7614 13.7614 18 11 18H10C7.23858 18 5 15.7614 5 13V8Z" className="text-text-secondary group-hover:text-white transition-colors" fill="currentColor" />
                      {/* Cup handle */}
                      <path d="M16 9H17.5C18.8807 9 20 10.1193 20 11.5C20 12.8807 18.8807 14 17.5 14H16" className="text-text-secondary group-hover:text-white transition-colors" stroke="currentColor" strokeWidth="2" fill="none" />
                      {/* Heart */}
                      <path d="M10.5 10C10.5 9.17157 9.82843 8.5 9 8.5C8.17157 8.5 7.5 9.17157 7.5 10C7.5 10.5 7.7 11 8.5 11.8L10.5 14L12.5 11.8C13.3 11 13.5 10.5 13.5 10C13.5 9.17157 12.8284 8.5 12 8.5C11.1716 8.5 10.5 9.17157 10.5 10Z" fill="#FF5E5B" />
                    </svg>
                  </a>

                  {/* Patreon */}
                  <a
                    href="https://patreon.com/Srujan923?utm_medium=unknown&utm_source=join_link&utm_campaign=creatorshare_creator&utm_content=copyLink"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full border border-white/10 bg-bg-surface transition-all duration-300 hover:border-white hover:bg-white/10 hover:scale-110 active:scale-95 group"
                    title="Patreon"
                  >
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                      {/* Outer circle */}
                      <circle cx="12" cy="12" r="10" className="text-text-secondary group-hover:text-white transition-colors" fill="currentColor" />
                      {/* P blob shape - organic curved shape */}
                      <path d="M8 18V6H9C9 6 10 6 11 6.5C12 7 13.5 7.5 14.5 9C15.5 10.5 15.5 12.5 14.5 14C13.5 15.5 11.5 16 10 16C9.5 16 9 16 9 16V18H8Z" fill="#030712" />
                    </svg>
                  </a>

                  {/* Reddit */}
                  <a
                    href="https://www.reddit.com/user/Careless_Bite3926/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full border border-white/10 bg-bg-surface transition-all duration-300 hover:border-orange-600 hover:bg-orange-600/10 hover:scale-110 active:scale-95 group"
                    title="Reddit"
                  >
                    <svg className="w-5 h-5 text-text-secondary group-hover:text-orange-600 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
                    </svg>
                  </a>

                  {/* YouTube */}
                  <a
                    href="https://www.youtube.com/@ksrujan68"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full border border-white/10 bg-bg-surface transition-all duration-300 hover:border-red-600 hover:bg-red-600/10 hover:scale-110 active:scale-95 group"
                    title="YouTube"
                  >
                    <svg className="w-5 h-5 text-text-secondary group-hover:text-red-600 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Support My Work Section - Entire card is clickable */}
              <div className="mt-6 sm:mt-8">
                <Link
                  href="/support"
                  className="relative z-20 group overflow-hidden rounded-xl sm:rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-4 sm:p-5 md:p-6 backdrop-blur-sm transition-all duration-500 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/10 block cursor-pointer active:scale-[0.98]"
                >
                  {/* Animated gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                  {/* Content */}
                  <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                    {/* Animated Icon */}
                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg
                        className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400 group-hover:animate-pulse"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                    </div>

                    {/* Text Content */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-display text-base sm:text-lg font-semibold text-white mb-1">
                        Fuel the Innovation
                      </h4>
                      <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                        If my work has added value to your projects or inspired new ideas, consider supporting continued research and development.
                        <span className="block mt-1 text-cyan-400/80">Clients can also complete their project payments here.</span>
                      </p>
                    </div>

                    {/* CTA Button Visual (not a real button, just styled) */}
                    <div className="flex-shrink-0 inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium text-xs sm:text-sm transition-all duration-300 group-hover:shadow-lg group-hover:shadow-cyan-500/25 group-hover:scale-105">
                      <span className="text-base sm:text-lg font-bold">$</span>
                      <span className="hidden xs:inline">Support My Work</span>
                      <span className="xs:hidden">Support</span>
                    </div>
                  </div>

                  {/* Decorative corner accent */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-cyan-500/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                </Link>
              </div>
            </div>

            {/* 3D Globe - Visible on all screen sizes */}
            <div className="relative h-[300px] sm:h-[350px] lg:h-[400px] xl:h-[450px] w-full overflow-hidden rounded-2xl border border-white/5 bg-bg-surface">
              <Scene cameraPosition={[0, 0, 5.5]}>
                <ContactGlobe />
              </Scene>
            </div>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div
        className="absolute right-0 top-1/4 h-[600px] w-[600px] rounded-full opacity-5 blur-3xl pointer-events-none"
        style={{ background: 'var(--gradient-primary)' }}
      />
    </section>
  );
}
