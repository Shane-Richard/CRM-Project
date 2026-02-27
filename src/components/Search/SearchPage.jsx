import React, { useRef, useEffect, useState } from 'react';
import {
    Search, X, Mail, Clock, Star, Paperclip,
    SortAsc, SortDesc, Filter, Inbox,
    ChevronRight, Zap, ArrowUpRight, Users,
    RotateCcw, Loader2, AlertCircle
} from 'lucide-react';
import { useSearch } from '../../hooks/useSearch';
import { useNavigation } from '../../hooks/useNavigation';

// ── Highlighted text renderer ──────────────────────────────────────────────
const HighlightText = ({ text = '', query = '' }) => {
    if (!query.trim()) return <span>{text}</span>;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
    return (
        <span>
            {parts.map((part, i) =>
                part.toLowerCase() === query.toLowerCase()
                    ? <mark key={i} className="bg-primary/30 text-slate-900 rounded px-0.5 not-italic font-bold">{part}</mark>
                    : <span key={i}>{part}</span>
            )}
        </span>
    );
};

// ── Single Email Result Card ───────────────────────────────────────────────
const EmailResultCard = ({ result, query, onClick }) => {
    const initials = result.sender
        ? result.sender.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
        : (result.sender_email?.[0]?.toUpperCase() || '?');

    const statusColors = {
        'Lead':              { bg: 'bg-blue-50',   text: 'text-blue-600',   border: 'border-blue-200' },
        'Interested':        { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-200' },
        'Meeting booked':    { bg: 'bg-amber-50',  text: 'text-amber-600',  border: 'border-amber-200' },
        'Meeting completed': { bg: 'bg-emerald-50',text: 'text-emerald-600',border: 'border-emerald-200' },
        'Won':               { bg: 'bg-green-50',  text: 'text-green-600',  border: 'border-green-200' },
        'Lost':              { bg: 'bg-red-50',    text: 'text-red-600',    border: 'border-red-200' },
    };
    const sc = statusColors[result.status] || { bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-200' };

    return (
        <div
            onClick={onClick}
            className="group flex items-start gap-4 px-6 py-4 hover:bg-slate-50 cursor-pointer transition-all duration-200 border-b border-slate-50 last:border-0 rounded-2xl hover:shadow-sm"
        >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-2xl bg-slate-900 text-primary flex items-center justify-center text-[11px] font-black">
                    {initials}
                </div>
                {!result.read && (
                    <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-primary rounded-full border border-white" />
                )}
                {result.isStarred && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center border border-white">
                        <Star className="w-2 h-2 text-white fill-white" />
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                    <span className={`text-[13px] truncate max-w-[200px] ${!result.read ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                        <HighlightText text={result.sender || result.sender_email || 'Unknown'} query={query} />
                    </span>
                    <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                        {result.has_attachments && <Paperclip className="w-3 h-3 text-slate-400" />}
                        <span className="text-[10px] text-slate-400 font-medium">{result.timestamp || result.date || ''}</span>
                    </div>
                </div>

                <p className={`text-[12px] mb-1 truncate ${!result.read ? 'font-bold text-slate-800' : 'font-medium text-slate-600'}`}>
                    <HighlightText text={result.subject || 'No Subject'} query={query} />
                </p>

                <p className="text-[11px] text-slate-400 line-clamp-1 leading-relaxed">
                    <HighlightText text={result._snippet || ''} query={query} />
                </p>
            </div>

            {/* Status + Arrow */}
            <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
                {result.status && (
                    <span className={`text-[9px] font-black px-2 py-1 rounded-lg border uppercase tracking-widest ${sc.bg} ${sc.text} ${sc.border}`}>
                        {result.status}
                    </span>
                )}
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-primary transition-colors" />
            </div>
        </div>
    );
};

// ── Recent search pill ─────────────────────────────────────────────────────
const RecentChip = ({ label, onClick }) => (
    <button
        onClick={onClick}
        className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-semibold rounded-xl transition-all"
    >
        <RotateCcw className="w-3 h-3 text-slate-400" />
        {label}
    </button>
);

// ── Empty / zero state ─────────────────────────────────────────────────────
const EmptyState = ({ query }) => (
    <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
        <div className="w-20 h-20 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center justify-center mb-6 rotate-6">
            <Search className="w-9 h-9 text-slate-200" strokeWidth={1.5} />
        </div>
        <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">No results for "{query}"</h3>
        <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-xs">
            Try different keywords, check spelling, or search by sender email address.
        </p>
    </div>
);

// ── Stat chip ──────────────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
const StatChip = ({ icon: Icon, label, value, color = 'slate' }) => {
    const colors = {
        slate:  'bg-slate-50 border-slate-100 text-slate-600',
        primary:'bg-primary/10 border-primary/20 text-slate-900',
        blue:   'bg-blue-50 border-blue-100 text-blue-700',
        violet: 'bg-violet-50 border-violet-100 text-violet-700',
    };
    return (
        <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border ${colors[color]}`}>
            <Icon className="w-4 h-4 flex-shrink-0" />
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{label}</p>
                <p className="text-[15px] font-black leading-tight">{value}</p>
            </div>
        </div>
    );
};

// ── Main Search Page ───────────────────────────────────────────────────────
const SearchPage = () => {
    const { navigate } = useNavigation();
    const {
        query, setQuery,
        debouncedQuery,
        activeType, setActiveType,
        sortBy, setSortBy,
        results,
        emailResults,
        totalCount,
        isSearching,
        recentSearches,
        clearRecent,
        handleSelectResult,
    } = useSearch();

    const inputRef = useRef(null);
    const [showSortMenu, setShowSortMenu] = useState(false);

    // Auto-focus on mount
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // Keyboard shortcut: Escape to clear
    useEffect(() => {
        const handler = (e) => {
            if (e.key === 'Escape') setQuery('');
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [setQuery]);

    const typeTabs = [
        { id: 'all',    label: 'All',    icon: Zap,   count: totalCount },
        { id: 'emails', label: 'Emails', icon: Mail,  count: emailResults.length },
        { id: 'leads',  label: 'Leads',  icon: Users, count: 0 },
    ];

    const sortOptions = [
        { id: 'relevance', label: 'Most Relevant' },
        { id: 'date',      label: 'Newest First'  },
        { id: 'sender',    label: 'By Sender'     },
    ];

    const goToInbox = (result) => {
        handleSelectResult(result);
        navigate('Inboxes');
    };

    return (
        <div className="flex flex-col h-full bg-[#f8f9fb] overflow-hidden">

            {/* ── Top Search Hero ── */}
            <div className="flex-shrink-0 bg-white border-b border-slate-100 px-10 pt-10 pb-6">
                <div className="max-w-3xl mx-auto">
                    {/* Title */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-9 h-9 rounded-2xl bg-slate-900 flex items-center justify-center">
                            <Search className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-[22px] font-black text-slate-900 leading-none tracking-tight">Global Search</h1>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Search across all emails, leads & contacts</p>
                        </div>
                    </div>

                    {/* Search Input */}
                    <div className="relative group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="Search emails, contacts, subjects..."
                            className="w-full bg-slate-50 border-2 border-slate-200 focus:border-primary focus:bg-white rounded-2xl pl-14 pr-14 py-4 text-[15px] font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all shadow-sm focus:shadow-md"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                            {isSearching && (
                                <Loader2 className="w-4 h-4 text-primary animate-spin" />
                            )}
                            {query && (
                                <button
                                    onClick={() => setQuery('')}
                                    className="w-7 h-7 flex items-center justify-center rounded-xl bg-slate-200 hover:bg-red-100 hover:text-red-500 text-slate-500 transition-all"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                            {!query && (
                                <kbd className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">ESC</kbd>
                            )}
                        </div>
                    </div>

                    {/* Stats Row — shown when there are results */}
                    {debouncedQuery && results.length > 0 && (
                        <div className="flex items-center gap-3 mt-5 animate-in fade-in slide-in-from-top-2 duration-300">
                            <StatChip icon={Zap} label="Total" value={totalCount} color="primary" />
                            <StatChip icon={Mail} label="Emails" value={emailResults.length} color="blue" />
                            <StatChip icon={Users} label="Leads" value={0} color="violet" />
                        </div>
                    )}
                </div>
            </div>

            {/* ── Toolbar (Type tabs + Sort) ── */}
            {debouncedQuery && (
                <div className="flex-shrink-0 bg-white border-b border-slate-100 px-10 py-3 animate-in fade-in duration-200">
                    <div className="max-w-3xl mx-auto flex items-center justify-between">
                        {/* Type Tabs */}
                        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
                            {typeTabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveType(tab.id)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${
                                        activeType === tab.id
                                            ? 'bg-white text-slate-900 shadow-sm'
                                            : 'text-slate-400 hover:text-slate-600'
                                    }`}
                                >
                                    <tab.icon className={`w-3 h-3 ${activeType === tab.id ? 'text-primary' : ''}`} />
                                    {tab.label}
                                    {tab.count > 0 && (
                                        <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-black ${
                                            activeType === tab.id ? 'bg-primary/20 text-slate-900' : 'bg-slate-200 text-slate-500'
                                        }`}>
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Sort */}
                        <div className="relative">
                            <button
                                onClick={() => setShowSortMenu(v => !v)}
                                className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-[11px] font-black text-slate-600 uppercase tracking-widest transition-all"
                            >
                                <SortAsc className="w-3.5 h-3.5" />
                                {sortOptions.find(s => s.id === sortBy)?.label}
                            </button>
                            {showSortMenu && (
                                <div className="absolute right-0 top-10 z-50 w-44 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                    {sortOptions.map(opt => (
                                        <button
                                            key={opt.id}
                                            onClick={() => { setSortBy(opt.id); setShowSortMenu(false); }}
                                            className={`w-full text-left px-4 py-3 text-[12px] font-bold transition-colors ${
                                                sortBy === opt.id
                                                    ? 'bg-primary/10 text-slate-900'
                                                    : 'text-slate-600 hover:bg-slate-50'
                                            }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Results Body ── */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-3xl mx-auto px-10 py-6">

                    {/* Landing state (no query) */}
                    {!debouncedQuery && (
                        <div className="space-y-8 animate-in fade-in duration-300">
                            {/* Recent Searches */}
                            {recentSearches.length > 0 && (
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                            <Clock className="w-3 h-3" /> Recent Searches
                                        </h3>
                                        <button
                                            onClick={clearRecent}
                                            className="text-[10px] font-black text-slate-400 hover:text-red-500 uppercase tracking-widest transition-colors"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {recentSearches.map(s => (
                                            <RecentChip key={s} label={s} onClick={() => setQuery(s)} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Quick Tips */}
                            <div>
                                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                                    <Zap className="w-3 h-3" /> Search Tips
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { tip: 'Search by sender name', example: 'e.g. "Alex Johnson"' },
                                        { tip: 'Search by email address', example: 'e.g. "alex@company.com"' },
                                        { tip: 'Search by subject line', example: 'e.g. "Partnership"' },
                                        { tip: 'Search by message content', example: 'e.g. "meeting tomorrow"' },
                                    ].map(({ tip, example }) => (
                                        <div key={tip} className="p-4 bg-white rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
                                            <p className="text-[12px] font-bold text-slate-800 mb-0.5">{tip}</p>
                                            <p className="text-[11px] text-slate-400 font-medium">{example}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Searching indicator */}
                    {debouncedQuery && isSearching && results.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Searching...</p>
                        </div>
                    )}

                    {/* Zero results */}
                    {debouncedQuery && !isSearching && results.length === 0 && (
                        <EmptyState query={debouncedQuery} />
                    )}

                    {/* Results */}
                    {debouncedQuery && results.length > 0 && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                            {/* Section header */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-slate-400" />
                                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                        {results.length} result{results.length !== 1 ? 's' : ''} for
                                    </h3>
                                    <span className="text-[11px] font-black text-slate-900 bg-primary/10 px-2 py-0.5 rounded-lg">
                                        "{debouncedQuery}"
                                    </span>
                                </div>
                            </div>

                            {/* Result cards */}
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
                                {results.map(result => (
                                    <EmailResultCard
                                        key={result.id}
                                        result={result}
                                        query={debouncedQuery}
                                        onClick={() => goToInbox(result)}
                                    />
                                ))}
                            </div>

                            {results.length >= 50 && (
                                <p className="text-center text-[11px] text-slate-400 font-medium mt-4">
                                    Showing top 50 results — refine your search for more specific matches
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Dismiss sort menu on outside click */}
            {showSortMenu && (
                <div className="fixed inset-0 z-40" onClick={() => setShowSortMenu(false)} />
            )}
        </div>
    );
};

export default SearchPage;
