'use client';

import Link from 'next/link';
import { ArrowLeft, Shield, Mail, Phone, MapPin, Package, Globe, Clock } from 'lucide-react';

export default function ShippingPolicyPage() {
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
                <div className="mb-12">
                    <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
                        Shipping & Delivery Policy
                    </h1>
                    <p className="text-text-muted">
                        Last updated: December 28, 2024
                    </p>
                </div>

                <div className="prose prose-invert prose-cyan max-w-none space-y-8">
                    {/* Nature of Services */}
                    <section className="bg-bg-elevated rounded-2xl border border-white/10 p-6 md:p-8">
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                            <Globe className="w-6 h-6 text-cyan-400" />
                            Nature of Services
                        </h2>
                        <div className="space-y-4 text-text-secondary">
                            <p className="leading-relaxed">
                                This website primarily offers <strong>digital services and support contributions</strong>.
                                As such, no physical shipping of goods is required for most transactions.
                            </p>
                            <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4 mt-4">
                                <p className="text-cyan-300 font-medium">
                                    📧 All deliverables are provided digitally via email or through secure download links.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Digital Deliverables */}
                    <section className="bg-bg-elevated rounded-2xl border border-white/10 p-6 md:p-8">
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                            <Package className="w-6 h-6 text-purple-400" />
                            Digital Deliverables
                        </h2>
                        <div className="space-y-4 text-text-secondary">
                            <p className="leading-relaxed">
                                For project-based work (verified clients using "Fund a Breakthrough" tier),
                                deliverables may include:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Source code and software packages</li>
                                <li>Technical documentation and reports</li>
                                <li>AI/ML models and trained weights</li>
                                <li>Design files and prototypes</li>
                                <li>Research papers and analysis documents</li>
                            </ul>
                        </div>
                    </section>

                    {/* Delivery Timeline */}
                    <section className="bg-bg-elevated rounded-2xl border border-white/10 p-6 md:p-8">
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                            <Clock className="w-6 h-6 text-amber-400" />
                            Delivery Timeline
                        </h2>
                        <div className="space-y-4 text-text-secondary">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="bg-bg-surface rounded-xl p-4 border border-white/5">
                                    <h3 className="font-semibold text-white mb-2">Support Contributions</h3>
                                    <p className="text-sm">
                                        Thank you email and confirmation sent <strong>immediately</strong> after
                                        successful payment.
                                    </p>
                                </div>
                                <div className="bg-bg-surface rounded-xl p-4 border border-white/5">
                                    <h3 className="font-semibold text-white mb-2">Project Deliverables</h3>
                                    <p className="text-sm">
                                        As per the timeline agreed in the project contract.
                                        Typically <strong>1-4 weeks</strong> depending on scope.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Delivery Method */}
                    <section className="bg-bg-elevated rounded-2xl border border-white/10 p-6 md:p-8">
                        <h2 className="text-2xl font-bold text-white mb-4">Delivery Method</h2>
                        <div className="space-y-4 text-text-secondary">
                            <p className="leading-relaxed">
                                Digital deliverables are provided through:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li><strong>Email:</strong> Documents, reports, and small files</li>
                                <li><strong>Cloud Storage:</strong> Google Drive, Dropbox, or similar for larger files</li>
                                <li><strong>GitHub:</strong> For source code and version-controlled projects</li>
                                <li><strong>Secure Transfer:</strong> For sensitive or proprietary materials</li>
                            </ul>
                        </div>
                    </section>

                    {/* Physical Shipping (if applicable) */}
                    <section className="bg-bg-elevated rounded-2xl border border-white/10 p-6 md:p-8">
                        <h2 className="text-2xl font-bold text-white mb-4">Physical Shipping (Special Cases)</h2>
                        <div className="space-y-4 text-text-secondary">
                            <p className="leading-relaxed">
                                In rare cases where physical delivery is required (e.g., hardware prototypes,
                                robotics components), the following applies:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Shipping costs will be communicated and agreed upon before order confirmation</li>
                                <li>Domestic shipping (India): 3-7 business days</li>
                                <li>International shipping: 7-21 business days (depending on destination)</li>
                                <li>Tracking information will be provided once shipped</li>
                            </ul>
                            <p className="leading-relaxed mt-4 text-sm">
                                Note: Custom duties and import taxes for international orders are the
                                responsibility of the recipient.
                            </p>
                        </div>
                    </section>

                    {/* Issues & Support */}
                    <section className="bg-bg-elevated rounded-2xl border border-white/10 p-6 md:p-8">
                        <h2 className="text-2xl font-bold text-white mb-4">Delivery Issues</h2>
                        <div className="space-y-4 text-text-secondary">
                            <p className="leading-relaxed">
                                If you encounter any issues with delivery:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Check your spam/junk folder for digital deliveries</li>
                                <li>Ensure the email address provided is correct</li>
                                <li>Contact us within 48 hours if you haven't received your deliverable</li>
                            </ul>
                            <p className="leading-relaxed mt-4">
                                We will resend or provide alternative delivery methods at no additional cost.
                            </p>
                        </div>
                    </section>

                    {/* Contact */}
                    <section className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-2xl border border-cyan-500/20 p-6 md:p-8">
                        <h2 className="text-2xl font-bold text-white mb-4">Contact Us for Delivery Inquiries</h2>
                        <p className="text-text-secondary leading-relaxed mb-6">
                            For any questions regarding shipping or delivery:
                        </p>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-text-secondary">
                                <Mail className="w-5 h-5 text-cyan-400" />
                                <a href="mailto:srujan.hardik@gmail.com" className="hover:text-cyan-400 transition-colors">
                                    srujan.hardik@gmail.com
                                </a>
                            </div>
                            <div className="flex items-center gap-3 text-text-secondary">
                                <Phone className="w-5 h-5 text-cyan-400" />
                                <span>+91 9100725768</span>
                            </div>
                            <div className="flex items-center gap-3 text-text-secondary">
                                <MapPin className="w-5 h-5 text-cyan-400" />
                                <span>Hyderabad, Telangana, India</span>
                            </div>
                        </div>
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
                        <Link href="/legal/contact" className="hover:text-cyan-400 transition-colors">
                            Contact Us
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
