/**
 * AddLeadModal.jsx
 * Modal to add a single new contact/lead manually.
 * Full form: name, email, company, title, phone, website, linkedin, location, status, notes.
 */
import React, { useState } from 'react';
import { X, User, Mail, Building2, Briefcase, Phone, Globe, Linkedin, MapPin, FileText, ChevronDown } from 'lucide-react';
import { STATUS_MAP } from './StatusBadge';

const FIELD_CLASS = 'w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder-gray-300';

const FormField = ({ label, icon: Icon, required, children }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-500 mb-1.5">
      {label}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    <div className="relative">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <Icon className="w-3.5 h-3.5 text-gray-300" />
        </div>
      )}
      {React.cloneElement(children, {
        className: `${FIELD_CLASS} ${Icon ? 'pl-9' : ''}`,
      })}
    </div>
  </div>
);

const INITIAL_FORM = {
  name: '', email: '', company: '', title: '', phone: '',
  website: '', linkedin: '', location: '', status: 'lead', notes: '',
};

const AddLeadModal = ({ onClose, onSave, isSaving }) => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});

  const set = (key, value) => {
    setForm(p => ({ ...p, [key]: value }));
    if (errors[key]) setErrors(p => ({ ...p, [key]: null }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const result = await onSave(form);
    if (result?.success) {
      onClose();
    } else if (result?.error) {
      setErrors({ email: result.error.includes('unique') ? 'Email already exists' : result.error });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <div>
            <h2 className="text-base font-bold text-gray-900">Add New Lead</h2>
            <p className="text-xs text-gray-400 mt-0.5">Manually add a contact to your CRM</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Name + Email */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FormField label="Full Name" icon={User} required>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                />
              </FormField>
              {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
            </div>
            <div>
              <FormField label="Email Address" icon={Mail} required>
                <input
                  type="email"
                  placeholder="john@company.com"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                />
              </FormField>
              {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
            </div>
          </div>

          {/* Company + Title */}
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Company" icon={Building2}>
              <input
                type="text"
                placeholder="Acme Inc."
                value={form.company}
                onChange={e => set('company', e.target.value)}
              />
            </FormField>
            <FormField label="Job Title" icon={Briefcase}>
              <input
                type="text"
                placeholder="VP of Sales"
                value={form.title}
                onChange={e => set('title', e.target.value)}
              />
            </FormField>
          </div>

          {/* Phone + Location */}
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Phone" icon={Phone}>
              <input
                type="tel"
                placeholder="+1 555 000 0000"
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
              />
            </FormField>
            <FormField label="Location" icon={MapPin}>
              <input
                type="text"
                placeholder="New York, US"
                value={form.location}
                onChange={e => set('location', e.target.value)}
              />
            </FormField>
          </div>

          {/* Website + LinkedIn */}
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Website" icon={Globe}>
              <input
                type="url"
                placeholder="https://company.com"
                value={form.website}
                onChange={e => set('website', e.target.value)}
              />
            </FormField>
            <FormField label="LinkedIn" icon={Linkedin}>
              <input
                type="url"
                placeholder="linkedin.com/in/john"
                value={form.linkedin}
                onChange={e => set('linkedin', e.target.value)}
              />
            </FormField>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">CRM Status</label>
            <div className="relative">
              <select
                value={form.status}
                onChange={e => set('status', e.target.value)}
                className={`${FIELD_CLASS} appearance-none pr-8`}
              >
                {Object.entries(STATUS_MAP).map(([key, cfg]) => (
                  <option key={key} value={key}>{cfg.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300 pointer-events-none" />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Notes</label>
            <textarea
              rows={3}
              placeholder="Any relevant context about this lead..."
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              className={`${FIELD_CLASS} resize-none`}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-black text-sm font-bold hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {isSaving ? 'Saving...' : 'Add Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLeadModal;
