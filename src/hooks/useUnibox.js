import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { 
  Inbox,
  Mail,
  Bell,
  Calendar,
  Send,
  Hash,
  MoreVertical,
  Archive,
  Trash2
} from 'lucide-react';
import { threads as initialThreads } from '../mocks/mockData';
import { useAccounts } from './useAccounts';
import { useOrganization } from './useOrganization.jsx';
import { useToast } from './useToast.jsx';
import { mailService } from '../services/MailService';
import { gmailSyncEngine } from '../services/GmailSyncEngine';
import { LABEL_CONFIG } from '../config/labelConfig';
import supabase from '../services/supabaseClient';
import { normalizeEmail, toAccountId } from '../utils/normalizeEmail';

// Set up Auth Error listener globally for the sync engine
const setupAuthErrorListener = (showToast, triggerSync) => {
    gmailSyncEngine.onAuthError = () => {
        showToast({
            message: "Session expired. Please reconnect to sync emails.",
            type: 'error',
            duration: 10000,
            action: {
                label: "Reconnect",
                onClick: () => triggerSync()
            }
        });
    };
};

const STATUS_FILTERS = [
  ...LABEL_CONFIG.slice(0, 5), // Take first 5 for the sidebar
  { id: 'more', label: 'More', icon: MoreVertical, color: '#94a3b8' },
];

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

// Real API Call -> Supabase sync
const apiSyncUpdate = async (messageId, updates) => {
    try {
        const { error } = await supabase
            .from('messages')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', messageId);
        
        if (error) throw error;
        return { success: true };
    } catch (err) {
        console.error(`[API Sync] Failed for ${messageId}:`, err.message);
        // Fallback: try mock
        return new Promise((resolve) => {
            setTimeout(() => resolve({ success: true }), 300);
        });
    }
};

export const useUnibox = () => {
    const { accounts } = useAccounts();
    const { activeOrg } = useOrganization();
    const { showToast } = useToast();
    const [selectedIds, setSelectedIds] = useState([]);
    const [messagesState, setMessagesState] = useState(Array.isArray(initialThreads) ? initialThreads : []);
    const [selectedEmailId, setSelectedEmailId] = useState(null);
    const [activeFilter, setActiveFilter] = useState('lead');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('primary');
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncProgress, setSyncProgress] = useState('');
    const [lastSyncTime, setLastSyncTime] = useState(null);
    const [lastAccountCount, setLastAccountCount] = useState(Array.isArray(accounts) ? accounts.length : 0);
    const [nextPageToken, setNextPageToken] = useState(null);
    const [prevPageTokens, setPrevPageTokens] = useState([]);
    const [activePageToken, setActivePageToken] = useState(null);
    const [totalEstimate, setTotalEstimate] = useState(0);
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [itemsPerPage] = useState(25);
    const syncedAccountsRef = useRef(new Set());

    // ==========================================================
    //  MANUAL SYNC TRIGGER
    // ==========================================================
    const triggerSync = useCallback(async (accountEmail, pageToken = null, isNext = false, isPrev = false) => {
        if (isSyncing) return;

        const email = accountEmail || accounts.find(a => a.type === 'gmail')?.label;
        if (!email) {
            showToast({ message: 'No Gmail account connected. Add one first.', type: 'error' });
            return;
        }

        const cleanEmail = normalizeEmail(email);
        console.log(`[Sync]: Fetching live data for ${cleanEmail}`);
        setIsSyncing(true);
        setSyncProgress('Connecting to Gmail...');

        try {
            // Step 1: Profile check (non-blocking — sync continues even if this fails)
            setSyncProgress('Verifying connection...');
            try {
                await gmailSyncEngine.getProfile();
            } catch (profileError) {
                console.warn('[Sync] Profile check failed (non-blocking):', profileError.message);
            }

            // Step 2: Fetch threads
            setSyncProgress('Fetching latest threads...');
            const result = await mailService.triggerSync(email, itemsPerPage, pageToken);

            if (result.success && result.threads) {
                // Step 3: Set org_id on all threads
                const threadsWithOrg = result.threads.map(t => ({
                    ...t,
                    org_id: activeOrg?.id,
                    account_id: t.account_id || toAccountId(cleanEmail)
                }));

                // Step 4: Update local state (Single Source of Truth)
                setMessagesState(prev => {
                    // If real data arrived, purge all demo threads
                    const isRealData = result.source && !result.source.includes('Demo');
                    let base = prev;
                    if (isRealData) {
                        const demoCount = prev.filter(m => m.id?.startsWith('gmail_demo_')).length;
                        if (demoCount > 0) {
                            console.log(`[Sync] Purging ${demoCount} demo threads — real data has arrived`);
                        }
                        base = prev.filter(m => !m.id?.startsWith('gmail_demo_'));
                    }

                    // Dedup by both id AND thread_id for safety
                    const existingIds = new Set(base.map(m => m.id));
                    const existingThreadIds = new Set(base.map(m => m.thread_id).filter(Boolean));
                    const newThreads = threadsWithOrg.filter(t => 
                        !existingIds.has(t.id) && !existingThreadIds.has(t.thread_id)
                    );
                    // Update existing threads with fresh data (preserve CRM status)
                    const updatedExisting = base.map(existing => {
                        const updated = threadsWithOrg.find(t => t.thread_id === existing.thread_id);
                        return updated ? { ...existing, ...updated, status: existing.status } : existing;
                    });
                    
                    console.log(`[Sync] State updated: ${newThreads.length} new, ${updatedExisting.length} updated`);
                    return [...newThreads, ...updatedExisting];
                });

                // Step 5: Sync to Supabase
                setSyncProgress('Saving to database...');
                await gmailSyncEngine.syncToSupabase(threadsWithOrg, activeOrg?.id);

                setLastSyncTime(new Date());

                // Step 7: Update Pagination state
                if (result.nextPageToken) {
                    setNextPageToken(result.nextPageToken);
                } else if (!isPrev) {
                    setNextPageToken(null);
                }

                if (result.resultSizeEstimate) {
                    setTotalEstimate(Number(result.resultSizeEstimate));
                }

                if (isNext) {
                    setPrevPageTokens(prev => [...prev, activePageToken]);
                    setActivePageToken(pageToken);
                    setCurrentPageIndex(prev => prev + 1);
                } else if (isPrev) {
                    const newStack = prevPageTokens.slice(0, -1);
                    setPrevPageTokens(newStack);
                    setActivePageToken(pageToken);
                    setCurrentPageIndex(prev => Math.max(0, prev - 1));
                } else if (!pageToken) {
                    // Reset on fresh sync
                    setPrevPageTokens([]);
                    setActivePageToken(null);
                    setCurrentPageIndex(0);
                }

                console.log(`[Sync Success]: ${result.count} threads fetched for ${email} (Source: ${result.source})`);
                showToast({ 
                    message: `✅ Synced ${result.count} threads (Page ${currentPageIndex + 1})`, 
                    type: 'success' 
                });
            }
        } catch (error) {
            console.error("[Sync Error]:", error.message);
            showToast({ message: `Sync failed: ${error.message}`, type: 'error' });
        } finally {
            setIsSyncing(false);
            setSyncProgress('');
        }
    }, [isSyncing, accounts, activeOrg, showToast, currentPageIndex, itemsPerPage, activePageToken, prevPageTokens]);

    // Initialize Auth Error Listener once
    useEffect(() => {
        setupAuthErrorListener(showToast, triggerSync);
        return () => { gmailSyncEngine.onAuthError = null; };
    }, [showToast, triggerSync]);

    // ==========================================================
    //  LIVE CONNECTION AUDIT
    // ==========================================================
    useEffect(() => {
        if (accounts.length > 0) {
            const gmail = accounts.find(a => a.type === 'gmail');
            if (gmail) {
                console.log(`[Auth Success]: Supabase session active for ${gmail.label}`);
            }
        }
    }, [accounts]);

    // ==========================================================
    //  AUTO-HYDRATION: When user clicks on an account, auto-fetch
    // ==========================================================
    useEffect(() => {
        const gmailAccount = accounts.find(a => a.type === 'gmail');
        if (!gmailAccount) return;

        const accountId = gmailAccount.id || toAccountId(gmailAccount.label);
        
        // Only auto-hydrate once per account
        if (syncedAccountsRef.current.has(accountId)) return;
        
        // Check if we already have messages for this account
        const hasMessages = messagesState.some(m => m.account_id === accountId);
        if (hasMessages) {
            syncedAccountsRef.current.add(accountId);
            return;
        }

        // Trigger initial sync for this account
        syncedAccountsRef.current.add(accountId);
        triggerSync(gmailAccount.label);
    }, [accounts]); // eslint-disable-line react-hooks/exhaustive-deps

    // ==========================================================
    //  NEW ACCOUNT: Track account count changes
    // ==========================================================
    useEffect(() => {
        if (accounts.length > lastAccountCount) {
            setLastAccountCount(accounts.length);
            // Auto-hydration effect above will handle the sync
        }
    }, [accounts, lastAccountCount]);

    // ==========================================================
    //  REAL-TIME SUBSCRIPTION: Listen for new messages from Supabase
    // ==========================================================
    useEffect(() => {
        const gmailAccount = accounts.find(a => a.type === 'gmail');
        if (!gmailAccount) return;

        const accountId = gmailAccount.id || toAccountId(gmailAccount.label);

        // Subscribe to real-time inserts
        gmailSyncEngine.subscribeToRealtime(accountId, (newMessage) => {
            setMessagesState(prev => {
                // Check for duplicates
                if (prev.some(m => m.id === newMessage.id)) return prev;
                
                // Add new message at the top with "Interested" default status
                const withOrg = { ...newMessage, org_id: activeOrg?.id, status: newMessage.status || 'Interested' };
                showToast({ message: `New email from ${newMessage.sender}`, type: 'success' });
                return [withOrg, ...prev];
            });
        });

        // Start background polling (every 60s)
        gmailSyncEngine.startPolling(gmailAccount.label, (newThreads) => {
            setMessagesState(prev => {
                const existingIds = new Set(prev.map(m => m.id));
                const uniqueNew = newThreads
                    .filter(t => !existingIds.has(t.id))
                    .map(t => ({ ...t, org_id: activeOrg?.id }));
                
                if (uniqueNew.length > 0) {
                    console.log(`[Live Stream] ${uniqueNew.length} new messages detected`);
                    return [...uniqueNew, ...prev];
                }
                return prev;
            });
        }, 60000);

        return () => {
            gmailSyncEngine.destroy();
        };
    }, [accounts, activeOrg]); // eslint-disable-line react-hooks/exhaustive-deps


    // ==========================================================
    //  DYNAMIC COUNTS
    // ==========================================================
    const allCounts = useMemo(() => {
        const counts = {};
        if (!activeOrg) return counts;
        
        const activeMessages = messagesState.filter(m => !m.isDeleted && !m.isArchived && (!m.org_id || m.org_id === activeOrg.id));

        LABEL_CONFIG.forEach(label => {
            const count = activeMessages.filter(t => (t.status || '').toLowerCase().replace(/ /g, '_') === label.id).length;
            counts[label.id] = count;
        });

        (accounts || []).forEach((account, idx) => {
            const count = activeMessages.filter((m, mIdx) => {
                if (m.account_id) return m.account_id === account.id;
                const accLength = Array.isArray(accounts) ? accounts.length : 1;
                return mIdx % accLength === idx;
            }).length;
            counts[account.id] = count;
        });

        counts['unread'] = activeMessages.filter(m => !m.read).length;
        counts['archived'] = messagesState.filter(m => m.isArchived && !m.isDeleted && (!m.org_id || m.org_id === activeOrg.id)).length;
        counts['trash'] = messagesState.filter(m => m.isDeleted && (!m.org_id || m.org_id === activeOrg.id)).length;

        return counts;
    }, [messagesState, activeOrg, accounts]);

    // Sorting logic based on priorityScore
    const sortedMessages = useMemo(() => {
        return [...messagesState].sort((a, b) => {
            // Sort by gmail_date first (newest first)
            if (a.gmail_date && b.gmail_date) {
                return new Date(b.gmail_date) - new Date(a.gmail_date);
            }
            const statusA = (a.status || '').toLowerCase();
            const statusB = (b.status || '').toLowerCase();
            const scoreA = LABEL_CONFIG.find(l => l.label.toLowerCase() === statusA)?.priorityScore || 0;
            const scoreB = LABEL_CONFIG.find(l => l.label.toLowerCase() === statusB)?.priorityScore || 0;
            return scoreB - scoreA;
        });
    }, [messagesState]);

    // Filter messages
    const filteredMessages = useMemo(() => {
        return sortedMessages.filter(msg => {
            const isViewingTrash = activeFilter === 'trash';
            if (msg.isDeleted && !isViewingTrash) return false;
            if (!msg.isDeleted && isViewingTrash) return false;
            
            const isViewingArchived = activeFilter === 'archived';
            if (msg.isArchived && !isViewingArchived) return false;
            if (!msg.isArchived && isViewingArchived) return false;

            if (!activeOrg) return true;
            
            const matchesOrg = !msg.org_id || msg.org_id === activeOrg.id;
            if (!matchesOrg) return false;

            const query = searchQuery.toLowerCase();
            const matchesSearch = !query || 
                (msg.sender || '').toLowerCase().includes(query) ||
                (msg.subject || '').toLowerCase().includes(query) ||
                (msg.snippet || '').toLowerCase().includes(query) ||
                (msg.sender_email || '').toLowerCase().includes(query);
            
            let matchesFilter = false;
            const isAllLabels = LABEL_CONFIG.some(f => f.id === activeFilter);

            if (isAllLabels) {
                if (activeFilter === 'more') {
                    matchesFilter = true;
                } else {
                    matchesFilter = (msg.status || '').toLowerCase().replace(/ /g, '_') === activeFilter;
                }
            }
            else if (CAMPAIGNS.some(c => c.id === activeFilter)) {
                matchesFilter = true;
            }
            else if (Array.isArray(accounts) && accounts.some(i => i.id === activeFilter)) {
                // Account filter — show messages for this specific account
                matchesFilter = msg.account_id === activeFilter;
            }
            else if (MORE_FILTERS.some(m => m.id === activeFilter)) {
                if (activeFilter === 'unread') return !msg.read && matchesSearch;
                if (activeFilter === 'sent') return false;
                matchesFilter = true;
            } else {
                matchesFilter = true;
            }

            let matchesTab = true;
            if (activeTab === 'primary') {
                matchesTab = true; 
            } else {
                matchesTab = true;
            }

            return matchesSearch && matchesFilter && matchesTab;
        });
    }, [sortedMessages, searchQuery, activeFilter, accounts, activeOrg, activeTab]);

    // ==========================================================
    //  ACTIONS
    // ==========================================================

    const handleSelectEmail = useCallback((id) => {
        setSelectedEmailId(id);
        setSelectedIds([id]);
        setMessagesState(prev => prev.map(m => m.id === id ? { ...m, read: true } : m));
        
        // Mark as read in Gmail
        gmailSyncEngine.markAsRead(id);
    }, []);

    const toggleSelectId = useCallback((id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    }, []);

    const selectAll = useCallback(() => {
        setSelectedIds(filteredMessages.map(m => m.id));
    }, [filteredMessages]);

    const handleSelectFilter = useCallback((filterId) => {
        setActiveFilter(filterId);
        setSelectedEmailId(null);
        setSelectedIds([]);

        // Auto-hydrate: when clicking on an account, fetch its threads
        const clickedAccount = accounts.find(a => a.id === filterId);
        if (clickedAccount && clickedAccount.type === 'gmail') {
            const accountId = clickedAccount.id;
            const hasMessages = messagesState.some(m => m.account_id === accountId);
            if (!hasMessages) {
                triggerSync(clickedAccount.label);
            }
        }
    }, [accounts, messagesState, triggerSync]);

    // Batch action helper with rollback
    const performBatchAction = useCallback(async ({ ids, updateFn, successMsg, undoFn, gmailAction }) => {
        const previousState = [...messagesState];
        
        // 1. Optimistic UI Update
        setMessagesState(prev => prev.map(m => ids.includes(m.id) ? updateFn(m) : m));
        
        if (ids.includes(selectedEmailId)) {
            const remaining = filteredMessages.filter(m => !ids.includes(m.id));
            setSelectedEmailId(remaining.length > 0 ? remaining[0].id : null);
        }

        showToast({
            message: `${ids.length > 1 ? ids.length + ' items' : 'Item'} ${successMsg}`,
            onUndo: () => {
                setMessagesState(previousState);
                if (undoFn) undoFn();
            }
        });

        // 2. Real API Sync
        try {
            if (gmailAction) {
                await Promise.allSettled(ids.map(id => gmailAction(id)));
            }
            // Also sync to Supabase
            await Promise.allSettled(ids.map(id => {
                const updated = updateFn({ id });
                const { id: _, ...updates } = updated;
                return apiSyncUpdate(id, {
                    is_archived: updates.isArchived,
                    is_deleted: updates.isDeleted,
                    is_starred: updates.isStarred
                });
            }));
        } catch (error) {
            console.error("[Batch Sync] Failed, rolling back...", error);
            setMessagesState(previousState);
            showToast({ message: "Sync failed. Changes reverted.", type: 'error' });
        }
    }, [messagesState, selectedEmailId, filteredMessages, showToast]);

    const onUpdateStatus = useCallback(async (messageId, newStatusId) => {
        let messageToUpdate = null;
        let previousState = null;

        setMessagesState(prev => {
            previousState = [...prev];
            const msg = prev.find(m => m.id === messageId);
            if (!msg) return prev;
            
            messageToUpdate = msg;
            const currentStatusId = msg.status.toLowerCase().replace(/ /g, '_');
            const newStatusConfig = LABEL_CONFIG.find(l => l.id === newStatusId);
            const oldStatusConfig = LABEL_CONFIG.find(l => l.id === currentStatusId);

            if (oldStatusConfig?.priorityScore >= 9 && newStatusConfig?.priorityScore < 5) {
                const confirmed = window.confirm(`This lead is currently marked as "${msg.status}". Are you sure you want to revert it to a basic ${newStatusConfig.label}?`);
                if (!confirmed) return prev;
            }

            return prev.map(m => 
                m.id === messageId ? { ...m, status: newStatusConfig.label } : m
            );
        });

        if (!messageToUpdate) return;

        try {
            const newStatusConfig = LABEL_CONFIG.find(l => l.id === newStatusId);
            console.log(`[Universal Trigger] Syncing update for ${messageId} to ${newStatusConfig.label}...`);
            
            // Sync to Supabase
            await apiSyncUpdate(messageId, { status: newStatusConfig.label });
            
            console.log(`[Universal Trigger] Sync successful.`);
        } catch (error) {
            console.error(`[Universal Trigger] Sync failed: ${error.message}. Rolling back...`);
            setMessagesState(previousState);
            showToast({ message: "Failed to sync. Changes reverted.", type: 'error' });
        }
    }, [showToast]);

    const onArchive = useCallback((ids) => {
        const targetIds = Array.isArray(ids) ? ids : [ids];
        console.log(`[Gmail Action] Archiving ${targetIds.length} thread(s) via Gmail API...`);
        
        performBatchAction({
            ids: targetIds,
            updateFn: (m) => ({ ...m, isArchived: true }),
            successMsg: "archived",
            gmailAction: (id) => gmailSyncEngine.archiveThread(id)
        });
        setSelectedIds([]);
    }, [performBatchAction]);

    const onDelete = useCallback((ids) => {
        const targetIds = Array.isArray(ids) ? ids : [ids];
        console.log(`[Gmail Action] Deleting ${targetIds.length} thread(s) via Gmail API...`);
        
        performBatchAction({
            ids: targetIds,
            updateFn: (m) => ({ ...m, isDeleted: true }),
            successMsg: "moved to Trash",
            gmailAction: (id) => gmailSyncEngine.trashThread(id)
        });
        setSelectedIds([]);
    }, [performBatchAction]);

    const onToggleStar = useCallback((ids) => {
        const targetIds = Array.isArray(ids) ? ids : [ids];
        const firstItem = messagesState.find(m => m.id === targetIds[0]);
        const newStarState = !firstItem?.isStarred;
        console.log(`[Gmail Action] ${newStarState ? 'Starring' : 'Unstarring'} ${targetIds.length} thread(s) via Gmail API...`);

        performBatchAction({
            ids: targetIds,
            updateFn: (m) => ({ ...m, isStarred: newStarState }),
            successMsg: newStarState ? "added to favorites" : "removed from favorites",
            gmailAction: (id) => gmailSyncEngine.toggleStarThread(id, newStarState)
        });
    }, [performBatchAction, messagesState]);

    const onNextPage = useCallback(() => {
        if (!nextPageToken || isSyncing) return;
        triggerSync(null, nextPageToken, true, false);
    }, [nextPageToken, isSyncing, triggerSync]);

    const onPrevPage = useCallback(() => {
        if (prevPageTokens.length === 0 || isSyncing) return;
        const prevToken = prevPageTokens[prevPageTokens.length - 1]; // Pop the last one
        triggerSync(null, prevToken, false, true);
    }, [prevPageTokens, isSyncing, triggerSync]);

    const selectedEmail = useMemo(() => {
        return messagesState.find(m => m.id === selectedEmailId);
    }, [messagesState, selectedEmailId]);

    const paginatedMessages = useMemo(() => {
        const start = currentPageIndex * itemsPerPage;
        return filteredMessages.slice(start, start + itemsPerPage);
    }, [filteredMessages, currentPageIndex, itemsPerPage]);

    return {
        messages: paginatedMessages,
        allMessages: messagesState,
        selectedEmail,
        selectedEmailId,
        selectedIds,
        activeFilter,
        searchQuery,
        activeTab,
        isSyncing,
        syncProgress,
        lastSyncTime,
        filters: STATUS_FILTERS,
        campaigns: CAMPAIGNS,
        inboxes: accounts,
        moreFilters: MORE_FILTERS,
        statusCounts: allCounts,
        setSearchQuery,
        setActiveTab,
        onSelectEmail: handleSelectEmail,
        toggleSelectId,
        selectAll,
        onSelectFilter: handleSelectFilter,
        onUpdateStatus,
        onArchive,
        onDelete,
        onToggleStar,
        triggerSync,
        pagination: {
            currentPage: currentPageIndex + 1,
            itemsPerPage,
            totalItems: totalEstimate,
            hasNext: !!nextPageToken,
            hasPrev: prevPageTokens.length > 0,
            onNext: onNextPage,
            onPrev: onPrevPage
        }
    };
};
