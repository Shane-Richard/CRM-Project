/**
 * FunnelChart.jsx
 * Lead pipeline funnel using Recharts BarChart — horizontal bars
 * Shows the volume of leads at each CRM stage.
 */
import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl border border-white/10">
                <p className="font-semibold mb-0.5">{label}</p>
                <p className="text-primary">{payload[0].value} conversations</p>
            </div>
        );
    }
    return null;
};

const FunnelChart = ({ data = [] }) => {
    const hasData = data.some(d => d.value > 0);
    const maxVal = Math.max(...data.map(d => d.value), 1);

    if (!hasData) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
                    <span className="text-2xl">📊</span>
                </div>
                <p className="text-sm font-medium text-gray-400">No pipeline data yet</p>
                <p className="text-xs text-gray-300 mt-1">Status labels will appear as emails are categorized</p>
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={220}>
            <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 0, right: 24, bottom: 0, left: 0 }}
                barCategoryGap="28%"
            >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                <XAxis
                    type="number"
                    domain={[0, maxVal + 1]}
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    axisLine={false}
                    tickLine={false}
                />
                <YAxis
                    type="category"
                    dataKey="label"
                    width={110}
                    tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={22}>
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.85} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};

export default FunnelChart;
