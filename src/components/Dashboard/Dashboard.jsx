/**
 * Dashboard.jsx
 * CRM Command Center — Phase 1 of Master Plan
 *
 * Layout:
 *  Row 1: Welcome + Refresh
 *  Row 2: 4 KPI Cards (Emails, Unread, Leads, Open Rate, Reply Rate)
 *  Row 3: Email Volume Chart | Pipeline Funnel
 *  Row 4: Recent Conversations | Campaign Summary
 */
import React, { useMemo } from 'react';
import {
    Mail, MailOpen, Users, BarChart2,
    MessageSquare, RefreshCw, Loader2, AlertCircle,
    TrendingUp
} from 'lucide-react';

import { useDashboard } from '../../hooks/useDashboard';
import KPICard from './KPICard';
import FunnelChart from './FunnelChart';
import EmailVolumeChart from './EmailVolumeChart';
import RecentConversations from './RecentConversations';
import CampaignSummaryCard from './CampaignSummaryCard';

// ─── Section container ───────────────────────────────────────────────────────
const Card = ({ title, subtitle, children, className = '', action = null }) => (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden ${className}`}>
        {(title || action) && (
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
                <div>
                    <h3 className="text-sm font-bold text-gray-800">{title}</h3>
                    {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
                </div>
                {action}
            </div>
        )}
        <div className="px-5 pb-5">{children}</div>
    </div>
);

// ─── Skeleton loader ──────────────────────────────────────────────────────────
const Skeleton = ({ className = '' }) => (
    <div className={`bg-gray-100 animate-pulse rounded-xl ${className}`} />
);

const DashboardSkeleton = () => (
    <div className="h-full overflow-y-auto px-6 py-6 space-y-6">
        <div className="flex items-center justify-between">
            <div>
                <Skeleton className="h-7 w-48 mb-2" />
                <Skeleton className="h-4 w-32" />
            </div>
        </div>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <Skeleton className="h-72" />
            <Skeleton className="h-72" />
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
        </div>
    </div>
);

// ─── Legend dot ──────────────────────────────────────────────────────────────
const LegendDot = ({ color, label }) => (
    <div className="flex items-center gap-1.5 text-xs text-gray-500">
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
        {label}
    </div>
);

// ─── Main Dashboard Component ─────────────────────────────────────────────────
const Dashboard = ({ navigate }) => {
    const {
        isLoading,
        error,
        lastRefresh,
        refresh,
        kpis,
        funnelData,
        emailVolumeData,
        recentConversations,
        topCampaigns,
        totalContacts,
    } = useDashboard();

    const lastRefreshLabel = useMemo(() => {
        if (!lastRefresh) return null;
        const diff = Math.floor((new Date() - lastRefresh) / 60000);
        if (diff < 1) return 'Just now';
        if (diff < 60) return `${diff}m ago`;
        return `${Math.floor(diff / 60)}h ago`;
    }, [lastRefresh]);

    const now = new Date();
    const hour = now.getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    if (isLoading) return <DashboardSkeleton />;

    return (
        <div className="h-full overflow-y-auto bg-gray-50/40" style={{ scrollbarWidth: 'thin', scrollbarColor: '#e5e7eb transparent' }}>
            <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-6">

                {/* ── Header ─────────────────────────────────────── */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            {greeting} 👋
                        </h2>
                        <p className="text-sm text-gray-400 mt-0.5">
                            Here's what's happening with your CRM today
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {lastRefreshLabel && (
                            <span className="text-xs text-gray-400">Last updated: {lastRefreshLabel}</span>
                        )}
                        <button
                            onClick={refresh}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* ── Error Banner ────────────────────────────────── */}
                {error && (
                    <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>Could not load live data — showing cached information. ({error})</span>
                    </div>
                )}

                {/* ── KPI Cards ───────────────────────────────────── */}
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                    <KPICard
                        label="Total Emails"
                        value={kpis.totalEmails}
                        icon={Mail}
                        iconBg="bg-primary/10"
                        iconColor="text-primary"
                        glowColor="rgba(178,244,14,0.15)"
                        trend="positive"
                        trendLabel="Live"
                    />
                    <KPICard
                        label="Unread"
                        value={kpis.unreadCount}
                        icon={MailOpen}
                        iconBg="bg-purple-50"
                        iconColor="text-purple-500"
                        glowColor="rgba(168,85,247,0.1)"
                        trend={kpis.unreadCount > 10 ? 'negative' : 'neutral'}
                        trendLabel={kpis.unreadCount > 0 ? `${kpis.unreadCount} new` : 'All read'}
                    />
                    <KPICard
                        label="Total Contacts"
                        value={totalContacts}
                        icon={Users}
                        iconBg="bg-blue-50"
                        iconColor="text-blue-500"
                        glowColor="rgba(59,130,246,0.1)"
                        trend="positive"
                        trendLabel={`+${kpis.newLeads} this week`}
                    />
                    <KPICard
                        label="Open Rate"
                        value={kpis.openRate}
                        suffix="%"
                        icon={TrendingUp}
                        iconBg="bg-green-50"
                        iconColor="text-green-500"
                        glowColor="rgba(34,197,94,0.1)"
                        trend={kpis.openRate > 20 ? 'positive' : kpis.openRate > 10 ? 'neutral' : 'negative'}
                        trendLabel={`${kpis.replyRate}% reply`}
                    />
                </div>

                {/* ── Charts Row ──────────────────────────────────── */}
                <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">

                    {/* Email Volume (3/5 width) */}
                    <Card
                        className="xl:col-span-3"
                        title="Email Volume"
                        subtitle="Received & unread emails over the last 7 days"
                        action={
                            <div className="flex items-center gap-3">
                                <LegendDot color="#b2f40e" label="Received" />
                                <LegendDot color="#a855f7" label="Unread" />
                            </div>
                        }
                    >
                        <EmailVolumeChart data={emailVolumeData} />
                    </Card>

                    {/* Pipeline Funnel (2/5 width) */}
                    <Card
                        className="xl:col-span-2"
                        title="Lead Pipeline"
                        subtitle="Conversations by CRM status"
                    >
                        <FunnelChart data={funnelData} />
                    </Card>
                </div>

                {/* ── Bottom Row ──────────────────────────────────── */}
                <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 pb-6">

                    {/* Recent Conversations (3/5) */}
                    <Card
                        className="xl:col-span-3"
                        title="Recent Conversations"
                        subtitle="Latest emails from your inbox"
                        action={
                            <button
                                className="text-xs text-primary font-semibold hover:underline"
                                onClick={() => navigate && navigate('Inboxes')}
                            >
                                Open Inbox
                            </button>
                        }
                    >
                        <RecentConversations
                            conversations={recentConversations}
                            onNavigateToInbox={() => navigate && navigate('Inboxes')}
                        />
                    </Card>

                    {/* Campaigns (2/5) */}
                    <Card
                        className="xl:col-span-2"
                        title="Top Campaigns"
                        subtitle="Performance overview"
                        action={
                            <button
                                className="text-xs text-primary font-semibold hover:underline"
                                onClick={() => navigate && navigate('Campaigns')}
                            >
                                View all
                            </button>
                        }
                    >
                        <CampaignSummaryCard
                            campaigns={topCampaigns}
                            onNavigateToCampaigns={() => navigate && navigate('Campaigns')}
                        />
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
