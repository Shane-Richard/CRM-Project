/**
 * LeadFilters.jsx
 * Search bar + status/source filter chips + sort selector + result count.
 */
import React from 'react';
import { Search, X, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { STATUS_MAP } from './StatusBadge';

const SORT_OPTIONS = [
  { value: 'created_at_desc', label: 'Newest first' },
  { value: 'created_at_asc',  label: 'Oldest first' },
  { value: 'name_asc',        label: 'Name A→Z' },
  { value: 'name_desc',       label: 'Name Z→A' },
  { value: 'company_asc',     label: 'Company A→Z' },
  { value: 'updated_at_desc', label: 'Recently updated' },
];

const SOURCE_OPTIONS = [
  { value: 'all',      label: 'All Sources' },
  { value: 'manual',   label: 'Manual' },
  { value: 'csv',      label: 'CSV Import' },
  { value: 'gmail',    label: 'Gmail' },
  { value: 'campaign', label: 'Campaign' },
];

const LeadFilters = ({ filters, onFilterChange, stats, onReset }) => {
  const hasActiveFilters = filters.status !== 'all' || filters.source !== 'all' || filters.search;

  const handleSort = (val) => {
    const [sortBy, sortDir] = val.split('_').length === 2
      ? [val.split('_')[0], val.split('_')[1]]
      : val.split('_desc').length === 2
        ? [val.replace('_desc', ''), 'desc']
        : [val.replace('_asc', ''), 'asc'];
    onFilterChange('sortBy', sortBy);
    onFilterChange('sortDir', sortDir);
  };

  const sortValue = `${filters.sortBy}_${filters.sortDir}`;

  return (
    <div className="flex flex-col gap-3">
      {/* Row 1: Search + Sort */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
          <input
            type="text"
            placeholder="Search by name, email, or company..."
            value={filters.search}
            onChange={e => onFilterChange('search', e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
          />
          {filters.search && (
            <button onClick={() => onFilterChange('search', '')}
              className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-3.5 h-3.5 text-gray-300 hover:text-gray-500" />
            </button>
          )}
        </div>

        {/* Sort */}
        <div className="relative">
          <select
            value={sortValue}
            onChange={e => handleSort(e.target.value)}
            className="pl-3 pr-8 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-primary appearance-none cursor-pointer text-gray-600 font-medium"
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300 pointer-events-none" />
        </div>
      </div>

      {/* Row 2: Status filter chips + Source filter + Stats */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Status pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => onFilterChange('status', 'all')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all
              ${filters.status === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
          >
            All ({stats.total})
          </button>
          {Object.entries(STATUS_MAP).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => onFilterChange('status', filters.status === key ? 'all' : key)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border`}
              style={{
                background: filters.status === key ? cfg.color : cfg.bg,
                color: filters.status === key ? '#fff' : cfg.color,
                borderColor: filters.status === key ? cfg.color : 'transparent',
              }}
            >
              {cfg.label}
            </button>
          ))}
        </div>

        <div className="h-5 w-px bg-gray-200 mx-1" />

        {/* Source filter */}
        <div className="relative">
          <SlidersHorizontal className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
          <select
            value={filters.source}
            onChange={e => onFilterChange('source', e.target.value)}
            className="pl-7 pr-6 py-1.5 text-xs bg-white border border-gray-200 rounded-full focus:outline-none appearance-none cursor-pointer text-gray-600 font-medium"
          >
            {SOURCE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-300 pointer-events-none" />
        </div>

        {/* Reset */}
        {hasActiveFilters && (
          <button onClick={onReset}
            className="ml-auto px-3 py-1.5 rounded-full text-xs font-semibold text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex items-center gap-1">
            <X className="w-3 h-3" /> Clear filters
          </button>
        )}
      </div>
    </div>
  );
};

export default LeadFilters;
