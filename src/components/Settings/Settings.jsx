import React, { useState, useEffect, useMemo } from 'react';
import {
    User, Building2, Shield, Bell, Link2,
    Mail, LogOut, Save, CheckCircle,
    Users,
    Camera, UserPlus, X, Check,
    RefreshCw, Plus
} from 'lucide-react';
import { useOrganization } from '../../hooks/useOrganization';
import { useAccounts } from '../../hooks/useAccounts';
import { supabase } from '../../services/supabaseClient';

// ─────────────────────────────────────────────────────────────────────────────
// Shared UI Components
// ─────────────────────────────────────────────────────────────────────────────

const SectionHeader = ({ title, subtitle }) => (
    <div className="mb-8">
        <h2 className="text-[20px] font-black text-slate-900 tracking-tight leading-none">{title}</h2>
        {subtitle && <p className="text-[13px] text-slate-400 font-medium mt-1.5 leading-relaxed">{subtitle}</p>}
    </div>
);

const FieldLabel = ({ children }) => (
    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1.5 ml-1">
        {children}
    </label>
);

const TextInput = ({ className = '', ...props }) => (
    <input
        className={`w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] font-bold text-slate-900 
            placeholder:text-slate-300 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all 
            disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed ${className}`}
        {...props}
    />
);

const SaveFooter = ({ label = 'Save Changes', onSave, saved }) => (
    <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
        <div className={`flex items-center gap-2 transition-all duration-500 ${saved ? 'opacity-100' : 'opacity-0'}`}>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">Saved!</span>
        </div>
        <button
            onClick={onSave}
            className="px-7 py-2.5 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-slate-900/10 active:scale-95 flex items-center gap-2"
        >
            <Save className="w-3.5 h-3.5 text-primary" />
            {label}
        </button>
    </div>
);

const Toggle = ({ enabled, onToggle, label, description }) => (
    <div className="flex items-center justify-between py-4 border-b border-slate-50 last:border-0">
        <div>
            <p className="text-[13px] font-bold text-slate-800 leading-none">{label}</p>
            {description && <p className="text-[11px] text-slate-400 font-medium mt-1">{description}</p>}
        </div>
        <button
            onClick={onToggle}
            className={`relative w-11 h-6 rounded-full transition-colors duration-300 flex-shrink-0 ${enabled ? 'bg-primary' : 'bg-slate-200'}`}
        >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
    </div>
);

const Card = ({ children, className = '' }) => (
    <div className={`bg-white border border-slate-100 rounded-2xl shadow-sm ${className}`}>
        {children}
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// 7.1 — Profile Settings
// ─────────────────────────────────────────────────────────────────────────────
const ProfileSettings = () => {
    const [saved, setSaved] = useState(false);
    const { activeAccount } = useAccounts();
    const [sessionUser, setSessionUser] = useState(null);

    // Fetch real Supabase session on mount
    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            if (data?.session?.user) setSessionUser(data.session.user);
        });
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSessionUser(session?.user || null);
        });
        return () => subscription.unsubscribe();
    }, []);

    // Derive real user info — priority: Supabase session > activeAccount
    const realName  = sessionUser?.user_metadata?.full_name  || sessionUser?.user_metadata?.name  || activeAccount?.name  || activeAccount?.label || '';
    const realEmail = sessionUser?.email || activeAccount?.email || '';
    const avatarUrl = sessionUser?.user_metadata?.avatar_url || sessionUser?.user_metadata?.picture || null;

    // Generate initials from real name or email
    const initials = realName
        ? realName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
        : realEmail.slice(0, 2).toUpperCase();

    const [form, setForm] = useState({ name: '', headline: '', timezone: 'PKT (UTC+5)', phone: '' });

    // Populate form once session loads
    useEffect(() => {
        setForm(f => ({
            ...f,
            name:     realName,
            headline: f.headline || sessionUser?.user_metadata?.hd ? `@ ${sessionUser.user_metadata.hd}` : '',
        }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [realName]);

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="max-w-2xl animate-in fade-in slide-in-from-right-4 duration-500">
            <SectionHeader title="Personal Information" subtitle="Update your profile details, avatar, and personal preferences." />

            {/* Avatar */}
            <Card className="p-6 mb-6">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Profile Photo</p>
                <div className="flex items-center gap-6">
                    <div className="relative group">
                        {avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt={realName}
                                className="w-20 h-20 rounded-[2rem] border-4 border-white shadow-xl object-cover cursor-pointer"
                            />
                        ) : (
                            <div className="w-20 h-20 rounded-[2rem] bg-slate-900 border-4 border-white shadow-xl flex items-center justify-center text-primary text-2xl font-black cursor-pointer">
                                {initials}
                            </div>
                        )}
                        <div className="absolute inset-0 rounded-[2rem] bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                            <Camera className="w-5 h-5 text-white" />
                        </div>
                    </div>
                    <div>
                        <button className="px-4 py-2 bg-slate-100 text-slate-900 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all mb-2">
                            Upload Photo
                        </button>
                        <p className="text-[10px] text-slate-400 font-medium">JPG, GIF or PNG. Max 1MB.</p>
                    </div>
                </div>
            </Card>

            {/* Form Fields */}
            <Card className="p-6 mb-6 space-y-5">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Account Details</p>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <FieldLabel>Full Name</FieldLabel>
                        <TextInput value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your full name" />
                    </div>
                    <div>
                        <FieldLabel>Email Address</FieldLabel>
                        <TextInput value={realEmail} disabled />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <FieldLabel>Professional Headline</FieldLabel>
                        <TextInput value={form.headline} onChange={e => setForm(f => ({ ...f, headline: e.target.value }))} placeholder="e.g. Founder @ Company" />
                    </div>
                    <div>
                        <FieldLabel>Phone Number</FieldLabel>
                        <TextInput value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+1 (555) 000-0000" type="tel" />
                    </div>
                </div>
                <div>
                    <FieldLabel>Timezone</FieldLabel>
                    <select className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] font-bold text-slate-900 focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none">
                        <option>PKT (UTC+5)</option>
                        <option>UTC (UTC+0)</option>
                        <option>EST (UTC-5)</option>
                        <option>PST (UTC-8)</option>
                        <option>IST (UTC+5:30)</option>
                    </select>
                </div>
            </Card>

            {/* Password Change */}
            <Card className="p-6 mb-6 space-y-4">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Change Password</p>
                <div>
                    <FieldLabel>Current Password</FieldLabel>
                    <TextInput type="password" placeholder="••••••••••" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <FieldLabel>New Password</FieldLabel>
                        <TextInput type="password" placeholder="••••••••••" />
                    </div>
                    <div>
                        <FieldLabel>Confirm Password</FieldLabel>
                        <TextInput type="password" placeholder="••••••••••" />
                    </div>
                </div>
            </Card>

            <SaveFooter onSave={handleSave} saved={saved} />
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// 7.2 — Connected Accounts
// ─────────────────────────────────────────────────────────────────────────────
const AccountsSettings = () => {
    const { accounts, activeAccount } = useAccounts();

    return (
        <div className="max-w-2xl animate-in fade-in slide-in-from-right-4 duration-500">
            <SectionHeader title="Connected Accounts" subtitle="Manage all email accounts connected to your CRM workspace." />

            <div className="space-y-3 mb-6">
                {accounts.length > 0 ? (
                    accounts.map(acc => {
                        const isPrimary = activeAccount?.id === acc.id;
                        const provider = acc.type === 'gmail' ? 'Gmail' : acc.type === 'outlook' ? 'Outlook' : 'IMAP/SMTP';
                        const isError = acc.status === 'error';

                        return (
                            <Card key={acc.id} className={`p-5 flex items-center justify-between ${isError ? 'border-red-100' : ''}`}>
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${acc.type === 'gmail' ? 'bg-red-50' : 'bg-blue-50'}`}>
                                        <Mail className={`w-5 h-5 ${acc.type === 'gmail' ? 'text-red-500' : 'text-blue-500'}`} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-[13px] font-black text-slate-900">{acc.email || acc.label}</p>
                                            {isPrimary && (
                                                <span className="text-[9px] font-black bg-primary text-black px-2 py-0.5 rounded-md uppercase tracking-wider">Primary</span>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-slate-400 font-medium">{provider}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest ${
                                        isError ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                    }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${isError ? 'bg-red-500' : 'bg-emerald-500'}`} />
                                        {isError ? 'Error' : 'Connected'}
                                    </span>
                                    {isError && (
                                        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all">
                                            <RefreshCw className="w-3 h-3" /> Reconnect
                                        </button>
                                    )}
                                </div>
                            </Card>
                        );
                    })
                ) : (
                    <div className="p-8 text-center border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/50">
                        <Mail className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                        <p className="text-[13px] font-bold text-slate-400">No accounts connected yet</p>
                    </div>
                )}
            </div>

            <button className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-[12px] font-black text-slate-400 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> Add Another Account
            </button>
        </div>
    );
};


// ─────────────────────────────────────────────────────────────────────────────
// 7.3 — Notifications
// ─────────────────────────────────────────────────────────────────────────────
const NotificationSettings = () => {
    const [saved, setSaved] = useState(false);
    const [notifs, setNotifs] = useState({
        emailReplies:    true,
        campaignUpdates: true,
        weeklyDigest:    false,
        newLeads:        true,
        teamActivity:    false,
        browserPush:     true,
        desktopSound:    false,
        slackUpdates:    false,
    });

    const toggle = (key) => setNotifs(n => ({ ...n, [key]: !n[key] }));
    const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 3000); };

    const groups = [
        {
            title: 'Email Notifications',
            items: [
                { key: 'emailReplies',    label: 'New Email Replies',      description: 'Get notified when a lead replies to a campaign email.' },
                { key: 'campaignUpdates', label: 'Campaign Status Updates', description: 'Alerts when campaigns start, pause, or finish.' },
                { key: 'weeklyDigest',    label: 'Weekly Performance Digest', description: 'A summary of your CRM metrics every Monday.' },
                { key: 'newLeads',        label: 'New Lead Added',          description: 'Notifications when someone imports or adds a new lead.' },
                { key: 'teamActivity',    label: 'Team Activity',           description: 'Updates on team member actions and assignments.' },
            ]
        },
        {
            title: 'Push & Browser',
            items: [
                { key: 'browserPush', label: 'Browser Push Notifications', description: 'Show native browser notifications for urgent alerts.' },
                { key: 'desktopSound', label: 'Sound Alerts',             description: 'Play a sound when a new reply comes in.' },
                { key: 'slackUpdates', label: 'Slack Integration Alerts',  description: 'Forward key events to your connected Slack workspace.' },
            ]
        }
    ];

    return (
        <div className="max-w-2xl animate-in fade-in slide-in-from-right-4 duration-500">
            <SectionHeader title="Notification Preferences" subtitle="Control when and how you receive alerts from your CRM." />
            <div className="space-y-6">
                {groups.map(group => (
                    <Card key={group.title} className="p-6">
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">{group.title}</p>
                        {group.items.map(item => (
                            <Toggle
                                key={item.key}
                                enabled={notifs[item.key]}
                                onToggle={() => toggle(item.key)}
                                label={item.label}
                                description={item.description}
                            />
                        ))}
                    </Card>
                ))}
            </div>
            <SaveFooter onSave={handleSave} saved={saved} />
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// 7.4 — Workspace Settings
// ─────────────────────────────────────────────────────────────────────────────
const WorkspaceSettings = () => {
    const [saved, setSaved] = useState(false);
    const { organization } = useOrganization();

    const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 3000); };

    return (
        <div className="max-w-2xl animate-in fade-in slide-in-from-right-4 duration-500">
            <SectionHeader title="Workspace Settings" subtitle="Configure your organization-wide defaults and branding." />

            <Card className="p-6 mb-5 space-y-5">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Organization Info</p>
                <div>
                    <FieldLabel>Organization Name</FieldLabel>
                    <TextInput defaultValue={organization || 'My Workspace'} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <FieldLabel>Default Timezone</FieldLabel>
                        <select className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] font-bold text-slate-900 focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                            <option>PKT (UTC+5)</option>
                            <option>UTC (UTC+0)</option>
                            <option>EST (UTC-5)</option>
                        </select>
                    </div>
                    <div>
                        <FieldLabel>Language</FieldLabel>
                        <select className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] font-bold text-slate-900 focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                            <option>English (US)</option>
                            <option>English (UK)</option>
                            <option>Urdu</option>
                        </select>
                    </div>
                </div>
                <div>
                    <FieldLabel>Custom Tracking Domain</FieldLabel>
                    <TextInput placeholder="track.yourcompany.com" />
                    <p className="text-[10px] text-slate-400 font-medium mt-1.5 ml-1">Used for email open tracking pixels. Add a CNAME record pointing to our servers.</p>
                </div>
            </Card>

            <Card className="p-6 mb-5">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-5">Outreach Defaults</p>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <FieldLabel>Default Send Time</FieldLabel>
                        <select className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] font-bold text-slate-900 focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                            <option>9:00 AM</option>
                            <option>10:00 AM</option>
                            <option>2:00 PM</option>
                        </select>
                    </div>
                    <div>
                        <FieldLabel>Stop Sequence On</FieldLabel>
                        <select className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] font-bold text-slate-900 focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                            <option>Reply received</option>
                            <option>Unsubscribe</option>
                            <option>Bounce</option>
                        </select>
                    </div>
                </div>
            </Card>

            <SaveFooter onSave={handleSave} saved={saved} />
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// 7.5 — Team Members
// ─────────────────────────────────────────────────────────────────────────────
const ROLE_CONFIG = {
    admin:  { label: 'Admin',  color: 'bg-violet-50 text-violet-700 border-violet-100' },
    editor: { label: 'Editor', color: 'bg-blue-50 text-blue-700 border-blue-100' },
    viewer: { label: 'Viewer', color: 'bg-slate-50 text-slate-600 border-slate-100' },
};

const TeamSettings = () => {
    const [sessionUser, setSessionUser] = useState(null);
    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => setSessionUser(data?.session?.user || null));
    }, []);

    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('editor');
    const [inviteSent, setInviteSent] = useState(false);
    const [otherMembers, setOtherMembers] = useState([
        { id: 2, name: 'Sample User', email: 'user@example.com', role: 'editor', avatar: 'SU' },
    ]);

    // Combine self and others
    const members = useMemo(() => {
        const self = { 
            id: 'self', 
            name: sessionUser?.user_metadata?.full_name || 'You', 
            email: sessionUser?.email || '', 
            role: 'admin', 
            isSelf: true,
            avatar: sessionUser?.user_metadata?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'
        };
        return [self, ...otherMembers];
    }, [sessionUser, otherMembers]);

    const handleInvite = () => {
        if (!inviteEmail) return;
        setInviteSent(true);
        setTimeout(() => { setInviteSent(false); setInviteEmail(''); }, 3000);
    };

    const removeM = (id) => setOtherMembers(m => m.filter(x => x.id !== id));


    return (
        <div className="max-w-2xl animate-in fade-in slide-in-from-right-4 duration-500">
            <SectionHeader title="Team Members" subtitle="Manage who has access to your CRM workspace and their roles." />

            {/* Invite Form */}
            <Card className="p-6 mb-6">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Invite New Member</p>
                <div className="flex gap-3">
                    <TextInput
                        value={inviteEmail}
                        onChange={e => setInviteEmail(e.target.value)}
                        placeholder="colleague@company.com"
                        type="email"
                        className="flex-1"
                    />
                    <select
                        value={inviteRole}
                        onChange={e => setInviteRole(e.target.value)}
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-[12px] font-black text-slate-700 focus:ring-2 focus:ring-primary/20 outline-none"
                    >
                        <option value="editor">Editor</option>
                        <option value="viewer">Viewer</option>
                        <option value="admin">Admin</option>
                    </select>
                    <button
                        onClick={handleInvite}
                        className={`px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2 flex-shrink-0 ${
                            inviteSent ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white hover:bg-black'
                        }`}
                    >
                        {inviteSent ? <><Check className="w-3.5 h-3.5" /> Sent!</> : <><UserPlus className="w-3.5 h-3.5" /> Invite</>}
                    </button>
                </div>
            </Card>

            {/* Member List */}
            <div className="space-y-2">
                {members.map(m => {
                    const rc = ROLE_CONFIG[m.role];
                    return (
                        <Card key={m.id} className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-900 text-primary font-black text-[12px] flex items-center justify-center">
                                    {m.avatar}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="text-[13px] font-black text-slate-900">{m.name}</p>
                                        {m.isSelf && <span className="text-[9px] font-black bg-primary text-black px-2 py-0.5 rounded-md">You</span>}
                                    </div>
                                    <p className="text-[11px] text-slate-400 font-medium">{m.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border ${rc.color}`}>
                                    {rc.label}
                                </span>
                                {!m.isSelf && (
                                    <button onClick={() => removeM(m.id)} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};





// ─────────────────────────────────────────────────────────────────────────────
// 7.8 — Integrations
// ─────────────────────────────────────────────────────────────────────────────
const IntegrationsSettings = () => {
    const { accounts } = useAccounts();

    const isGmailConnected = accounts.some(a => a.type === 'gmail');


    const integrations = [
        { id: 'gmail',    name: 'Google Workspace', desc: 'Gmail inbox sync and sending via API.',     icon: Mail,   color: 'bg-red-50',     iconColor: 'text-red-500',   status: isGmailConnected ? 'connected' : 'disconnected' },
    ];


    return (
        <div className="max-w-2xl animate-in fade-in slide-in-from-right-4 duration-500">
            <SectionHeader title="Integrations" subtitle="Connect third-party services and configure automation webhooks." />

            <div className="grid gap-3 mb-8">
                {integrations.map(item => {
                    const Icon = item.icon;
                    const isConnected = item.status === 'connected';
                    return (
                        <Card key={item.id} className="p-5 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`w-11 h-11 rounded-2xl ${item.color} flex items-center justify-center`}>
                                    <Icon className={`w-5 h-5 ${item.iconColor}`} />
                                </div>
                                <div>
                                    <p className="text-[13px] font-black text-slate-900">{item.name}</p>
                                    <p className="text-[11px] text-slate-400 font-medium">{item.desc}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {isConnected ? (
                                    <>
                                        <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Connected
                                        </span>
                                        <button className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                                            <Link2 className="w-3.5 h-3.5" />
                                        </button>
                                    </>
                                ) : (
                                    <button className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">
                                        Connect
                                    </button>
                                )}
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};


// ─────────────────────────────────────────────────────────────────────────────
// Sidebar Navigation
// ─────────────────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
    { id: 'profile',      label: 'Profile',           icon: User,       group: 'Account' },
    { id: 'accounts',     label: 'Connected Accounts', icon: Mail,       group: 'Account' },
    { id: 'notifications',label: 'Notifications',      icon: Bell,       group: 'Account' },
    { id: 'workspace',    label: 'Workspace',          icon: Building2,  group: 'Organization' },
    { id: 'team',         label: 'Team Members',       icon: Users,      group: 'Organization' },
    { id: 'integrations', label: 'Integrations',       icon: Link2,      group: 'Developer' },
];

const SettingsSidebar = ({ activeTab, setActiveTab, onLogout }) => {
    const groups = [...new Set(NAV_ITEMS.map(i => i.group))];
    return (
        <div className="w-60 flex-shrink-0 border-r border-slate-100 h-full bg-slate-50/30 flex flex-col py-6 px-4">
            <div className="mb-6 px-3">
                <p className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Settings</p>
            </div>
            <div className="flex-1 space-y-5 overflow-y-auto">
                {groups.map(group => (
                    <div key={group}>
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.25em] px-3 mb-2">{group}</p>
                        <div className="space-y-0.5">
                            {NAV_ITEMS.filter(i => i.group === group).map(item => {
                                const Icon = item.icon;
                                const isActive = activeTab === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveTab(item.id)}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[12px] font-bold transition-all text-left ${
                                            isActive
                                                ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                                                : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'
                                        }`}
                                    >
                                        <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-primary' : 'text-slate-400'}`} />
                                        {item.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
            <button
                onClick={onLogout}
                className="flex items-center gap-3 px-3 py-2.5 text-[12px] font-black text-red-500 hover:bg-red-50 rounded-xl transition-all mt-2"
            >
                <LogOut className="w-3.5 h-3.5" />
                Sign out
            </button>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Settings Page
// ─────────────────────────────────────────────────────────────────────────────
const Settings = () => {
    const [activeTab, setActiveTab] = useState('profile');

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            // App.jsx will automatically catch this and show Login
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'profile':       return <ProfileSettings />;
            case 'accounts':      return <AccountsSettings />;
            case 'notifications': return <NotificationSettings />;
            case 'workspace':     return <WorkspaceSettings />;
            case 'team':          return <TeamSettings />;
            case 'integrations':  return <IntegrationsSettings />;
            default:              return <ProfileSettings />;
        }
    };

    return (
        <div className="flex h-full bg-white overflow-hidden">
            <SettingsSidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
            <div className="flex-1 overflow-y-auto px-10 py-10 bg-[#fcfdfe] custom-scrollbar">
                {renderContent()}
            </div>
        </div>
    );
};

export default Settings;
