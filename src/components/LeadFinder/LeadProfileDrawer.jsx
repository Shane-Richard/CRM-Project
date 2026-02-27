/**
 * LeadProfileDrawer.jsx
 * Right-side slide-in drawer showing full contact profile.
 * Allows inline editing of all fields and status update.
 */
import React, { useState, useEffect } from 'react';
import {
  X, Mail, Phone, Globe, Linkedin, Building2,
  MapPin, FileText, Edit3, Check, Trash2, ExternalLink, Clock
} from 'lucide-react';
import StatusBadge, { STATUS_MAP } from './StatusBadge';

const InfoRow = (props) => {
  const IconComp = props.icon;
  if (!props.value) return null;
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 mt-0.5">
        <IconComp className="w-3.5 h-3.5 text-gray-400" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">{props.label}</p>
        {props.href ? (
          <a href={props.href} target="_blank" rel="noreferrer"
            className="text-sm text-primary font-medium hover:underline flex items-center gap-1 mt-0.5 truncate">
            {props.value} <ExternalLink className="w-3 h-3 flex-shrink-0" />
          </a>
        ) : (
          <p className="text-sm text-gray-800 font-medium mt-0.5 break-all">{props.value}</p>
        )}
      </div>
    </div>
  );
};

const Avatar = ({ name, size = 'lg' }) => {
  const initials = (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const hue = (name || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-lg' };
  return (
    <div className={`rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 ${sizes[size] || sizes.md}`}
      style={{ background: `hsl(${hue}, 60%, 50%)` }}>
      {initials}
    </div>
  );
};

const LeadProfileDrawer = ({ lead, onClose, onUpdate, onDelete, isSaving }) => {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!lead) return;
    // schedule outside synchronous effect body
    const t = setTimeout(() => setForm({ ...lead }), 0);
    return () => clearTimeout(t);
  }, [lead]);

  if (!lead) return null;

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    const result = await onUpdate(lead.id, form);
    if (result?.success) setEditing(false);
  };

  const handleDelete = async () => {
    await onDelete(lead.id);
    onClose();
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/10" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-sm z-50 bg-white shadow-2xl border-l border-gray-100 overflow-y-auto flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h3 className="text-sm font-bold text-gray-800">Contact Profile</h3>
          <div className="flex items-center gap-2">
            {!editing ? (
              <button onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-xs font-semibold text-gray-600 hover:bg-gray-200 transition-colors">
                <Edit3 className="w-3 h-3" /> Edit
              </button>
            ) : (
              <button onClick={handleSave} disabled={isSaving}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-black text-xs font-bold hover:bg-primary/90 transition-colors">
                <Check className="w-3 h-3" /> {isSaving ? 'Saving...' : 'Save'}
              </button>
            )}
            <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Profile section */}
        <div className="px-5 py-5 border-b border-gray-50">
          <div className="flex items-start gap-4">
            <Avatar name={lead.name} size="lg" />
            <div className="flex-1 min-w-0">
              {editing ? (
                <input className="w-full text-base font-bold text-gray-900 border-b border-primary/40 focus:outline-none bg-transparent pb-0.5 mb-1"
                  value={form.name} onChange={e => set('name', e.target.value)} />
              ) : (
                <p className="text-base font-bold text-gray-900 truncate">{lead.name || '—'}</p>
              )}
              {editing ? (
                <input className="w-full text-sm text-gray-500 border-b border-gray-200 focus:outline-none bg-transparent pb-0.5"
                  value={form.title} onChange={e => set('title', e.target.value)} placeholder="Job Title" />
              ) : (
                <p className="text-sm text-gray-500">{lead.title || 'No title'}</p>
              )}

              {/* Status selector */}
              <div className="mt-2">
                {editing ? (
                  <select value={form.status} onChange={e => set('status', e.target.value)}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:border-primary">
                    {Object.entries(STATUS_MAP).map(([key, cfg]) => (
                      <option key={key} value={key}>{cfg.label}</option>
                    ))}
                  </select>
                ) : (
                  <StatusBadge status={lead.status} />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="px-5 py-4 space-y-4 flex-1">
          {editing ? (
            <div className="space-y-3">
              {[
                { k: 'email', label: 'Email', icon: Mail, type: 'email' },
                { k: 'company', label: 'Company', icon: Building2, type: 'text' },
                { k: 'phone', label: 'Phone', icon: Phone, type: 'tel' },
                { k: 'location', label: 'Location', icon: MapPin, type: 'text' },
                { k: 'website', label: 'Website', icon: Globe, type: 'url' },
                { k: 'linkedin', label: 'LinkedIn', icon: Linkedin, type: 'url' },
              ].map((item) => {
                const FieldIcon = item.icon;
                return (
                  <div key={item.k}>
                    <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide block mb-1">{item.label}</label>
                    <div className="relative">
                      <FieldIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
                      <input type={item.type} value={form[item.k] || ''}
                        onChange={e => set(item.k, e.target.value)}
                        className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors" />
                    </div>
                  </div>
                );
              })}
              <div>
                <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide block mb-1">Notes</label>
                <textarea rows={4} value={form.notes || ''}
                  onChange={e => set('notes', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary resize-none transition-colors" />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <InfoRow icon={Mail} label="Email" value={lead.email} href={`mailto:${lead.email}`} />
              <InfoRow icon={Building2} label="Company" value={lead.company} />
              <InfoRow icon={Phone} label="Phone" value={lead.phone} href={lead.phone ? `tel:${lead.phone}` : null} />
              <InfoRow icon={MapPin} label="Location" value={lead.location} />
              <InfoRow icon={Globe} label="Website" value={lead.website} href={lead.website} />
              <InfoRow icon={Linkedin} label="LinkedIn" value={lead.linkedin} href={lead.linkedin} />
              {lead.notes && (
                <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-1.5 flex items-center gap-1">
                    <FileText className="w-3 h-3" /> Notes
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">{lead.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 space-y-2">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Clock className="w-3 h-3" />
            Added {formatDate(lead.created_at)}
            {lead.source && ` · via ${lead.source}`}
          </div>

          {confirmDelete ? (
            <div className="flex gap-2">
              <button onClick={() => setConfirmDelete(false)}
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600">
                Cancel
              </button>
              <button onClick={handleDelete}
                className="flex-1 px-3 py-2 rounded-lg bg-red-500 text-white text-xs font-bold hover:bg-red-600">
                Confirm Delete
              </button>
            </div>
          ) : (
            <button onClick={() => setConfirmDelete(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-red-100 text-red-400 text-xs font-semibold hover:bg-red-50 transition-colors">
              <Trash2 className="w-3.5 h-3.5" /> Delete Contact
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default LeadProfileDrawer;
