'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    MessageSquare,
    LogOut,
    Trash2,
    ChevronDown,
    ChevronUp,
    Clock,
    User,
    Globe,
    X,
    RefreshCw,
    Search,
    Users
} from 'lucide-react';

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    source?: string;
}

interface ChatSession {
    id: string;
    startedAt: string;
    lastMessageAt: string;
    userAgent?: string;
    ipAddress?: string;
    messageCount: number;
    preview?: string;
    messages?: ChatMessage[];
}

export default function AdminChatHistoryPage() {
    const router = useRouter();
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedSession, setExpandedSession] = useState<string | null>(null);
    const [sessionDetails, setSessionDetails] = useState<Record<string, ChatSession>>({});
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        loadSessions();
    }, [page]);

    const loadSessions = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/admin/chat-history?page=${page}&limit=20`);
            if (response.status === 401) {
                router.push('/admin');
                return;
            }
            if (response.ok) {
                const data = await response.json();
                setSessions(data.sessions || []);
                setTotalPages(data.totalPages || 1);
                setTotal(data.total || 0);
            }
        } catch (error) {
            console.error('Failed to load chat history:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadSessionDetails = async (sessionId: string) => {
        if (sessionDetails[sessionId]) {
            return; // Already loaded
        }

        try {
            const response = await fetch(`/api/admin/chat-history?sessionId=${sessionId}`);
            if (response.ok) {
                const data = await response.json();
                setSessionDetails(prev => ({
                    ...prev,
                    [sessionId]: data.session
                }));
            }
        } catch (error) {
            console.error('Failed to load session details:', error);
        }
    };

    const handleExpand = async (sessionId: string) => {
        if (expandedSession === sessionId) {
            setExpandedSession(null);
        } else {
            setExpandedSession(sessionId);
            await loadSessionDetails(sessionId);
        }
    };

    const handleDelete = async (sessionId: string) => {
        try {
            const response = await fetch(`/api/admin/chat-history?sessionId=${sessionId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                setSessions(sessions.filter(s => s.id !== sessionId));
                setMessage({ type: 'success', text: 'Session deleted successfully' });
                setTimeout(() => setMessage(null), 3000);
            } else {
                setMessage({ type: 'error', text: 'Failed to delete session' });
            }
        } catch {
            setMessage({ type: 'error', text: 'Failed to delete session' });
        } finally {
            setDeleteConfirm(null);
        }
    };

    const handleLogout = async () => {
        await fetch('/api/admin/auth', { method: 'DELETE' });
        router.push('/admin');
    };

    const filteredSessions = sessions.filter(session =>
        session.preview?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.ipAddress?.includes(searchQuery) ||
        session.id.includes(searchQuery)
    );

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getDeviceFromUserAgent = (ua?: string) => {
        if (!ua) return 'Unknown';
        if (ua.includes('Mobile')) return '📱 Mobile';
        if (ua.includes('Tablet')) return '📱 Tablet';
        return '💻 Desktop';
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
                <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-purple-500/10 via-cyan-500/5 to-transparent rounded-full blur-3xl" />
            </div>

            {/* Header */}
            <header className="sticky top-0 z-40 backdrop-blur-xl bg-bg-base/80 border-b border-white/10">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin/clients"
                            className="flex items-center gap-2 text-text-muted hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-purple-400" />
                            <h1 className="font-display text-lg font-bold text-white">
                                Chat History
                            </h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={loadSessions}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-text-muted hover:text-white transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            <span className="text-sm hidden sm:inline">Refresh</span>
                        </button>
                        <Link
                            href="/admin/clients"
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-text-muted hover:text-white transition-colors"
                        >
                            <Users className="w-4 h-4" />
                            <span className="text-sm hidden sm:inline">Clients</span>
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-text-muted hover:text-white transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="text-sm hidden sm:inline">Logout</span>
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
                        <span className="text-sm font-medium">{message.text}</span>
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-bg-elevated rounded-xl border border-white/10 p-4">
                        <p className="text-xs text-text-muted mb-1">Total Sessions</p>
                        <p className="text-2xl font-bold text-white">{total}</p>
                    </div>
                    <div className="bg-bg-elevated rounded-xl border border-white/10 p-4">
                        <p className="text-xs text-text-muted mb-1">This Page</p>
                        <p className="text-2xl font-bold text-purple-400">{sessions.length}</p>
                    </div>
                    <div className="bg-bg-elevated rounded-xl border border-white/10 p-4">
                        <p className="text-xs text-text-muted mb-1">Total Messages</p>
                        <p className="text-2xl font-bold text-cyan-400">
                            {sessions.reduce((sum, s) => sum + s.messageCount, 0)}
                        </p>
                    </div>
                    <div className="bg-bg-elevated rounded-xl border border-white/10 p-4">
                        <p className="text-xs text-text-muted mb-1">Page</p>
                        <p className="text-2xl font-bold text-white">{page} / {totalPages}</p>
                    </div>
                </div>

                {/* Search */}
                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by message, IP, or session ID..."
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-white/10 bg-bg-surface text-white placeholder-text-muted focus:border-purple-500 transition-colors"
                        />
                    </div>
                </div>

                {/* Sessions List */}
                <div className="space-y-4">
                    {filteredSessions.length === 0 ? (
                        <div className="bg-bg-elevated rounded-2xl border border-white/10 p-12 text-center">
                            <MessageSquare className="w-12 h-12 text-text-muted mx-auto mb-4" />
                            <p className="text-text-muted">No chat sessions yet</p>
                            <p className="text-sm text-text-muted/60 mt-2">
                                Conversations from the AI avatar will appear here
                            </p>
                        </div>
                    ) : (
                        filteredSessions.map((session) => (
                            <div
                                key={session.id}
                                className="bg-bg-elevated rounded-xl border border-white/10 overflow-hidden"
                            >
                                {/* Session Header */}
                                <div
                                    className="p-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                                    onClick={() => handleExpand(session.id)}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="flex items-center gap-1 text-xs text-text-muted">
                                                    <Clock className="w-3 h-3" />
                                                    {formatDate(session.startedAt)}
                                                </span>
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
                                                    {session.messageCount} messages
                                                </span>
                                            </div>
                                            <p className="text-white text-sm truncate mb-2">
                                                {session.preview || 'No preview available'}
                                            </p>
                                            <div className="flex items-center gap-4 text-xs text-text-muted">
                                                <span className="flex items-center gap-1">
                                                    <Globe className="w-3 h-3" />
                                                    {session.ipAddress || 'Unknown IP'}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <User className="w-3 h-3" />
                                                    {getDeviceFromUserAgent(session.userAgent)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDeleteConfirm(session.id);
                                                }}
                                                className="p-2 rounded-lg hover:bg-red-500/10 text-text-muted hover:text-red-400 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            {expandedSession === session.id ? (
                                                <ChevronUp className="w-5 h-5 text-text-muted" />
                                            ) : (
                                                <ChevronDown className="w-5 h-5 text-text-muted" />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Messages */}
                                {expandedSession === session.id && (
                                    <div className="border-t border-white/10 p-4 bg-black/20">
                                        {sessionDetails[session.id]?.messages ? (
                                            <div
                                                data-lenis-prevent
                                                className="space-y-4 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
                                                onWheel={(e) => e.stopPropagation()}
                                            >
                                                {sessionDetails[session.id].messages!.map((msg) => (
                                                    <div
                                                        key={msg.id}
                                                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                                    >
                                                        <div
                                                            className={`max-w-[80%] rounded-xl p-3 ${msg.role === 'user'
                                                                ? 'bg-cyan-500/20 border border-cyan-500/30'
                                                                : 'bg-purple-500/10 border border-purple-500/20'
                                                                }`}
                                                        >
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className={`text-xs font-medium ${msg.role === 'user' ? 'text-cyan-400' : 'text-purple-400'
                                                                    }`}>
                                                                    {msg.role === 'user' ? 'User' : 'AI Avatar'}
                                                                </span>
                                                                {msg.source && (
                                                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-text-muted">
                                                                        {msg.source}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-white whitespace-pre-wrap">
                                                                {msg.content}
                                                            </p>
                                                            <p className="text-[10px] text-text-muted mt-1">
                                                                {formatDate(msg.timestamp)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-text-muted">
                                                Loading messages...
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-8">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <span className="px-4 py-2 text-text-muted">
                            Page {page} of {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                )}
            </main>

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-bg-elevated rounded-2xl border border-white/10 p-6 max-w-sm w-full shadow-2xl">
                        <div className="text-center">
                            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-6 h-6 text-red-400" />
                            </div>
                            <h3 className="font-display text-lg font-bold text-white mb-2">
                                Delete Session?
                            </h3>
                            <p className="text-sm text-text-muted mb-6">
                                This will permanently delete this chat session and all its messages.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="flex-1 py-2.5 rounded-xl border border-white/10 text-text-muted font-medium hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDelete(deleteConfirm)}
                                    className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
