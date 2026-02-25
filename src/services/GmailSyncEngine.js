/**
 * GmailSyncEngine.js
 * High-Performance Sync Engine for Gmail → Unibox
 * 
 * Architecture:
 * 1. Fetches real Gmail threads via REST API using provider_token
 * 2. Maps to universal app format (Single Source of Truth)
 * 3. Persists to Supabase messages table
 * 4. Supports real-time subscriptions for live updates
 * 5. Handles Gmail Webhooks (Push Notifications)
 */

import supabase from './supabaseClient';
import { normalizeEmail, toAccountId } from '../utils/normalizeEmail';

const GMAIL_API_BASE = 'https://www.googleapis.com/gmail/v1/users/me';

class GmailSyncEngine {
    constructor() {
        this.accessToken = null;
        this.syncInProgress = false;
        this.pollingInterval = null;
        this.realtimeChannel = null;
        this.onAuthError = null; // Callback for UI when re-auth is needed

        // Auto-restore token from localStorage on startup
        const storedToken = localStorage.getItem('gmail_access_token');
        if (storedToken) {
            this.accessToken = storedToken;
            console.log('[SyncEngine] ✅ Access token restored from localStorage');
        }
    }

    /**
     * Set the OAuth access token for Gmail API calls
     */
    setAccessToken(token) {
        this.accessToken = token;
        if (token) {
            localStorage.setItem('gmail_access_token', token);
        }
        console.log('[SyncEngine] Access token set:', token ? '✅' : '❌');
    }

    /**
     * Get stored access token from localStorage or Supabase session
     */
    getAccessToken() {
        if (this.accessToken) return this.accessToken;
        
        // Try from localStorage (saved during OAuth)
        const stored = localStorage.getItem('gmail_access_token');
        if (stored) {
            this.accessToken = stored;
            return stored;
        }
        return null;
    }

    /**
     * Re-authenticate: trigger a fresh OAuth prompt
     * Used when token is expired/invalid and we need a new one
     */
    async reAuthenticate() {
        return new Promise((resolve, reject) => {
            if (!window.google) {
                reject(new Error('Google SDK not loaded'));
                return;
            }

            const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
            if (!clientId) {
                reject(new Error('Missing VITE_GOOGLE_CLIENT_ID'));
                return;
            }

            console.log('[SyncEngine] 🔄 Requesting fresh OAuth token...');

            const client = window.google.accounts.oauth2.initTokenClient({
                client_id: clientId,
                scope: [
                    'https://www.googleapis.com/auth/gmail.modify',
                    'https://www.googleapis.com/auth/gmail.send',
                    'https://www.googleapis.com/auth/userinfo.email',
                    'https://www.googleapis.com/auth/userinfo.profile'
                ].join(' '),
                callback: (response) => {
                    if (response.access_token) {
                        this.setAccessToken(response.access_token);
                        console.log('[SyncEngine] ✅ Fresh token obtained');
                        resolve(response.access_token);
                    } else {
                        reject(new Error('OAuth failed — no token returned'));
                    }
                },
                error_callback: (err) => reject(err)
            });

            client.requestAccessToken();
        });
    }

    /**
     * Make an authenticated Gmail API request with retry logic for 403
     */
    async gmailFetch(endpoint, options = {}, retryCount = 0) {
        const MAX_RETRIES = 3;
        const token = this.getAccessToken();
        if (!token) {
            throw new Error('No access token available. Please re-authenticate.');
        }

        const url = `${GMAIL_API_BASE}${endpoint}`;
        const response = await fetch(url, {
            ...options,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                ...options.headers
            }
        });

        if (response.status === 401) {
            console.error('[SyncEngine] Token expired — clearing stored token');
            localStorage.removeItem('gmail_access_token');
            this.accessToken = null;
            if (this.onAuthError) this.onAuthError();
            throw new Error('Token expired (401). Please re-authenticate.');
        }

        // 403 Retry — Gmail API may need a few seconds after being enabled
        if (response.status === 403) {
            const errorData = await response.json().catch(() => ({}));
            const errorMsg = errorData.error?.message || response.statusText;
            
            if (retryCount < MAX_RETRIES) {
                const delay = Math.pow(2, retryCount + 1) * 1000; // 2s, 4s, 8s
                console.warn(`[SyncEngine] 403 Forbidden: "${errorMsg}" — Retry ${retryCount + 1}/${MAX_RETRIES} in ${delay / 1000}s...`);
                await new Promise(r => setTimeout(r, delay));
                return this.gmailFetch(endpoint, options, retryCount + 1);
            }
            throw new Error(`Gmail API Forbidden (403) after ${MAX_RETRIES} retries: ${errorMsg}`);
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Gmail API Error (${response.status}): ${errorData.error?.message || response.statusText}`);
        }

        return response.json();
    }

    /**
     * Get Gmail profile info (validates API connectivity)
     */
    async getProfile() {
        console.log('[SyncEngine] Checking Gmail profile...');
        try {
            const profile = await this.gmailFetch('/profile');
            console.log(`[SyncEngine] ✅ Profile verified: ${profile.emailAddress} (${profile.messagesTotal} messages)`);
            return profile;
        } catch (error) {
            console.warn('[SyncEngine] Profile check failed:', error.message);
            throw error;
        }
    }

    /**
     * CORE: Fetch latest Gmail threads
     * @param {number} maxResults - Number of threads to fetch (default 25)
     * @returns {Array} Mapped threads in universal format
     */
    async fetchThreads(accountEmail, maxResults = 25, pageToken = null, category = 'primary') {
        console.log(`[Sync]: Fetching live data for ${accountEmail}${pageToken ? ` (Page Token: ${pageToken})` : ''} [Category: ${category}]`);
        
        try {
            // Step 1: List thread IDs from Gmail
            let labelId = 'INBOX';
            if (category === 'social') labelId = 'CATEGORY_SOCIAL';
            else if (category === 'promotions') labelId = 'CATEGORY_PROMOTIONS';
            
            let url = `/threads?maxResults=${maxResults}&labelIds=${labelId}`;
            if (pageToken) url += `&pageToken=${pageToken}`;
            
            const threadList = await this.gmailFetch(url);
            
            if (!threadList.threads || threadList.threads.length === 0) {
                return { threads: [], nextPageToken: null, resultSizeEstimate: 0 };
            }

            // Step 2: Fetch full details from Gmail
            const threadDetails = await Promise.allSettled(
                threadList.threads.map(t => this.gmailFetch(`/threads/${t.id}?format=full`))
            );

            // Step 3: Map Gmail data
            const gmailThreads = threadDetails
                .filter(r => r.status === 'fulfilled')
                .map(r => this.mapGmailThread(r.value, accountEmail))
                .filter(Boolean);

            // Step 4: Merge with existing metadata from Supabase (PRESREVE CRM STATUS)
            const threadIds = gmailThreads.map(t => t.id);
            const { data: existingMetadata } = await supabase
                .from('messages')
                .select('id, status, is_archived, is_deleted, is_starred')
                .in('id', threadIds);

            const metadataMap = (existingMetadata || []).reduce((acc, curr) => {
                acc[curr.id] = curr;
                return acc;
            }, {});

            const finalThreads = gmailThreads.map(t => {
                const meta = metadataMap[t.id];
                if (meta) {
                    return {
                        ...t,
                        status: meta.status || t.status,
                        isArchived: meta.is_archived ?? t.isArchived,
                        isDeleted: meta.is_deleted ?? t.isDeleted,
                        isStarred: meta.is_starred ?? t.isStarred
                    };
                }
                return t;
            });

            console.log(`[Sync Success]: ${finalThreads.length} threads synced and merged with CRM metadata`);
            
            return {
                threads: finalThreads,
                nextPageToken: threadList.nextPageToken || null,
                resultSizeEstimate: threadList.resultSizeEstimate || 0
            };

        } catch (error) {
            console.error('[SyncEngine] Error in fetchThreads:', error.message);
            throw error;
        }
    }

    /**
     * Map a Gmail API thread to our universal message format
     */
    mapGmailThread(thread, accountEmail) {
        if (!thread || !thread.messages || thread.messages.length === 0) return null;

        const latestMessage = thread.messages[thread.messages.length - 1];
        const headers = latestMessage.payload?.headers || [];

        const getHeader = (name) => {
            const h = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
            return h ? h.value : '';
        };

        const fromRaw = getHeader('From');
        const senderMatch = fromRaw.match(/^(.+?)(?:\s*<(.+?)>)?$/);
        const senderName = senderMatch ? senderMatch[1].replace(/"/g, '').trim() : fromRaw;
        const senderEmail = senderMatch && senderMatch[2] ? senderMatch[2] : fromRaw;

        const toRaw = getHeader('To');
        const subject = getHeader('Subject') || '(No Subject)';

        // Extract body text
        const bodyData = this.extractBody(latestMessage.payload);

        // Extract attachments
        const attachments = this.extractAttachments(latestMessage.payload);

        // Determine read status
        const isUnread = latestMessage.labelIds?.includes('UNREAD') || false;
        const isStarred = latestMessage.labelIds?.includes('STARRED') || false;

        // Format timestamp
        const internalDate = new Date(parseInt(latestMessage.internalDate));
        const timeAgo = this.formatTimeAgo(internalDate);

        return {
            id: `gmail_${thread.id}`,
            thread_id: thread.id,
            gmail_message_id: latestMessage.id,
            account_id: toAccountId(accountEmail),
            account_email: normalizeEmail(accountEmail),
            sender: senderName,
            sender_email: normalizeEmail(senderEmail),
            recipient: toRaw,
            recipient_email: normalizeEmail(toRaw),
            subject: subject,
            snippet: thread.snippet || latestMessage.snippet || '',
            body_html: bodyData.html || '',
            body_text: bodyData.text || '',
            status: 'Interested', // Default CRM status for new emails
            labels: latestMessage.labelIds || [],
            read: !isUnread,
            isStarred: isStarred,
            isArchived: false,
            isDeleted: false,
            has_attachments: attachments.length > 0,
            attachments: attachments,
            org_id: null, // Will be set by useUnibox
            priorityScore: isUnread ? 8 : 5,
            timestamp: timeAgo,
            gmail_date: internalDate.toISOString(),
            date: internalDate.toLocaleDateString('en-US', { 
                month: 'short', day: 'numeric', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            }),
            messageCount: thread.messages.length,
            email: senderEmail // For backward compatibility
        };
    }

    /**
     * Recursively extract body from MIME parts
     */
    extractBody(payload) {
        let html = '';
        let text = '';

        if (!payload) return { html, text };

        // Direct body
        if (payload.body?.data) {
            const decoded = this.decodeBase64Url(payload.body.data);
            if (payload.mimeType === 'text/html') {
                html = decoded;
            } else if (payload.mimeType === 'text/plain') {
                text = decoded;
            }
        }

        // Nested parts
        if (payload.parts) {
            for (const part of payload.parts) {
                if (part.mimeType === 'text/html' && part.body?.data) {
                    html = this.decodeBase64Url(part.body.data);
                } else if (part.mimeType === 'text/plain' && part.body?.data) {
                    text = this.decodeBase64Url(part.body.data);
                } else if (part.parts) {
                    const nested = this.extractBody(part);
                    if (nested.html) html = nested.html;
                    if (nested.text) text = nested.text;
                }
            }
        }

        return { html, text };
    }

    /**
     * Extract attachments metadata from MIME parts
     */
    extractAttachments(payload) {
        const attachments = [];
        
        const extractFromParts = (parts) => {
            if (!parts) return;
            for (const part of parts) {
                if (part.filename && part.filename.length > 0) {
                    const ext = part.filename.split('.').pop()?.toUpperCase() || 'FILE';
                    attachments.push({
                        id: part.body?.attachmentId || '',
                        filename: part.filename,
                        mimeType: part.mimeType,
                        size: part.body?.size || 0,
                        sizeFormatted: this.formatFileSize(part.body?.size || 0),
                        extension: ext,
                        color: this.getExtColor(ext)
                    });
                }
                if (part.parts) extractFromParts(part.parts);
            }
        };

        extractFromParts(payload?.parts);
        return attachments;
    }

    /**
     * Decode base64url-encoded strings
     */
    decodeBase64Url(data) {
        try {
            const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
            return decodeURIComponent(
                atob(base64)
                    .split('')
                    .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
        } catch {
            return '';
        }
    }

    /**
     * Get color for file extension
     */
    getExtColor(ext) {
        const colors = {
            PDF: { bg: 'bg-red-100', text: 'text-red-500' },
            DOC: { bg: 'bg-blue-100', text: 'text-blue-500' },
            DOCX: { bg: 'bg-blue-100', text: 'text-blue-500' },
            XLS: { bg: 'bg-green-100', text: 'text-green-500' },
            XLSX: { bg: 'bg-green-100', text: 'text-green-500' },
            PNG: { bg: 'bg-purple-100', text: 'text-purple-500' },
            JPG: { bg: 'bg-purple-100', text: 'text-purple-500' },
            JPEG: { bg: 'bg-purple-100', text: 'text-purple-500' },
            ZIP: { bg: 'bg-amber-100', text: 'text-amber-500' },
        };
        return colors[ext] || { bg: 'bg-gray-100', text: 'text-gray-500' };
    }

    /**
     * Format file size
     */
    formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    }

    /**
     * Format time ago
     */
    formatTimeAgo(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    // =====================================================
    //  SUPABASE SYNC: Persist messages to database
    // =====================================================

    /**
     * Sync fetched threads to Supabase (upsert)
     */
    async syncToSupabase(threads, orgId) {
        if (!threads || threads.length === 0) return;

        const rows = threads.map(t => ({
            id: t.id,
            thread_id: t.thread_id,
            gmail_message_id: t.gmail_message_id,
            account_id: t.account_id,
            account_email: t.account_email,
            sender: t.sender,
            sender_email: t.sender_email,
            recipient: t.recipient,
            recipient_email: t.recipient_email,
            subject: t.subject,
            snippet: t.snippet,
            body_html: t.body_html,
            body_text: t.body_text,
            status: t.status,
            labels: t.labels,
            is_read: t.read,
            is_starred: t.isStarred || false,
            is_archived: t.isArchived || false,
            is_deleted: t.isDeleted || false,
            has_attachments: t.has_attachments,
            attachments: t.attachments,
            org_id: orgId,
            priority_score: t.priorityScore,
            gmail_date: t.gmail_date
        }));

        const { data, error } = await supabase
            .from('messages')
            .upsert(rows, { onConflict: 'id' });

        if (error) {
            console.error('[SyncEngine] Supabase sync failed:', error.message);
        } else {
            console.log(`[SyncEngine] ${rows.length} messages synced to Supabase ✅`);
        }
        
        return { data, error };
    }

    /**
     * Load cached messages from Supabase for an account
     */
    async loadFromSupabase(accountId) {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('account_id', accountId)
            .order('gmail_date', { ascending: false })
            .limit(50);

        if (error) {
            console.error('[SyncEngine] Supabase load failed:', error.message);
            return [];
        }

        // Map Supabase rows back to our app format
        return (data || []).map(row => ({
            ...row,
            read: row.is_read,
            isStarred: row.is_starred,
            isArchived: row.is_archived,
            isDeleted: row.is_deleted,
            timestamp: this.formatTimeAgo(new Date(row.gmail_date)),
            date: new Date(row.gmail_date).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            }),
            email: row.sender_email
        }));
    }

    // =====================================================
    //  GMAIL API ACTIONS: Archive, Delete, Star
    // =====================================================

    /**
     * Archive a thread in Gmail (remove INBOX label)
     */
    async archiveThread(threadId) {
        const realThreadId = threadId.replace('gmail_', '');
        
        // Skip demo thread IDs — they aren't real Gmail threads
        if (realThreadId.startsWith('demo_')) {
            console.log(`[Gmail Action] Skipping archive for demo thread: ${realThreadId}`);
            return { success: true, demo: true };
        }

        console.log(`[Gmail Action] Archiving thread ${realThreadId}...`);
        
        try {
            await this.gmailFetch(`/threads/${realThreadId}/modify`, {
                method: 'POST',
                body: JSON.stringify({
                    removeLabelIds: ['INBOX']
                })
            });
            
            // Also update Supabase
            await supabase
                .from('messages')
                .update({ is_archived: true, updated_at: new Date().toISOString() })
                .eq('thread_id', realThreadId);
                
            console.log(`[Gmail Action] Thread ${realThreadId} archived ✅`);
            return { success: true };
        } catch (error) {
            console.error(`[Gmail Action] Archive failed:`, error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Delete (Trash) a thread in Gmail
     */
    async trashThread(threadId) {
        const realThreadId = threadId.replace('gmail_', '');
        
        if (realThreadId.startsWith('demo_')) {
            console.log(`[Gmail Action] Skipping trash for demo thread: ${realThreadId}`);
            return { success: true, demo: true };
        }

        console.log(`[Gmail Action] Trashing thread ${realThreadId}...`);
        
        try {
            await this.gmailFetch(`/threads/${realThreadId}/trash`, {
                method: 'POST'
            });
            
            // Also update Supabase
            await supabase
                .from('messages')
                .update({ is_deleted: true, updated_at: new Date().toISOString() })
                .eq('thread_id', realThreadId);
                
            console.log(`[Gmail Action] Thread ${realThreadId} moved to trash ✅`);
            return { success: true };
        } catch (error) {
            console.error(`[Gmail Action] Trash failed:`, error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Star/Unstar a thread in Gmail
     */
    async toggleStarThread(threadId, star = true) {
        const realThreadId = threadId.replace('gmail_', '');
        
        if (realThreadId.startsWith('demo_')) {
            console.log(`[Gmail Action] Skipping star toggle for demo thread: ${realThreadId}`);
            return { success: true, demo: true };
        }

        console.log(`[Gmail Action] ${star ? 'Starring' : 'Unstarring'} thread ${realThreadId}...`);
        
        try {
            await this.gmailFetch(`/threads/${realThreadId}/modify`, {
                method: 'POST',
                body: JSON.stringify(
                    star 
                        ? { addLabelIds: ['STARRED'] }
                        : { removeLabelIds: ['STARRED'] }
                )
            });
            
            await supabase
                .from('messages')
                .update({ is_starred: star, updated_at: new Date().toISOString() })
                .eq('thread_id', realThreadId);
                
            console.log(`[Gmail Action] Thread ${realThreadId} ${star ? 'starred' : 'unstarred'} ✅`);
            return { success: true };
        } catch (error) {
            console.error(`[Gmail Action] Star toggle failed:`, error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Mark thread as read in Gmail
     */
    async markAsRead(threadId) {
        const realThreadId = threadId.replace('gmail_', '');
        
        if (realThreadId.startsWith('demo_')) {
            return { success: true, demo: true };
        }

        try {
            await this.gmailFetch(`/threads/${realThreadId}/modify`, {
                method: 'POST',
                body: JSON.stringify({
                    removeLabelIds: ['UNREAD']
                })
            });
            
            await supabase
                .from('messages')
                .update({ is_read: true, updated_at: new Date().toISOString() })
                .eq('thread_id', realThreadId);
                
            return { success: true };
        } catch (error) {
            console.error(`[Gmail Action] Mark read failed:`, error.message);
            return { success: false, error: error.message };
        }
    }

    // =====================================================
    //  REAL-TIME: Supabase Subscriptions + Polling
    // =====================================================

    /**
     * Subscribe to real-time message inserts from Supabase
     */
    subscribeToRealtime(accountId, onNewMessage) {
        if (this.realtimeChannel) {
            supabase.removeChannel(this.realtimeChannel);
        }

        this.realtimeChannel = supabase
            .channel('messages-realtime')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `account_id=eq.${accountId}`
                },
                (payload) => {
                    console.log('[Realtime] New message received:', payload.new?.subject);
                    if (onNewMessage) {
                        const mapped = {
                            ...payload.new,
                            read: payload.new.is_read,
                            isStarred: payload.new.is_starred,
                            isArchived: payload.new.is_archived,
                            isDeleted: payload.new.is_deleted,
                            timestamp: this.formatTimeAgo(new Date(payload.new.gmail_date)),
                            date: new Date(payload.new.gmail_date).toLocaleDateString('en-US', {
                                month: 'short', day: 'numeric', year: 'numeric'
                            }),
                            email: payload.new.sender_email
                        };
                        onNewMessage(mapped);
                    }
                }
            )
            .subscribe((status) => {
                console.log(`[Realtime] Subscription status: ${status}`);
            });

        return this.realtimeChannel;
    }

    /**
     * Start polling for new emails (fallback for webhooks)
     * Polls every 30 seconds
     */
    startPolling(accountEmail, onNewThreads, intervalMs = 30000) {
        this.stopPolling();
        
        console.log(`[SyncEngine] Starting polling every ${intervalMs / 1000}s for ${accountEmail}`);
        
        this.pollingInterval = setInterval(async () => {
            try {
                const threads = await this.fetchThreads(accountEmail, 5);
                if (threads && threads.length > 0 && onNewThreads) {
                    onNewThreads(threads);
                }
            } catch (error) {
                console.warn('[SyncEngine] Poll failed silently:', error.message);
            }
        }, intervalMs);
    }

    /**
     * Stop polling
     */
    stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
            console.log('[SyncEngine] Polling stopped');
        }
    }


    /**
     * Cleanup
     */
    destroy() {
        this.stopPolling();
        if (this.realtimeChannel) {
            supabase.removeChannel(this.realtimeChannel);
            this.realtimeChannel = null;
        }
    }
}

// Singleton
export const gmailSyncEngine = new GmailSyncEngine();
export default gmailSyncEngine;
