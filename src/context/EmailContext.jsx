import React, { createContext, useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { 
    Inbox, 
    Mail, 
    Bell, 
    Calendar, 
    Send, 
    Archive, 
    Trash2,
    Hash
} from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { useAccounts } from '../hooks/useAccounts';
import { useOrganization } from '../hooks/useOrganization';
import { apiService } from '../services/apiService';
import { gmailSyncEngine } from '../services/GmailSyncEngine';
import { LABEL_CONFIG } from '../config/labelConfig';

const CAMPAIGNS = [
    { id: 'q1_outreach', label: 'Q1 Outreach', icon: Hash },
    { id: 'product_feedback', label: 'Product Feedback', icon: Hash },
];

const MORE_FILTERS = [
    { id: 'inbox', label: 'Inbox', icon: Inbox },
    { id: 'unread', label: 'Unread only', icon: Mail },
    { id: 'reminders', label: 'Reminders only', icon: Bell },
    { id: 'scheduled', label: 'Scheduled emails', icon: Calendar },
    { id: 'sent', label: 'Sent', icon: Send },
    { id: 'archived', label: 'Archived', icon: Archive },
    { id: 'trash', label: 'Trash', icon: Trash2 },
];

const EmailContext = createContext();

export const EmailProvider = ({ children }) => {
    const { activeAccount, accounts } = useAccounts();
    const { activeOrg } = useOrganization();
    const { showToast } = useToast();

    // --- State Initialization from URL ---
    const getInitialParams = () => {
        const params = new URLSearchParams(window.location.search);
        return {
            page: parseInt(params.get('page')) || 1,
            tab: params.get('tab') || 'primary',
            filter: params.get('filter') || 'all'
        };
    };

    const [currentPage, setCurrentPage] = useState(getInitialParams().page);
    const [activeTab, setActiveTab] = useState(getInitialParams().tab);
    const [activeFilter, setActiveFilter] = useState(getInitialParams().filter);

    // --- Global State ---
    const [messagesState, setMessagesState] = useState([]);
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSyncTime, setLastSyncTime] = useState(null);
    const [error, setError] = useState(null);
    const [selectedEmailId, setSelectedEmailId] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    // --- Pagination Data ---
    const [itemsPerPage] = useState(25);
    const [totalItems, setTotalItems] = useState(0);
    const [nextPageToken, setNextPageToken] = useState(null);
    const [pageTokenStacks, setPageTokenStacks] = useState({});

    // --- Caching System (Memory) ---
    const cacheRef = useRef({}); // Key: "email_filter_tab_page" -> { messages, nextPageToken, total }

    // --- URL Synchronization ---
    const updateUrlParams = useCallback((updates) => {
        const url = new URL(window.location);
        if (updates.page !== undefined) {
             if (updates.page === 1) url.searchParams.delete('page');
             else url.searchParams.set('page', updates.page);
        }
        if (updates.tab !== undefined) {
             if (updates.tab === 'primary') url.searchParams.delete('tab');
             else url.searchParams.set('tab', updates.tab);
        }
        if (updates.filter !== undefined) {
             if (updates.filter === 'all') url.searchParams.delete('filter');
             else url.searchParams.set('filter', updates.filter);
        }
        window.history.pushState({}, '', url);
    }, []);

    const getCacheKey = useCallback((page, tab, filter) => {
        const email = activeAccount?.email || 'none';
        return `${email}_${filter}_${tab}_${page}`;
    }, [activeAccount]);

    // --- Core Logic Layer (The Brain) ---
    const triggerSync = useCallback(async (options = {}) => {
        const { 
            page = currentPage, 
            tab = activeTab,
            filter = activeFilter,
            forceRefresh = false, 
            isInitial = false 
        } = options;

        if (!activeAccount) return;
        
        const cacheKey = getCacheKey(page, tab, filter);
        if (!forceRefresh && cacheRef.current[cacheKey]) {
            console.log(`[EmailContext] Serving from cache: ${cacheKey}`);
            const cached = cacheRef.current[cacheKey];
            setMessagesState(cached.messages);
            setNextPageToken(cached.nextPageToken);
            setTotalItems(cached.total);
            return;
        }

        setIsSyncing(true);
        setError(null);

        try {
            const stackKey = `${tab}_${filter}`;
            const currentStack = pageTokenStacks[stackKey] || [null];
            const token = currentStack[page - 1] || null;
            
            // Gmail categorized fetch only if filter is 'all' or 'inbox'
            const useCategory = (filter === 'all' || filter === 'inbox' || filter === 'unread');
            const result = await apiService.messages.syncGmail(
                activeAccount.email, 
                itemsPerPage, 
                token, 
                useCategory ? tab : 'primary'
            );
            
            if (result.success) {
                const threadsWithOrg = result.threads.map(t => ({ ...t, org_id: activeOrg?.id }));

                // Sync to Supabase for persistence
                if (result.source && !result.source.includes('Demo')) {
                    await gmailSyncEngine.syncToSupabase(threadsWithOrg, activeOrg?.id);
                }

                setMessagesState(threadsWithOrg);
                setNextPageToken(result.nextPageToken);
                setTotalItems(result.resultSizeEstimate || result.threads.length);
                setLastSyncTime(new Date());

                // Update token stack for this view
                if (result.nextPageToken && !currentStack[page]) {
                    setPageTokenStacks(prev => ({
                        ...prev,
                        [stackKey]: (() => {
                            const next = [...(prev[stackKey] || [null])];
                            next[page] = result.nextPageToken;
                            return next;
                        })()
                    }));
                }

                // Update Cache
                cacheRef.current[cacheKey] = {
                    messages: threadsWithOrg,
                    nextPageToken: result.nextPageToken,
                    total: result.resultSizeEstimate || result.count
                };

                if (isInitial && page === 1) {
                    showToast({ message: "Inbox synchronized", type: 'success' });
                }
            }
        } catch (err) {
            console.error("[EmailContext] Sync Error:", err);
            setError(err.message);
            showToast({ message: "Sync failed: " + err.message, type: 'error' });
        } finally {
            setIsSyncing(false);
        }
    }, [activeAccount, activeOrg, currentPage, activeTab, activeFilter, itemsPerPage, pageTokenStacks, getCacheKey, showToast]);

    // --- UI/UX Handlers ---
    const handleTabChange = useCallback((newTab) => {
        if (newTab === activeTab) return;
        setActiveTab(newTab);
        setCurrentPage(1);
        updateUrlParams({ tab: newTab, page: 1 });
        triggerSync({ page: 1, tab: newTab });
    }, [activeTab, updateUrlParams, triggerSync]);

    const handleFilterChange = useCallback((newFilter) => {
        if (newFilter === activeFilter) return;
        setActiveFilter(newFilter);
        setCurrentPage(1);
        updateUrlParams({ filter: newFilter, page: 1 });
        triggerSync({ page: 1, filter: newFilter });
    }, [activeFilter, updateUrlParams, triggerSync]);

    const handleNextPage = useCallback(() => {
        if (!nextPageToken || isSyncing) return;
        const next = currentPage + 1;
        setCurrentPage(next);
        updateUrlParams({ page: next });
        triggerSync({ page: next });
    }, [nextPageToken, isSyncing, currentPage, updateUrlParams, triggerSync]);

    const handlePrevPage = useCallback(() => {
        if (currentPage <= 1 || isSyncing) return;
        const prev = currentPage - 1;
        setCurrentPage(prev);
        updateUrlParams({ page: prev });
        triggerSync({ page: prev });
    }, [currentPage, isSyncing, updateUrlParams, triggerSync]);

    // --- Data Integrity & Persistence ---
    useEffect(() => {
        if (activeAccount) triggerSync({ isInitial: true });
    }, [activeAccount, triggerSync]);

    useEffect(() => {
        const handlePopState = () => {
            const p = getInitialParams();
            if (p.page !== currentPage) setCurrentPage(p.page);
            if (p.tab !== activeTab) setActiveTab(p.tab);
            if (p.filter !== activeFilter) setActiveFilter(p.filter);
            triggerSync({ page: p.page, tab: p.tab, filter: p.filter });
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [currentPage, activeTab, activeFilter, triggerSync]);

    // --- Message Actions ---
    const onUpdateStatus = useCallback(async (id, status) => {
        const previous = [...messagesState];
        setMessagesState(prev => prev.map(m => m.id === id ? { ...m, status } : m));
        // Clear cache on mutation
        cacheRef.current = {};
        try {
            await apiService.messages.updateStatus(id, status);
            showToast({ message: `Status updated to ${status}` });
        } catch {
            setMessagesState(previous);
            showToast({ message: "Failed to update status", type: 'error' });
        }
    }, [messagesState, showToast]);

    const onArchive = useCallback(async (idsOrSingle) => {
        const ids = Array.isArray(idsOrSingle) ? idsOrSingle : [idsOrSingle];
        const previous = [...messagesState];
        setMessagesState(prev => prev.map(m => ids.includes(m.id) ? { ...m, isArchived: true } : m));
        // Clear cache on mutation
        cacheRef.current = {};
        try {
            await apiService.messages.updateFlags(ids, { is_archived: true });
            showToast({ message: `${ids.length} items archived` });
            if (ids.includes(selectedEmailId)) setSelectedEmailId(null);
        } catch {
            setMessagesState(previous);
            showToast({ message: "Archive failed", type: 'error' });
        }
    }, [messagesState, selectedEmailId, showToast]);

    const onDelete = useCallback(async (idsOrSingle) => {
        const ids = Array.isArray(idsOrSingle) ? idsOrSingle : [idsOrSingle];
        const previous = [...messagesState];
        setMessagesState(prev => prev.map(m => ids.includes(m.id) ? { ...m, isDeleted: true } : m));
        // Clear cache on mutation
        cacheRef.current = {};
        try {
            await apiService.messages.updateFlags(ids, { is_deleted: true });
            showToast({ message: `${ids.length} items deleted` });
            if (ids.includes(selectedEmailId)) setSelectedEmailId(null);
        } catch {
            setMessagesState(previous);
            showToast({ message: "Delete failed", type: 'error' });
        }
    }, [messagesState, selectedEmailId, showToast]);

    const onRestore = useCallback(async (idsOrSingle) => {
        const ids = Array.isArray(idsOrSingle) ? idsOrSingle : [idsOrSingle];
        const previous = [...messagesState];
        // Optimistic update — remove isDeleted flag and reset folder
        setMessagesState(prev =>
            prev.map(m =>
                ids.includes(m.id)
                    ? { ...m, isDeleted: false, folder_id: 'primary' }
                    : m
            )
        );
        // Clear view
        if (ids.includes(selectedEmailId)) setSelectedEmailId(null);
        // Clear cache
        cacheRef.current = {};
        try {
            await apiService.messages.updateFlags(ids, { is_deleted: false, folder_id: 'primary' });
            showToast({ message: `Email restored to Inbox`, type: 'success' });
        } catch {
            setMessagesState(previous);
            showToast({ message: 'Restore failed', type: 'error' });
        }
    }, [messagesState, selectedEmailId, showToast]);

    const onToggleStar = useCallback(async (id, starred) => {
        setMessagesState(prev => prev.map(m => m.id === id ? { ...m, isStarred: starred } : m));
        // Clear cache on mutation
        cacheRef.current = {};
        try {
            await apiService.messages.updateFlags([id], { is_starred: starred });
        } catch (err) { console.error(err); }
    }, []);

    // --- Derived State ---
    const filteredMessages = useMemo(() => {
        let filtered = [...messagesState];
        const isArchiveView = activeFilter === 'archived';
        const isTrashView = activeFilter === 'trash';

        if (isArchiveView) filtered = filtered.filter(msg => msg.isArchived && !msg.isDeleted);
        else if (isTrashView) filtered = filtered.filter(msg => msg.isDeleted);
        else filtered = filtered.filter(msg => !msg.isArchived && !msg.isDeleted);

        if (activeFilter !== 'all' && !isArchiveView && !isTrashView) {
            if (activeFilter === 'unread') filtered = filtered.filter(msg => !msg.read);
            else if (LABEL_CONFIG.some(l => l.id === activeFilter)) {
                filtered = filtered.filter(msg => msg.status?.toLowerCase() === activeFilter.toLowerCase());
            }
        }

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(m => m.subject?.toLowerCase().includes(q) || m.sender?.toLowerCase().includes(q));
        }
        return filtered;
    }, [messagesState, activeFilter, searchQuery]);

    const statusCounts = useMemo(() => {
        const counts = {};
        LABEL_CONFIG.forEach(l => {
            counts[l.id] = messagesState.filter(m => m.status?.toLowerCase() === l.id && !m.isDeleted && !m.isArchived).length;
        });
        counts['all'] = messagesState.filter(m => !m.isDeleted && !m.isArchived).length;
        counts['unread'] = messagesState.filter(m => !m.read && !m.isDeleted && !m.isArchived).length;
        counts['archived'] = messagesState.filter(m => m.isArchived && !m.isDeleted).length;
        counts['trash'] = messagesState.filter(m => m.isDeleted).length;
        return counts;
    }, [messagesState]);

    const lastSyncLabel = useMemo(() => {
        if (!lastSyncTime) return null;
        const diff = new Date() - lastSyncTime;
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        return `${Math.floor(mins / 60)}h ago`;
    }, [lastSyncTime]);

    const value = {
        messages: filteredMessages,
        isSyncing,
        syncProgress: `Syncing ${activeTab}...`,
        lastSyncTime,
        lastSyncLabel,
        error,
        selectedEmail: messagesState.find(m => m.id === selectedEmailId),
        selectedEmailId,
        selectedIds,
        activeTab,
        setActiveTab: handleTabChange,
        activeFilter,
        searchQuery,
        setSearchQuery,
        statusCounts,
        onSelectEmail: setSelectedEmailId,
        onSelectFilter: handleFilterChange,
        onUpdateStatus,
        onArchive,
        onDelete,
        onRestore,
        onToggleStar,
        toggleSelectId: (id) => setSelectedIds(p => p.includes(id) ? p.filter(i => i !== id) : [...p, id]),
        selectAll: () => setSelectedIds(selectedIds.length === filteredMessages.length ? [] : filteredMessages.map(m => m.id)),
        triggerSync: () => triggerSync({ forceRefresh: true }),
        filters: LABEL_CONFIG,
        campaigns: CAMPAIGNS,
        inboxes: accounts,
        moreFilters: MORE_FILTERS,
        pagination: { 
            currentPage, 
            itemsPerPage, 
            totalItems,
            hasNext: !!nextPageToken,
            hasPrev: currentPage > 1,
            onNext: handleNextPage,
            onPrev: handlePrevPage
        }
    };

    return <EmailContext.Provider value={value}>{children}</EmailContext.Provider>;
};

export { EmailContext };
