import { useState, useMemo, useCallback, useEffect } from 'react';
import { useEmailStore } from './useEmailStore';

// Highlight matching query in text
const highlight = (text = '', query = '') => {
    if (!query.trim()) return text;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return text.replace(new RegExp(`(${escaped})`, 'gi'), '**$1**');
};

// Extract snippet around match
const extractSnippet = (text = '', query = '', maxLen = 120) => {
    if (!text) return '';
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx < 0) return text.slice(0, maxLen) + (text.length > maxLen ? '...' : '');
    const start = Math.max(0, idx - 30);
    const end = Math.min(text.length, idx + query.length + 80);
    return (start > 0 ? '...' : '') + text.slice(start, end) + (end < text.length ? '...' : '');
};

export const useSearch = () => {
    const { allMessages = [], onSelectEmail, onSelectFilter } = useEmailStore();
    const [query, setQuery]           = useState('');
    const [activeType, setActiveType] = useState('all');
    const [sortBy, setSortBy]         = useState('relevance');
    const [recentSearches, setRecentSearches] = useState(
        () => JSON.parse(localStorage.getItem('crm_recent_searches') || '[]')
    );

    // Debounce
    const DEBOUNCE_MS = 200;
    const [debouncedQuery, setDebouncedQuery] = useState('');
    useEffect(() => {
        const t = setTimeout(() => setDebouncedQuery(query), DEBOUNCE_MS);
        return () => clearTimeout(t);
    }, [query]);

    // Derived — no extra state needed
    const isSearching = debouncedQuery.length >= 2;
    // ── Email Results
    const emailResults = useMemo(() => {
        const q = debouncedQuery.trim().toLowerCase();
        if (!q || q.length < 2) return [];

        return allMessages
            .filter(m => !m.isDeleted && !m.isArchived)
            .filter(m =>
                m.subject?.toLowerCase().includes(q) ||
                m.sender?.toLowerCase().includes(q) ||
                m.sender_email?.toLowerCase().includes(q) ||
                m.snippet?.toLowerCase().includes(q) ||
                m.body_text?.toLowerCase().includes(q)
            )
            .map(m => ({
                ...m,
                _type: 'email',
                _snippet: extractSnippet(m.snippet || m.body_text || '', q),
                _highlight: highlight(m.subject || 'No Subject', q),
                _senderHighlight: highlight(m.sender || m.sender_email || '', q),
                _score: computeScore(m, q),
            }))
            .sort((a, b) => {
                if (sortBy === 'date') return new Date(b.gmail_date || 0) - new Date(a.gmail_date || 0);
                if (sortBy === 'sender') return (a.sender || '').localeCompare(b.sender || '');
                return b._score - a._score;
            })
            .slice(0, 50);
    }, [debouncedQuery, allMessages, sortBy]);

    // ── Combined results by type
    const results = useMemo(() => {
        if (activeType === 'all') return emailResults;
        if (activeType === 'emails') return emailResults;
        return [];
    }, [emailResults, activeType]);

    const totalCount = results.length;

    const saveSearch = useCallback((q) => {
        if (!q.trim()) return;
        const updated = [q, ...recentSearches.filter(s => s !== q)].slice(0, 8);
        setRecentSearches(updated);
        localStorage.setItem('crm_recent_searches', JSON.stringify(updated));
    }, [recentSearches]);

    const clearRecent = useCallback(() => {
        setRecentSearches([]);
        localStorage.removeItem('crm_recent_searches');
    }, []);

    const handleSelectResult = useCallback((result) => {
        if (result._type === 'email') {
            saveSearch(debouncedQuery);
            onSelectEmail(result.id);
            onSelectFilter('all');
        }
    }, [debouncedQuery, onSelectEmail, onSelectFilter, saveSearch]);

    return {
        query,
        setQuery,
        debouncedQuery,
        activeType,
        setActiveType,
        sortBy,
        setSortBy,
        results,
        emailResults,
        totalCount,
        isSearching,
        recentSearches,
        clearRecent,
        handleSelectResult,
        saveSearch,
    };
};

// Relevance score: subject match > sender match > body match
function computeScore(msg, query) {
    let score = 0;
    const q = query.toLowerCase();
    if (msg.subject?.toLowerCase().includes(q)) score += 40;
    if (msg.sender?.toLowerCase().startsWith(q)) score += 30;
    else if (msg.sender?.toLowerCase().includes(q)) score += 20;
    if (msg.sender_email?.toLowerCase().includes(q)) score += 15;
    if (msg.snippet?.toLowerCase().includes(q)) score += 10;
    if (msg.body_text?.toLowerCase().includes(q)) score += 5;
    if (!msg.read) score += 5; // unread bump
    return score;
}
