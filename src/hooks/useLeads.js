/**
 * useLeads.js
 * Complete Lead Finder data hook
 * Handles: fetch, add, update, delete, import CSV, search, filter, sort, pagination
 */
import { useState, useCallback, useEffect, useMemo } from 'react';
import { supabase } from '../services/supabaseClient';

const PAGE_SIZE = 20;

const DEFAULT_FILTERS = {
  status: 'all',
  source: 'all',
  search: '',
  sortBy: 'created_at',
  sortDir: 'desc',
};

export const useLeads = () => {
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [selectedIds, setSelectedIds] = useState(new Set());

  // ── Fetch leads from Supabase with filters ──────────────────────────────
  const fetchLeads = useCallback(async (overrideFilters = null, overridePage = null) => {
    setIsLoading(true);
    setError(null);
    try {
      const f = overrideFilters || filters;
      const p = overridePage || page;
      const from = (p - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabase
        .from('contacts')
        .select('*', { count: 'exact' })
        .range(from, to)
        .order(f.sortBy, { ascending: f.sortDir === 'asc' });

      if (f.status !== 'all') {
        query = query.eq('status', f.status);
      }
      if (f.source !== 'all') {
        query = query.eq('source', f.source);
      }
      if (f.search?.trim()) {
        const s = f.search.trim();
        query = query.or(`name.ilike.%${s}%,email.ilike.%${s}%,company.ilike.%${s}%`);
      }

      const { data, error: err, count } = await query;
      if (err) throw err;

      setLeads(data || []);
      setTotalCount(count || 0);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // ── Add single lead ─────────────────────────────────────────────────────
  const addLead = useCallback(async (leadData) => {
    setIsSaving(true);
    try {
      const { data, error: err } = await supabase
        .from('contacts')
        .insert([{
          name: leadData.name?.trim() || '',
          email: leadData.email?.trim().toLowerCase(),
          company: leadData.company?.trim() || '',
          title: leadData.title?.trim() || '',
          phone: leadData.phone?.trim() || '',
          website: leadData.website?.trim() || '',
          linkedin: leadData.linkedin?.trim() || '',
          location: leadData.location?.trim() || '',
          status: leadData.status || 'lead',
          source: leadData.source || 'manual',
          notes: leadData.notes?.trim() || '',
          tags: leadData.tags || [],
        }])
        .select()
        .single();

      if (err) throw err;
      // Refresh first page
      await fetchLeads(filters, 1);
      setPage(1);
      return { success: true, data };
    } catch (e) {
      return { success: false, error: e.message };
    } finally {
      setIsSaving(false);
    }
  }, [filters, fetchLeads]);

  // ── Update lead ─────────────────────────────────────────────────────────
  const updateLead = useCallback(async (id, updates) => {
    setIsSaving(true);
    try {
      const { data, error: err } = await supabase
        .from('contacts')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (err) throw err;
      setLeads(prev => prev.map(l => l.id === id ? data : l));
      return { success: true, data };
    } catch (e) {
      return { success: false, error: e.message };
    } finally {
      setIsSaving(false);
    }
  }, []);

  // ── Delete single lead ──────────────────────────────────────────────────
  const deleteLead = useCallback(async (id) => {
    try {
      const { error: err } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);
      if (err) throw err;
      setLeads(prev => prev.filter(l => l.id !== id));
      setTotalCount(c => c - 1);
      setSelectedIds(prev => { const s = new Set(prev); s.delete(id); return s; });
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }, []);

  // ── Delete selected leads (bulk) ────────────────────────────────────────
  const deleteSelected = useCallback(async () => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    try {
      const { error: err } = await supabase
        .from('contacts')
        .delete()
        .in('id', ids);
      if (err) throw err;
      setLeads(prev => prev.filter(l => !selectedIds.has(l.id)));
      setTotalCount(c => c - ids.length);
      setSelectedIds(new Set());
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }, [selectedIds]);

  // ── CSV Import ──────────────────────────────────────────────────────────
  const importCSV = useCallback(async (rows) => {
    setIsSaving(true);
    let imported = 0;
    let skipped = 0;
    const errors = [];

    try {
      // Process in chunks of 50
      const chunks = [];
      for (let i = 0; i < rows.length; i += 50) {
        chunks.push(rows.slice(i, i + 50));
      }

      for (const chunk of chunks) {
        const payload = chunk
          .filter(r => r.email?.trim())
          .map(r => ({
            name: r.name?.trim() || r.email?.split('@')[0] || '',
            email: r.email?.trim().toLowerCase(),
            company: r.company?.trim() || '',
            title: r.title?.trim() || r.job_title?.trim() || '',
            phone: r.phone?.trim() || '',
            website: r.website?.trim() || '',
            linkedin: r.linkedin?.trim() || '',
            location: r.location?.trim() || r.city?.trim() || '',
            status: r.status?.trim() || 'lead',
            source: 'csv',
            notes: r.notes?.trim() || '',
            tags: r.tags ? r.tags.split(',').map(t => t.trim()) : [],
          }));

        const { data, error: err } = await supabase
          .from('contacts')
          .upsert(payload, { onConflict: 'email', ignoreDuplicates: false })
          .select();

        if (err) {
          errors.push(err.message);
        } else {
          imported += data?.length || 0;
        }
      }

      skipped = rows.length - imported;
      await fetchLeads(filters, 1);
      setPage(1);
      return { success: true, imported, skipped, errors };
    } catch (e) {
      return { success: false, error: e.message, imported, skipped };
    } finally {
      setIsSaving(false);
    }
  }, [filters, fetchLeads]);

  // ── Quick status update ─────────────────────────────────────────────────
  const updateStatus = useCallback(async (id, status) => {
    return updateLead(id, { status });
  }, [updateLead]);

  // ── Filter helpers ──────────────────────────────────────────────────────
  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
    setSelectedIds(new Set());
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
    setSelectedIds(new Set());
  }, []);

  // ── Selection helpers ────────────────────────────────────────────────────
  const toggleSelect = useCallback((id) => {
    setSelectedIds(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === leads.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(leads.map(l => l.id)));
    }
  }, [selectedIds, leads]);

  // ── Stats ────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    return {
      total: totalCount,
      thisPage: leads.length,
      selected: selectedIds.size,
      totalPages: Math.max(1, Math.ceil(totalCount / PAGE_SIZE)),
    };
  }, [totalCount, leads, selectedIds]);

  return {
    // Data
    leads,
    isLoading,
    isSaving,
    error,
    stats,
    // Pagination
    page,
    setPage,
    PAGE_SIZE,
    // Filters
    filters,
    updateFilter,
    resetFilters,
    // Selection
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    // Actions
    addLead,
    updateLead,
    updateStatus,
    deleteLead,
    deleteSelected,
    importCSV,
    refetch: fetchLeads,
  };
};
