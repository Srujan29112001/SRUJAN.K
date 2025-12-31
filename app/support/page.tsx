'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Heart, Coffee, Star, Rocket, Lock, X, CheckCircle, AlertCircle, ChevronDown, ExternalLink } from 'lucide-react';

type PaymentTier = 'coffee' | 'applause' | 'breakthrough';

interface VerifiedInvestor {
    name: string;
    amount: number;
    currency: string;
    paymentLink?: string;
}

interface TierCurrency {
    amount: number;
    paymentLink: string;
}

interface TierSettings {
    usd: TierCurrency;
    inr: TierCurrency;
}

interface AllTierSettings {
    coffee: TierSettings;
    applause: TierSettings;
}

// Default fallback values
const DEFAULT_SETTINGS: AllTierSettings = {
    coffee: { usd: { amount: 25, paymentLink: '' }, inr: { amount: 2000, paymentLink: '' } },
    applause: { usd: { amount: 100, paymentLink: '' }, inr: { amount: 8500, paymentLink: '' } },
};

// Google Form Web App URLs for logging
const GOOGLE_FORM_URLS = {
    coffee: 'https://script.google.com/macros/s/AKfycby7405lbgJSGJshqP7XGWhMmmDnlEZgKwJa0pgRQyxDt8eExEAIbFvrurbOl1aiyR-9-A/exec',
    applause: 'https://script.google.com/macros/s/AKfycbyfEzK-XWCLLO7WQnxB5Oo7pP-hrEUHJtHNVXAhEgr7NKcj1ZNRfK_CmZOqIO1y467q/exec',
    breakthrough: 'https://script.google.com/macros/s/AKfycbwGwL1I2S3J739K07a3ewDY45C-ctc2yPOaVPrpfgvQQI2ZWuzr2_a5wyJwahEbN3xT/exec',
};

export default function SupportPage() {
    const router = useRouter();
    const [selectedTier, setSelectedTier] = useState<PaymentTier>('applause');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        currency: 'usd',
        message: '',
    });
    const [isProcessing, setIsProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [paymentError, setPaymentError] = useState<string | null>(null);
    const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
    const [tierSettings, setTierSettings] = useState<AllTierSettings>(DEFAULT_SETTINGS);

    // Fetch tier settings on mount
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await fetch('/api/admin/settings');
                if (response.ok) {
                    const data = await response.json();
                    setTierSettings(data);
                }
            } catch (error) {
                console.error('Failed to fetch tier settings:', error);
            }
        };
        fetchSettings();
    }, []);

    // Determine which payment gateway to use based on currency
    const useRazorpay = formData.currency.toLowerCase() === 'inr';

    // Currency options (only USD and INR)
    const currencies = [
        { code: 'usd', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
        { code: 'inr', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
    ];

    const selectedCurrency = currencies.find(c => c.code === formData.currency) || currencies[0];

    // Load Razorpay script dynamically
    useEffect(() => {
        if (useRazorpay && typeof window !== 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            document.body.appendChild(script);
            return () => {
                if (document.body.contains(script)) {
                    document.body.removeChild(script);
                }
            };
        }
    }, [useRazorpay]);

    // Breakthrough verification state
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [verificationData, setVerificationData] = useState({ name: '', email: '' });
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationResult, setVerificationResult] = useState<{
        verified: boolean;
        investor?: VerifiedInvestor;
        message?: string;
    } | null>(null);
    const [breakthroughUnlocked, setBreakthroughUnlocked] = useState(false);
    const [unlockedInvestor, setUnlockedInvestor] = useState<VerifiedInvestor | null>(null);

    // Get fixed amount based on tier and currency
    const getAmount = () => {
        if (selectedTier === 'breakthrough' && unlockedInvestor) {
            return unlockedInvestor.amount;
        }
        const tier = tierSettings[selectedTier as 'coffee' | 'applause'];
        const currency = formData.currency as 'usd' | 'inr';
        return tier ? tier[currency].amount : 0;
    };

    // Get payment link based on tier and currency
    const getPaymentLink = () => {
        const tier = tierSettings[selectedTier as 'coffee' | 'applause'];
        const currency = formData.currency as 'usd' | 'inr';
        return tier ? tier[currency].paymentLink : '';
    };

    // Check if email is valid format
    const isValidEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const tiers = [
        {
            id: 'coffee' as PaymentTier,
            icon: Coffee,
            title: 'Buy Me a Coffee',
            description: 'A quick thank you for the work',
            locked: false,
        },
        {
            id: 'applause' as PaymentTier,
            icon: Star,
            title: 'Applause for a Project',
            description: 'For a project, post, research, or idea',
            subtitle: 'Feedback required',
            locked: false,
        },
        {
            id: 'breakthrough' as PaymentTier,
            icon: Rocket,
            title: 'Fund a Breakthrough or Pay for Hiring',
            description: 'Complete your project payment or invest in innovation',
            locked: !breakthroughUnlocked,
        },
    ];

    const handleTierSelect = (tierId: PaymentTier) => {
        const tier = tiers.find((t) => t.id === tierId);
        if (tier?.locked) {
            setShowVerificationModal(true);
            setVerificationResult(null);
        } else {
            setSelectedTier(tierId);
            if (tierId === 'breakthrough' && unlockedInvestor) {
                setFormData({
                    ...formData,
                    currency: unlockedInvestor.currency,
                });
            }
        }
    };

    const handleVerification = async () => {
        if (!verificationData.email.trim()) {
            setVerificationResult({ verified: false, message: 'Please enter your email address' });
            return;
        }

        setIsVerifying(true);

        try {
            const response = await fetch('/api/verify-investor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(verificationData),
            });

            const result = await response.json();

            if (result.verified && result.investor) {
                setVerificationResult({
                    verified: true,
                    investor: result.investor,
                });
                setBreakthroughUnlocked(true);
                setUnlockedInvestor(result.investor);

                // Auto-select breakthrough tier
                setTimeout(() => {
                    setShowVerificationModal(false);
                    setSelectedTier('breakthrough');
                    setFormData({
                        ...formData,
                        name: verificationData.name || result.investor.name,
                        email: verificationData.email,
                        currency: result.investor.currency,
                    });
                }, 2000);
            } else {
                setVerificationResult({
                    verified: false,
                    message: 'Email not found. Please verify your email or reach out to Srujan to collaborate before funding.',
                });
            }
        } catch {
            setVerificationResult({
                verified: false,
                message: 'Verification failed. Please try again.',
            });
        } finally {
            setIsVerifying(false);
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        // Message is required for Applause tier
        if (selectedTier === 'applause' && !formData.message.trim()) {
            newErrors.message = 'Please share your feedback for this tier';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Log supporter details to Google Form
    const logToGoogleForm = async () => {
        const formUrl = GOOGLE_FORM_URLS[selectedTier];
        const amount = getAmount();

        const data = {
            name: formData.name,
            email: formData.email,
            amount: amount,
            currency: formData.currency.toUpperCase(),
            message: formData.message || '',
            tier: selectedTier,
            timestamp: new Date().toISOString(),
            paymentMethod: useRazorpay ? 'Razorpay' : 'Skydo',
        };

        try {
            // Send to Google Form (fire and forget - don't block payment)
            fetch(formUrl, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
        } catch (error) {
            // Log error but don't block payment
            console.error('Failed to log to Google Form:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsProcessing(true);
        setPaymentError(null);

        // Log to Google Form first
        await logToGoogleForm();

        try {
            if (useRazorpay) {
                // Use Razorpay for INR
                await handleRazorpayPayment();
            } else {
                // Use Skydo for USD - redirect to external link
                handleSkydoPayment();
            }
        } catch (error) {
            console.error('Payment error:', error);
            setPaymentError(error instanceof Error ? error.message : 'Payment failed. Please try again.');
            setIsProcessing(false);
        }
    };

    const handleSkydoPayment = () => {
        // For USD, open payment link (Skydo or custom link from settings)
        let link: string;

        if (selectedTier === 'breakthrough' && unlockedInvestor?.paymentLink) {
            // Use custom link for verified breakthrough clients
            link = unlockedInvestor.paymentLink;
        } else {
            // Use link from tier settings
            link = getPaymentLink();
        }

        // Store session data for success tracking
        sessionStorage.setItem('supportTier', selectedTier);
        sessionStorage.setItem('supportName', formData.name);
        sessionStorage.setItem('supportAmount', getAmount().toString());
        sessionStorage.setItem('supportCurrency', formData.currency.toUpperCase());

        // Open payment link in new tab
        window.open(link, '_blank');
        setIsProcessing(false);
    };

    const handleRazorpayPayment = async () => {
        const amount = getAmount();

        // Create Razorpay order
        const response = await fetch('/api/payment/razorpay/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: amount.toString(),
                tier: selectedTier,
                customerEmail: formData.email,
                customerName: formData.name,
                message: formData.message,
            }),
        });

        const orderData = await response.json();

        if (!response.ok) {
            throw new Error(orderData.error || 'Failed to create order');
        }

        // Open Razorpay checkout modal
        const options = {
            key: orderData.keyId,
            amount: orderData.amount,
            currency: orderData.currency,
            name: orderData.name,
            description: orderData.description,
            order_id: orderData.orderId,
            prefill: orderData.prefill,
            theme: {
                color: '#06b6d4', // cyan-500
            },
            handler: async function (response: {
                razorpay_payment_id: string;
                razorpay_order_id: string;
                razorpay_signature: string;
            }) {
                // Verify payment
                try {
                    const verifyResponse = await fetch('/api/payment/razorpay/verify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            tier: selectedTier,
                            customerName: formData.name,
                            customerEmail: formData.email,
                            amount: amount.toString(),
                            message: formData.message,
                        }),
                    });

                    const verifyData = await verifyResponse.json();

                    if (verifyData.verified) {
                        // Redirect to success page
                        router.push(
                            `/support/success?gateway=razorpay&tier=${selectedTier}&name=${encodeURIComponent(formData.name)}&amount=${amount}&currency=inr&payment_id=${response.razorpay_payment_id}`
                        );
                    } else {
                        throw new Error('Payment verification failed');
                    }
                } catch {
                    setPaymentError('Payment verification failed. Please contact support.');
                    setIsProcessing(false);
                }
            },
            modal: {
                ondismiss: function () {
                    setIsProcessing(false);
                },
            },
        };

        // @ts-expect-error - Razorpay is loaded dynamically
        const rzp = new window.Razorpay(options);
        rzp.open();
    };

    return (
        <div className="min-h-screen bg-bg-base relative overflow-hidden pb-48 sm:pb-8">
            {/* Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[400px] sm:w-[600px] md:w-[800px] h-[400px] sm:h-[600px] md:h-[800px] bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-transparent rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-[300px] sm:w-[450px] md:w-[600px] h-[300px] sm:h-[450px] md:h-[600px] bg-gradient-to-tr from-purple-500/10 via-indigo-500/5 to-transparent rounded-full blur-3xl" />
                <div
                    className="absolute inset-0 opacity-[0.02]"
                    style={{
                        backgroundImage: `repeating-linear-gradient(-45deg, transparent, transparent 40px, currentColor 40px, currentColor 41px)`,
                    }}
                />
            </div>

            <div className="relative z-10 container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-5xl">
                {/* Back link */}
                <Link
                    href="/#contact"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm text-white/80 hover:text-white hover:border-cyan-400/50 hover:bg-cyan-400/10 transition-all duration-300 mb-6 sm:mb-8"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="font-mono text-xs uppercase tracking-wider">
                        Portfolio
                    </span>
                </Link>

                {/* Header */}
                <div className="mb-10 sm:mb-14 md:mb-16">
                    {/* Title Section */}
                    <div className="text-center mb-8 sm:mb-10">
                        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-3 sm:mb-4 px-2">
                            Fuel the Innovation
                        </h1>
                        <p className="text-sm sm:text-base text-white/60 max-w-xl mx-auto px-4">
                            Your support enables continued research in AI, machine learning, and robotics.
                        </p>
                    </div>

                    {/* Description Cards */}
                    <div className="max-w-3xl mx-auto grid sm:grid-cols-2 gap-3 sm:gap-4">
                        <div className="bg-white/[0.02] rounded-lg sm:rounded-xl border border-white/[0.05] p-4 sm:p-5 md:p-6">
                            <div className="flex items-center gap-2 mb-2 sm:mb-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                                <span className="text-xs sm:text-sm text-cyan-400 font-medium">The Mission</span>
                            </div>
                            <p className="text-white/70 text-xs sm:text-sm leading-relaxed">
                                Behind every AI breakthrough lies countless hours of research and problem-solving.
                                Your support directly enables the continuation of this vital work.
                            </p>
                        </div>

                        <div className="bg-white/[0.02] rounded-lg sm:rounded-xl border border-white/[0.05] p-4 sm:p-5 md:p-6">
                            <div className="flex items-center gap-2 mb-2 sm:mb-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                                <span className="text-xs sm:text-sm text-cyan-400 font-medium">Your Impact</span>
                            </div>
                            <p className="text-white/70 text-xs sm:text-sm leading-relaxed">
                                Every contribution funds cloud computing, research tools, and exploration
                                of uncharted territories in machine learning and robotics.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tiers */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-8 sm:mb-10 md:mb-12">
                    {tiers.map((tier) => {
                        const Icon = tier.icon;
                        const isSelected = selectedTier === tier.id && !tier.locked;

                        return (
                            <button
                                key={tier.id}
                                onClick={() => handleTierSelect(tier.id)}
                                className={`relative p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border text-left transition-all duration-300 active:scale-95 ${isSelected
                                    ? 'border-cyan-500 bg-cyan-500/10'
                                    : tier.locked
                                        ? 'border-white/5 bg-bg-surface/50 opacity-70'
                                        : 'border-white/10 bg-bg-surface hover:border-white/30'
                                    }`}
                            >
                                {tier.locked && (
                                    <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                                        <Lock className="w-3 h-3 sm:w-4 sm:h-4 text-text-muted" />
                                    </div>
                                )}

                                <div
                                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4 ${isSelected
                                        ? 'bg-cyan-500/20 text-cyan-400'
                                        : tier.locked
                                            ? 'bg-white/5 text-text-muted'
                                            : 'bg-white/10 text-white'
                                        }`}
                                >
                                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                                </div>

                                <h3 className="font-display text-base sm:text-lg font-bold text-white mb-1 pr-6">
                                    {tier.title}
                                </h3>
                                <p className="text-xs sm:text-sm text-text-muted leading-relaxed">{tier.description}</p>

                                {tier.subtitle && (
                                    <p className="text-[10px] sm:text-xs text-cyan-400 mt-2">• {tier.subtitle}</p>
                                )}

                                {tier.locked && (
                                    <p className="text-[10px] sm:text-xs text-cyan-400 mt-2">• Verification required</p>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Main Form Section */}
                <div className="max-w-2xl mx-auto">
                    <div className="bg-bg-elevated rounded-xl sm:rounded-2xl border border-white/10 p-4 sm:p-6 md:p-8">
                        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
                            {/* Currency & Amount Display */}
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-text-muted mb-2">
                                    Amount
                                </label>
                                <div className="flex gap-2 sm:gap-3">
                                    {/* Currency Dropdown */}
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
                                            disabled={selectedTier === 'breakthrough'}
                                            className="flex items-center gap-1.5 sm:gap-2 h-10 sm:h-12 px-3 sm:px-4 rounded-lg sm:rounded-xl border border-white/10 bg-bg-surface text-white hover:border-white/20 transition-colors disabled:opacity-50 active:scale-95"
                                        >
                                            <span className="text-sm sm:text-base">{selectedCurrency.flag}</span>
                                            <span className="font-medium text-xs sm:text-sm">{selectedCurrency.code.toUpperCase()}</span>
                                            <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-text-muted" />
                                        </button>

                                        {currencyDropdownOpen && (
                                            <>
                                                <div
                                                    className="fixed inset-0 z-40"
                                                    onClick={() => setCurrencyDropdownOpen(false)}
                                                />
                                                <div className="absolute top-full left-0 mt-2 w-48 py-2 rounded-xl border border-white/10 bg-bg-elevated shadow-2xl z-50">
                                                    {currencies.map((currency) => (
                                                        <button
                                                            key={currency.code}
                                                            type="button"
                                                            onClick={() => {
                                                                setFormData({ ...formData, currency: currency.code });
                                                                setCurrencyDropdownOpen(false);
                                                            }}
                                                            className={`w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-white/5 transition-colors ${formData.currency === currency.code ? 'text-cyan-400' : 'text-white'
                                                                }`}
                                                        >
                                                            <span>{currency.flag}</span>
                                                            <span>{currency.code.toUpperCase()}</span>
                                                            <span className="text-text-muted text-sm">- {currency.name}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Fixed Amount Display */}
                                    <div className="flex-1 flex items-center gap-2 h-10 sm:h-12 px-3 sm:px-4 rounded-lg sm:rounded-xl border border-white/10 bg-bg-surface">
                                        <span className="text-text-muted text-sm sm:text-base">{selectedCurrency.symbol}</span>
                                        <span className="text-white font-bold text-base sm:text-lg">
                                            {getAmount().toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                {/* Payment Gateway Indicator */}
                                <p className="text-[10px] sm:text-xs text-text-muted mt-2 flex items-center gap-1">
                                    {useRazorpay ? (
                                        <>Payment via <span className="text-blue-400 font-medium">Razorpay</span></>
                                    ) : (
                                        <>Payment via <span className="text-amber-400 font-medium">Skydo</span> <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3" /></>
                                    )}
                                </p>
                            </div>

                            {/* Name */}
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-text-muted mb-2">
                                    Your Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Enter your name"
                                    className={`w-full h-10 sm:h-12 px-3 sm:px-4 text-sm sm:text-base rounded-lg sm:rounded-xl border bg-bg-surface text-white placeholder-text-muted transition-colors ${errors.name ? 'border-red-500' : 'border-white/10 focus:border-cyan-500'
                                        }`}
                                />
                                {errors.name && (
                                    <p className="text-[10px] sm:text-xs text-red-400 mt-1">{errors.name}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-text-muted mb-2">
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="your@email.com"
                                    className={`w-full h-10 sm:h-12 px-3 sm:px-4 text-sm sm:text-base rounded-lg sm:rounded-xl border bg-bg-surface text-white placeholder-text-muted transition-colors ${errors.email ? 'border-red-500' : 'border-white/10 focus:border-cyan-500'
                                        }`}
                                />
                                {errors.email && (
                                    <p className="text-[10px] sm:text-xs text-red-400 mt-1">{errors.email}</p>
                                )}
                            </div>

                            {/* Message */}
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-text-muted mb-2">
                                    Message {selectedTier === 'applause' ? '(Required)' : '(Optional)'}
                                </label>
                                <textarea
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    placeholder="Leave a note..."
                                    rows={3}
                                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl border bg-bg-surface text-white placeholder-text-muted resize-none transition-colors ${errors.message ? 'border-red-500' : 'border-white/10 focus:border-cyan-500'
                                        }`}
                                />
                                {errors.message && (
                                    <p className="text-[10px] sm:text-xs text-red-400 mt-1">{errors.message}</p>
                                )}
                            </div>

                            {/* Error Display */}
                            {paymentError && (
                                <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-red-500/10 border border-red-500/20">
                                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                    <p className="text-xs sm:text-sm text-red-300">{paymentError}</p>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isProcessing || (selectedTier === 'breakthrough' && !breakthroughUnlocked) || !formData.name.trim() || !isValidEmail(formData.email)}
                                className="w-full py-3 sm:py-4 rounded-lg sm:rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-base sm:text-lg transition-all hover:shadow-lg hover:shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95"
                            >
                                {isProcessing ? (
                                    <span className="text-sm sm:text-base">{useRazorpay ? 'Opening Razorpay...' : 'Opening Skydo...'}</span>
                                ) : (
                                    <>
                                        <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
                                        <span className="text-sm sm:text-base">
                                            Support with {selectedCurrency.symbol}{getAmount().toLocaleString()}
                                        </span>
                                    </>
                                )}
                            </button>

                            {/* Security & Legal Links */}
                            <div className="text-center space-y-2.5 sm:space-y-3">
                                <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-text-muted">
                                    <span>🔒</span>
                                    <span>Secure payment via</span>
                                    {useRazorpay ? (
                                        <span className="font-medium text-blue-400">Razorpay</span>
                                    ) : (
                                        <span className="font-medium text-amber-400">Skydo</span>
                                    )}
                                </div>

                                {/* Legal Links */}
                                <div className="flex flex-wrap justify-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-text-muted pt-2 border-t border-white/5">
                                    <Link href="/legal/privacy" className="hover:text-cyan-400 transition-colors active:text-cyan-300">
                                        Privacy
                                    </Link>
                                    <span className="text-white/20">•</span>
                                    <Link href="/legal/terms" className="hover:text-cyan-400 transition-colors active:text-cyan-300">
                                        Terms
                                    </Link>
                                    <span className="text-white/20">•</span>
                                    <Link href="/legal/refund" className="hover:text-cyan-400 transition-colors active:text-cyan-300">
                                        Refunds
                                    </Link>
                                    <span className="text-white/20">•</span>
                                    <Link href="/legal/shipping" className="hover:text-cyan-400 transition-colors active:text-cyan-300">
                                        Shipping
                                    </Link>
                                    <span className="text-white/20">•</span>
                                    <Link href="/legal/contact" className="hover:text-cyan-400 transition-colors active:text-cyan-300">
                                        Contact
                                    </Link>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Verification Modal */}
            {showVerificationModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-bg-elevated rounded-xl sm:rounded-2xl border border-white/10 p-5 sm:p-6 md:p-8 max-w-md w-full shadow-2xl">
                        <div className="flex justify-between items-start mb-5 sm:mb-6">
                            <div>
                                <h3 className="font-display text-lg sm:text-xl font-bold text-white mb-1">
                                    Verify Your Access
                                </h3>
                                <p className="text-xs sm:text-sm text-text-muted">
                                    This tier is reserved for verified partners and clients.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowVerificationModal(false)}
                                className="p-1 rounded-lg hover:bg-white/5 transition-colors active:scale-95"
                            >
                                <X className="w-4 h-4 sm:w-5 sm:h-5 text-text-muted" />
                            </button>
                        </div>

                        {verificationResult?.verified ? (
                            <div className="text-center py-6 sm:py-8">
                                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                    <CheckCircle className="w-7 h-7 sm:w-8 sm:h-8 text-green-400" />
                                </div>
                                <h4 className="font-display text-base sm:text-lg font-bold text-white mb-1.5 sm:mb-2">
                                    Verified!
                                </h4>
                                <p className="text-xs sm:text-sm text-text-muted">
                                    Welcome, {verificationResult.investor?.name}. Unlocking your tier...
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-3 sm:space-y-4 mb-5 sm:mb-6">
                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-text-muted mb-2">
                                            Your Name
                                        </label>
                                        <input
                                            type="text"
                                            value={verificationData.name}
                                            onChange={(e) => setVerificationData({ ...verificationData, name: e.target.value })}
                                            placeholder="Enter your name"
                                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl border border-white/10 bg-bg-surface text-white placeholder-text-muted focus:border-cyan-500 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-text-muted mb-2">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            value={verificationData.email}
                                            onChange={(e) => setVerificationData({ ...verificationData, email: e.target.value })}
                                            placeholder="your@email.com"
                                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl border border-white/10 bg-bg-surface text-white placeholder-text-muted focus:border-cyan-500 transition-all"
                                        />
                                    </div>
                                </div>

                                {verificationResult && !verificationResult.verified && (
                                    <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-red-500/10 border border-red-500/20 mb-5 sm:mb-6">
                                        <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                        <p className="text-xs sm:text-sm text-red-300">{verificationResult.message}</p>
                                    </div>
                                )}

                                <button
                                    onClick={handleVerification}
                                    disabled={isVerifying}
                                    className="w-full py-2.5 sm:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold transition-all hover:shadow-lg hover:shadow-cyan-500/25 disabled:opacity-50 active:scale-95"
                                >
                                    {isVerifying ? 'Verifying...' : 'Verify Access'}
                                </button>

                                <p className="text-center text-[10px] sm:text-xs text-text-muted mt-3 sm:mt-4">
                                    Not a verified partner? <Link href="/ai-assistant" className="text-cyan-400 hover:underline active:text-cyan-300">Contact Srujan</Link> to collaborate.
                                </p>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
