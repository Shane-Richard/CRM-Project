/**
 * RecentConversations.jsx
 * Shows the 8 most recent email conversations with sender, subject, status badge, and time.
 */
import React from 'react';
import { Mail, MailOpen } from 'lucide-react';
import { LABEL_CONFIG } from '../../config/labelConfig';

const getStatusConfig = (status) => {
    if (!status) return null;
    const key = status.toLowerCase().replace(/\s+/g, '_');
    return LABEL_CONFIG.find(l => l.id === key) || null;
};

const Avatar = ({ name }) => {
    const initials = (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
    const hue = (name || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
    return (
        <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ background: `hsl(${hue}, 60%, 50%)` }}
        >
            {initials}
        </div>
    );
};

const RecentConversations = ({ conversations = [], onNavigateToInbox }) => {
    if (conversations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
                    <Mail className="w-6 h-6 text-gray-300" />
                </div>
                <p className="text-sm font-medium text-gray-400">No recent conversations</p>
                <p className="text-xs text-gray-300 mt-1">Go to Inboxes to sync your Gmail</p>
            </div>
        );
    }

    return (
        <div className="space-y-1">
            {conversations.map((conv) => {
                const statusCfg = getStatusConfig(conv.status);
                return (
                    <div
                        key={conv.id}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors group"
                        onClick={() => onNavigateToInbox && onNavigateToInbox(conv.id)}
                    >
                        {/* Avatar */}
                        <Avatar name={conv.sender} />

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                                <span className={`text-sm font-semibold truncate ${conv.isRead ? 'text-gray-600' : 'text-gray-900'}`}>
                                    {conv.sender}
                                </span>
                                <span className="text-[11px] text-gray-400 flex-shrink-0">{conv.time}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                                {!conv.isRead && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                                )}
                                <p className="text-xs text-gray-500 truncate">{conv.subject}</p>
                            </div>
                        </div>

                        {/* Status pill */}
                        {statusCfg && (
                            <div
                                className="flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                                style={{
                                    background: statusCfg.color + '20',
                                    color: statusCfg.color,
                                    border: `1px solid ${statusCfg.color}40`
                                }}
                            >
                                {statusCfg.label}
                            </div>
                        )}
                    </div>
                );
            })}

            {/* View all link */}
            <button
                className="w-full text-center text-xs text-primary font-medium py-2 mt-1 hover:underline"
                onClick={() => onNavigateToInbox && onNavigateToInbox()}
            >
                View all conversations →
            </button>
        </div>
    );
};

export default RecentConversations;
