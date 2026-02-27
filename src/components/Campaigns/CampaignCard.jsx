import React from 'react';
import {
    Play, Pause, CheckCircle, FileEdit, Trash2,
    Mail, Users, TrendingUp, MessageSquare, Clock,
    ChevronRight, MoreVertical, Zap, Target
} from 'lucide-react';

const STATUS_CONFIG = {
    active:    { label: 'Active',    color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-500', Icon: Play },
    paused:    { label: 'Paused',    color: 'text-amber-600',   bg: 'bg-amber-50',   border: 'border-amber-200',   dot: 'bg-amber-500',   Icon: Pause },
    completed: { label: 'Completed', color: 'text-blue-600',    bg: 'bg-blue-50',    border: 'border-blue-200',    dot: 'bg-blue-500',    Icon: CheckCircle },
    draft:     { label: 'Draft',     color: 'text-slate-500',   bg: 'bg-slate-50',   border: 'border-slate-200',   dot: 'bg-slate-400',   Icon: FileEdit },
};

// Mini ring chart for open/reply rate
const RingChart = ({ value, color = '#b2f40e', size = 44, stroke = 4 }) => {
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (value / 100) * circ;
    return (
        <svg width={size} height={size} className="-rotate-90">
            <circle cx={size/2} cy={size/2} r={r} stroke="#f1f5f9" strokeWidth={stroke} fill="none" />
            <circle
                cx={size/2} cy={size/2} r={r}
                stroke={color} strokeWidth={stroke} fill="none"
                strokeDasharray={circ} strokeDashoffset={offset}
                strokeLinecap="round"
                className="transition-all duration-700"
            />
        </svg>
    );
};


// Mini sparkline from daily data
const Sparkline = ({ data, color = '#b2f40e', h = 28, w = 80 }) => {
    if (!data || data.length < 2) return null;
    const max = Math.max(...data, 1);
    const pts = data.map((v, i) => {
        const x = (i / (data.length - 1)) * w;
        const y = h - (v / max) * h;
        return `${x},${y}`;
    }).join(' ');
    return (
        <svg width={w} height={h} className="overflow-visible">
            <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
};

const CampaignCard = ({ campaign, isSelected, onClick, onStatusChange, onDelete }) => {
    const cfg = STATUS_CONFIG[campaign.status] || STATUS_CONFIG.draft;
    const [menuOpen, setMenuOpen] = React.useState(false);

    return (
        <div
            onClick={onClick}
            className={`group relative p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                isSelected
                    ? 'border-primary bg-primary/3 shadow-md shadow-primary/10'
                    : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm'
            }`}
        >
            {/* Top row */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                        <span className={`text-[9px] font-black uppercase tracking-widest ${cfg.color}`}>{cfg.label}</span>
                    </div>
                    <h3 className="text-[14px] font-black text-slate-900 truncate">{campaign.name}</h3>
                </div>

                {/* Kebab menu */}
                <div className="relative flex-shrink-0">
                    <button
                        onClick={e => { e.stopPropagation(); setMenuOpen(v => !v); }}
                        className="w-7 h-7 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 opacity-0 group-hover:opacity-100 transition-all"
                    >
                        <MoreVertical className="w-4 h-4" />
                    </button>
                    {menuOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={e => { e.stopPropagation(); setMenuOpen(false); }} />
                            <div className="absolute right-0 top-8 z-50 w-44 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                                {campaign.status !== 'active' && (
                                    <button onClick={e => { e.stopPropagation(); onStatusChange('active'); setMenuOpen(false); }} className="w-full flex items-center gap-2 px-4 py-3 text-[12px] font-semibold text-emerald-600 hover:bg-emerald-50">
                                        <Play className="w-3.5 h-3.5" /> Activate
                                    </button>
                                )}
                                {campaign.status === 'active' && (
                                    <button onClick={e => { e.stopPropagation(); onStatusChange('paused'); setMenuOpen(false); }} className="w-full flex items-center gap-2 px-4 py-3 text-[12px] font-semibold text-amber-600 hover:bg-amber-50">
                                        <Pause className="w-3.5 h-3.5" /> Pause
                                    </button>
                                )}
                                <button onClick={e => { e.stopPropagation(); onDelete(); setMenuOpen(false); }} className="w-full flex items-center gap-2 px-4 py-3 text-[12px] font-semibold text-red-500 hover:bg-red-50">
                                    <Trash2 className="w-3.5 h-3.5" /> Delete
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Tags */}
            {campaign.tags?.length > 0 && (
                <div className="flex gap-1.5 flex-wrap mb-3">
                    {campaign.tags.slice(0, 2).map(t => (
                        <span key={t} className="text-[9px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-lg uppercase tracking-wider">{t}</span>
                    ))}
                </div>
            )}

            {/* Stats mini */}
            <div className="flex items-center justify-between">
                <div className="flex gap-3 text-[11px] text-slate-500">
                    <span><strong className="text-slate-800 font-black">{campaign.leads}</strong> leads</span>
                    <span><strong className="text-slate-800 font-black">{campaign.sent}</strong> sent</span>
                    <span><strong className="text-slate-800 font-black">{campaign.replyRate}%</strong> reply</span>
                </div>
                <div className="flex-shrink-0">
                    <Sparkline data={campaign.dailySends} />
                </div>
            </div>

            {/* Open rate bar */}
            <div className="mt-3 h-1 rounded-full bg-slate-100 overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${campaign.openRate}%`, background: '#b2f40e' }}
                />
            </div>
            <div className="flex justify-between mt-1">
                <span className="text-[9px] text-slate-400 font-medium">Open rate</span>
                <span className="text-[9px] font-black text-slate-600">{campaign.openRate}%</span>
            </div>

            {/* Chevron */}
            <ChevronRight className={`absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-all ${isSelected ? 'text-primary opacity-100' : 'text-slate-300 opacity-0 group-hover:opacity-100'}`} />
        </div>
    );
};

export { CampaignCard, STATUS_CONFIG, RingChart, Sparkline };
