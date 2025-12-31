'use client';

import Link from 'next/link';
import { ArrowLeft, Shield, Mail, Phone, MapPin, MessageCircle, Clock, Linkedin, Github, Send } from 'lucide-react';

export default function ContactUsPage() {
    return (
        <div className="min-h-screen bg-bg-base">
            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-xl bg-bg-base/80 border-b border-white/10">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-text-muted hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Back to Home</span>
                    </Link>
                    <div className="flex items-center gap-2 text-cyan-400">
                        <Shield className="w-5 h-5" />
                        <span className="font-medium">Legal</span>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-6 py-12">
                <div className="mb-12 text-center">
                    <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
                        Contact Us
                    </h1>
                    <p className="text-text-muted max-w-2xl mx-auto">
                        Have questions, feedback, or need support? We're here to help.
                        Reach out through any of the channels below.
                    </p>
                </div>

                <div className="space-y-8">
                    {/* Contact Info Card */}
                    <section className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-2xl border border-cyan-500/20 p-8">
                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Primary Contact */}
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-6">Get in Touch</h2>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-4 p-4 bg-bg-surface/50 rounded-xl backdrop-blur">
                                        <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                                            <Mail className="w-6 h-6 text-cyan-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white">Email</h3>
                                            <a
                                                href="mailto:srujan.hardik@gmail.com"
                                                className="text-cyan-400 hover:underline"
                                            >
                                                srujan.hardik@gmail.com
                                            </a>
                                            <p className="text-sm text-text-muted mt-1">
                                                For inquiries, support, and collaborations
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4 p-4 bg-bg-surface/50 rounded-xl backdrop-blur">
                                        <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                            <Phone className="w-6 h-6 text-green-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white">Phone</h3>
                                            <p className="text-text-secondary">+91 9100725768</p>
                                            <p className="text-sm text-text-muted mt-1">
                                                Available Mon-Sat, 10 AM - 7 PM IST
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4 p-4 bg-bg-surface/50 rounded-xl backdrop-blur">
                                        <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                                            <MapPin className="w-6 h-6 text-purple-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white">Location</h3>
                                            <p className="text-text-secondary">Hyderabad, Telangana</p>
                                            <p className="text-text-secondary">India - 500081</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Owner Details */}
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-6">Owner Information</h2>
                                <div className="bg-bg-surface/50 rounded-xl p-6 backdrop-blur">
                                    <div className="text-center mb-6">
                                        <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-3xl font-bold text-white mb-4">
                                            KS
                                        </div>
                                        <h3 className="text-xl font-bold text-white">Katta Srujan</h3>
                                        <p className="text-cyan-400">AI & Robotics Engineer</p>
                                    </div>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between py-2 border-b border-white/5">
                                            <span className="text-text-muted">Full Name</span>
                                            <span className="text-text-secondary">KATTA SRUJAN</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b border-white/5">
                                            <span className="text-text-muted">Email</span>
                                            <span className="text-text-secondary">srujan.hardik@gmail.com</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b border-white/5">
                                            <span className="text-text-muted">Phone</span>
                                            <span className="text-text-secondary">+91 9100725768</span>
                                        </div>
                                        <div className="flex justify-between py-2">
                                            <span className="text-text-muted">Country</span>
                                            <span className="text-text-secondary">India</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Response Time */}
                    <section className="bg-bg-elevated rounded-2xl border border-white/10 p-6 md:p-8">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                                <Clock className="w-6 h-6 text-amber-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white mb-2">Response Time</h2>
                                <p className="text-text-secondary">
                                    We typically respond to all inquiries within <strong>24-48 hours</strong> during
                                    business days. For urgent matters, please mention "URGENT" in your email subject line.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Social Links */}
                    <section className="bg-bg-elevated rounded-2xl border border-white/10 p-6 md:p-8">
                        <h2 className="text-xl font-bold text-white mb-6 text-center">Connect on Social Media</h2>
                        <div className="flex flex-wrap justify-center gap-4">
                            <a
                                href="https://linkedin.com/in/srujan-katta"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-6 py-3 bg-[#0077B5]/20 hover:bg-[#0077B5]/30 border border-[#0077B5]/30 rounded-xl text-[#0077B5] transition-all hover:scale-105"
                            >
                                <Linkedin className="w-5 h-5" />
                                <span>LinkedIn</span>
                            </a>
                            <a
                                href="https://github.com/srujan29112001"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white transition-all hover:scale-105"
                            >
                                <Github className="w-5 h-5" />
                                <span>GitHub</span>
                            </a>
                            <a
                                href="https://t.me/srujankatta"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-6 py-3 bg-[#0088CC]/20 hover:bg-[#0088CC]/30 border border-[#0088CC]/30 rounded-xl text-[#0088CC] transition-all hover:scale-105"
                            >
                                <Send className="w-5 h-5" />
                                <span>Telegram</span>
                            </a>
                        </div>
                    </section>

                    {/* Grievance Redressal */}
                    <section className="bg-bg-elevated rounded-2xl border border-white/10 p-6 md:p-8">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                                <MessageCircle className="w-6 h-6 text-red-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white mb-2">Grievance Redressal</h2>
                                <p className="text-text-secondary mb-4">
                                    If you have any complaints or grievances regarding our services, payments, or
                                    any other matter, please contact our Grievance Officer:
                                </p>
                                <div className="bg-bg-surface rounded-xl p-4 space-y-2 text-sm">
                                    <p><strong className="text-white">Name:</strong> <span className="text-text-secondary">Katta Srujan</span></p>
                                    <p><strong className="text-white">Email:</strong> <a href="mailto:srujan.hardik@gmail.com" className="text-cyan-400 hover:underline">srujan.hardik@gmail.com</a></p>
                                    <p><strong className="text-white">Phone:</strong> <span className="text-text-secondary">+91 9100725768</span></p>
                                    <p><strong className="text-white">Address:</strong> <span className="text-text-secondary">Hyderabad, Telangana, India - 500081</span></p>
                                </div>
                                <p className="text-sm text-text-muted mt-4">
                                    Grievances will be acknowledged within 24 hours and resolved within 7 business days.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Quick Actions */}
                    <section className="grid md:grid-cols-2 gap-4">
                        <Link
                            href="/support"
                            className="group bg-gradient-to-br from-cyan-500/10 to-blue-500/10 hover:from-cyan-500/20 hover:to-blue-500/20 rounded-2xl border border-cyan-500/20 p-6 transition-all"
                        >
                            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                                Support My Work →
                            </h3>
                            <p className="text-sm text-text-muted">
                                Make a contribution to support AI & Robotics research
                            </p>
                        </Link>
                        <Link
                            href="/#contact"
                            className="group bg-gradient-to-br from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 rounded-2xl border border-purple-500/20 p-6 transition-all"
                        >
                            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                                View Full Portfolio →
                            </h3>
                            <p className="text-sm text-text-muted">
                                Explore projects, skills, and connect on the main portfolio
                            </p>
                        </Link>
                    </section>
                </div>

                {/* Footer Links */}
                <div className="mt-12 pt-8 border-t border-white/10">
                    <div className="flex flex-wrap gap-6 justify-center text-sm text-text-muted">
                        <Link href="/legal/privacy" className="hover:text-cyan-400 transition-colors">
                            Privacy Policy
                        </Link>
                        <Link href="/legal/terms" className="hover:text-cyan-400 transition-colors">
                            Terms & Conditions
                        </Link>
                        <Link href="/legal/refund" className="hover:text-cyan-400 transition-colors">
                            Cancellation & Refunds
                        </Link>
                        <Link href="/legal/shipping" className="hover:text-cyan-400 transition-colors">
                            Shipping Policy
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
