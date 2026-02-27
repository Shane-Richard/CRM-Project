import React from 'react';
import {
    AreaChart, Area, LineChart, Line, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
    Mail, Eye, MessageSquare, AlertCircle, XCircle, MessagesSquare,
    TrendingUp, TrendingDown, Download, Target, Megaphone,
    ChevronRight, ChevronUp, ChevronDown, BarChart2, Percent, Users
} from 'lucide-react';
import { useAnalytics } from '../../hooks/useAnalytics';

// ─────────────────────────────────────────────────────────────────────────────
// Icon map for KPI cards
// ─────────────────────────────────────────────────────────────────────────────
const KPI_ICONS = {
    mail:    Mail,
    eye:     Eye,
    message: MessageSquare,
    alert:   AlertCircle,
    x:       XCircle,
    chat:    MessagesSquare,
};

// ─────────────────────────────────────────────────────────────────────────────
// KPI Card
// ─────────────────────────────────────────────────────────────────────────────
const KPICard = ({ label, value, change, status, icon }) => {
    // eslint-disable-next-line no-unused-vars
    const Icon = KPI_ICONS[icon] || Mail;
    const isUp = status === 'up';
    return (
        <div className="p-5 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300 group cursor-default">
            <div className="flex items-center justify-between mb-4">
                <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-slate-900 transition-colors duration-300">
                    <Icon className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors duration-300" />
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black ${
                    isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
                }`}>
                    {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {change}
                </div>
            </div>
            <p className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 mb-1">{label}</p>
            <h3 className="text-[22px] font-black text-slate-900 tracking-tight leading-none">{value}</h3>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Chart Card wrapper
// ─────────────────────────────────────────────────────────────────────────────
const ChartCard = ({ title, icon: Icon, children, className = '', legend }) => (
    <div className={`bg-white border border-slate-100 rounded-[2rem] p-7 shadow-sm ${className}`}>
        <div className="flex items-center justify-between mb-6">
            <h3 className="text-[12px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-3">
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                    <Icon className="w-3.5 h-3.5 text-slate-500" />
                </div>
                {title}
            </h3>
            {legend && (
                <div className="flex items-center gap-4">
                    {legend.map(l => (
                        <div key={l.label} className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{l.label}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
        {children}
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Shared Recharts tooltip style
// ─────────────────────────────────────────────────────────────────────────────
const tooltipStyle = {
    contentStyle: { backgroundColor: '#0f172a', border: 'none', borderRadius: '14px', padding: '10px 14px', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' },
    itemStyle:    { color: '#fff', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' },
    labelStyle:   { color: '#94a3b8', fontSize: '10px', marginBottom: '4px', fontWeight: 800 },
    cursor:       { stroke: '#f1f5f9', strokeWidth: 1.5 },
};

// ─────────────────────────────────────────────────────────────────────────────
// Volume Area Chart
// ─────────────────────────────────────────────────────────────────────────────
const VolumeChart = ({ data }) => (
    <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data}>
            <defs>
                <linearGradient id="gradSent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#b2f40e" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#b2f40e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradOpened" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#64748b" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#64748b" stopOpacity={0} />
                </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
            <Tooltip {...tooltipStyle} />
            <Area type="monotone" dataKey="sent"   name="Sent"   stroke="#b2f40e" strokeWidth={2.5} fillOpacity={1} fill="url(#gradSent)" dot={false} activeDot={{ r: 5, fill: '#b2f40e', strokeWidth: 0 }} />
            <Area type="monotone" dataKey="opened" name="Opened" stroke="#94a3b8" strokeWidth={2}   fillOpacity={1} fill="url(#gradOpened)" dot={false} activeDot={{ r: 4, fill: '#94a3b8', strokeWidth: 0 }} />
        </AreaChart>
    </ResponsiveContainer>
);

// ─────────────────────────────────────────────────────────────────────────────
// Open Rate Trend Line Chart
// ─────────────────────────────────────────────────────────────────────────────
const OpenRateChart = ({ data }) => (
    <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} unit="%" domain={[0, 40]} />
            <Tooltip {...tooltipStyle} formatter={(v) => [`${v}%`]} />
            <Line type="monotone" dataKey="openRate"  name="Open Rate"  stroke="#b2f40e" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#b2f40e', strokeWidth: 0 }} />
            <Line type="monotone" dataKey="replyRate" name="Reply Rate" stroke="#a78bfa" strokeWidth={2}   dot={false} activeDot={{ r: 4, fill: '#a78bfa', strokeWidth: 0 }} />
        </LineChart>
    </ResponsiveContainer>
);

// ─────────────────────────────────────────────────────────────────────────────
// Reply Volume Bar Chart
// ─────────────────────────────────────────────────────────────────────────────
const ReplyBarChart = ({ data }) => (
    <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} barSize={10}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} dy={8} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} />
            <Tooltip {...tooltipStyle} />
            <Bar dataKey="replies" name="Replies" fill="#b2f40e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="bounced" name="Bounced" fill="#fca5a5" radius={[4, 4, 0, 0]} />
        </BarChart>
    </ResponsiveContainer>
);

// ─────────────────────────────────────────────────────────────────────────────
// Funnel Pipeline
// ─────────────────────────────────────────────────────────────────────────────
const PipelineFunnel = ({ data }) => (
    <div className="space-y-3">
        {data.map((item, idx) => {
            const max = data[0].value;
            const width = (item.value / max) * 100;
            const isFinal = idx === data.length - 1;
            return (
                <div key={idx}>
                    <div className="flex items-center justify-between mb-1.5 px-0.5">
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest w-20">
                                {item.name}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">
                                {item.pct}%
                            </span>
                        </div>
                        <span className={`text-[12px] font-black ${isFinal ? 'text-primary' : 'text-slate-800'}`}>
                            {item.value.toLocaleString()}
                        </span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-50 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${width}%`, backgroundColor: isFinal ? '#b2f40e' : item.fill }}
                        />
                    </div>
                </div>
            );
        })}
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Campaign Performance Table
// ─────────────────────────────────────────────────────────────────────────────
const STATUS_DOT = {
    active:    'bg-emerald-500',
    paused:    'bg-amber-400',
    completed: 'bg-blue-500',
    draft:     'bg-slate-300',
};

const SortIcon = ({ col, sortKey, sortDir }) => {
    if (sortKey !== col) return <ChevronDown className="w-3 h-3 text-slate-200 ml-1 inline" />;
    return sortDir === 'desc'
        ? <ChevronDown className="w-3 h-3 text-primary ml-1 inline" />
        : <ChevronUp className="w-3 h-3 text-primary ml-1 inline" />;
};

const CampaignTable = ({ campaigns, sortKey, sortDir, onSort }) => (
    <div className="overflow-hidden">
        <table className="w-full">
            <thead>
                <tr className="bg-slate-50/60 border-b border-slate-100">
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Campaign</th>
                    {[
                        { key: 'leads',     label: 'Audience' },
                        { key: 'sent',      label: 'Sent' },
                        { key: 'opens',     label: 'Opens' },
                        { key: 'openRate',  label: 'Open %' },
                        { key: 'replies',   label: 'Replies' },
                        { key: 'replyRate', label: 'Reply %' },
                        { key: 'bounced',   label: 'Bounced' },
                    ].map(col => (
                        <th
                            key={col.key}
                            onClick={() => onSort(col.key)}
                            className="px-4 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-slate-700 transition-colors select-none"
                        >
                            {col.label}
                            <SortIcon col={col.key} sortKey={sortKey} sortDir={sortDir} />
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
                {campaigns.map((camp) => (
                    <tr key={camp.id} className="group hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOT[camp.status] || 'bg-slate-300'}`} />
                                <span className="text-[13px] font-black text-slate-900 group-hover:text-black transition-colors">{camp.name}</span>
                            </div>
                        </td>
                        <td className="px-4 py-4 text-center text-[12px] font-bold text-slate-500">{camp.leads.toLocaleString()}</td>
                        <td className="px-4 py-4 text-center text-[12px] font-bold text-slate-500">{camp.sent.toLocaleString()}</td>
                        <td className="px-4 py-4 text-center text-[12px] font-bold text-slate-500">{camp.opens.toLocaleString()}</td>
                        <td className="px-4 py-4 text-center">
                            <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-black ${
                                camp.openRate > 30 ? 'bg-emerald-50 text-emerald-700' :
                                camp.openRate > 15 ? 'bg-blue-50 text-blue-700' :
                                'bg-slate-50 text-slate-500'
                            }`}>
                                {camp.openRate > 0 ? `${camp.openRate}%` : '—'}
                            </span>
                        </td>
                        <td className="px-4 py-4 text-center text-[12px] font-bold text-slate-500">{camp.replies}</td>
                        <td className="px-4 py-4 text-center">
                            <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-black ${
                                camp.replyRate > 10 ? 'bg-primary text-black' :
                                camp.replyRate > 5  ? 'bg-violet-50 text-violet-700' :
                                'bg-slate-50 text-slate-500'
                            }`}>
                                {camp.replyRate > 0 ? `${camp.replyRate}%` : '—'}
                            </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                            <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-black ${
                                camp.bounced > 10 ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-400'
                            }`}>
                                {camp.bounced}
                            </span>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main Analytics Page
// ─────────────────────────────────────────────────────────────────────────────
const Analytics = () => {
    const {
        dateRange, setDateRange,
        kpis, volumeData, openRateData, funnelData, campaignComparison,
        sortKey, sortDir, handleSort,
        exportCSV,
    } = useAnalytics();

    const RANGES = [
        { id: '7d', label: 'Last 7d' },
        { id: '30d', label: 'Last 30d' },
        { id: '90d', label: 'Last 90d' },
        { id: 'ytd', label: 'Year to Date' },
    ];

    return (
        <div className="flex-1 h-full overflow-y-auto bg-[#fcfdfe] custom-scrollbar">
            <div className="max-w-[1400px] mx-auto px-8 py-8">

                {/* ── Page Header ── */}
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <h1 className="text-[26px] font-black text-slate-900 tracking-tight leading-none">Performance Analytics</h1>
                        <p className="text-[13px] text-slate-400 font-medium mt-1">Track outreach efficiency, lead conversion, and campaign effectiveness.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Date Range Picker */}
                        <div className="flex bg-slate-100 p-1 rounded-2xl">
                            {RANGES.map(r => (
                                <button
                                    key={r.id}
                                    onClick={() => setDateRange(r.id)}
                                    className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all whitespace-nowrap ${
                                        dateRange === r.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-700'
                                    }`}
                                >
                                    {r.label}
                                </button>
                            ))}
                        </div>
                        {/* Export CSV Button */}
                        <button
                            onClick={exportCSV}
                            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-900/10 active:scale-95"
                        >
                            <Download className="w-3.5 h-3.5 text-primary" />
                            Export CSV
                        </button>
                    </div>
                </div>

                {/* ── KPI Grid (6 cards, 3 col on md, 6 on xl) ── */}
                <div className="grid grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
                    {kpis.map((kpi, idx) => (
                        <KPICard key={idx} {...kpi} />
                    ))}
                </div>

                {/* ── Row 1: Volume Chart (2/3) + Pipeline (1/3) ── */}
                <div className="grid grid-cols-3 gap-6 mb-6">
                    <ChartCard
                        title="Email Send Volume"
                        icon={BarChart2}
                        className="col-span-2"
                        legend={[
                            { label: 'Sent', color: '#b2f40e' },
                            { label: 'Opened', color: '#94a3b8' },
                        ]}
                    >
                        <VolumeChart data={volumeData} />
                    </ChartCard>

                    <ChartCard title="Lead Pipeline Funnel" icon={Target}>
                        <PipelineFunnel data={funnelData} />
                    </ChartCard>
                </div>

                {/* ── Row 2: Open Rate Trend (2/3) + Reply / Bounced Bar (1/3) ── */}
                <div className="grid grid-cols-3 gap-6 mb-6">
                    <ChartCard
                        title="Open & Reply Rate Trend"
                        icon={Percent}
                        className="col-span-2"
                        legend={[
                            { label: 'Open Rate', color: '#b2f40e' },
                            { label: 'Reply Rate', color: '#a78bfa' },
                        ]}
                    >
                        <OpenRateChart data={openRateData} />
                    </ChartCard>

                    <ChartCard
                        title="Replies & Bounces"
                        icon={MessageSquare}
                        legend={[
                            { label: 'Replies', color: '#b2f40e' },
                            { label: 'Bounced', color: '#fca5a5' },
                        ]}
                    >
                        <ReplyBarChart data={volumeData} />
                    </ChartCard>
                </div>

                {/* ── Campaign Performance Table ── */}
                <div className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm">
                    <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/40">
                        <h3 className="text-[12px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-3">
                            <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100">
                                <Megaphone className="w-3.5 h-3.5 text-slate-500" />
                            </div>
                            Campaign Performance Breakdown
                        </h3>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                {campaignComparison.length} campaigns
                            </span>
                            <button className="text-[11px] font-black text-primary hover:text-slate-900 flex items-center gap-1 uppercase tracking-widest transition-all">
                                View all <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                    <CampaignTable
                        campaigns={campaignComparison}
                        sortKey={sortKey}
                        sortDir={sortDir}
                        onSort={handleSort}
                    />
                </div>

            </div>
        </div>
    );
};

export default Analytics;
