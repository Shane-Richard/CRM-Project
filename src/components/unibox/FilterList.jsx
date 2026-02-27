import React, { useState, memo } from 'react';
import { 
  Plus, 
  Filter, 
  Check, 
  ChevronDown, 
  ChevronRight, 
  Search, 
  RefreshCw, 
  Loader2,
  AlertCircle, 
  ExternalLink, 
  User,
  Zap,
  Tag,
  Hash,
  X,
  MoreHorizontal,
  LogOut,
  Wifi
} from 'lucide-react';

import UniversalModal from '../ui/UniversalModal';
import { useAccounts } from '../../hooks/useAccounts';
import { useUI } from '../../hooks/useUI.jsx';
import { useOrganization } from '../../hooks/useOrganization.jsx';
import ConnectionSelector from './ConnectionSelector';
import { mailService } from '../../services/MailService';
import { getAutoConfig } from '../../config/mailConfig';
import { normalizeEmail } from '../../utils/normalizeEmail';
import { useToast } from '../../hooks/useToast';

const NavGroup = ({ title, children, defaultOpen = true, rightAction }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mb-6">
      {title && (
        <div 
            role="button"
            tabIndex={0}
            onClick={() => setIsOpen(!isOpen)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsOpen(!isOpen); } }}
            className="flex items-center justify-between w-full text-[11px] font-bold text-slate-400 px-6 py-2 uppercase tracking-[0.1em] hover:text-slate-600 transition-colors cursor-pointer select-none"
        >
            <span>{title}</span>
            <div className="flex items-center gap-2">
                {rightAction && (
                    <div onClick={(e) => e.stopPropagation()}>
                        {rightAction}
                    </div>
                )}
                <div className="text-slate-300">
                    {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </div>
            </div>
        </div>
      )}
      
      {isOpen && (
        <div className="px-3 space-y-0.5 animate-in fade-in slide-in-from-top-1 duration-200">
            {children}
        </div>
      )}
    </div>
  );
};

const FilterItem = memo(({ id, label, icon: Icon, activeFilter, onClick, count, color, isOnline, isInbox, onRemove }) => {
  const isActive = activeFilter === id;
  
  return (
    <button
      onClick={() => onClick(id)}
      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group relative mb-0.5 ${
        isActive 
          ? 'bg-white text-slate-900 shadow-[0_4px_12px_rgba(0,0,0,0.05)] scale-[1.02] z-10' 
          : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-900'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className={`flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-300 ${
          isActive ? 'bg-primary text-black' : 'bg-slate-100 group-hover:bg-white text-slate-400 group-hover:text-slate-600'
        }`}>
          {Icon && <Icon className="w-3.5 h-3.5" style={!isActive && color ? { color } : {}} />}
        </div>
        <span className={`text-[13px] tracking-tight truncate ${isActive ? 'font-bold' : 'font-medium'}`}>{label}</span>
      </div>
      
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {isOnline && <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />}
        {count !== undefined && count > 0 && (
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
            isActive ? 'bg-slate-100 text-slate-900' : 'bg-slate-200/50 text-slate-500 group-hover:bg-slate-200'
          }`}>
            {count}
          </span>
        )}
        {/* Remove button — only for inbox accounts, visible on hover */}
        {isInbox && onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(id);
            }}
            className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-red-100 text-slate-400 hover:text-red-500 transition-all duration-200 flex-shrink-0"
            title="Remove account"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
      
      {isActive && (
        <div className="absolute -left-1 top-2 bottom-2 w-1.5 bg-primary rounded-r-full shadow-[0_0_12px_rgba(178,244,14,0.4)]" />
      )}
    </button>
  );
});


// ─── Gmail Inbox Item with dropdown menu ───────────────────────────────────
const GmailInboxItem = memo(({ inbox, activeFilter, onSelectFilter, count, onDisconnect, onSync, isSyncing }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const menuRef = React.useRef(null);
  const isActive = activeFilter === inbox.id;
  const label = normalizeEmail(inbox.label);

  // Close menu on outside click
  React.useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const handleDisconnect = async () => {
    setMenuOpen(false);
    setDisconnecting(true);
    await onDisconnect(inbox.id, label);
    setDisconnecting(false);
  };

  return (
    <div className={`relative group flex items-center mb-0.5 rounded-xl transition-all duration-200 ${
      isActive 
        ? 'bg-white shadow-[0_4px_12px_rgba(0,0,0,0.05)] scale-[1.02] z-10' 
        : 'hover:bg-slate-200/50'
    }`}>
      
      {/* Main clickable row */}
      <button
        onClick={() => onSelectFilter(inbox.id)}
        className="flex-1 flex items-center gap-3 px-3 py-2.5 min-w-0"
      >
        {/* Icon */}
        <div className={`relative flex items-center justify-center w-7 h-7 rounded-lg flex-shrink-0 transition-all duration-300 ${
          isActive ? 'bg-primary text-black' : 'bg-slate-100 group-hover:bg-white text-slate-400 group-hover:text-slate-600'
        }`}>
          {disconnecting 
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <User className="w-3.5 h-3.5" />
          }
          {/* Green online dot */}
          <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-green-500 border border-white shadow-[0_0_6px_rgba(34,197,94,0.5)]" />
        </div>

        {/* Label + badge */}
        <span className={`text-[13px] tracking-tight truncate flex-1 text-left ${
          isActive ? 'font-bold text-slate-900' : 'font-medium text-slate-500 group-hover:text-slate-900'
        }`}>
          {label}
        </span>

        {count > 0 && (
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0 ${
            isActive ? 'bg-slate-100 text-slate-900' : 'bg-slate-200/50 text-slate-500'
          }`}>
            {count}
          </span>
        )}
      </button>

      {/* 3-dot menu button */}
      <div className="relative flex-shrink-0 pr-2" ref={menuRef}>
        <button
          onClick={(e) => { e.stopPropagation(); setMenuOpen(v => !v); }}
          className={`opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all duration-200 ${
            menuOpen
              ? 'opacity-100 bg-slate-200 text-slate-700'
              : 'hover:bg-slate-200 text-slate-400 hover:text-slate-700'
          }`}
          title="Account options"
        >
          <MoreHorizontal className="w-3.5 h-3.5" />
        </button>

        {/* Dropdown */}
        {menuOpen && (
          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
            {/* Sync option */}
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onSync && onSync(inbox.label); }}
              disabled={isSyncing}
              className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                {isSyncing 
                  ? <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin" />
                  : <RefreshCw className="w-3.5 h-3.5 text-blue-500" />
                }
              </div>
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </button>

            {/* Divider */}
            <div className="h-px bg-slate-100 mx-3" />

            {/* Disconnect */}
            <button
              onClick={(e) => { e.stopPropagation(); handleDisconnect(); }}
              disabled={disconnecting}
              className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-semibold text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              <div className="w-6 h-6 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                {disconnecting 
                  ? <Loader2 className="w-3.5 h-3.5 text-red-500 animate-spin" />
                  : <LogOut className="w-3.5 h-3.5 text-red-500" />
                }
              </div>
              {disconnecting ? 'Disconnecting...' : 'Disconnect Gmail'}
            </button>
          </div>
        )}
      </div>

      {/* Active indicator bar */}
      {isActive && (
        <div className="absolute -left-1 top-2 bottom-2 w-1.5 bg-primary rounded-r-full shadow-[0_0_12px_rgba(178,244,14,0.4)]" />
      )}
    </div>
  );
});



const FilterList = memo(({ 
  filters = [], 
  campaigns = [],
  inboxes = [],
  moreFilters = [],
  activeFilter, 
  onSelectFilter,
  counts = {},
  isSyncing = false,
  onSync,
  lastSyncTime,
  lastSyncLabel
}) => {
  const { isAddAccountOpen, modalView, setModalView, openAddAccountModal, closeAddAccountModal } = useUI();
  const { addAccount, removeAccount } = useAccounts();
  const { addOrganization } = useOrganization();
  const { showToast } = useToast();

  // ── Gmail disconnect handler
  const handleDisconnectGmail = async (accountId, accountLabel) => {
    try {
      // 1. Stop all background sync
      const { gmailSyncEngine } = await import('../../services/GmailSyncEngine');
      gmailSyncEngine.destroy();

      // 2. Clear Gmail token from localStorage
      localStorage.removeItem('gmail_access_token');

      // 3. Remove from accounts state
      removeAccount(accountId);

      showToast({ message: `"${accountLabel}" disconnected from Gmail`, type: 'success' });
    } catch (err) {
      console.error('[Disconnect] Error:', err);
      showToast({ message: 'Failed to disconnect. Try again.', type: 'error' });
    }
  };

  const [searchLocal, setSearchLocal] = useState('');

  const [manualData, setManualData] = useState({
      email: '',
      smtpHost: '',
      smtpPort: '587',
      imapHost: '',
      imapPort: '993',
      password: ''
  });

  const handleManualInputChange = (field, value) => {
      const nextData = { ...manualData, [field]: value };
      
      if (field === 'email' && value.includes('@')) {
          try {
              const config = getAutoConfig(value);
              if (config) {
                  nextData.smtpHost = config.smtp.host;
                  nextData.smtpPort = config.smtp.port.toString();
                  nextData.imapHost = config.imap.host;
                  nextData.imapPort = config.imap.port.toString();
              }
          } catch (e) {
              console.warn("Auto-config failed:", e);
          }
      }
      setManualData(nextData);
  };

  const handleAddAccount = async (type) => {
      if (type === 'manual') {
          setModalView('manual_form');
          return;
      }
      
      if (type === 'gmail') {
          try {
              const res = await mailService.connectGmail();
              const cleanEmail = normalizeEmail(res.email);
              addAccount({ label: cleanEmail, type: 'gmail', ...res, email: cleanEmail });
              await addOrganization(cleanEmail, 'gmail.com');
              closeAddAccountModal();
              showToast({ message: "Gmail account connected successfully", type: 'success' });
          } catch (error) {
              console.error("[OAuth Error]", error);
              showToast({ 
                message: error.message === 'Google Identity Services not loaded' 
                    ? "Google login service not ready. Refresh and try again." 
                    : "Connection failed: " + error.message, 
                type: 'error' 
              });
          }
          return;
      }

      const label = `New ${type} Account`;
      addAccount({ label, type });
      await addOrganization(label, `${type}.com`);
      closeAddAccountModal();
  };
  
  const handleSaveManual = async (e) => {
      e.preventDefault();
      addAccount({ 
          label: manualData.email, 
          type: 'imap',
          config: manualData
      });
      await addOrganization(manualData.email, manualData.email.split('@')[1]);
      closeAddAccountModal();
  };

  return (
    <div className="w-full bg-slate-50 h-full flex flex-col pt-8 overflow-y-auto section-scrollbar border-r border-slate-200/60">
        {/* Header Section */}
        <div className="px-6 mb-8">
             <div className="flex items-center justify-between mb-5">
                 <h2 className="text-2xl font-black text-slate-900 tracking-tight">Unibox</h2>
                 <button 
                    onClick={() => onSync && onSync()}
                    disabled={isSyncing}
                    className="p-2 rounded-xl bg-white shadow-sm border border-slate-200 text-slate-400 hover:text-primary transition-all active:scale-95 disabled:opacity-50"
                 >
                    {isSyncing ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <RefreshCw className="w-4 h-4" />}
                 </button>
             </div>
             <div className="relative group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-colors group-focus-within:text-primary" />
                <input 
                    type="text" 
                    value={searchLocal}
                    onChange={(e) => setSearchLocal(e.target.value)}
                    placeholder="Search messages..." 
                    className="w-full bg-slate-200/40 border-none rounded-2xl pl-11 pr-4 py-3 text-[13px] font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all outline-none" 
                />
             </div>
        </div>

        <div className="flex-1">
             {/* Campaigns Group - Hidden if empty */}
             {campaigns.length > 0 && (
                 <NavGroup title="Campaigns" defaultOpen={true}>
                    {campaigns.map((camp) => (
                        <FilterItem 
                            key={camp.id} 
                            {...camp} 
                            activeFilter={activeFilter} 
                            onClick={onSelectFilter} 
                        />
                    ))}
                 </NavGroup>
             )}

             {/* Dynamic Status Filters */}
             <NavGroup title="Status" defaultOpen={true}>
                {filters.map((filter) => (
                    <FilterItem 
                        key={filter.id} 
                        {...filter} 
                        count={counts[filter.id] || 0}
                        activeFilter={activeFilter} 
                        onClick={onSelectFilter} 
                    />
                ))}
             </NavGroup>

             {/* Connected Inboxes */}
             <NavGroup 
                title="All Inboxes" 
                defaultOpen={true}
                rightAction={
                    <button 
                        onClick={openAddAccountModal}
                        className="p-1 rounded-md hover:bg-slate-200 text-slate-400 hover:text-primary transition-colors"
                    >
                        <Plus className="w-3.5 h-3.5" />
                    </button>
                }
             >
                {inboxes.map((inbox) => (
                    inbox.type === 'gmail' ? (
                        <GmailInboxItem
                            key={inbox.id}
                            inbox={inbox}
                            activeFilter={activeFilter}
                            onSelectFilter={onSelectFilter}
                            count={counts[inbox.id] || 0}
                            isSyncing={isSyncing}
                            onSync={onSync}
                            onDisconnect={handleDisconnectGmail}
                        />
                    ) : (
                        <FilterItem
                            key={inbox.id}
                            {...inbox}
                            label={inbox.label}
                            icon={inbox.icon || User}
                            count={counts[inbox.id] || 0}
                            activeFilter={activeFilter}
                            onClick={() => onSelectFilter(inbox.id)}
                            isOnline={inbox.status === 'connected'}
                            isInbox={true}
                            onRemove={(id) => {
                              if (window.confirm(`Remove "${inbox.label}" from inboxes?`)) {
                                removeAccount(id);
                              }
                            }}
                        />
                    )
                ))}


                
                {/* Last Sync Mini-Indicator */}
                {lastSyncTime && (
                    <div className="px-3 py-3 mt-2 bg-slate-100/50 rounded-xl mx-1">
                        <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2 animate-pulse" />
                                Live Sync
                            </span>
                            <span className="text-[10px] font-medium text-slate-500 italic">{lastSyncLabel}</span>
                        </div>
                    </div>
                )}
             </NavGroup>

             {/* Explore Section - Standard Folders */}
             {moreFilters.length > 0 && (
                <NavGroup title="Explore" defaultOpen={true}>
                    {moreFilters.map((item) => (
                        <FilterItem 
                            key={item.id}
                            {...item}
                            count={counts[item.id] || 0}
                            activeFilter={activeFilter}
                            onClick={() => onSelectFilter(item.id)}
                        />
                    ))}
                </NavGroup>
             )}

        </div>

        {/* Footer Action */}
        <div className="p-4 mt-auto">
             <button
                onClick={openAddAccountModal}
                className="w-full group flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900 text-white hover:bg-black transition-all shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0"
             >
                <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm font-bold">Add Account</span>
             </button>
        </div>

        {/* Modals */}
        <UniversalModal 
            isOpen={isAddAccountOpen} 
            onClose={closeAddAccountModal}
            title={modalView === 'selection' ? "Connect New Account" : "Configure IMAP/SMTP"}
        >
            {modalView === 'selection' ? (
                <div className="space-y-6">
                    <ConnectionSelector onSelect={handleAddAccount} />
                </div>
            ) : (
                <form onSubmit={handleSaveManual} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Username / Email</label>
                        <input 
                            type="email" 
                            required
                            value={manualData.email}
                            onChange={(e) => handleManualInputChange('email', e.target.value)}
                            placeholder="user@domain.com" 
                            className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all" 
                        />
                    </div>
                    {/* ... rest of the form ... */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">SMTP Host</label>
                            <input 
                                type="text" 
                                required
                                value={manualData.smtpHost}
                                onChange={(e) => handleManualInputChange('smtpHost', e.target.value)}
                                placeholder="smtp.example.com" 
                                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all" 
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Port</label>
                            <input 
                                type="text" 
                                required
                                value={manualData.smtpPort}
                                onChange={(e) => handleManualInputChange('smtpPort', e.target.value)}
                                placeholder="587" 
                                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all" 
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">App Password</label>
                        <input 
                            type="password" 
                            required
                            value={manualData.password}
                            onChange={(e) => handleManualInputChange('password', e.target.value)}
                            placeholder="••••••••••••" 
                            className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all" 
                        />
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={() => setModalView('selection')} className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">Back</button>
                        <button type="submit" className="px-8 py-2.5 bg-primary text-black text-sm font-black rounded-xl shadow-lg shadow-primary/10 hover:brightness-105 active:scale-95 transition-all">Save Account</button>
                    </div>
                </form>
            )}
        </UniversalModal>
    </div>
  );
});

export default FilterList;
