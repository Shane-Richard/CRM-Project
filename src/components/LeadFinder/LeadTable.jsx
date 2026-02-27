/**
 * LeadTable.jsx
 * Interactive data table for contacts/leads:
 * - Checkbox multi-select
 * - Avatar + Name + Email
 * - Company, Title, Status, Source
 * - Created date, quick actions (edit, delete)
 * - Row click → opens profile drawer
 * - Empty state + loading state
 */
import React from 'react';
import {
  Trash2, ChevronLeft, ChevronRight, ExternalLink,
  Globe, Linkedin, Phone
} from 'lucide-react';
import StatusBadge from './StatusBadge';

const Avatar = ({ name }) => {
  const initials = (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const hue = (name || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
      style={{ background: `hsl(${hue}, 60%, 50%)` }}>
      {initials}
    </div>
  );
};

const SkeletonRow = () => (
  <tr className="border-b border-gray-50 animate-pulse">
    {[...Array(7)].map((_, i) => (
      <td key={i} className="px-4 py-3">
        <div className="h-3.5 bg-gray-100 rounded-md" style={{ width: `${60 + (i * 10) % 30}%` }} />
      </td>
    ))}
  </tr>
);

const EmptyState = ({ hasFilters, onReset }) => (
  <tr>
    <td colSpan={7}>
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
          <span className="text-3xl">{hasFilters ? '🔍' : '👥'}</span>
        </div>
        <p className="text-sm font-semibold text-gray-500 mb-1">
          {hasFilters ? 'No leads match your filters' : 'No contacts yet'}
        </p>
        <p className="text-xs text-gray-400 mb-4">
          {hasFilters ? 'Try adjusting your search or filters' : 'Add your first lead or import from CSV'}
        </p>
        {hasFilters && (
          <button onClick={onReset}
            className="px-4 py-2 rounded-xl bg-gray-100 text-xs font-semibold text-gray-600 hover:bg-gray-200 transition-colors">
            Clear all filters
          </button>
        )}
      </div>
    </td>
  </tr>
);

const SOURCE_LABELS = {
  manual: { label: 'Manual', color: '#6b7280' },
  csv: { label: 'CSV', color: '#3b82f6' },
  gmail: { label: 'Gmail', color: '#ef4444' },
  campaign: { label: 'Campaign', color: '#a855f7' },
};

const LeadTable = ({
  leads,
  isLoading,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onRowClick,
  onDelete,
  filters,
  onReset,
  page,
  stats,
  onPageChange,
}) => {
  const allSelected = leads.length > 0 && selectedIds.size === leads.length;
  const someSelected = selectedIds.size > 0 && !allSelected;
  const hasFilters = filters.search || filters.status !== 'all' || filters.source !== 'all';

  const formatDate = (d) => {
    if (!d) return '—';
    const date = new Date(d);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm border-separate border-spacing-0">
          <thead>
            <tr className="sticky top-0 bg-white z-10">
              <th className="w-10 px-4 py-3 text-left border-b border-gray-100">
                <input
                  type="checkbox"
                  className="w-3.5 h-3.5 accent-primary cursor-pointer rounded"
                  checked={allSelected}
                  ref={el => { if (el) el.indeterminate = someSelected; }}
                  onChange={onToggleSelectAll}
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 border-b border-gray-100 whitespace-nowrap">NAME</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 border-b border-gray-100 whitespace-nowrap">COMPANY</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 border-b border-gray-100 whitespace-nowrap">STATUS</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 border-b border-gray-100 whitespace-nowrap">SOURCE</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 border-b border-gray-100 whitespace-nowrap">ADDED</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 border-b border-gray-100 whitespace-nowrap">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(8)].map((_, i) => <SkeletonRow key={i} />)
            ) : leads.length === 0 ? (
              <EmptyState hasFilters={hasFilters} onReset={onReset} />
            ) : (
              leads.map(lead => {
                const isSelected = selectedIds.has(lead.id);
                const srcCfg = SOURCE_LABELS[lead.source] || SOURCE_LABELS.manual;
                return (
                  <tr
                    key={lead.id}
                    className={`border-b border-gray-50 hover:bg-gray-50/60 cursor-pointer transition-colors group
                      ${isSelected ? 'bg-primary/5' : ''}`}
                    onClick={() => onRowClick(lead)}
                  >
                    {/* Checkbox */}
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        className="w-3.5 h-3.5 accent-primary cursor-pointer rounded"
                        checked={isSelected}
                        onChange={() => onToggleSelect(lead.id)}
                      />
                    </td>

                    {/* Name + Email */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={lead.name} />
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate max-w-[140px]">{lead.name || '—'}</p>
                          <p className="text-xs text-gray-400 truncate max-w-[140px]">{lead.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Company + Title */}
                    <td className="px-4 py-3">
                      <p className="text-gray-700 font-medium truncate max-w-[120px]">{lead.company || '—'}</p>
                      {lead.title && <p className="text-xs text-gray-400 truncate max-w-[120px]">{lead.title}</p>}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <StatusBadge status={lead.status} />
                    </td>

                    {/* Source */}
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold" style={{ color: srcCfg.color }}>{srcCfg.label}</span>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                      {formatDate(lead.created_at)}
                    </td>

                    {/* Quick actions */}
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {lead.email && (
                          <a href={`mailto:${lead.email}`}
                            className="w-7 h-7 rounded-lg hover:bg-blue-50 flex items-center justify-center transition-colors"
                            title="Send Email">
                            <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                          </a>
                        )}
                        <button
                          onClick={() => onDelete(lead.id)}
                          className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center transition-colors"
                          title="Delete">
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!isLoading && stats.total > 0 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-white flex-shrink-0">
          <span className="text-xs text-gray-400">
            Showing <strong>{((page - 1) * 20) + 1}–{Math.min(page * 20, stats.total)}</strong> of <strong>{stats.total}</strong> contacts
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-500" />
            </button>
            {[...Array(Math.min(5, stats.totalPages))].map((_, i) => {
              const p = Math.max(1, page - 2) + i;
              if (p > stats.totalPages) return null;
              return (
                <button
                  key={p}
                  onClick={() => onPageChange(p)}
                  className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors
                    ${p === page ? 'bg-primary text-black' : 'hover:bg-gray-100 text-gray-600'}`}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= stats.totalPages}
              className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadTable;
