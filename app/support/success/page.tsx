'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, ArrowRight, Coffee, Star, Rocket, Mail, Sparkles } from 'lucide-react';
import { getCurrencyByCode } from '@/data/currencies';

type PaymentTier = 'coffee' | 'applause' | 'breakthrough';

// Tier-specific content configurations
const tierContent: Record<PaymentTier, {
    icon: typeof Coffee;
    title: string;
    subtitle: string;
    message: string;
    color: string;
    benefits: string[];
}> = {
    coffee: {
        icon: Coffee,
        title: "Thanks for the Coffee!",
        subtitle: "Quick sip, lasting impact",
        message: "Your support fuels the late-night coding sessions and keeps the innovation brewing. Every coffee counts!",
        color: "from-amber-400 to-orange-500",
        benefits: [
            "You'll receive a confirmation email shortly",
            "Your support helps fund ongoing research",
            "Stay connected for project updates",
        ],
    },
    applause: {
        icon: Star,
        title: "Your Applause Means Everything!",
        subtitle: "Feedback received with gratitude",
        message: "Thank you for taking the time to share your thoughts. Your feedback helps shape better projects and drives meaningful innovation.",
        color: "from-cyan-400 to-blue-500",
        benefits: [
            "Your feedback has been recorded",
            "You'll receive updates on related projects",
            "Your input directly influences future work",
        ],
    },
    breakthrough: {
        icon: Rocket,
        title: "Welcome to the Inner Circle!",
        subtitle: "Breakthrough Partner",
        message: "You've joined an exclusive group of visionaries. As a breakthrough funder, you'll have direct access to cutting-edge developments and collaboration opportunities.",
        color: "from-purple-400 to-pink-500",
        benefits: [
            "Priority access to new research and projects",
            "Direct communication channel established",
            "Exclusive updates and early previews",
            "Collaboration opportunities on future work",
        ],
    },
};

function SuccessPageContent() {
    const searchParams = useSearchParams();
    const [supporterName, setSupporterName] = useState('');
    const [supportAmount, setSupportAmount] = useState('');
    const [supportCurrency, setSupportCurrency] = useState('usd');
    const [supportTier, setSupportTier] = useState<PaymentTier>('applause');
    const [paymentGateway, setPaymentGateway] = useState<'stripe' | 'razorpay' | null>(null);
    const [showContent, setShowContent] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const currency = getCurrencyByCode(supportCurrency);
    const content = tierContent[supportTier];
    const TierIcon = content.icon;

    useEffect(() => {
        // First, try to get from URL query params (from real payment callbacks)
        const urlName = searchParams.get('name');
        const urlAmount = searchParams.get('amount');
        const urlCurrency = searchParams.get('currency');
        const urlTier = searchParams.get('tier') as PaymentTier | null;
        const urlGateway = searchParams.get('gateway') as 'stripe' | 'razorpay' | null;

        // Fall back to session storage (for testing or legacy flow)
        const name = urlName || sessionStorage.getItem('supporterName') || 'Friend';
        const amount = urlAmount || sessionStorage.getItem('supportAmount') || '10';
        const currencyCode = urlCurrency || sessionStorage.getItem('supportCurrency') || 'usd';
        const tierValue = urlTier || (sessionStorage.getItem('supportTier') as PaymentTier) || 'applause';
        const email = sessionStorage.getItem('supporterEmail') || '';
        const message = sessionStorage.getItem('supporterMessage') || '';

        setSupporterName(decodeURIComponent(name));
        setSupportAmount(amount);
        setSupportCurrency(currencyCode);
        setSupportTier(tierValue);
        if (urlGateway) setPaymentGateway(urlGateway);

        // Send thank you email (only if we have email from session)
        if (email && !emailSent) {
            fetch('/api/send-thank-you', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipientEmail: email,
                    recipientName: name,
                    tier: tierValue,
                    amount,
                    currency: currencyCode,
                    message,
                    gateway: urlGateway || 'stripe',
                }),
            }).then(() => setEmailSent(true)).catch(console.error);
        }

        // Clear session data
        sessionStorage.removeItem('supporterName');
        sessionStorage.removeItem('supportAmount');
        sessionStorage.removeItem('supportCurrency');
        sessionStorage.removeItem('supportTier');
        sessionStorage.removeItem('supporterEmail');
        sessionStorage.removeItem('supporterMessage');

        setTimeout(() => setShowContent(true), 100);
    }, [searchParams, emailSent]);

    return (
        <div className="min-h-screen bg-bg-base relative overflow-hidden flex items-center justify-center">
            {/* Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className={`absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-gradient-to-br ${content.color} opacity-10 rounded-full blur-3xl`} />
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-blue-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl" />
            </div>

            <div
                className={`relative z-10 text-center max-w-2xl px-6 transition-all duration-1000 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                    }`}
            >
                {/* Success icon */}
                <div className="relative inline-block mb-8">
                    <div className={`absolute inset-0 bg-gradient-to-br ${content.color} opacity-20 rounded-full blur-2xl`} />
                    <div className={`relative w-20 h-20 rounded-full bg-gradient-to-br ${content.color} flex items-center justify-center`}>
                        <CheckCircle className="w-10 h-10 text-white" />
                    </div>
                    {supportTier === 'breakthrough' && (
                        <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-pulse" />
                    )}
                </div>

                {/* Tier badge */}
                <div className="flex items-center justify-center gap-2 mb-4">
                    <TierIcon className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm text-cyan-400 font-medium">{content.subtitle}</span>
                </div>

                {/* Title */}
                <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">
                    {content.title}
                </h1>

                <p className="text-lg text-white/60 mb-6">
                    Thank you, {supporterName.split(' ')[0]}!
                </p>

                {/* Amount */}
                <div className={`inline-block px-6 py-3 rounded-xl bg-gradient-to-r ${content.color} mb-8`}>
                    <span className="text-2xl font-bold text-white">
                        {currency?.symbol}{supportAmount}
                    </span>
                </div>

                {/* Message */}
                <p className="text-white/70 mb-8 max-w-lg mx-auto">
                    {content.message}
                </p>

                {/* Benefits */}
                <div className="bg-white/[0.02] rounded-xl border border-white/[0.05] p-6 mb-8 text-left">
                    <h3 className="text-sm text-cyan-400 font-medium mb-4 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        What happens next
                    </h3>
                    <ul className="space-y-3">
                        {content.benefits.map((benefit, index) => (
                            <li key={index} className="flex items-start gap-3 text-sm text-white/70">
                                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                                {benefit}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Return link */}
                <Link
                    href="/"
                    className={`inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r ${content.color} text-white font-bold transition-all duration-300 hover:shadow-lg hover:scale-105 group`}
                >
                    Return to Portfolio
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
        </div>
    );
}

export default function SuccessPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-bg-base flex items-center justify-center text-white">Loading...</div>}>
            <SuccessPageContent />
        </Suspense>
    );
}
