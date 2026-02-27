import React from 'react';
import {
    Plus, Search, Megaphone,
    TrendingUp, Users, Mail, MessageSquare,
    Zap, Play, Pause, CheckCircle, FileEdit
} from 'lucide-react';
import { useCampaigns } from '../../hooks/useCampaigns';
import { CampaignCard } from './CampaignCard';
import CampaignDetail from './CampaignDetail';
import CreateCampaignModal from './CreateCampaignModal';

// Aggregate stat card (top bar)
const TopStat = ({ icon: Icon, label, value, accent = false }) => (
    <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl border flex-1 min-w-[130px] ${
        accent ? 'bg-primary/5 border-primary/20' : 'bg-white border-slate-100'
    }`}>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
            accent ? 'bg-primary/10' : 'bg-slate-50'
        }`}>
            <Icon className={`w-4.5 h-4.5 ${accent ? 'text-slate-800' : 'text-slate-500'}`} />
        </div>
        <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
            <p className="text-[18px] font-black text-slate-900 leading-tight">{value}</p>
        </div>
    </div>
);

const STATUS_FILTERS = [
    { id: 'all',       label: 'All',       Icon: Zap },
    { id: 'active',    label: 'Active',    Icon: Play },
    { id: 'paused',    label: 'Paused',    Icon: Pause },
    { id: 'completed', label: 'Completed', Icon: CheckCircle },
    { id: 'draft',     label: 'Draft',     Icon: FileEdit },
];

const Campaigns = () => {
    const {
        campaigns,
        stats,
        selectedId,
        selectedCampaign,
        setSelectedId,
        filterStatus,
        setFilterStatus,
        searchQuery,
        setSearchQuery,
        showCreate,
        setShowCreate,
        createCampaign,
        updateStatus,
        deleteCampaign,
    } = useCampaigns();

    return (
        <div className="flex flex-col h-full bg-[#f8f9fb] overflow-hidden">

            {/* ── Top Header ── */}
            <div className="flex-shrink-0 bg-white border-b border-slate-100 px-8 pt-8 pb-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center">
                            <Megaphone className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-[22px] font-black text-slate-900 leading-none tracking-tight">Campaigns</h1>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Email outreach sequences</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowCreate(true)}
                        className="flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-2xl text-[12px] font-black hover:bg-black transition-all shadow-lg shadow-slate-900/20 hover:-translate-y-0.5 active:translate-y-0"
                    >
                        <Plus className="w-4 h-4 text-primary" />
                        New Campaign
                    </button>
                </div>

                {/* Aggregate Stats Row */}
                <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
                    <TopStat icon={Megaphone}      label="Total"       value={stats.total}        accent />
                    <TopStat icon={Play}           label="Active"      value={stats.active} />
                    <TopStat icon={Users}          label="Total Leads" value={stats.totalLeads} />
                    <TopStat icon={Mail}           label="Sent"        value={stats.totalSent} />
                    <TopStat icon={MessageSquare}  label="Replies"     value={stats.totalReplies} />
                    <TopStat icon={TrendingUp}     label="Avg Open"    value={`${stats.avgOpenRate}%`} />
                </div>
            </div>

            {/* ── Main Two-Column Layout ── */}
            <div className="flex flex-1 min-h-0 overflow-hidden">

                {/* Left — Campaign List */}
                <div className="w-[380px] flex-shrink-0 flex flex-col border-r border-slate-100 bg-[#f8f9fb] overflow-hidden">

                    {/* Search + Filter */}
                    <div className="px-5 py-4 border-b border-slate-100 bg-white space-y-3">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search campaigns..."
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[12px] font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:bg-white transition-all"
                            />
                        </div>
                        {/* Status filter tabs */}
                        <div className="flex gap-1 overflow-x-auto">
                            {STATUS_FILTERS.map(f => (
                                <button
                                    key={f.id}
                                    onClick={() => setFilterStatus(f.id)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex-shrink-0 transition-all ${
                                        filterStatus === f.id
                                            ? 'bg-slate-900 text-primary shadow-sm'
                                            : 'bg-slate-100 text-slate-400 hover:text-slate-700'
                                    }`}
                                >
                                    <f.Icon className="w-3 h-3" />
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {campaigns.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                                <div className="w-16 h-16 rounded-[1.5rem] bg-white border border-slate-100 flex items-center justify-center mb-4 rotate-6 shadow-sm">
                                    <Megaphone className="w-7 h-7 text-slate-200" />
                                </div>
                                <p className="text-[13px] font-black text-slate-500 mb-1">No campaigns found</p>
                                <p className="text-[11px] text-slate-400 font-medium">Try a different filter or create one</p>
                                <button
                                    onClick={() => setShowCreate(true)}
                                    className="mt-4 text-[11px] font-black text-primary hover:underline"
                                >
                                    + New Campaign
                                </button>
                            </div>
                        ) : (
                            campaigns.map(c => (
                                <CampaignCard
                                    key={c.id}
                                    campaign={c}
                                    isSelected={c.id === selectedId}
                                    onClick={() => setSelectedId(c.id === selectedId ? null : c.id)}
                                    onStatusChange={(status) => updateStatus(c.id, status)}
                                    onDelete={() => deleteCampaign(c.id)}
                                />
                            ))
                        )}
                    </div>

                    {/* Count footer */}
                    <div className="px-5 py-3 border-t border-slate-100 bg-white">
                        <p className="text-[11px] font-bold text-slate-400">
                            {campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''}
                            {filterStatus !== 'all' && ` · ${filterStatus}`}
                        </p>
                    </div>
                </div>

                {/* Right — Campaign Detail */}
                <div className="flex-1 bg-[#f8f9fb] overflow-hidden">
                    <CampaignDetail
                        campaign={selectedCampaign}
                        onStatusChange={updateStatus}
                        onDelete={deleteCampaign}
                    />
                </div>
            </div>

            {/* Create Campaign Modal */}
            {showCreate && (
                <CreateCampaignModal
                    onClose={() => setShowCreate(false)}
                    onCreate={createCampaign}
                />
            )}
        </div>
    );
};

export default Campaigns;
