'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Save,
    LogOut,
    Settings,
    Coffee,
    Star,
    DollarSign,
    AlertCircle,
    CheckCircle,
    Bot
} from 'lucide-react';

interface TierCurrency {
    amount: number;
    paymentLink: string;
}

interface TierSettings {
    usd: TierCurrency;
    inr: TierCurrency;
}

interface AllSettings {
    coffee: TierSettings;
    applause: TierSettings;
}

export default function AdminSettingsPage() {
    const router = useRouter();
    const [settings, setSettings] = useState<AllSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        checkAuthAndLoadSettings();
    }, []);

    const checkAuthAndLoadSettings = async () => {
        try {
            // Load tier settings
            const settingsResponse = await fetch('/api/admin/settings');
            if (settingsResponse.ok) {
                const data = await settingsResponse.json();
                setSettings(data);
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        await fetch('/api/admin/auth', { method: 'DELETE' });
        router.push('/admin');
    };

    const handleSave = async () => {
        if (!settings) return;

        setIsSaving(true);
        setMessage(null);

        try {
            const response = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            });

            if (response.ok) {
                setMessage({ type: 'success', text: 'Settings saved successfully!' });
                setTimeout(() => setMessage(null), 3000);
            } else {
                setMessage({ type: 'error', text: 'Failed to save settings' });
            }
        } catch {
            setMessage({ type: 'error', text: 'Failed to save settings' });
        } finally {
            setIsSaving(false);
        }
    };


    const updateTierSetting = (
        tier: 'coffee' | 'applause',
        currency: 'usd' | 'inr',
        field: 'amount' | 'paymentLink',
        value: string | number
    ) => {
        if (!settings) return;

        setSettings({
            ...settings,
            [tier]: {
                ...settings[tier],
                [currency]: {
                    ...settings[tier][currency],
                    [field]: field === 'amount' ? Number(value) : value
                }
            }
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-bg-base flex items-center justify-center">
                <div className="text-text-muted">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg-base">
            {/* Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-transparent rounded-full blur-3xl" />
            </div>

            {/* Header */}
            <header className="sticky top-0 z-40 backdrop-blur-xl bg-bg-base/80 border-b border-white/10">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin/clients"
                            className="flex items-center gap-2 text-text-muted hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex items-center gap-2">
                            <Settings className="w-5 h-5 text-purple-400" />
                            <h1 className="font-display text-lg font-bold text-white">
                                Tier Settings
                            </h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/admin/clients"
                            className="text-sm text-text-muted hover:text-white transition-colors"
                        >
                            Clients
                        </Link>
                        <Link
                            href="/admin/resume"
                            className="text-sm text-text-muted hover:text-white transition-colors"
                        >
                            Resume
                        </Link>
                        <Link
                            href="/admin/ai-providers"
                            className="text-sm text-text-muted hover:text-white transition-colors"
                        >
                            AI Providers
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-text-muted hover:text-white transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 max-w-4xl mx-auto px-6 py-8">
                {/* Message Toast */}
                {message && (
                    <div className={`fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg ${message.type === 'success'
                        ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                        : 'bg-red-500/20 border border-red-500/30 text-red-400'
                        }`}>
                        {message.type === 'success' ? (
                            <CheckCircle className="w-5 h-5" />
                        ) : (
                            <AlertCircle className="w-5 h-5" />
                        )}
                        <span className="text-sm font-medium">{message.text}</span>
                    </div>
                )}

                {/* Description */}
                <p className="text-text-muted mb-8">
                    Configure pricing and payment links for Coffee and Applause tiers. Changes take effect immediately.
                </p>

                {/* AI key management moved — pointer card */}
                <div className="bg-bg-elevated rounded-2xl border border-white/10 p-6 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                            <Bot className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="flex-1">
                            <h2 className="font-display text-lg font-bold text-white">AI Configuration has moved</h2>
                            <p className="text-sm text-text-muted">
                                The AI Chat now runs on each visitor&apos;s own API key (the 🔑 panel in the chat).
                                Your keys power only the Resume Engine — manage them in{' '}
                                <Link href="/admin/ai-providers" className="text-cyan-400 hover:underline">AI Providers</Link>.
                            </p>
                        </div>
                        <Link
                            href="/admin/ai-providers"
                            className="flex-shrink-0 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-bold hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                        >
                            Open AI Providers →
                        </Link>
                    </div>
                </div>

                {settings && (
                    <div className="space-y-8">
                        {/* Coffee Tier */}
                        <div className="bg-bg-elevated rounded-2xl border border-white/10 p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                                    <Coffee className="w-5 h-5 text-amber-400" />
                                </div>
                                <div>
                                    <h2 className="font-display text-lg font-bold text-white">
                                        ☕ Buy Me a Coffee
                                    </h2>
                                    <p className="text-sm text-text-muted">Basic support tier</p>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                {/* USD */}
                                <div className="space-y-4 p-4 rounded-xl bg-bg-surface border border-white/5">
                                    <div className="flex items-center gap-2 text-green-400">
                                        <span className="text-lg">🇺🇸</span>
                                        <span className="font-medium">USD (Skydo)</span>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-text-muted mb-1">Amount ($)</label>
                                        <input
                                            type="number"
                                            value={settings.coffee.usd.amount}
                                            onChange={(e) => updateTierSetting('coffee', 'usd', 'amount', e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg border border-white/10 bg-bg-base text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-text-muted mb-1">Skydo Payment Link *</label>
                                        <input
                                            type="url"
                                            value={settings.coffee.usd.paymentLink}
                                            onChange={(e) => updateTierSetting('coffee', 'usd', 'paymentLink', e.target.value)}
                                            placeholder="https://dashboard.skydo.com/pay/..."
                                            className="w-full px-3 py-2 rounded-lg border border-white/10 bg-bg-base text-white text-sm"
                                        />
                                    </div>
                                </div>

                                {/* INR */}
                                <div className="space-y-4 p-4 rounded-xl bg-bg-surface border border-white/5">
                                    <div className="flex items-center gap-2 text-blue-400">
                                        <span className="text-lg">🇮🇳</span>
                                        <span className="font-medium">INR (Razorpay)</span>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-text-muted mb-1">Amount (₹)</label>
                                        <input
                                            type="number"
                                            value={settings.coffee.inr.amount}
                                            onChange={(e) => updateTierSetting('coffee', 'inr', 'amount', e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg border border-white/10 bg-bg-base text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-text-muted mb-1">Razorpay Payment Link *</label>
                                        <input
                                            type="url"
                                            value={settings.coffee.inr.paymentLink}
                                            onChange={(e) => updateTierSetting('coffee', 'inr', 'paymentLink', e.target.value)}
                                            placeholder="https://razorpay.com/payment-link/..."
                                            className="w-full px-3 py-2 rounded-lg border border-white/10 bg-bg-base text-white text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Applause Tier */}
                        <div className="bg-bg-elevated rounded-2xl border border-white/10 p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                                    <Star className="w-5 h-5 text-yellow-400" />
                                </div>
                                <div>
                                    <h2 className="font-display text-lg font-bold text-white">
                                        ⭐ Project Applause
                                    </h2>
                                    <p className="text-sm text-text-muted">Support a specific project</p>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                {/* USD */}
                                <div className="space-y-4 p-4 rounded-xl bg-bg-surface border border-white/5">
                                    <div className="flex items-center gap-2 text-green-400">
                                        <span className="text-lg">🇺🇸</span>
                                        <span className="font-medium">USD (Skydo)</span>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-text-muted mb-1">Amount ($)</label>
                                        <input
                                            type="number"
                                            value={settings.applause.usd.amount}
                                            onChange={(e) => updateTierSetting('applause', 'usd', 'amount', e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg border border-white/10 bg-bg-base text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-text-muted mb-1">Skydo Payment Link *</label>
                                        <input
                                            type="url"
                                            value={settings.applause.usd.paymentLink}
                                            onChange={(e) => updateTierSetting('applause', 'usd', 'paymentLink', e.target.value)}
                                            placeholder="https://dashboard.skydo.com/pay/..."
                                            className="w-full px-3 py-2 rounded-lg border border-white/10 bg-bg-base text-white text-sm"
                                        />
                                    </div>
                                </div>

                                {/* INR */}
                                <div className="space-y-4 p-4 rounded-xl bg-bg-surface border border-white/5">
                                    <div className="flex items-center gap-2 text-blue-400">
                                        <span className="text-lg">🇮🇳</span>
                                        <span className="font-medium">INR (Razorpay)</span>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-text-muted mb-1">Amount (₹)</label>
                                        <input
                                            type="number"
                                            value={settings.applause.inr.amount}
                                            onChange={(e) => updateTierSetting('applause', 'inr', 'amount', e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg border border-white/10 bg-bg-base text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-text-muted mb-1">Razorpay Payment Link *</label>
                                        <input
                                            type="url"
                                            value={settings.applause.inr.paymentLink}
                                            onChange={(e) => updateTierSetting('applause', 'inr', 'paymentLink', e.target.value)}
                                            placeholder="https://razorpay.com/payment-link/..."
                                            className="w-full px-3 py-2 rounded-lg border border-white/10 bg-bg-base text-white text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-end">
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold transition-all hover:shadow-lg hover:shadow-purple-500/25 disabled:opacity-50"
                            >
                                <Save className="w-5 h-5" />
                                {isSaving ? 'Saving...' : 'Save Settings'}
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
