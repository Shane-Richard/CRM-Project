/**
 * LeadFinder.jsx
 * Phase 2 — Lead Finder Module
 *
 * Full-featured contact database:
 * - Search, filter by status/source, sort
 * - Table with multi-select, pagination
 * - Add lead modal (manual)
 * - Import CSV modal (bulk)
 * - Profile drawer (view + edit + delete)
 * - Bulk delete
 * - Stats header with live counts
 * - Toast notifications
 */
import React, { useState, useCallback } from 'react';
import {
  UserPlus, Upload, Trash2, RefreshCw,
  Users, UserCheck, TrendingUp, AlertCircle,
  Loader2
} from 'lucide-react';

import { useLeads } from '../../hooks/useLeads';
import LeadFilters from './LeadFilters';
import LeadTable from './LeadTable';
import AddLeadModal from './AddLeadModal';
import ImportCSVModal from './ImportCSVModal';
import LeadProfileDrawer from './LeadProfileDrawer';

// ── Mini stat card at top ────────────────────────────────────────────────────
const StatChip = (props) => {
  const IconComp = props.icon;
  return (
    <div className="flex items-center gap-2.5 bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: props.color + '15' }}>
        <IconComp className="w-4 h-4" style={{ color: props.color }} />
      </div>
      <div>
        <p className="text-lg font-bold text-gray-900 leading-none">{props.value}</p>
        <p className="text-xs text-gray-400 mt-0.5">{props.label}</p>
      </div>
    </div>
  );
};

// ── Toast mini notification ───────────────────────────────────────────────────
const Toast = ({ msg, type }) => {
  if (!msg) return null;
  const cls = type === 'error' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-green-50 border-green-200 text-green-600';
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[999] flex items-center gap-2 px-5 py-3 rounded-xl border shadow-lg text-sm font-medium animate-in ${cls}`}>
      {type === 'error' ? <AlertCircle className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
      {msg}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
const LeadFinder = () => {
  const {
    leads, isLoading, isSaving, error, stats,
    page, setPage, filters, updateFilter, resetFilters,
    selectedIds, toggleSelect, toggleSelectAll,
    addLead, updateLead, deleteLead, deleteSelected, importCSV,
    refetch,
  } = useLeads();

  const [showAddModal, setShowAddModal]       = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedLead, setSelectedLead]       = useState(null); // profile drawer
  const [toast, setToast]                     = useState(null);

  // ── Toast helper ──────────────────────────────────────────────────────────
  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleAddLead = async (form) => {
    const result = await addLead(form);
    if (result.success) showToast('Lead added successfully!');
    else showToast(result.error || 'Failed to add lead', 'error');
    return result;
  };

  const handleImport = async (rows) => {
    const result = await importCSV(rows);
    if (result.success) showToast(`Imported ${result.imported} contacts!`);
    else showToast(result.error || 'Import failed', 'error');
    return result;
  };

  const handleUpdate = async (id, updates) => {
    const result = await updateLead(id, updates);
    if (result.success) {
      showToast('Contact updated!');
      // Also update the drawer's lead data
      setSelectedLead(result.data);
    } else {
      showToast(result.error || 'Update failed', 'error');
    }
    return result;
  };

  const handleDelete = async (id) => {
    const result = await deleteLead(id);
    if (result.success) showToast('Contact deleted');
    else showToast(result.error || 'Delete failed', 'error');
  };

  const handleBulkDelete = async () => {
    const n = selectedIds.size;
    const result = await deleteSelected();
    if (result?.success) showToast(`${n} contacts deleted`);
    else showToast(result?.error || 'Delete failed', 'error');
  };

  // Per-row status chip counts (quick stats) ────────────────────────────────
  const wonCount = leads.filter(l => l.status === 'won').length;
  const interestedCount = leads.filter(l => l.status === 'interested').length;

  return (
    <div className="flex flex-col h-full bg-gray-50/40 overflow-hidden">

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 bg-white border-b border-gray-100 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Lead Finder</h2>
            <p className="text-sm text-gray-400 mt-0.5">
              Manage your contact pipeline · {stats.total} total contacts
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Refresh */}
            <button
              onClick={() => refetch()}
              disabled={isLoading}
              className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
              title="Refresh"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 text-gray-400" />
              )}
            </button>

            {/* Bulk delete */}
            {selectedIds.size > 0 && (
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 border border-red-100 text-red-500 text-sm font-semibold hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete {selectedIds.size}
              </button>
            )}

            {/* Import CSV */}
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
            >
              <Upload className="w-3.5 h-3.5" />
              Import CSV
            </button>

            {/* Add Lead */}
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-black text-sm font-bold hover:bg-primary/90 transition-colors shadow-sm"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Add Lead
            </button>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="flex items-center gap-3 mt-4 overflow-x-auto pb-1">
          <StatChip icon={Users}      label="Total Contacts"   value={stats.total}         color="#6b7280" />
          <StatChip icon={TrendingUp} label="Won"              value={wonCount}             color="#b2f40e" />
          <StatChip icon={UserCheck}  label="Interested"       value={interestedCount}      color="#a855f7" />
          <StatChip icon={UserPlus}   label="New Leads (page)" value={stats.thisPage}       color="#3b82f6" />
        </div>
      </div>

      {/* ── Filters ─────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 px-6 py-4 bg-white border-b border-gray-50">
        <LeadFilters
          filters={filters}
          onFilterChange={updateFilter}
          onReset={resetFilters}
          stats={stats}
        />
      </div>

      {/* ── Error banner ─────────────────────────────────────────────────── */}
      {error && (
        <div className="flex-shrink-0 mx-6 mt-3 flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Table ───────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden mx-6 my-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <LeadTable
          leads={leads}
          isLoading={isLoading}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={toggleSelectAll}
          onRowClick={setSelectedLead}
          onDelete={handleDelete}
          filters={filters}
          onReset={resetFilters}
          page={page}
          stats={stats}
          onPageChange={setPage}
        />
      </div>

      {/* ── Modals ──────────────────────────────────────────────────────── */}
      {showAddModal && (
        <AddLeadModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddLead}
          isSaving={isSaving}
        />
      )}

      {showImportModal && (
        <ImportCSVModal
          onClose={() => setShowImportModal(false)}
          onImport={handleImport}
          isSaving={isSaving}
        />
      )}

      {/* ── Profile Drawer ───────────────────────────────────────────────── */}
      {selectedLead && (
        <LeadProfileDrawer
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          isSaving={isSaving}
        />
      )}

      {/* ── Toast ───────────────────────────────────────────────────────── */}
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  );
};

export default LeadFinder;
