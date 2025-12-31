'use client';

import Link from 'next/link';
import { ArrowLeft, Shield, Mail, Phone, MapPin, RefreshCcw, XCircle, CheckCircle } from 'lucide-react';

export default function RefundPolicyPage() {
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
                        Cancellation & Refund Policy
                    </h1>
                    <p className="text-text-muted">
                        Last updated: December 28, 2024
                    </p>
                </div>

                <div className="prose prose-invert prose-cyan max-w-none space-y-8">
                    {/* Overview */}
                    <section className="bg-bg-elevated rounded-2xl border border-white/10 p-6 md:p-8">
                        <h2 className="text-2xl font-bold text-white mb-4">Overview</h2>
                        <p className="text-text-secondary leading-relaxed">
                            This Cancellation and Refund Policy outlines the terms under which refunds or cancellations
                            may be processed for payments made on this website. We strive to ensure a fair and
                            transparent process for all transactions.
                        </p>
                    </section>

                    {/* Support Contributions */}
                    <section className="bg-bg-elevated rounded-2xl border border-white/10 p-6 md:p-8">
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                            <RefreshCcw className="w-6 h-6 text-cyan-400" />
                            Support Contributions
                        </h2>
                        <div className="space-y-4 text-text-secondary">
                            <p className="leading-relaxed">
                                Contributions made through our support tiers ("Buy Me a Coffee", "Applause for a Project")
                                are considered voluntary donations to support ongoing AI and Robotics research and development.
                            </p>
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mt-4">
                                <p className="text-amber-300 font-medium">
                                    ⚠️ These contributions are generally non-refundable as they are voluntary support payments.
                                </p>
                            </div>
                            <p className="leading-relaxed mt-4">
                                However, refunds may be considered in the following cases:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Duplicate payment due to technical error</li>
                                <li>Unauthorized transaction (with proper documentation)</li>
                                <li>Payment amount significantly different from intended</li>
                            </ul>
                        </div>
                    </section>

                    {/* Hiring/Project Payments */}
                    <section className="bg-bg-elevated rounded-2xl border border-white/10 p-6 md:p-8">
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                            <CheckCircle className="w-6 h-6 text-green-400" />
                            Hiring & Project Payments
                        </h2>
                        <div className="space-y-4 text-text-secondary">
                            <p className="leading-relaxed">
                                For verified clients using the "Fund a Breakthrough" tier for project payments:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Refunds are subject to the terms agreed upon in the project contract</li>
                                <li>Partial refunds may be available based on work completed</li>
                                <li>Cancellation requests must be made within 24 hours of payment for full refund eligibility</li>
                                <li>Post-delivery refunds are not available unless work does not meet agreed specifications</li>
                            </ul>
                        </div>
                    </section>

                    {/* Cancellation Process */}
                    <section className="bg-bg-elevated rounded-2xl border border-white/10 p-6 md:p-8">
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                            <XCircle className="w-6 h-6 text-red-400" />
                            Cancellation Process
                        </h2>
                        <div className="space-y-4 text-text-secondary">
                            <p className="leading-relaxed">
                                To request a cancellation or refund:
                            </p>
                            <ol className="list-decimal list-inside space-y-3 ml-4">
                                <li>Contact us via email at <a href="mailto:srujan.hardik@gmail.com" className="text-cyan-400 hover:underline">srujan.hardik@gmail.com</a></li>
                                <li>Include your transaction ID/payment reference</li>
                                <li>Provide the date and amount of the transaction</li>
                                <li>Explain the reason for your refund request</li>
                            </ol>
                            <p className="leading-relaxed mt-4">
                                We will review your request and respond within <strong>5-7 business days</strong>.
                            </p>
                        </div>
                    </section>

                    {/* Refund Timeline */}
                    <section className="bg-bg-elevated rounded-2xl border border-white/10 p-6 md:p-8">
                        <h2 className="text-2xl font-bold text-white mb-4">Refund Timeline</h2>
                        <div className="space-y-4 text-text-secondary">
                            <p className="leading-relaxed">
                                Once a refund is approved:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li><strong>Stripe payments:</strong> 5-10 business days to reflect in your account</li>
                                <li><strong>Razorpay payments:</strong> 5-7 business days to reflect in your account</li>
                            </ul>
                            <p className="leading-relaxed mt-4 text-sm">
                                Note: The exact timeline depends on your bank or payment provider's processing time.
                            </p>
                        </div>
                    </section>

                    {/* Non-Refundable Cases */}
                    <section className="bg-bg-elevated rounded-2xl border border-white/10 p-6 md:p-8">
                        <h2 className="text-2xl font-bold text-white mb-4">Non-Refundable Scenarios</h2>
                        <div className="space-y-4 text-text-secondary">
                            <p className="leading-relaxed">
                                Refunds will NOT be processed in the following cases:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Change of mind after making a voluntary contribution</li>
                                <li>Request made more than 30 days after the transaction</li>
                                <li>Completed project work that meets agreed specifications</li>
                                <li>False or fraudulent refund claims</li>
                            </ul>
                        </div>
                    </section>

                    {/* Disputes */}
                    <section className="bg-bg-elevated rounded-2xl border border-white/10 p-6 md:p-8">
                        <h2 className="text-2xl font-bold text-white mb-4">Disputes</h2>
                        <p className="text-text-secondary leading-relaxed">
                            If you have a dispute regarding a transaction that cannot be resolved through our
                            standard refund process, please contact us directly. We are committed to resolving
                            disputes fairly and will work with you to find an appropriate solution. For unresolved
                            disputes, matters will be subject to the jurisdiction of courts in Hyderabad, Telangana, India.
                        </p>
                    </section>

                    {/* Contact */}
                    <section className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-2xl border border-cyan-500/20 p-6 md:p-8">
                        <h2 className="text-2xl font-bold text-white mb-4">Contact Us for Refunds</h2>
                        <p className="text-text-secondary leading-relaxed mb-6">
                            For any refund or cancellation inquiries, please reach out to us:
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
