import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
    Search, X, Mail, LayoutDashboard, Users2, Megaphone,
    BarChart2, Settings, Inbox, ArrowRight, Clock,
    Star, Paperclip, Zap, ChevronRight
} from 'lucide-react';
import { useSearch } from '../../hooks/useSearch';
import { useNavigation } from '../../hooks/useNavigation';

// ── Highlighted text (same pattern as SearchPage) ──────────────────────────
const Highlight = ({ text = '', query = '' }) => {
    if (!query.trim()) return <span>{text}</span>;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
    return (
        <span>
            {parts.map((part, i) =>
                part.toLowerCase() === query.toLowerCase()
                    ? <mark key={i} className="bg-primary/30 text-slate-900 rounded-sm font-black not-italic">{part}</mark>
                    : <span key={i}>{part}</span>
            )}
        </span>
    );
};

// ── Static quick-nav actions ────────────────────────────────────────────────
const QUICK_ACTIONS = [
    { id: 'nav_dashboard',  label: 'Go to Dashboard',   icon: LayoutDashboard, nav: 'Dashboard',   shortcut: '→' },
    { id: 'nav_inboxes',    label: 'Go to Inboxes',     icon: Inbox,           nav: 'Inboxes',     shortcut: '→' },
    { id: 'nav_leads',      label: 'Go to Lead Finder', icon: Users2,          nav: 'Lead Finder', shortcut: '→' },
    { id: 'nav_search',     label: 'Open Search',       icon: Search,          nav: 'Search',      shortcut: '→' },
    { id: 'nav_campaigns',  label: 'Go to Campaigns',   icon: Megaphone,       nav: 'Campaigns',   shortcut: '→' },
    { id: 'nav_analytics',  label: 'Go to Analytics',   icon: BarChart2,       nav: 'Analytics',   shortcut: '→' },
    { id: 'nav_settings',   label: 'Go to Settings',    icon: Settings,        nav: 'Settings',    shortcut: '→' },
];

// ── CommandPalette Component ────────────────────────────────────────────────
const CommandPalette = ({ onClose }) => {
    const { navigate } = useNavigation();
    const {
        query, setQuery,
        debouncedQuery,
        results,
        recentSearches,
        handleSelectResult,
    } = useSearch();

    const inputRef = useRef(null);
    const listRef = useRef(null);
    const [selectedIdx, setSelectedIdx] = useState(0);
    const prevQueryRef = useRef(debouncedQuery);

    useEffect(() => { inputRef.current?.focus(); }, []);

    // Reset selection when query changes — use ref to avoid setState-in-effect warning
    if (prevQueryRef.current !== debouncedQuery) {
        prevQueryRef.current = debouncedQuery;
        // Direct state update during render is safe for derived resets
    }

    // Build a combined list for keyboard nav
    const showActions = !debouncedQuery || debouncedQuery.length < 2;
    const filteredActions = showActions
        ? QUICK_ACTIONS.filter(a => !query || a.label.toLowerCase().includes(query.toLowerCase()))
        : [];

    const combinedItems = useMemo(() => [
        ...filteredActions.map(a => ({ ...a, _kind: 'action' })),
        ...results.slice(0, 8).map(r => ({ ...r, _kind: 'email' })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ], [debouncedQuery, results.length, filteredActions.length]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIdx(i => Math.min(i + 1, combinedItems.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIdx(i => Math.max(i - 1, 0));
        } else if (e.key === 'Enter' && combinedItems[selectedIdx]) {
            const item = combinedItems[selectedIdx];
            if (item._kind === 'action') {
                navigate(item.nav);
                onClose();
            } else {
                handleSelectResult(item);
                navigate('Inboxes');
                onClose();
            }
        } else if (e.key === 'Escape') {
            onClose();
        }
    }, [combinedItems, selectedIdx, navigate, onClose, handleSelectResult]);

    // Scroll selected item into view
    useEffect(() => {
        const el = listRef.current?.children[selectedIdx];
        el?.scrollIntoView({ block: 'nearest' });
    }, [selectedIdx]);

    return (
        <div
            className="fixed inset-0 z-[300] flex items-start justify-center pt-[15vh] px-4"
            onClick={e => e.target === e.currentTarget && onClose()}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

            {/* Palette */}
            <div className="relative w-full max-w-[600px] bg-white rounded-3xl shadow-[0_40px_120px_rgba(0,0,0,0.3)] overflow-hidden border border-slate-200 animate-in zoom-in-95 fade-in duration-200">
                {/* Input Row */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
                    <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search or jump to..."
                        className="flex-1 text-[15px] font-medium text-slate-900 placeholder:text-slate-400 bg-transparent outline-none"
                    />
                    {query ? (
                        <button
                            onClick={() => setQuery('')}
                            className="w-6 h-6 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    ) : (
                        <kbd className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">ESC</kbd>
                    )}
                </div>

                {/* Results List */}
                <div className="max-h-[420px] overflow-y-auto" ref={listRef}>
                    {/* Quick Nav Actions */}
                    {filteredActions.length > 0 && (
                        <div>
                            <div className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                {!query ? 'Quick Actions' : 'Navigation'}
                            </div>
                            {filteredActions.map((action, idx) => {
                                const isSelected = idx === selectedIdx;
                                return (
                                    <button
                                        key={action.id}
                                        onClick={() => { navigate(action.nav); onClose(); }}
                                        className={`w-full flex items-center gap-3 px-4 py-3 transition-all text-left ${
                                            isSelected ? 'bg-slate-900 text-white' : 'hover:bg-slate-50 text-slate-700'
                                        }`}
                                    >
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                            isSelected ? 'bg-white/10' : 'bg-slate-100'
                                        }`}>
                                            <action.icon className={`w-4 h-4 ${isSelected ? 'text-primary' : 'text-slate-500'}`} />
                                        </div>
                                        <span className="text-[13px] font-semibold flex-1">{action.label}</span>
                                        <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-primary' : 'text-slate-300'}`} />
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Email Results */}
                    {results.length > 0 && (
                        <div>
                            <div className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-t border-slate-50">
                                Emails ({results.length})
                            </div>
                            {results.slice(0, 8).map((result, idx) => {
                                const absIdx = filteredActions.length + idx;
                                const isSelected = absIdx === selectedIdx;
                                const initials = result.sender
                                    ? result.sender.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                                    : (result.sender_email?.[0]?.toUpperCase() || '?');

                                return (
                                    <button
                                        key={result.id}
                                        onClick={() => {
                                            handleSelectResult(result);
                                            navigate('Inboxes');
                                            onClose();
                                        }}
                                        className={`w-full flex items-center gap-3 px-4 py-3 transition-all text-left ${
                                            isSelected ? 'bg-slate-900 text-white' : 'hover:bg-slate-50'
                                        }`}
                                    >
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-[11px] font-black ${
                                            isSelected ? 'bg-white/10 text-primary' : 'bg-slate-900 text-primary'
                                        }`}>
                                            {initials}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-[12px] font-semibold truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                                                <Highlight text={result.subject || 'No Subject'} query={debouncedQuery} />
                                            </p>
                                            <p className={`text-[11px] truncate ${isSelected ? 'text-white/60' : 'text-slate-400'}`}>
                                                {result.sender || result.sender_email}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1.5 flex-shrink-0">
                                            {!result.read && <div className="w-2 h-2 rounded-full bg-primary" />}
                                            {result.isStarred && <Star className={`w-3 h-3 ${isSelected ? 'text-amber-400' : 'text-amber-400'} fill-current`} />}
                                            <span className={`text-[10px] ${isSelected ? 'text-white/40' : 'text-slate-400'}`}>{result.timestamp}</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Recent Searches (no query) */}
                    {!query && recentSearches.length > 0 && (
                        <div>
                            <div className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-t border-slate-50">
                                Recent
                            </div>
                            {recentSearches.slice(0, 4).map(s => (
                                <button
                                    key={s}
                                    onClick={() => setQuery(s)}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-slate-500 transition-colors"
                                >
                                    <Clock className="w-4 h-4 text-slate-300 flex-shrink-0" />
                                    <span className="text-[12px] font-medium">{s}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* No results */}
                    {debouncedQuery && debouncedQuery.length >= 2 && combinedItems.length === 0 && (
                        <div className="py-12 text-center">
                            <p className="text-[13px] font-semibold text-slate-400">No results for "{debouncedQuery}"</p>
                        </div>
                    )}
                </div>

                {/* Footer hints */}
                <div className="flex items-center gap-4 px-5 py-3 border-t border-slate-50 bg-slate-50">
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                        <kbd className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[9px]">↑↓</kbd> Navigate
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                        <kbd className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[9px]">↵</kbd> Select
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                        <kbd className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[9px]">ESC</kbd> Close
                    </span>
                    <span className="ml-auto text-[10px] font-black text-primary uppercase tracking-widest">
                        CRM Search
                    </span>
                </div>
            </div>
        </div>
    );
};

export default CommandPalette;
