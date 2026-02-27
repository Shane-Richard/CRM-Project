import React, { useState } from 'react';
import { 
    User, Building, CreditCard, Shield, Globe, 
    Bell, Palette, Mail, Github, LogOut, 
    ChevronRight, ExternalLink, Save, CheckCircle
} from 'lucide-react';
import { useOrganization } from '../../hooks/useOrganization';

// ── Settings Sidebar Component ──────────────────────────────────────────────
const SettingsSidebar = ({ activeTab, setActiveTab }) => {
    const categories = [
        { id: 'profile',    label: 'Profile',       icon: User },
        { id: 'organization',label: 'Organization',  icon: Building },
        { id: 'billing',    label: 'Billing',       icon: CreditCard },
        { id: 'security',   label: 'Security',      icon: Shield },
        { id: 'notifications',label: 'Notifications',icon: Bell },
        { id: 'appearance', label: 'Appearance',    icon: Palette },
        { id: 'integrations',label: 'Integrations', icon: Mail },
    ];

    return (
        <div className="w-64 flex-shrink-0 border-r border-slate-100 h-full bg-slate-50/50 p-6 flex flex-col">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 px-3">System Settings</h3>
            <div className="space-y-1 flex-1">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveTab(cat.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-bold transition-all ${
                            activeTab === cat.id 
                                ? 'bg-white text-slate-900 shadow-sm border border-slate-200' 
                                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                    >
                        <cat.icon className={`w-4 h-4 ${activeTab === cat.id ? 'text-primary' : 'text-slate-400'}`} />
                        {cat.label}
                    </button>
                ))}
            </div>
            <button className="flex items-center gap-3 px-3 py-3 text-[13px] font-black text-red-500 hover:bg-red-50 rounded-xl transition-all">
                <LogOut className="w-4 h-4" />
                Logout
            </button>
        </div>
    );
};

// ── Profile Settings ────────────────────────────────────────────────────────
const ProfileSettings = () => (
    <div className="max-w-2xl space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
        <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight mb-1">Personal Information</h2>
            <p className="text-[13px] text-slate-400 font-medium">Update your profile details and representative information.</p>
        </div>

        <div className="space-y-6">
            <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-[2rem] bg-slate-900 border-4 border-white shadow-xl flex items-center justify-center text-primary text-2xl font-black relative group cursor-pointer">
                    SY
                    <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[9px] font-black uppercase tracking-widest text-center py-1 opacity-0 group-hover:opacity-100 transition-opacity rounded-b-[1.75rem]">Edit</div>
                </div>
                <div>
                    <button className="px-4 py-2 bg-slate-100 text-slate-900 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Upload New</button>
                    <p className="text-[10px] text-slate-400 font-medium mt-2">JPG, GIF or PNG. 1MB max.</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                    <input type="text" defaultValue="Sharoon Younas" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                    <input type="email" defaultValue="sharoon@txb.ai" disabled className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] font-bold text-slate-400 cursor-not-allowed" />
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Professional Headline</label>
                <input type="text" defaultValue="Founder @ TXB AI" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
            </div>
        </div>

        <div className="pt-4 flex items-center justify-between border-t border-slate-100">
            <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-[11px] font-black uppercase tracking-widest">Everything is up to date</span>
            </div>
            <button className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-900/10 active:scale-95 flex items-center gap-2">
                <Save className="w-3.5 h-3.5 text-primary" />
                Save Changes
            </button>
        </div>
    </div>
);

// ── Integrations Settings ────────────────────────────────────────────────────
const IntegrationsSettings = () => (
    <div className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
        <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight mb-1">App Integrations</h2>
            <p className="text-[13px] text-slate-400 font-medium">Connect and manage external services for your workspace.</p>
        </div>

        <div className="grid gap-4">
            {/* Gmail */}
            <div className="p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center">
                        <Mail className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                        <h4 className="text-[15px] font-black text-slate-900">Google Workspace</h4>
                        <p className="text-[12px] text-slate-400 font-medium">Syncing inbox and sending emails via API.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-100">Connected</span>
                    <button className="p-2 hover:bg-slate-50 text-slate-300 hover:text-slate-600 transition-all"><Settings className="w-4 h-4" /></button>
                </div>
            </div>

            {/* Supabase */}
            <div className="p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
                        <Globe className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                        <h4 className="text-[15px] font-black text-slate-900">Supabase DB</h4>
                        <p className="text-[12px] text-slate-400 font-medium">Live connection for CRM lead storage.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-100">Live</span>
                    <button className="p-2 hover:bg-slate-50 text-slate-300 hover:text-slate-600 transition-all"><Settings className="w-4 h-4" /></button>
                </div>
            </div>

            {/* GitHub */}
            <div className="p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm flex items-center justify-between opacity-60">
                <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-900">
                        <Github className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="text-[15px] font-black text-slate-900">GitHub Enterprise</h4>
                        <p className="text-[12px] text-slate-400 font-medium">Sync project data and deployments.</p>
                    </div>
                </div>
                <button className="px-5 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">Connect</button>
            </div>
        </div>
    </div>
);

// ── Main Settings Component ─────────────────────────────────────────────────
const Settings = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const { organization } = useOrganization();

    const renderContent = () => {
        switch (activeTab) {
            case 'profile':      return <ProfileSettings />;
            case 'integrations': return <IntegrationsSettings />;
            case 'organization':
                return (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        <h2 className="text-xl font-black text-slate-900 tracking-tight mb-1">Organization: {organization}</h2>
                        <p className="text-[13px] text-slate-400 font-medium mb-8">Manage your company workspace and team access control.</p>
                        <div className="p-12 border-2 border-dashed border-slate-100 rounded-[3rem] text-center bg-slate-50/30">
                            <Building className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                            <p className="text-[14px] font-black text-slate-400">Organization management is coming in Phase 8.</p>
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500 flex flex-col items-center justify-center py-20 px-10 text-center bg-slate-50/50 rounded-[3rem] border border-slate-100">
                        <div className="w-16 h-16 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-6">
                            <Palette className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-lg font-black text-slate-900 mb-2 capitalize">{activeTab} Settings</h3>
                        <p className="text-sm text-slate-400 font-medium max-w-sm mb-6 leading-relaxed">
                            We're currently focusing on core CRM modules. {activeTab} settings will be released in the upcoming sprint.
                        </p>
                        <button className="text-[11px] font-black text-primary uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
                            View Roadmap <ExternalLink className="w-3 h-3" />
                        </button>
                    </div>
                );
        }
    };

    return (
        <div className="flex h-full bg-white">
            <SettingsSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="flex-1 overflow-y-auto px-12 py-12 custom-scrollbar">
                {renderContent()}
            </div>
        </div>
    );
};

export default Settings;
