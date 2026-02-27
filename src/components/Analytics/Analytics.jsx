import React from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    LineChart, Line, AreaChart, Area, Cell, PieChart, Pie
} from 'recharts';
import { 
    TrendingUp, TrendingDown, Mail, MousePointer2, 
    MessageSquare, Target, Calendar, Download, 
    Filter, ChevronRight, BarChart2, PieChart as PieIcon
} from 'lucide-react';
import { useAnalytics } from '../../hooks/useAnalytics';

// ── KPI Card Component ───────────────────────────────────────────────────────
const KPICard = ({ label, value, change, status }) => (
    <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-all group">
        <p className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 mb-2">{label}</p>
        <div className="flex items-end justify-between">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h3>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black ${
                status === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
            }`}>
                {status === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {change}
            </div>
        </div>
    </div>
);

// ── Performance Header ────────────────────────────────────────────────────────
const AnalyticsHeader = ({ dateRange, onRangeChange }) => (
    <div className="flex items-center justify-between mb-8">
        <div>
            <h1 className="text-[28px] font-black text-slate-900 tracking-tight">Performance Analytics</h1>
            <p className="text-[13px] text-slate-400 font-medium">Track your outreach efficiency and conversion metrics.</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="flex bg-slate-100 p-1 rounded-2xl">
                {['7d', '30d', '90d', 'ytd'].map(range => (
                    <button
                        key={range}
                        onClick={() => onRangeChange(range)}
                        className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                            dateRange === range ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        {range}
                    </button>
                ))}
            </div>
            <button className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-900/10 active:scale-95">
                <Download className="w-3.5 h-3.5 text-primary" />
                Export CSV
            </button>
        </div>
    </div>
);

// ── Main Analytics Page ───────────────────────────────────────────────────────
const Analytics = () => {
    const { 
        dateRange, setDateRange, 
        kpis, volumeData, funnelData, campaignComparison 
    } = useAnalytics();

    return (
        <div className="flex-1 h-full overflow-y-auto bg-[#fcfdfe] custom-scrollbar">
            <div className="max-w-7xl mx-auto px-10 py-10">
                <AnalyticsHeader dateRange={dateRange} onRangeChange={setDateRange} />

                {/* KPI Grid */}
                <div className="grid grid-cols-4 gap-6 mb-8">
                    {kpis.map((kpi, idx) => (
                        <KPICard key={idx} {...kpi} />
                    ))}
                </div>

                {/* Main Charts Row */}
                <div className="grid grid-cols-3 gap-6 mb-8">
                    {/* Volume Chart */}
                    <div className="col-span-2 bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                                <div className="p-2 bg-slate-100 rounded-xl">
                                    <BarChart2 className="w-4 h-4 text-slate-600" />
                                </div>
                                Email Send Volume
                            </h3>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sent</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Opened</span>
                                </div>
                            </div>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={volumeData}>
                                    <defs>
                                        <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#b2f40e" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#b2f40e" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis 
                                        dataKey="date" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                                        dy={10}
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                                    />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', padding: '12px' }}
                                        itemStyle={{ color: '#fff', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}
                                        labelStyle={{ color: '#94a3b8', fontSize: '10px', marginBottom: '4px', fontWeight: 800 }}
                                    />
                                    <Area type="monotone" dataKey="sent" stroke="#b2f40e" strokeWidth={3} fillOpacity={1} fill="url(#colorSent)" />
                                    <Area type="monotone" dataKey="opened" stroke="#e2e8f0" strokeWidth={2} fill="transparent" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Funnel Chart */}
                    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm">
                        <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-3 mb-8">
                            <div className="p-2 bg-slate-100 rounded-xl">
                                <Target className="w-4 h-4 text-slate-600" />
                            </div>
                            Lead Pipeline
                        </h3>
                        <div className="space-y-4">
                            {funnelData.map((item, idx) => {
                                const max = funnelData[0].value;
                                const width = (item.value / max) * 100;
                                return (
                                    <div key={idx} className="group">
                                        <div className="flex items-center justify-between mb-1.5 px-1">
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.name}</span>
                                            <span className="text-[11px] font-black text-slate-900">{item.value.toLocaleString()}</span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full transition-all duration-1000 ease-out rounded-full"
                                                style={{ width: `${width}%`, backgroundColor: item.fill }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Campaigns Performance Table */}
                <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
                    <div className="px-8 py-7 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                        <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                            <div className="p-2 bg-white rounded-xl shadow-sm">
                                <Megaphone className="w-4 h-4 text-slate-600" />
                            </div>
                            Campaign Performance
                        </h3>
                        <button className="text-[11px] font-black text-primary hover:text-slate-900 flex items-center gap-1 uppercase tracking-widest transition-all">
                            View all campaigns <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Campaign Name</th>
                                <th className="px-8 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Audience</th>
                                <th className="px-8 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Sent</th>
                                <th className="px-8 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Opens</th>
                                <th className="px-8 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Replies</th>
                                <th className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Reply Rate</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {campaignComparison.map((camp) => (
                                <tr key={camp.id} className="group hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-primary" />
                                            <span className="text-[14px] font-black text-slate-900 group-hover:text-black transition-colors">{camp.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-center text-[13px] font-bold text-slate-600">{camp.leads}</td>
                                    <td className="px-8 py-5 text-center text-[13px] font-bold text-slate-600">{camp.sent}</td>
                                    <td className="px-8 py-5 text-center text-[13px] font-bold text-slate-600">{camp.opens}</td>
                                    <td className="px-8 py-5 text-center text-[13px] font-bold text-slate-600">{camp.replies}</td>
                                    <td className="px-8 py-5 text-right">
                                        <span className="inline-block px-3 py-1 bg-primary text-black text-[11px] font-black rounded-lg">
                                            {camp.rate}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
