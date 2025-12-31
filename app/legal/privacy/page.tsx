'use client';

import Link from 'next/link';
import { ArrowLeft, Shield, Mail, Phone, MapPin } from 'lucide-react';

export default function PrivacyPolicyPage() {
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
                        Privacy Policy
                    </h1>
                    <p className="text-text-muted">
                        Last updated: December 28, 2024
                    </p>
                </div>

                <div className="prose prose-invert prose-cyan max-w-none space-y-8">
                    {/* Introduction */}
                    <section className="bg-bg-elevated rounded-2xl border border-white/10 p-6 md:p-8">
                        <h2 className="text-2xl font-bold text-white mb-4">Introduction</h2>
                        <p className="text-text-secondary leading-relaxed">
                            This Privacy Policy applies to your use of the website of Katta Srujan ("we", "our", "us")
                            hosted at this domain and any related services. We are committed to protecting your privacy
                            and ensuring the security of your personal information.
                        </p>
                        <p className="text-text-secondary leading-relaxed mt-4">
                            By using this website, you agree to the collection and use of information in accordance with
                            this policy. If you do not agree with this policy, please do not use our services.
                        </p>
                    </section>

                    {/* Information Collection */}
                    <section className="bg-bg-elevated rounded-2xl border border-white/10 p-6 md:p-8">
                        <h2 className="text-2xl font-bold text-white mb-4">Information We Collect</h2>
                        <div className="space-y-4 text-text-secondary">
                            <p className="leading-relaxed">
                                We collect information that you provide directly to us, including:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Name and email address when you contact us or make a payment</li>
                                <li>Payment information processed securely through Stripe or Razorpay</li>
                                <li>Messages and feedback you send through our contact forms</li>
                                <li>Any other information you choose to provide</li>
                            </ul>
                            <p className="leading-relaxed mt-4">
                                We also automatically collect certain information when you visit our website:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Browser type and version</li>
                                <li>IP address and location data</li>
                                <li>Pages visited and time spent on pages</li>
                                <li>Device information</li>
                            </ul>
                        </div>
                    </section>

                    {/* Use of Information */}
                    <section className="bg-bg-elevated rounded-2xl border border-white/10 p-6 md:p-8">
                        <h2 className="text-2xl font-bold text-white mb-4">How We Use Your Information</h2>
                        <div className="space-y-4 text-text-secondary">
                            <p className="leading-relaxed">We use the information we collect to:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Process payments and send transaction confirmations</li>
                                <li>Respond to your inquiries and provide customer support</li>
                                <li>Send you updates about projects and services (with your consent)</li>
                                <li>Improve our website and services</li>
                                <li>Detect and prevent fraud or abuse</li>
                                <li>Comply with legal obligations</li>
                            </ul>
                        </div>
                    </section>

                    {/* Payment Security */}
                    <section className="bg-bg-elevated rounded-2xl border border-white/10 p-6 md:p-8">
                        <h2 className="text-2xl font-bold text-white mb-4">Payment Security</h2>
                        <div className="space-y-4 text-text-secondary">
                            <p className="leading-relaxed">
                                All payment transactions are processed securely through our payment partners:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li><strong>Stripe</strong> - For international payments (USD, EUR, GBP, etc.)</li>
                                <li><strong>Razorpay</strong> - For Indian Rupee (INR) payments</li>
                            </ul>
                            <p className="leading-relaxed mt-4">
                                We do not store your credit card details on our servers. All payment information is
                                encrypted and processed directly by our payment partners who are PCI-DSS compliant.
                            </p>
                        </div>
                    </section>

                    {/* Data Sharing */}
                    <section className="bg-bg-elevated rounded-2xl border border-white/10 p-6 md:p-8">
                        <h2 className="text-2xl font-bold text-white mb-4">Information Sharing</h2>
                        <div className="space-y-4 text-text-secondary">
                            <p className="leading-relaxed">
                                We do not sell or rent your personal information to third parties. We may share
                                your information with:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Payment processors (Stripe, Razorpay) for transaction processing</li>
                                <li>Service providers who assist in operating our website</li>
                                <li>Legal authorities when required by law</li>
                            </ul>
                        </div>
                    </section>

                    {/* Cookies */}
                    <section className="bg-bg-elevated rounded-2xl border border-white/10 p-6 md:p-8">
                        <h2 className="text-2xl font-bold text-white mb-4">Cookies</h2>
                        <p className="text-text-secondary leading-relaxed">
                            We use cookies and similar tracking technologies to enhance your experience on our
                            website. You can set your browser to refuse cookies, but some features of our
                            website may not function properly without them.
                        </p>
                    </section>

                    {/* Your Rights */}
                    <section className="bg-bg-elevated rounded-2xl border border-white/10 p-6 md:p-8">
                        <h2 className="text-2xl font-bold text-white mb-4">Your Rights</h2>
                        <div className="space-y-4 text-text-secondary">
                            <p className="leading-relaxed">You have the right to:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Access and receive a copy of your personal data</li>
                                <li>Request correction of inaccurate data</li>
                                <li>Request deletion of your personal data</li>
                                <li>Withdraw consent for data processing</li>
                                <li>Lodge a complaint with a supervisory authority</li>
                            </ul>
                        </div>
                    </section>

                    {/* Contact */}
                    <section className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-2xl border border-cyan-500/20 p-6 md:p-8">
                        <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
                        <p className="text-text-secondary leading-relaxed mb-6">
                            If you have any questions about this Privacy Policy, please contact us:
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
                        <Link href="/legal/terms" className="hover:text-cyan-400 transition-colors">
                            Terms & Conditions
                        </Link>
                        <Link href="/legal/refund" className="hover:text-cyan-400 transition-colors">
                            Cancellation & Refunds
                        </Link>
                        <Link href="/legal/shipping" className="hover:text-cyan-400 transition-colors">
                            Shipping Policy
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
