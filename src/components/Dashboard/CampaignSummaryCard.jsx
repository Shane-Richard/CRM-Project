/**
 * CampaignSummaryCard.jsx
 * Shows top-3 campaigns with open rate, reply rate progress bars.
 */
import React from 'react';
import { Megaphone, Play, Pause, CheckCircle, FileEdit } from 'lucide-react';

const statusConfig = {
    active: { icon: Play, label: 'Active', color: 'text-green-500', bg: 'bg-green-50' },
    paused: { icon: Pause, label: 'Paused', color: 'text-amber-500', bg: 'bg-amber-50' },
    completed: { icon: CheckCircle, label: 'Done', color: 'text-blue-500', bg: 'bg-blue-50' },
    draft: { icon: FileEdit, label: 'Draft', color: 'text-gray-400', bg: 'bg-gray-50' },
};

const ProgressBar = ({ value, color }) => (
    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
        <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${Math.min(value, 100)}%`, background: color }}
        />
    </div>
);

const CampaignSummaryCard = ({ campaigns = [], onNavigateToCampaigns }) => {
    if (campaigns.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
                    <Megaphone className="w-6 h-6 text-gray-300" />
                </div>
                <p className="text-sm font-medium text-gray-400">No campaigns yet</p>
                <p className="text-xs text-gray-300 mt-1">Create your first outreach campaign</p>
                <button
                    className="mt-3 text-xs text-primary font-semibold hover:underline"
                    onClick={() => onNavigateToCampaigns && onNavigateToCampaigns()}
                >
                    Create Campaign →
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {campaigns.map((camp) => {
                const cfg = statusConfig[camp.status] || statusConfig.draft;
                const StatusIcon = cfg.icon;
                return (
                    <div
                        key={camp.id}
                        className="p-4 bg-gray-50/60 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all cursor-pointer group"
                        onClick={() => onNavigateToCampaigns && onNavigateToCampaigns()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-semibold text-gray-800 truncate pr-2 group-hover:text-gray-900">{camp.name}</p>
                            <span className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color} flex-shrink-0`}>
                                <StatusIcon className="w-2.5 h-2.5" />
                                {cfg.label}
                            </span>
                        </div>

                        {/* Stats Row */}
                        <div className="flex gap-4 mb-3 text-xs text-gray-500">
                            <span><strong className="text-gray-700">{camp.leads}</strong> leads</span>
                            <span><strong className="text-gray-700">{camp.sent}</strong> sent</span>
                        </div>

                        {/* Open Rate */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-[11px] text-gray-500">
                                <span>Open Rate</span>
                                <span className="font-semibold text-gray-700">{camp.openRate}%</span>
                            </div>
                            <ProgressBar value={camp.openRate} color="#b2f40e" />

                            <div className="flex justify-between text-[11px] text-gray-500 mt-1">
                                <span>Reply Rate</span>
                                <span className="font-semibold text-gray-700">{camp.replyRate}%</span>
                            </div>
                            <ProgressBar value={camp.replyRate} color="#a855f7" />
                        </div>
                    </div>
                );
            })}

            <button
                className="w-full text-center text-xs text-primary font-medium py-1.5 hover:underline"
                onClick={() => onNavigateToCampaigns && onNavigateToCampaigns()}
            >
                View all campaigns →
            </button>
        </div>
    );
};

export default CampaignSummaryCard;
