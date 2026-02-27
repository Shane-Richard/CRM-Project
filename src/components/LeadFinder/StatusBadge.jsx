/**
 * StatusBadge.jsx
 * Colored pill badge for lead status — matches labelConfig colors.
 */
import React from 'react';

const STATUS_MAP = {
  lead:               { label: 'Lead',             color: '#f59e0b', bg: '#fef3c7' },
  interested:         { label: 'Interested',         color: '#a855f7', bg: '#f3e8ff' },
  meeting_booked:     { label: 'Meeting Booked',     color: '#3b82f6', bg: '#dbeafe' },
  meeting_done:       { label: 'Meeting Done',       color: '#10b981', bg: '#d1fae5' },
  won:                { label: 'Won',                color: '#b2f40e', bg: '#f0ffe6' },
  out_of_office:      { label: 'Out of Office',      color: '#6b7280', bg: '#f3f4f6' },
  wrong_person:       { label: 'Wrong Person',       color: '#9ca3af', bg: '#f9fafb' },
  not_interested:     { label: 'Not Interested',     color: '#ef4444', bg: '#fee2e2' },
  lost:               { label: 'Lost',               color: '#dc2626', bg: '#fef2f2' },
};

const StatusBadge = ({ status, size = 'sm', onClick = null }) => {
  const cfg = STATUS_MAP[status?.toLowerCase().replace(/\s+/g, '_')] || {
    label: status || 'Unknown',
    color: '#9ca3af',
    bg: '#f3f4f6',
  };

  const padMap = { xs: 'px-1.5 py-0.5 text-[10px]', sm: 'px-2 py-0.5 text-xs', md: 'px-3 py-1 text-sm' };

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full ${padMap[size] || padMap.sm} ${onClick ? 'cursor-pointer hover:opacity-80' : ''}`}
      style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}30` }}
      onClick={onClick}
    >
      {cfg.label}
    </span>
  );
};

export { STATUS_MAP };
export default StatusBadge;
