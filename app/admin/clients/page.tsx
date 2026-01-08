'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Plus,
    Trash2,
    LogOut,
    Users,
    DollarSign,
    ExternalLink,
    X,
    AlertCircle,
    CheckCircle,
    Settings,
    MessageSquare
} from 'lucide-react';

interface Client {
    id: string;
    email: string;
    name: string;
    amount: number;
    currency: string;
    paymentLink: string;
    createdAt: string;
}

export default function AdminClientsPage() {
    const router = useRouter();
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [formData, setFormData] = useState({
        email: '',
        name: '',
        amount: '',
        currency: 'usd',
        paymentLink: '',
    });

    // Check authentication and load clients
    useEffect(() => {
        checkAuthAndLoadClients();
    }, []);

    const checkAuthAndLoadClients = async () => {
        try {
            const clientsResponse = await fetch('/api/admin/clients');
            if (clientsResponse.ok) {
                const data = await clientsResponse.json();
                setClients(data.clients || []);
            }
        } catch (error) {
            console.error('Failed to load clients:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        await fetch('/api/admin/auth', { method: 'DELETE' });
        router.push('/admin');
    };

    const handleAddClient = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsAdding(true);
        setMessage(null);

        try {
            const response = await fetch('/api/admin/clients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setClients([...clients, data.client]);
                setShowAddModal(false);
                setFormData({ email: '', name: '', amount: '', currency: 'usd', paymentLink: '' });
                setMessage({ type: 'success', text: 'Client added successfully!' });
                setTimeout(() => setMessage(null), 3000);
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to add client' });
            }
        } catch {
            setMessage({ type: 'error', text: 'Failed to add client' });
        } finally {
            setIsAdding(false);
        }
    };

    const handleDeleteClient = async (id: string) => {
        try {
            const response = await fetch(`/api/admin/clients?id=${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setClients(clients.filter(c => c.id !== id));
                setMessage({ type: 'success', text: 'Client removed successfully!' });
                setTimeout(() => setMessage(null), 3000);
            } else {
                setMessage({ type: 'error', text: 'Failed to remove client' });
            }
        } catch {
            setMessage({ type: 'error', text: 'Failed to remove client' });
        } finally {
            setDeleteId(null);
        }
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
                <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-transparent rounded-full blur-3xl" />
            </div>

            {/* Header */}
            <header className="sticky top-0 z-40 backdrop-blur-xl bg-bg-base/80 border-b border-white/10">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/"
                            className="flex items-center gap-2 text-text-muted hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-cyan-400" />
                            <h1 className="font-display text-lg font-bold text-white">
                                Client Management
                            </h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/admin/chat-history"
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-text-muted hover:text-white transition-colors"
                        >
                            <MessageSquare className="w-4 h-4" />
                            <span className="text-sm">Chat History</span>
                        </Link>
                        <Link
                            href="/admin/settings"
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-text-muted hover:text-white transition-colors"
                        >
                            <Settings className="w-4 h-4" />
                            <span className="text-sm">Settings</span>
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-text-muted hover:text-white transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="text-sm">Logout</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 max-w-6xl mx-auto px-6 py-8">
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

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-bg-elevated rounded-xl border border-white/10 p-4">
                        <p className="text-xs text-text-muted mb-1">Total Clients</p>
                        <p className="text-2xl font-bold text-white">{clients.length}</p>
                    </div>
                    <div className="bg-bg-elevated rounded-xl border border-white/10 p-4">
                        <p className="text-xs text-text-muted mb-1">USD Clients</p>
                        <p className="text-2xl font-bold text-green-400">
                            {clients.filter(c => c.currency === 'usd').length}
                        </p>
                    </div>
                    <div className="bg-bg-elevated rounded-xl border border-white/10 p-4">
                        <p className="text-xs text-text-muted mb-1">INR Clients</p>
                        <p className="text-2xl font-bold text-blue-400">
                            {clients.filter(c => c.currency === 'inr').length}
                        </p>
                    </div>
                    <div className="bg-bg-elevated rounded-xl border border-white/10 p-4">
                        <p className="text-xs text-text-muted mb-1">Total Value</p>
                        <p className="text-2xl font-bold text-cyan-400">
                            ${clients.filter(c => c.currency === 'usd').reduce((sum, c) => sum + c.amount, 0).toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* Add Client Button */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="font-display text-xl font-bold text-white">
                        Verified Clients
                    </h2>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium text-sm transition-all hover:shadow-lg hover:shadow-cyan-500/25"
                    >
                        <Plus className="w-4 h-4" />
                        Add Client
                    </button>
                </div>

                {/* Clients Table */}
                <div className="bg-bg-elevated rounded-2xl border border-white/10 overflow-hidden">
                    {clients.length === 0 ? (
                        <div className="text-center py-12">
                            <Users className="w-12 h-12 text-text-muted mx-auto mb-4" />
                            <p className="text-text-muted">No clients yet</p>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="mt-4 text-cyan-400 hover:underline text-sm"
                            >
                                Add your first client
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="text-left text-xs font-medium text-text-muted px-6 py-4">Email</th>
                                        <th className="text-left text-xs font-medium text-text-muted px-6 py-4">Name</th>
                                        <th className="text-left text-xs font-medium text-text-muted px-6 py-4">Amount</th>
                                        <th className="text-left text-xs font-medium text-text-muted px-6 py-4">Payment</th>
                                        <th className="text-right text-xs font-medium text-text-muted px-6 py-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {clients.map((client) => (
                                        <tr key={client.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                                            <td className="px-6 py-4">
                                                <span className="text-white text-sm">{client.email}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-text-secondary text-sm">{client.name}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-sm font-medium ${client.currency === 'usd' ? 'text-green-400' : 'text-blue-400'
                                                    }`}>
                                                    {client.currency === 'usd' ? '$' : '₹'}
                                                    {client.amount.toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {client.paymentLink ? (
                                                    <a
                                                        href={client.paymentLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={`inline-flex items-center gap-1 text-xs hover:underline ${client.paymentLink.includes('skydo') ? 'text-amber-400' : 'text-blue-400'
                                                            }`}
                                                    >
                                                        {client.paymentLink.includes('skydo') ? 'Skydo' : 'Razorpay'} <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                ) : (
                                                    <span className="text-xs text-blue-400">Razorpay (auto)</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => setDeleteId(client.id)}
                                                    className="p-2 rounded-lg hover:bg-red-500/10 text-text-muted hover:text-red-400 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>

            {/* Add Client Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-bg-elevated rounded-2xl border border-white/10 p-6 md:p-8 max-w-md w-full shadow-2xl">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="font-display text-xl font-bold text-white mb-1">
                                    Add New Client
                                </h3>
                                <p className="text-sm text-text-muted">
                                    Add a verified client for breakthrough tier
                                </p>
                            </div>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="p-1 rounded-lg hover:bg-white/5 transition-colors"
                            >
                                <X className="w-5 h-5 text-text-muted" />
                            </button>
                        </div>

                        <form onSubmit={handleAddClient} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-2">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="client@email.com"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-bg-surface text-white placeholder-text-muted focus:border-cyan-500 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-2">
                                    Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Client name"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-bg-surface text-white placeholder-text-muted focus:border-cyan-500 transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-muted mb-2">
                                        Amount *
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        placeholder="1000"
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-white/10 bg-bg-surface text-white placeholder-text-muted focus:border-cyan-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-muted mb-2">
                                        Currency *
                                    </label>
                                    <select
                                        value={formData.currency}
                                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-white/10 bg-bg-surface text-white focus:border-cyan-500 transition-all"
                                    >
                                        <option value="usd">USD ($)</option>
                                        <option value="inr">INR (₹)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-2">
                                    Payment Link *
                                    <span className="text-text-muted font-normal ml-1">(Skydo or Razorpay)</span>
                                </label>
                                <input
                                    type="url"
                                    value={formData.paymentLink}
                                    onChange={(e) => setFormData({ ...formData, paymentLink: e.target.value })}
                                    placeholder="https://dashboard.skydo.com/pay/... or Razorpay link"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-bg-surface text-white placeholder-text-muted focus:border-cyan-500 transition-all"
                                />
                                <p className="text-xs text-text-muted mt-1">
                                    Paste the Skydo or Razorpay payment link for this client
                                </p>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 py-3 rounded-xl border border-white/10 text-text-muted font-medium hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isAdding}
                                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold transition-all hover:shadow-lg hover:shadow-cyan-500/25 disabled:opacity-50"
                                >
                                    {isAdding ? 'Adding...' : 'Add Client'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-bg-elevated rounded-2xl border border-white/10 p-6 max-w-sm w-full shadow-2xl">
                        <div className="text-center">
                            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-6 h-6 text-red-400" />
                            </div>
                            <h3 className="font-display text-lg font-bold text-white mb-2">
                                Remove Client?
                            </h3>
                            <p className="text-sm text-text-muted mb-6">
                                This will remove the client from verified list. They won't be able to access the breakthrough tier.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteId(null)}
                                    className="flex-1 py-2.5 rounded-xl border border-white/10 text-text-muted font-medium hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDeleteClient(deleteId)}
                                    className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
