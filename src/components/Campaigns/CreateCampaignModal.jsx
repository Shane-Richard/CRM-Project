import React, { useState } from 'react';
import { X, Megaphone, ChevronRight, Mail, Users, FileText, Tag, Plus, Trash2, Search, Check, Filter } from 'lucide-react';
import { useLeads } from '../../hooks/useLeads';

const STEP_GOALS = [
    { id: 'cold_outreach',  label: 'Cold Outreach',     desc: 'Reach new prospects' },
    { id: 'nurture',        label: 'Lead Nurture',       desc: 'Warm up existing leads' },
    { id: 'partnership',    label: 'Partnership',        desc: 'Find strategic partners' },
    { id: 'follow_up',      label: 'Follow-up',          desc: 'Re-engage silent leads' },
];

// Wizard step indicator
const StepBadge = ({ step, current, label }) => {
    const done    = step < current;
    const active  = step === current;
    return (
        <div className="flex items-center gap-3">
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-[11px] font-black transition-all ${
                done   ? 'bg-primary text-black' :
                active ? 'bg-slate-900 text-primary border-2 border-primary' :
                         'bg-slate-100 text-slate-400'
            }`}>
                {done ? '✓' : step}
            </div>
            <span className={`text-[12px] font-bold hidden sm:block ${active ? 'text-slate-900' : 'text-slate-400'}`}>{label}</span>
        </div>
    );
};

const CreateCampaignModal = ({ onClose, onCreate }) => {
    const [step, setStep] = useState(1);
    const { leads, isLoading, updateFilter, filters } = useLeads();
    
    const [form, setForm] = useState({
        name: '',
        goal: '',
        tags: [],
        tagInput: '',
        selectedLeads: new Set(),
        subjectLine: '',
        senderName: '',
        senderEmail: '',
        steps: [{ id: 1, subject: '', delay: 0, body: '' }],
    });
    const [errors, setErrors] = useState({});

    const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

    const addTag = () => {
        const t = form.tagInput.trim();
        if (t && !form.tags.includes(t)) {
            set('tags', [...form.tags, t]);
        }
        set('tagInput', '');
    };

    const toggleLead = (id) => {
        const next = new Set(form.selectedLeads);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        set('selectedLeads', next);
    };

    const selectAllLeads = () => {
        if (form.selectedLeads.size === leads.length) {
            set('selectedLeads', new Set());
        } else {
            set('selectedLeads', new Set(leads.map(l => l.id)));
        }
    };

    const addStep = () => {
        const last = form.steps[form.steps.length - 1];
        set('steps', [...form.steps, { id: last.id + 1, subject: '', delay: last.delay + 3, body: '' }]);
    };

    const removeStep = (id) => {
        if (form.steps.length <= 1) return;
        set('steps', form.steps.filter(s => s.id !== id));
    };

    const updateStep = (id, key, val) => {
        set('steps', form.steps.map(s => s.id === id ? { ...s, [key]: val } : s));
    };

    const validate = () => {
        const e = {};
        if (step === 1) {
            if (!form.name.trim()) e.name = 'Campaign name required';
            if (!form.goal) e.goal = 'Select a goal';
        }
        if (step === 2) {
            if (form.selectedLeads.size === 0) e.leads = 'Select at least one lead';
        }
        if (step === 3) {
            if (!form.senderName.trim()) e.senderName = 'Sender name required';
            if (!form.senderEmail.trim()) e.senderEmail = 'Sender email required';
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const next = () => { if (validate()) setStep(s => s + 1); };
    const back = () => setStep(s => s - 1);

    const handleSubmit = () => {
        onCreate({
            name: form.name,
            goal: form.goal,
            tags: form.tags,
            leadIds: Array.from(form.selectedLeads),
            senderName: form.senderName,
            senderEmail: form.senderEmail,
            sequence: form.steps,
            subjectLine: form.steps[0]?.subject || form.name,
        });
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between px-8 pt-8 pb-6 border-b border-slate-100 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center">
                            <Megaphone className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-[18px] font-black text-slate-900">New Campaign</h2>
                            <p className="text-[11px] text-slate-400 font-medium tracking-wide">Step {step} of 4 • {form.selectedLeads.size} leads selected</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Step Indicators */}
                <div className="flex items-center gap-4 px-8 py-4 bg-slate-50 border-b border-slate-100 flex-shrink-0">
                    <StepBadge step={1} current={step} label="Basics" />
                    <div className="flex-1 h-px bg-slate-200" />
                    <StepBadge step={2} current={step} label="Leads" />
                    <div className="flex-1 h-px bg-slate-200" />
                    <StepBadge step={3} current={step} label="Sender" />
                    <div className="flex-1 h-px bg-slate-200" />
                    <StepBadge step={4} current={step} label="Sequence" />
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-8 py-6">

                    {/* ── Step 1: Basics ── */}
                    {step === 1 && (
                        <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div>
                                <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">Campaign Name *</label>
                                <input
                                    value={form.name}
                                    onChange={e => set('name', e.target.value)}
                                    placeholder="e.g. Q1 SaaS Outreach"
                                    className={`w-full px-4 py-3 rounded-2xl border-2 text-[13px] font-medium text-slate-900 bg-slate-50 focus:bg-white focus:outline-none transition-all ${errors.name ? 'border-red-300 focus:border-red-400' : 'border-slate-200 focus:border-primary'}`}
                                />
                                {errors.name && <p className="text-[11px] text-red-500 mt-1 font-semibold">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">Campaign Goal *</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {STEP_GOALS.map(g => (
                                        <button
                                            key={g.id}
                                            onClick={() => set('goal', g.id)}
                                            className={`p-4 rounded-2xl border-2 text-left transition-all ${
                                                form.goal === g.id
                                                    ? 'border-primary bg-primary/5 shadow-sm'
                                                    : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                                            }`}
                                        >
                                            <p className={`text-[12px] font-black mb-0.5 ${form.goal === g.id ? 'text-slate-900' : 'text-slate-700'}`}>{g.label}</p>
                                            <p className="text-[10px] text-slate-400 font-medium">{g.desc}</p>
                                        </button>
                                    ))}
                                </div>
                                {errors.goal && <p className="text-[11px] text-red-500 mt-1 font-semibold">{errors.goal}</p>}
                            </div>

                            <div>
                                <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">Tags (optional)</label>
                                <div className="flex gap-2 mb-2 flex-wrap">
                                    {form.tags.map(t => (
                                        <span key={t} className="flex items-center gap-1 text-[11px] font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-lg">
                                            {t}
                                            <button onClick={() => set('tags', form.tags.filter(x => x !== t))} className="text-slate-400 hover:text-red-500">×</button>
                                        </span>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        value={form.tagInput}
                                        onChange={e => set('tagInput', e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && addTag()}
                                        placeholder="Add tag..."
                                        className="flex-1 px-4 py-2.5 rounded-xl border-2 border-slate-200 bg-slate-50 text-[12px] font-medium focus:outline-none focus:border-primary"
                                    />
                                    <button onClick={addTag} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[11px] font-black hover:bg-black transition-all">
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Step 2: Leads ── */}
                    {step === 2 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="flex items-end justify-between mb-2">
                                <div>
                                    <p className="text-[12px] font-semibold text-slate-500">Select leads from your CRM to target with this campaign.</p>
                                </div>
                                <div className="flex gap-2">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                        <input
                                            type="text"
                                            value={filters.search}
                                            onChange={e => updateFilter('search', e.target.value)}
                                            placeholder="Search leads..."
                                            className="pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-medium focus:outline-none focus:border-primary transition-all w-48"
                                        />
                                    </div>
                                    <button
                                        onClick={selectAllLeads}
                                        className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-[11px] font-black text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2"
                                    >
                                        {form.selectedLeads.size === leads.length ? 'Deselect All' : 'Select Page'}
                                    </button>
                                </div>
                            </div>

                            {isLoading ? (
                                <div className="py-20 flex flex-col items-center justify-center gap-3">
                                    <div className="w-8 h-8 border-2 border-primary border-t-transparent animate-spin rounded-full" />
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Hydrating leads...</p>
                                </div>
                            ) : leads.length === 0 ? (
                                <div className="py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                                    <Users className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                                    <p className="text-[13px] font-black text-slate-500">No leads found</p>
                                    <p className="text-[11px] text-slate-400 font-medium">Try adjusting your search filters.</p>
                                </div>
                            ) : (
                                <div className="border border-slate-100 rounded-2xl overflow-hidden">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50 border-b border-slate-100">
                                            <tr>
                                                <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 w-12">
                                                    <div className="flex items-center justify-center">
                                                        <div
                                                            onClick={selectAllLeads}
                                                            className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer transition-all ${
                                                                form.selectedLeads.size === leads.length ? 'bg-primary border-primary' : 'bg-white border-slate-300'
                                                            }`}
                                                        >
                                                            {form.selectedLeads.size === leads.length && <Check className="w-3 h-3 text-black" strokeWidth={4} />}
                                                        </div>
                                                    </div>
                                                </th>
                                                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Name / Company</th>
                                                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Email</th>
                                                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right pr-6">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {leads.map(l => (
                                                <tr
                                                    key={l.id}
                                                    onClick={() => toggleLead(l.id)}
                                                    className={`hover:bg-slate-50 cursor-pointer transition-colors ${form.selectedLeads.has(l.id) ? 'bg-primary/3' : ''}`}
                                                >
                                                    <td className="px-5 py-3">
                                                        <div className="flex items-center justify-center">
                                                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                                                                form.selectedLeads.has(l.id) ? 'bg-primary border-primary' : 'bg-white border-slate-200'
                                                            }`}>
                                                                {form.selectedLeads.has(l.id) && <Check className="w-3 h-3 text-black" strokeWidth={4} />}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex flex-col">
                                                            <span className="text-[12px] font-bold text-slate-900 leading-tight">{l.name}</span>
                                                            <span className="text-[10px] text-slate-400 font-medium">{l.company}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="text-[12px] font-medium text-slate-600">{l.email}</span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right pr-6">
                                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wider ${
                                                            l.status === 'interested' ? 'bg-emerald-100 text-emerald-700' :
                                                            l.status === 'replied'    ? 'bg-blue-100 text-blue-700' :
                                                            'bg-slate-100 text-slate-500'
                                                        }`}>
                                                            {l.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                            {errors.leads && <p className="text-[11px] text-red-500 mt-1 font-semibold">{errors.leads}</p>}
                        </div>
                    )}

                    {/* ── Step 3: Sender ── */}
                    {step === 3 && (
                        <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl mb-4">
                                <p className="text-[12px] font-bold text-slate-700">Emails will be sent from this sender identity. Make sure it matches your connected Gmail account.</p>
                            </div>
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">Sender Name *</label>
                                    <input
                                        value={form.senderName}
                                        onChange={e => set('senderName', e.target.value)}
                                        placeholder="Your Name"
                                        className={`w-full px-4 py-3 rounded-2xl border-2 text-[13px] font-medium text-slate-900 bg-slate-50 focus:bg-white focus:outline-none transition-all ${errors.senderName ? 'border-red-300' : 'border-slate-200 focus:border-primary'}`}
                                    />
                                    {errors.senderName && <p className="text-[11px] text-red-500 mt-1 font-semibold">{errors.senderName}</p>}
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">Sender Email *</label>
                                    <input
                                        value={form.senderEmail}
                                        onChange={e => set('senderEmail', e.target.value)}
                                        placeholder="you@company.com"
                                        className={`w-full px-4 py-3 rounded-2xl border-2 text-[13px] font-medium text-slate-900 bg-slate-50 focus:bg-white focus:outline-none transition-all ${errors.senderEmail ? 'border-red-300' : 'border-slate-200 focus:border-primary'}`}
                                    />
                                    {errors.senderEmail && <p className="text-[11px] text-red-500 mt-1 font-semibold">{errors.senderEmail}</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Step 4: Sequence ── */}
                    {step === 4 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <p className="text-[12px] font-semibold text-slate-500">Build your email sequence. Each step is sent after the previous with a delay.</p>
                            {form.steps.map((s, idx) => (
                                <div key={s.id} className="p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="w-6 h-6 rounded-lg bg-slate-900 text-primary text-[10px] font-black flex items-center justify-center">{idx + 1}</span>
                                            <span className="text-[12px] font-black text-slate-700">Step {idx + 1}</span>
                                        </div>
                                        {form.steps.length > 1 && (
                                            <button onClick={() => removeStep(s.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                    <input
                                        value={s.subject}
                                        onChange={e => updateStep(s.id, 'subject', e.target.value)}
                                        placeholder="Subject line (use {{first_name}}, {{company}})"
                                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-[12px] font-medium focus:outline-none focus:border-primary"
                                    />
                                    {idx > 0 && (
                                        <div className="flex items-center gap-3">
                                            <span className="text-[11px] text-slate-500 font-medium">Send after</span>
                                            <input
                                                type="number"
                                                min={1}
                                                value={s.delay}
                                                onChange={e => updateStep(s.id, 'delay', parseInt(e.target.value) || 1)}
                                                className="w-16 px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-[12px] font-bold text-center focus:outline-none focus:border-primary"
                                            />
                                            <span className="text-[11px] text-slate-500 font-medium">days of no reply</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                            <button
                                onClick={addStep}
                                className="w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl text-[12px] font-black text-slate-400 hover:border-primary hover:text-slate-700 transition-all flex items-center justify-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Add Step
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-8 py-5 border-t border-slate-100 flex-shrink-0">
                    <button
                        onClick={step === 1 ? onClose : back}
                        className="px-5 py-2.5 text-[12px] font-black text-slate-500 hover:text-slate-900 transition-colors"
                    >
                        {step === 1 ? 'Cancel' : '← Back'}
                    </button>
                    <button
                        onClick={step === 4 ? handleSubmit : next}
                        className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-[12px] font-black hover:bg-black transition-all shadow-lg shadow-slate-900/20 hover:-translate-y-0.5 active:translate-y-0"
                    >
                        {step === 4 ? (
                            <><Megaphone className="w-4 h-4 text-primary" /> Create Campaign</>
                        ) : (
                            <>Continue <ChevronRight className="w-4 h-4 text-primary" /></>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateCampaignModal;
