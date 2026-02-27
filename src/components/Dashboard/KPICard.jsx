/**
 * KPICard.jsx
 * Premium metric card with animated counter, trend indicator, and glow effect.
 */
import React, { useEffect, useRef, useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

// Smooth counter animation
const useCountUp = (target, duration = 1200) => {
    const [count, setCount] = useState(0);
    const startTime = useRef(null);
    const frame = useRef(null);

    useEffect(() => {
        if (target === 0) {
            // Reset via rAF to stay outside synchronous effect
            frame.current = requestAnimationFrame(() => setCount(0));
            return () => cancelAnimationFrame(frame.current);
        }
        const animate = (timestamp) => {
            if (!startTime.current) startTime.current = timestamp;
            const progress = Math.min((timestamp - startTime.current) / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) frame.current = requestAnimationFrame(animate);
            else setCount(target);
        };
        startTime.current = null;
        frame.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frame.current);
    }, [target, duration]);

    return count;
};

const KPICard = ({
    label,
    value,
    suffix = '',
    icon: Icon,
    iconBg = 'bg-primary/10',
    iconColor = 'text-primary',
    glowColor = 'rgba(178,244,14,0.15)',
    trend = null,        // positive | negative | neutral
    trendLabel = '',
    formatValue = null,  // optional custom formatter
}) => {
    const animatedValue = useCountUp(typeof value === 'number' ? value : 0);
    const displayValue = formatValue
        ? formatValue(value)
        : `${typeof value === 'number' ? animatedValue : value}${suffix}`;

    return (
        <div
            className="relative rounded-2xl bg-white border border-gray-100 p-6 overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
            style={{ boxShadow: `0 2px 16px 0 rgba(0,0,0,0.04)` }}
        >
            {/* Subtle background gradient on hover */}
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                style={{ background: `radial-gradient(ellipse at top left, ${glowColor}, transparent 70%)` }}
            />

            {/* Top Row: Icon + Trend */}
            <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center`}>
                    {Icon && <Icon className={`w-5 h-5 ${iconColor}`} strokeWidth={2} />}
                </div>

                {trend && (
                    <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                        trend === 'positive' ? 'bg-green-50 text-green-600' :
                        trend === 'negative' ? 'bg-red-50 text-red-400' :
                        'bg-gray-100 text-gray-400'
                    }`}>
                        {trend === 'positive' ? <TrendingUp className="w-3 h-3" /> :
                         trend === 'negative' ? <TrendingDown className="w-3 h-3" /> :
                         <Minus className="w-3 h-3" />}
                        {trendLabel}
                    </div>
                )}
            </div>

            {/* Value */}
            <div className="mb-1">
                <span className="text-3xl font-bold text-gray-900 tracking-tight">
                    {displayValue}
                </span>
            </div>

            {/* Label */}
            <p className="text-sm text-gray-400 font-medium">{label}</p>

            {/* Bottom accent line */}
            <div
                className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `linear-gradient(90deg, transparent, ${glowColor.replace('0.15', '0.6')}, transparent)` }}
            />
        </div>
    );
};

export default KPICard;
