/**
 * useDashboard.js
 * Central data hook for the Dashboard page.
 * Aggregates data from Supabase: messages, contacts, campaigns
 * Computes KPIs, funnel data, and activity feed.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import supabase from '../services/supabaseClient';
import { LABEL_CONFIG } from '../config/labelConfig';

const REFRESH_INTERVAL_MS = 60000; // Auto-refresh every 60 seconds

export const useDashboard = () => {
    const [messages, setMessages] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [lastRefresh, setLastRefresh] = useState(null);
    const [error, setError] = useState(null);

    // ─── Core Fetch ──────────────────────────────────────────────────────────
    const fetchAll = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [msgRes, contRes, campRes] = await Promise.all([
                supabase
                    .from('messages')
                    .select('id, status, is_read, is_archived, is_deleted, gmail_date, sender, sender_email, subject, snippet, account_email')
                    .order('gmail_date', { ascending: false })
                    .limit(500),

                supabase
                    .from('contacts')
                    .select('id, name, email, company, status, created_at')
                    .order('created_at', { ascending: false })
                    .limit(500),

                supabase
                    .from('campaigns')
                    .select('id, name, status, leads_count, sent_count, opened_count, replied_count, created_at')
                    .order('created_at', { ascending: false })
                    .limit(10),
            ]);

            setMessages(msgRes.data || []);
            setContacts(contRes.data || []);
            setCampaigns(campRes.data || []);
            setLastRefresh(new Date());
        } catch (err) {
            console.error('[Dashboard] Fetch error:', err.message);
            setError(err.message);
            // Use empty arrays — UI shows empty state gracefully
        } finally {
            setIsLoading(false);
        }
    }, []);

    // ─── Auto-Refresh ─────────────────────────────────────────────────────────
    useEffect(() => {
        fetchAll();
        const interval = setInterval(fetchAll, REFRESH_INTERVAL_MS);
        return () => clearInterval(interval);
    }, [fetchAll]);

    // ─── KPI Computations ────────────────────────────────────────────────────
    const kpis = useMemo(() => {
        const activeMessages = messages.filter(m => !m.is_archived && !m.is_deleted);
        const totalMessages = activeMessages.length;
        const unreadCount = activeMessages.filter(m => !m.is_read).length;

        // NEW contacts added in last 7 days
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const newLeads = contacts.filter(c => new Date(c.created_at) > sevenDaysAgo).length;

        // Open Rate across all campaigns
        const totalSent = campaigns.reduce((s, c) => s + (c.sent_count || 0), 0);
        const totalOpened = campaigns.reduce((s, c) => s + (c.opened_count || 0), 0);
        const totalReplied = campaigns.reduce((s, c) => s + (c.replied_count || 0), 0);
        const openRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0;
        const replyRate = totalSent > 0 ? ((totalReplied / totalSent) * 100).toFixed(1) : 0;

        return {
            totalEmails: totalMessages,
            unreadCount,
            newLeads,
            openRate,
            replyRate: parseFloat(replyRate),
            emailsSentThisWeek: totalSent,
        };
    }, [messages, contacts, campaigns]);

    // ─── Funnel Data (Lead Pipeline) ─────────────────────────────────────────
    const funnelData = useMemo(() => {
        // Use contacts table for CRM pipeline stages
        const statusOrder = [
            { id: 'lead', label: 'Lead', color: '#facc15' },
            { id: 'interested', label: 'Interested', color: '#a855f7' },
            { id: 'meeting_booked', label: 'Meeting Booked', color: '#3b82f6' },
            { id: 'meeting_completed', label: 'Meeting Done', color: '#22c55e' },
            { id: 'won', label: 'Won', color: '#b2f40e' },
        ];

        // Aggregate from messages (real-time statuses)
        const messageCounts = {};
        messages.filter(m => !m.is_deleted && !m.is_archived).forEach(m => {
            const key = (m.status || '').toLowerCase().replace(/\s+/g, '_');
            messageCounts[key] = (messageCounts[key] || 0) + 1;
        });

        return statusOrder.map(stage => ({
            ...stage,
            value: messageCounts[stage.id] || 0,
        }));
    }, [messages]);

    // ─── Email Volume Chart (Last 7 Days) ────────────────────────────────────
    const emailVolumeData = useMemo(() => {
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const dayStart = new Date(date); dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(date); dayEnd.setHours(23, 59, 59, 999);

            const dayMessages = messages.filter(m => {
                const msgDate = new Date(m.gmail_date);
                return msgDate >= dayStart && msgDate <= dayEnd;
            });

            last7Days.push({
                day: dateStr,
                received: dayMessages.length,
                unread: dayMessages.filter(m => !m.is_read).length,
            });
        }
        return last7Days;
    }, [messages]);

    // ─── Recent Conversations (last 5) ───────────────────────────────────────
    const recentConversations = useMemo(() => {
        return messages
            .filter(m => !m.is_deleted && !m.is_archived)
            .slice(0, 8)
            .map(m => ({
                id: m.id,
                sender: m.sender || 'Unknown',
                senderEmail: m.sender_email,
                subject: m.subject || '(No Subject)',
                snippet: m.snippet,
                status: m.status,
                isRead: m.is_read,
                time: m.gmail_date
                    ? new Date(m.gmail_date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                    : '',
            }));
    }, [messages]);

    // ─── Status Distribution (for donut / bar chart) ─────────────────────────
    const statusDistribution = useMemo(() => {
        const counts = {};
        LABEL_CONFIG.forEach(l => { counts[l.id] = 0; });
        messages.filter(m => !m.is_deleted && !m.is_archived).forEach(m => {
            const key = (m.status || '').toLowerCase().replace(/\s+/g, '_');
            if (counts[key] !== undefined) counts[key]++;
        });

        return LABEL_CONFIG.map(l => ({
            name: l.label,
            value: counts[l.id] || 0,
            color: l.color,
        })).filter(d => d.value > 0);
    }, [messages]);

    // ─── Top Campaigns ────────────────────────────────────────────────────────
    const topCampaigns = useMemo(() => {
        return campaigns.slice(0, 3).map(c => ({
            id: c.id,
            name: c.name,
            status: c.status,
            leads: c.leads_count || 0,
            sent: c.sent_count || 0,
            openRate: c.sent_count > 0 ? Math.round((c.opened_count / c.sent_count) * 100) : 0,
            replyRate: c.sent_count > 0 ? Math.round((c.replied_count / c.sent_count) * 100) : 0,
        }));
    }, [campaigns]);

    return {
        isLoading,
        error,
        lastRefresh,
        refresh: fetchAll,
        kpis,
        funnelData,
        emailVolumeData,
        recentConversations,
        statusDistribution,
        topCampaigns,
        totalContacts: contacts.length,
    };
};
