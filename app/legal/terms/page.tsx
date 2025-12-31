'use client';

import Link from 'next/link';
import { ArrowLeft, Shield, Mail, Phone, MapPin } from 'lucide-react';

export default function TermsAndConditionsPage() {
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
                        Terms & Conditions
                    </h1>
                    <p className="text-text-muted">
                        Last updated: December 28, 2024
                    </p>
                </div>

                <div className="prose prose-invert prose-cyan max-w-none space-y-8">
                    {/* Introduction */}
                    <section className="bg-bg-elevated rounded-2xl border border-white/10 p-6 md:p-8">
                        <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
                        <p className="text-text-secondary leading-relaxed">
                            Welcome to the portfolio website of Katta Srujan ("we", "our", "us"). These Terms and
                            Conditions govern your use of our website and services, including any payments made
                            through our platform. By accessing or using our website, you agree to be bound by these terms.
                        </p>
                        <p className="text-text-secondary leading-relaxed mt-4">
                            If you do not agree with any part of these terms, please do not use our website or services.
                        </p>
                    </section>

                    {/* Services */}
                    <section className="bg-bg-elevated rounded-2xl border border-white/10 p-6 md:p-8">
                        <h2 className="text-2xl font-bold text-white mb-4">2. Services</h2>
                        <div className="space-y-4 text-text-secondary">
                            <p className="leading-relaxed">
                                This website showcases my portfolio as an AI & Robotics Engineer. Services offered include:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Portfolio showcase of AI, Robotics, and Research projects</li>
                                <li>AI-powered chat assistant for project inquiries</li>
                                <li>Support/donation platform for funding innovation</li>
                                <li>Hiring services for freelance projects (verification required)</li>
                            </ul>
                        </div>
                    </section>

                    {/* Payments */}
                    <section className="bg-bg-elevated rounded-2xl border border-white/10 p-6 md:p-8">
                        <h2 className="text-2xl font-bold text-white mb-4">3. Payments</h2>
                        <div className="space-y-4 text-text-secondary">
                            <p className="leading-relaxed">
                                Payments on this website are processed through secure third-party payment gateways:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li><strong>Stripe</strong> - For international currency payments</li>
                                <li><strong>Razorpay</strong> - For Indian Rupee (INR) payments</li>
                            </ul>
                            <p className="leading-relaxed mt-4">
                                By making a payment, you agree to the terms and privacy policies of the respective
                                payment processor. All transactions are final unless otherwise specified in our
                                Cancellation & Refunds Policy.
                            </p>
                        </div>
                    </section>

                    {/* User Obligations */}
                    <section className="bg-bg-elevated rounded-2xl border border-white/10 p-6 md:p-8">
                        <h2 className="text-2xl font-bold text-white mb-4">4. User Obligations</h2>
                        <div className="space-y-4 text-text-secondary">
                            <p className="leading-relaxed">By using this website, you agree to:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Provide accurate and truthful information</li>
                                <li>Not use the website for any unlawful purposes</li>
                                <li>Not attempt to gain unauthorized access to any part of the website</li>
                                <li>Not interfere with the proper functioning of the website</li>
                                <li>Not use automated systems to access the website without permission</li>
                            </ul>
                        </div>
                    </section>

                    {/* Intellectual Property */}
                    <section className="bg-bg-elevated rounded-2xl border border-white/10 p-6 md:p-8">
                        <h2 className="text-2xl font-bold text-white mb-4">5. Intellectual Property</h2>
                        <div className="space-y-4 text-text-secondary">
                            <p className="leading-relaxed">
                                All content on this website, including but not limited to text, graphics, logos,
                                images, videos, and software, is the property of Katta Srujan and is protected
                                by intellectual property laws.
                            </p>
                            <p className="leading-relaxed">
                                You may not reproduce, distribute, modify, or create derivative works without
                                explicit written permission.
                            </p>
                        </div>
                    </section>

                    {/* Support Tiers */}
                    <section className="bg-bg-elevated rounded-2xl border border-white/10 p-6 md:p-8">
                        <h2 className="text-2xl font-bold text-white mb-4">6. Support Tiers</h2>
                        <div className="space-y-4 text-text-secondary">
                            <p className="leading-relaxed">
                                We offer three support tiers for contributions:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li><strong>Buy Me a Coffee</strong> - A small token of appreciation</li>
                                <li><strong>Applause for a Project</strong> - Support with feedback for specific work</li>
                                <li><strong>Fund a Breakthrough</strong> - For verified partners and clients (requires verification)</li>
                            </ul>
                            <p className="leading-relaxed mt-4">
                                Contributions are voluntary and support ongoing research and development in AI
                                and Robotics. All contributions are final unless covered by our refund policy.
                            </p>
                        </div>
                    </section>

                    {/* Limitation of Liability */}
                    <section className="bg-bg-elevated rounded-2xl border border-white/10 p-6 md:p-8">
                        <h2 className="text-2xl font-bold text-white mb-4">7. Limitation of Liability</h2>
                        <div className="space-y-4 text-text-secondary">
                            <p className="leading-relaxed">
                                To the maximum extent permitted by law, we shall not be liable for any indirect,
                                incidental, special, consequential, or punitive damages arising from your use
                                of this website or services.
                            </p>
                            <p className="leading-relaxed">
                                The website and its contents are provided "as is" without warranties of any kind,
                                either express or implied.
                            </p>
                        </div>
                    </section>

                    {/* Governing Law */}
                    <section className="bg-bg-elevated rounded-2xl border border-white/10 p-6 md:p-8">
                        <h2 className="text-2xl font-bold text-white mb-4">8. Governing Law</h2>
                        <p className="text-text-secondary leading-relaxed">
                            These Terms and Conditions are governed by and construed in accordance with the laws
                            of India. Any disputes arising from these terms shall be subject to the exclusive
                            jurisdiction of the courts in Hyderabad, Telangana, India.
                        </p>
                    </section>

                    {/* Changes to Terms */}
                    <section className="bg-bg-elevated rounded-2xl border border-white/10 p-6 md:p-8">
                        <h2 className="text-2xl font-bold text-white mb-4">9. Changes to Terms</h2>
                        <p className="text-text-secondary leading-relaxed">
                            We reserve the right to modify these Terms and Conditions at any time. Changes will
                            be effective immediately upon posting on this page. Your continued use of the website
                            after any changes constitutes acceptance of the new terms.
                        </p>
                    </section>

                    {/* Contact */}
                    <section className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-2xl border border-cyan-500/20 p-6 md:p-8">
                        <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
                        <p className="text-text-secondary leading-relaxed mb-6">
                            If you have any questions about these Terms and Conditions, please contact us:
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
