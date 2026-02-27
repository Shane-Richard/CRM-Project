/**
 * EmailVolumeChart.jsx
 * Area + Line chart showing email volume over last 7 days.
 * Uses Recharts AreaChart.
 */
import React from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl border border-white/10 space-y-1">
                <p className="font-semibold text-gray-300">{label}</p>
                {payload.map((p, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                        <span className="capitalize">{p.name}:</span>
                        <span className="font-bold">{p.value}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const EmailVolumeChart = ({ data = [] }) => {
    const hasData = data.some(d => d.received > 0 || d.unread > 0);

    if (!hasData) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
                    <span className="text-2xl">📈</span>
                </div>
                <p className="text-sm font-medium text-gray-400">No email data yet</p>
                <p className="text-xs text-gray-300 mt-1">Sync your inbox to see volume trends</p>
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                <defs>
                    <linearGradient id="colorReceived" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#b2f40e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#b2f40e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorUnread" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis
                    dataKey="day"
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    axisLine={false}
                    tickLine={false}
                />
                <YAxis
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                    type="monotone"
                    dataKey="received"
                    name="Received"
                    stroke="#b2f40e"
                    strokeWidth={2}
                    fill="url(#colorReceived)"
                    dot={false}
                    activeDot={{ r: 4, fill: '#b2f40e', strokeWidth: 0 }}
                />
                <Area
                    type="monotone"
                    dataKey="unread"
                    name="Unread"
                    stroke="#a855f7"
                    strokeWidth={2}
                    fill="url(#colorUnread)"
                    dot={false}
                    activeDot={{ r: 4, fill: '#a855f7', strokeWidth: 0 }}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
};

export default EmailVolumeChart;
