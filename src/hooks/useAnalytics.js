import { useState, useMemo } from 'react';

/**
 * Hook for managing CRM analytics data.
 * Initially uses mock data, designed for Supabase integration.
 */
export const useAnalytics = () => {
    const [dateRange, setDateRange] = useState('7d'); // '7d', '30d', '90d', 'ytd'
    const isLoading = false;

    // Mock KPI Data
    const kpis = useMemo(() => [
        { label: 'Total Sent',   value: '12,840', change: '+12%', status: 'up' },
        { label: 'Open Rate',    value: '24.8%',  change: '+2.4%', status: 'up' },
        { label: 'Reply Rate',   value: '8.3%',   change: '-0.5%', status: 'down' },
        { label: 'Conversion',   value: '3.1%',   change: '+0.8%', status: 'up' },
    ], []);

    // Mock Chart Data - Volume (Sent vs Opened)
    const volumeData = useMemo(() => [
        { date: 'Mon', sent: 400, opened: 240, replies: 24 },
        { date: 'Tue', sent: 300, opened: 139, replies: 18 },
        { date: 'Wed', sent: 200, opened: 980, replies: 29 },
        { date: 'Thu', sent: 278, opened: 390, replies: 20 },
        { date: 'Fri', sent: 189, opened: 480, replies: 12 },
        { date: 'Sat', sent: 239, opened: 380, replies: 15 },
        { date: 'Sun', sent: 349, opened: 430, replies: 22 },
    ], []);

    // Mock Funnel Data
    const funnelData = useMemo(() => [
        { name: 'Total Leads', value: 1200, fill: '#f1f5f9' },
        { name: 'Contacted',   value: 800,  fill: '#e2e8f0' },
        { name: 'Interested',  value: 450,  fill: '#cbd5e1' },
        { name: 'Replied',     value: 200,  fill: '#94a3b8' },
        { name: 'Booked',      value: 85,   fill: '#475569' },
        { name: 'Closed',      value: 32,   fill: '#b2f40e' },
    ], []);

    // Mock Campaign Performance Data
    const campaignComparison = useMemo(() => [
        { id: 1, name: 'Cold Outreach Q1', leads: 500, sent: 480, opens: 142, replies: 42, rate: '8.4%' },
        { id: 2, name: 'Product Update',   leads: 1200,sent: 1198,opens: 480, replies: 12, rate: '1.0%' },
        { id: 3, name: 'Follow-up Sequence',leads: 150, sent: 150, opens: 89,  replies: 28, rate: '18.6%' },
        { id: 4, name: 'Webinar Invite',   leads: 800, sent: 740, opens: 210, replies: 15, rate: '2.0%' },
    ], []);

    return {
        dateRange,
        setDateRange,
        isLoading,
        kpis,
        volumeData,
        funnelData,
        campaignComparison
    };
};
