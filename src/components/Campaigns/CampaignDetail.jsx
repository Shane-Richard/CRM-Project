import React, { useState, useMemo } from 'react';
import {
    Play, Pause, Trash2, Mail, Users, TrendingUp,
    MessageSquare, Target, Zap, Clock, BarChart2,
    CheckCircle, FileEdit, Search, ChevronRight,
    MapPin, Globe, Layout, List
} from 'lucide-react';
import { STATUS_CONFIG, RingChart } from './CampaignCard';
import { useLeads } from '../../hooks/useLeads';

// Bar chart for daily sends
const DailyBarChart = ({ data = [] }) => {
    const max = Math.max(...data, 1);
    return (
        <div className="flex items-end gap-1 h-16">
            {data.map((v, i) => (
                <div
                    key={i}
                    className="flex-1 rounded-t-sm transition-all duration-500 hover:opacity-80"
                    style={{
                        height: `${Math.max((v / max) * 100, 4)}%`,
                        background: i === data.length - 1 ? '#b2f40e' : '#e2e8f0',
                    }}
                    title={`${v} sends`}
                />
            ))}
        </div>
    );
};

// Sequence Step Row
const SequenceStep = ({ step, isLast }) => (
    <div className="flex gap-4">
        {/* Timeline */}
        <div className="flex flex-col items-center flex-shrink-0">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-primary flex items-center justify-center text-[11px] font-black">
                {step.step}
            </div>
            {!isLast && <div className="w-px flex-1 bg-slate-100 mt-2 mb-0" />}
        </div>

        {/* Content */}
        <div className="flex-1 pb-5">
            <div className="flex items-start justify-between mb-2">
                <div>
                    <p className="text-[13px] font-bold text-slate-900">{step.subject || 'Untitled Step'}</p>
                    {step.delay > 0 && (
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Sent after {step.delay} days of no reply
                        </p>
                    )}
                    {step.delay === 0 && (
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">First touchpoint</p>
                    )}
                </div>
                <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-2 py-1 rounded-lg uppercase tracking-wider flex-shrink-0 ml-3">Email</span>
            </div>

            {/* Step micro-stats */}
            <div className="flex gap-4">
                <div className="text-center">
                    <p className="text-[13px] font-black text-slate-900">{step.sends}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Sent</p>
                </div>
                <div className="text-center">
                    <p className="text-[13px] font-black text-slate-900">{step.sends > 0 ? Math.round((step.opens / step.sends) * 100) : 0}%</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Open</p>
                </div>
                <div className="text-center">
                    <p className="text-[13px] font-black text-slate-900">{step.sends > 0 ? Math.round((step.replies / step.sends) * 100) : 0}%</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Reply</p>
                </div>
            </div>
        </div>
    </div>
);

// eslint-disable-next-line no-unused-vars
const MetricCard = ({ icon: Icon, label, value, sub, color = 'slate', ring, ringColor }) => {
    const colors = {
        slate:   { bg: 'bg-slate-50',   border: 'border-slate-100',  text: 'text-slate-600' },
        green:   { bg: 'bg-emerald-50', border: 'border-emerald-100',text: 'text-emerald-700' },
        blue:    { bg: 'bg-blue-50',    border: 'border-blue-100',    text: 'text-blue-700' },
        violet:  { bg: 'bg-violet-50',  border: 'border-violet-100', text: 'text-violet-700' },
        amber:   { bg: 'bg-amber-50',   border: 'border-amber-100',  text: 'text-amber-700' },
    };
    const c = colors[color];
    return (
        <div className={`p-4 rounded-2xl border ${c.bg} ${c.border} flex items-center gap-4`}>
            {ring !== undefined ? (
                <div className="relative flex-shrink-0">
                    <RingChart value={ring} color={ringColor || '#b2f40e'} size={48} stroke={5} />
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-slate-700">{ring}%</span>
                </div>
            ) : (
                <div className={`w-10 h-10 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${c.text}`} />
                </div>
            )}
            <div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
                <p className="text-[20px] font-black text-slate-900 leading-tight">{value}</p>
                {sub && <p className="text-[10px] text-slate-400 font-medium">{sub}</p>}
            </div>
        </div>
    );
};

const CampaignDetail = ({ campaign, onStatusChange, onDelete }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const { leads: allLeads, isLoading: leadsLoading } = useLeads();

    // Mock filtering for campaign leads
    const campaignLeads = useMemo(() => {
        if (!campaign?.leadIds) return [];
        return allLeads.filter(l => campaign.leadIds.includes(l.id));
    }, [allLeads, campaign]);

    if (!campaign) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center px-8">
                <div className="w-20 h-20 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center justify-center mb-6 rotate-6">
                    <BarChart2 className="w-9 h-9 text-slate-200" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-2">Select a Campaign</h3>
                <p className="text-sm text-slate-400 font-medium max-w-xs">Click any campaign from the list to view detailed analytics, sequence steps, and performance metrics.</p>
            </div>
        );
    }

    const cfg = STATUS_CONFIG[campaign.status] || STATUS_CONFIG.draft;

    const tabs = [
        { id: 'overview', label: 'Performance', icon: Layout },
        { id: 'sequence', label: 'Sequence',    icon: List },
        { id: 'leads',    label: 'Leads',       icon: Users, count: campaign.leads },
    ];

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* ── Header ── */}
            <div className="flex-shrink-0 px-8 pt-8 pb-0 border-b border-slate-100 bg-white sticky top-0 z-10 transition-all">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                            <span className={`text-[10px] font-black uppercase tracking-widest ${cfg.color}`}>{cfg.label}</span>
                            {campaign.tags?.map(t => (
                                <span key={t} className="text-[9px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-lg uppercase tracking-wider">{t}</span>
                            ))}
                        </div>
                        <h2 className="text-[20px] font-black text-slate-900 tracking-tight">{campaign.name}</h2>
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5 flex items-center gap-1.5">
                            <Clock className="w-3 h-3" /> Last activity {campaign.lastActivity}
                        </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                        {campaign.status === 'active' ? (
                            <button
                                onClick={() => onStatusChange(campaign.id, 'paused')}
                                className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 border border-amber-200 rounded-xl text-[11px] font-black hover:bg-amber-100 transition-all"
                            >
                                <Pause className="w-3.5 h-3.5" /> Pause
                            </button>
                        ) : (campaign.status === 'paused' || campaign.status === 'draft') ? (
                            <button
                                onClick={() => onStatusChange(campaign.id, 'active')}
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-xl text-[11px] font-black hover:bg-emerald-100 transition-all"
                            >
                                <Play className="w-3.5 h-3.5" /> Activate
                            </button>
                        ) : null}
                        <button
                            onClick={() => onDelete(campaign.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-500 border border-red-200 rounded-xl text-[11px] font-black hover:bg-red-100 transition-all"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-6">
                    {tabs.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id)}
                            className={`pb-4 text-[12px] font-black transition-all relative flex items-center gap-2 ${
                                activeTab === t.id ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            <t.icon className={`w-3.5 h-3.5 ${activeTab === t.id ? 'text-primary' : ''}`} />
                            {t.label}
                            {t.count !== undefined && <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md">{t.count}</span>}
                            {activeTab === t.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-900 rounded-t-full shadow-[0_-2px_8px_rgba(0,0,0,0.1)]" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Content Area ── */}
            <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8 custom-scrollbar">

                {/* Performance Tab */}
                {activeTab === 'overview' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                        <div>
                            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                                <Target className="w-3.5 h-3.5" /> Performance Overview
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                <MetricCard icon={Users}        label="Total Leads"   value={campaign.leads}   color="slate" />
                                <MetricCard icon={Mail}         label="Emails Sent"   value={campaign.sent}    color="blue" />
                                <MetricCard icon={TrendingUp}   label="Open Rate"     value={`${campaign.openRate}%`}  ring={campaign.openRate}  ringColor="#b2f40e" color="green" />
                                <MetricCard icon={MessageSquare}label="Reply Rate"    value={`${campaign.replyRate}%`} ring={campaign.replyRate} ringColor="#a855f7" color="violet" />
                                <MetricCard icon={Zap}          label="Click Rate"    value={`${campaign.clickRate}%`}   color="amber" sub={`${campaign.opens} total opens`} />
                                <MetricCard icon={CheckCircle}  label="Replies"       value={campaign.replies}            color="green" sub={`${campaign.bounced} bounced`} />
                            </div>
                        </div>

                        {campaign.dailySends?.length > 0 && (
                            <div>
                                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                                    <BarChart2 className="w-3.5 h-3.5" /> Daily Send Activity
                                </h3>
                                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                                    <DailyBarChart data={campaign.dailySends} />
                                    <div className="flex justify-between mt-2">
                                        <span className="text-[10px] text-slate-400 font-medium">14 days ago</span>
                                        <span className="text-[10px] text-slate-400 font-medium">Today</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Sequence Tab */}
                {activeTab === 'sequence' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5" /> Email Sequence ({campaign.sequence?.length} steps)
                        </h3>
                        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                            {campaign.sequence?.map((step, idx) => (
                                <SequenceStep
                                    key={step.id}
                                    step={step}
                                    isLast={idx === campaign.sequence.length - 1}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Leads Tab */}
                {activeTab === 'leads' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
                        <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                            <Users className="w-3.5 h-3.5" /> Targeted Prospects
                        </h3>

                        {leadsLoading ? (
                            <div className="py-20 flex flex-col items-center">
                                <div className="w-8 h-8 border-2 border-primary border-t-transparent animate-spin rounded-full mb-3" />
                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Hydrating leads...</p>
                            </div>
                        ) : campaignLeads.length === 0 ? (
                            <div className="py-16 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl">
                                <Users className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                                <p className="text-[13px] font-black text-slate-500">No leads targeted yet</p>
                                <p className="text-[11px] text-slate-400 font-medium">Add leads through the campaign editor.</p>
                            </div>
                        ) : (
                            <div className="grid gap-3">
                                {campaignLeads.map(lead => (
                                    <div key={lead.id} className="group flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-primary transition-all shadow-sm hover:shadow-md cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-primary font-black text-[12px] group-hover:bg-primary group-hover:text-black transition-colors">
                                                {lead.name?.charAt(0) || lead.email?.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="text-[13px] font-black text-slate-900 leading-tight">{lead.name}</h4>
                                                <div className="flex items-center gap-3 mt-0.5">
                                                    <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                                                        <Globe className="w-3 h-3" /> {lead.company || 'Private'}
                                                    </span>
                                                    <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" /> {lead.location || 'Unknown'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                             <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wider ${
                                                lead.status === 'replied' ? 'bg-blue-100 text-blue-700' :
                                                lead.status === 'unsubscribed' ? 'bg-red-100 text-red-700' :
                                                'bg-slate-100 text-slate-500'
                                            }`}>
                                                {lead.status}
                                            </span>
                                            <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-slate-400 transition-colors" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CampaignDetail;
