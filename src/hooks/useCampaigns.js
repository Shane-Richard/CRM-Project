import { useState, useMemo, useCallback } from 'react';

// ── Mock campaign data (replace with Supabase later) ──────────────────────
const MOCK_CAMPAIGNS = [
    {
        id: 'c1',
        name: 'Q1 SaaS Outreach',
        status: 'active',
        leads: 248,
        sent: 186,
        opens: 112,
        replies: 34,
        bounced: 8,
        openRate: 60,
        replyRate: 18,
        clickRate: 24,
        bounceRate: 4,
        createdAt: '2026-02-01',
        lastActivity: '2 hours ago',
        tags: ['SaaS', 'Cold Outreach'],
        sequence: [
            { id: 's1', step: 1, type: 'email', subject: 'Quick question about {{company}}', delay: 0, sends: 186, opens: 112, replies: 34 },
            { id: 's2', step: 2, type: 'email', subject: 'Following up — {{first_name}}', delay: 3, sends: 152, opens: 89, replies: 21 },
            { id: 's3', step: 3, type: 'email', subject: 'Last touch — value prop', delay: 7, sends: 98, opens: 44, replies: 11 },
        ],
        dailySends: [12, 24, 18, 31, 22, 28, 19, 15, 26, 33, 20, 17, 29, 24],
    },
    {
        id: 'c2',
        name: 'E-commerce Decision Makers',
        status: 'paused',
        leads: 532,
        sent: 445,
        opens: 201,
        replies: 67,
        bounced: 22,
        openRate: 45,
        replyRate: 15,
        clickRate: 18,
        bounceRate: 5,
        createdAt: '2026-01-20',
        lastActivity: '1 day ago',
        tags: ['E-commerce', 'Enterprise'],
        sequence: [
            { id: 's4', step: 1, type: 'email', subject: 'Helping {{company}} increase conversions', delay: 0, sends: 445, opens: 201, replies: 67 },
            { id: 's5', step: 2, type: 'email', subject: 'Case study for {{industry}}', delay: 4, sends: 378, opens: 143, replies: 45 },
        ],
        dailySends: [34, 28, 41, 39, 52, 44, 37, 48, 56, 43, 38, 51, 46, 39],
    },
    {
        id: 'c3',
        name: 'Agency Partnership Drive',
        status: 'completed',
        leads: 89,
        sent: 89,
        opens: 71,
        replies: 28,
        bounced: 3,
        openRate: 80,
        replyRate: 31,
        clickRate: 42,
        bounceRate: 3,
        createdAt: '2026-01-05',
        lastActivity: '5 days ago',
        tags: ['Agency', 'Partnership'],
        sequence: [
            { id: 's6', step: 1, type: 'email', subject: 'Partnership opportunity — {{company}}', delay: 0, sends: 89, opens: 71, replies: 28 },
            { id: 's7', step: 2, type: 'email', subject: 'Resources for {{first_name}}\'s agency', delay: 5, sends: 61, opens: 51, replies: 18 },
        ],
        dailySends: [8, 12, 9, 14, 11, 15, 10, 9, 7, 8, 6, 0, 0, 0],
    },
    {
        id: 'c4',
        name: 'Product Launch Nurture',
        status: 'draft',
        leads: 0,
        sent: 0,
        opens: 0,
        replies: 0,
        bounced: 0,
        openRate: 0,
        replyRate: 0,
        clickRate: 0,
        bounceRate: 0,
        createdAt: '2026-02-25',
        lastActivity: 'Just now',
        tags: ['Product', 'Nurture'],
        sequence: [
            { id: 's8', step: 1, type: 'email', subject: 'Introducing our new feature', delay: 0, sends: 0, opens: 0, replies: 0 },
        ],
        dailySends: [],
    },
];

const STATUS_OPTIONS = ['active', 'paused', 'completed', 'draft'];

export const useCampaigns = () => {
    const [campaigns, setCampaigns] = useState(MOCK_CAMPAIGNS);
    const [selectedId, setSelectedId]  = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreate, setShowCreate] = useState(false);

    const selectedCampaign = useMemo(
        () => campaigns.find(c => c.id === selectedId) || null,
        [campaigns, selectedId]
    );

    const filteredCampaigns = useMemo(() => {
        let list = [...campaigns];
        if (filterStatus !== 'all') list = list.filter(c => c.status === filterStatus);
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter(c =>
                c.name.toLowerCase().includes(q) ||
                c.tags.some(t => t.toLowerCase().includes(q))
            );
        }
        return list;
    }, [campaigns, filterStatus, searchQuery]);

    // Aggregate stats
    const stats = useMemo(() => ({
        total:       campaigns.length,
        active:      campaigns.filter(c => c.status === 'active').length,
        totalLeads:  campaigns.reduce((s, c) => s + c.leads, 0),
        totalSent:   campaigns.reduce((s, c) => s + c.sent, 0),
        totalReplies:campaigns.reduce((s, c) => s + c.replies, 0),
        avgOpenRate: campaigns.length
            ? Math.round(campaigns.reduce((s, c) => s + c.openRate, 0) / campaigns.length)
            : 0,
        avgReplyRate: campaigns.length
            ? Math.round(campaigns.reduce((s, c) => s + c.replyRate, 0) / campaigns.length)
            : 0,
    }), [campaigns]);

    // CRUD
    const createCampaign = useCallback((data) => {
        const newC = {
            id: `c${Date.now()}`,
            status: 'draft',
            leads: 0, sent: 0, opens: 0, replies: 0, bounced: 0,
            openRate: 0, replyRate: 0, clickRate: 0, bounceRate: 0,
            createdAt: new Date().toISOString().split('T')[0],
            lastActivity: 'Just now',
            dailySends: [],
            sequence: [{ id: `s${Date.now()}`, step: 1, type: 'email', subject: data.subjectLine || 'Step 1', delay: 0, sends: 0, opens: 0, replies: 0 }],
            ...data,
        };
        setCampaigns(prev => [newC, ...prev]);
        setSelectedId(newC.id);
        setShowCreate(false);
    }, []);

    const updateStatus = useCallback((id, status) => {
        setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    }, []);

    const deleteCampaign = useCallback((id) => {
        setCampaigns(prev => prev.filter(c => c.id !== id));
        if (selectedId === id) setSelectedId(null);
    }, [selectedId]);

    return {
        campaigns: filteredCampaigns,
        allCampaigns: campaigns,
        selectedCampaign,
        selectedId,
        setSelectedId,
        filterStatus,
        setFilterStatus,
        searchQuery,
        setSearchQuery,
        showCreate,
        setShowCreate,
        stats,
        createCampaign,
        updateStatus,
        deleteCampaign,
        STATUS_OPTIONS,
    };
};
