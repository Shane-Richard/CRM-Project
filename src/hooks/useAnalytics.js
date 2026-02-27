import { useState, useMemo, useCallback } from 'react';

// ── Seed data generators by range ─────────────────────────────────────────────
const generateVolumeData = (range) => {
    const configs = {
        '7d':  { days: 7,  labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] },
        '30d': { days: 30, labels: Array.from({ length: 30 }, (_, i) => `${i + 1}`) },
        '90d': { days: 12, labels: ['Jan W1','Jan W2','Jan W3','Jan W4','Feb W1','Feb W2','Feb W3','Feb W4','Mar W1','Mar W2','Mar W3','Mar W4'] },
        'ytd': { days: 12, labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'] },
    };
    const c = configs[range] || configs['7d'];
    return c.labels.map((date, i) => ({
        date,
        sent:    Math.round(200 + Math.sin(i * 0.8) * 120 + Math.random() * 80),
        opened:  Math.round(80  + Math.sin(i * 0.9) * 60  + Math.random() * 40),
        replies: Math.round(15  + Math.sin(i * 1.1) * 12  + Math.random() * 10),
        bounced: Math.round(5   + Math.random() * 8),
    }));
};

const generateOpenRateData = (range) => {
    const configs = {
        '7d':  ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
        '30d': Array.from({ length: 10 }, (_, i) => `Day ${i * 3 + 1}`),
        '90d': ['Jan W1','Jan W3','Feb W1','Feb W3','Mar W1','Mar W3'],
        'ytd': ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
    };
    const labels = configs[range] || configs['7d'];
    return labels.map((date, i) => ({
        date,
        openRate: +(18 + Math.sin(i * 0.7) * 8 + Math.random() * 5).toFixed(1),
        replyRate: +(5 + Math.sin(i * 0.9) * 3 + Math.random() * 2).toFixed(1),
    }));
};

const KPI_DATA = {
    '7d':  [
        { label: 'Total Sent',    value: '1,847',  change: '+12%',  status: 'up',   icon: 'mail' },
        { label: 'Open Rate',     value: '24.8%',  change: '+2.4%', status: 'up',   icon: 'eye' },
        { label: 'Reply Rate',    value: '8.3%',   change: '-0.5%', status: 'down', icon: 'message' },
        { label: 'Bounced',       value: '47',     change: '-3',    status: 'up',   icon: 'alert' },
        { label: 'Unsubscribed',  value: '12',     change: '+2',    status: 'down', icon: 'x' },
        { label: 'Conversations', value: '153',    change: '+18%',  status: 'up',   icon: 'chat' },
    ],
    '30d': [
        { label: 'Total Sent',    value: '12,840', change: '+8%',   status: 'up',   icon: 'mail' },
        { label: 'Open Rate',     value: '22.1%',  change: '+1.2%', status: 'up',   icon: 'eye' },
        { label: 'Reply Rate',    value: '7.9%',   change: '+0.3%', status: 'up',   icon: 'message' },
        { label: 'Bounced',       value: '219',    change: '-12',   status: 'up',   icon: 'alert' },
        { label: 'Unsubscribed',  value: '63',     change: '-5',    status: 'up',   icon: 'x' },
        { label: 'Conversations', value: '1,014',  change: '+22%',  status: 'up',   icon: 'chat' },
    ],
    '90d': [
        { label: 'Total Sent',    value: '48,200', change: '+21%',  status: 'up',   icon: 'mail' },
        { label: 'Open Rate',     value: '21.4%',  change: '+3.1%', status: 'up',   icon: 'eye' },
        { label: 'Reply Rate',    value: '7.2%',   change: '-1.1%', status: 'down', icon: 'message' },
        { label: 'Bounced',       value: '810',    change: '+40',   status: 'down', icon: 'alert' },
        { label: 'Unsubscribed',  value: '241',    change: '+18',   status: 'down', icon: 'x' },
        { label: 'Conversations', value: '3,470',  change: '+15%',  status: 'up',   icon: 'chat' },
    ],
    'ytd': [
        { label: 'Total Sent',    value: '189,440',change: '+34%',  status: 'up',   icon: 'mail' },
        { label: 'Open Rate',     value: '23.9%',  change: '+4.2%', status: 'up',   icon: 'eye' },
        { label: 'Reply Rate',    value: '8.8%',   change: '+2.0%', status: 'up',   icon: 'message' },
        { label: 'Bounced',       value: '2,901',  change: '-120',  status: 'up',   icon: 'alert' },
        { label: 'Unsubscribed',  value: '840',    change: '-62',   status: 'up',   icon: 'x' },
        { label: 'Conversations', value: '16,671', change: '+41%',  status: 'up',   icon: 'chat' },
    ],
};

const FUNNEL_DATA = [
    { name: 'Total Leads', value: 1200, fill: '#f1f5f9', pct: 100 },
    { name: 'Contacted',   value: 800,  fill: '#e2e8f0', pct: 67 },
    { name: 'Interested',  value: 450,  fill: '#cbd5e1', pct: 38 },
    { name: 'Replied',     value: 200,  fill: '#94a3b8', pct: 17 },
    { name: 'Booked',      value: 85,   fill: '#475569', pct: 7 },
    { name: 'Closed',      value: 32,   fill: '#b2f40e', pct: 3 },
];

const CAMPAIGN_DATA = [
    { id: 1, name: 'Cold Outreach Q1',    status: 'active',    leads: 500,  sent: 480,  opens: 142, replies: 42, bounced: 8,  openRate: 29.6, replyRate: 8.4 },
    { id: 2, name: 'Product Update',       status: 'completed', leads: 1200, sent: 1198, opens: 480, replies: 12, bounced: 14, openRate: 40.1, replyRate: 1.0 },
    { id: 3, name: 'Follow-up Sequence',   status: 'active',    leads: 150,  sent: 150,  opens: 89,  replies: 28, bounced: 2,  openRate: 59.3, replyRate: 18.6 },
    { id: 4, name: 'Webinar Invite',       status: 'paused',    leads: 800,  sent: 740,  opens: 210, replies: 15, bounced: 22, openRate: 28.4, replyRate: 2.0 },
    { id: 5, name: 'Re-engagement Blast',  status: 'draft',     leads: 2000, sent: 0,    opens: 0,   replies: 0,  bounced: 0,  openRate: 0,    replyRate: 0 },
];

/**
 * useAnalytics — Full Phase 6 analytics data hook.
 * Manages date range state, generates contextual mock data per range,
 * and provides CSV export functionality. Designed for Supabase wiring.
 */
export const useAnalytics = () => {
    const [dateRange, setDateRange] = useState('7d');
    const [sortKey, setSortKey] = useState('replyRate');
    const [sortDir, setSortDir] = useState('desc');

    // KPIs change by date range
    const kpis = useMemo(() => KPI_DATA[dateRange] || KPI_DATA['7d'], [dateRange]);

    // Volume chart data — regenerated per range
    const volumeData = useMemo(() => generateVolumeData(dateRange), [dateRange]);

    // Open/Reply rate trend data
    const openRateData = useMemo(() => generateOpenRateData(dateRange), [dateRange]);

    // Static funnel (would be live Supabase in prod)
    const funnelData = useMemo(() => FUNNEL_DATA, []);

    // Campaign table with sorting
    const campaignComparison = useMemo(() => {
        return [...CAMPAIGN_DATA].sort((a, b) => {
            const mul = sortDir === 'desc' ? -1 : 1;
            return (a[sortKey] - b[sortKey]) * mul;
        });
    }, [sortKey, sortDir]);

    const handleSort = useCallback((key) => {
        if (sortKey === key) {
            setSortDir(d => d === 'desc' ? 'asc' : 'desc');
        } else {
            setSortKey(key);
            setSortDir('desc');
        }
    }, [sortKey]);

    // CSV Export
    const exportCSV = useCallback(() => {
        const headers = ['Campaign', 'Leads', 'Sent', 'Opens', 'Open Rate %', 'Replies', 'Reply Rate %', 'Bounced'];
        const rows = CAMPAIGN_DATA.map(c => [
            c.name, c.leads, c.sent, c.opens, c.openRate, c.replies, c.replyRate, c.bounced
        ]);
        const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${dateRange}-${new Date().toISOString().slice(0,10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }, [dateRange]);

    return {
        dateRange, setDateRange,
        kpis,
        volumeData,
        openRateData,
        funnelData,
        campaignComparison,
        sortKey, sortDir, handleSort,
        exportCSV,
    };
};
