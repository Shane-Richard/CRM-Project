import React, { memo } from 'react';
import { CheckSquare, Square, Loader2, ChevronLeft, ChevronRight, Search, Inbox, Mail, Zap, Rocket } from 'lucide-react';

// MessageItem now shows real Gmail data with premium styling
const MessageItem = memo(({ message, isSelected, onClick, isChecked, onToggleCheck }) => {
   const { 
      sender, 
      sender_email, 
      subject, 
      snippet, 
      timestamp, 
      read, 
      isStarred, 
      has_attachments,
      messageCount,
      status
  } = message;

  const initials = sender 
    ? sender.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : (sender_email ? sender_email[0].toUpperCase() : '?');

  return (
    <div 
      onClick={onClick}
      className={`group relative flex items-start gap-4 px-6 py-4 cursor-pointer transition-all duration-300 border-b border-slate-100 ${
        isSelected 
          ? 'bg-slate-900 text-white z-10 shadow-xl' 
          : 'bg-white hover:bg-slate-50'
      }`}
    >
      {/* Selection Overlay */}
      <div 
          className="absolute left-0 top-0 bottom-0 w-1 bg-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={isSelected ? { opacity: 1 } : {}}
      />

      {/* Checkbox (Hover only) */}
      <div 
          className={`absolute left-0 top-0 bottom-0 flex items-center px-1 transition-all duration-300 ${isChecked ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
          onClick={(e) => { e.stopPropagation(); onToggleCheck?.(message.id); }}
      >
        <div className={`w-4 h-4 rounded-md flex items-center justify-center transition-colors ${isChecked ? 'bg-primary' : 'bg-slate-200'}`}>
            {isChecked && <CheckSquare className="w-3 h-3 text-black" />}
        </div>
      </div>

      {/* Avatar Container */}
      <div className="relative flex-shrink-0">
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black transition-transform duration-300 ${
            isSelected 
                ? 'bg-white/10 text-white scale-110' 
                : 'bg-slate-100 text-slate-700 group-hover:scale-105'
        }`}>
            {initials}
        </div>
        {!read && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-white shadow-[0_0_8px_rgba(178,244,14,0.6)]" />
        )}
        {isStarred && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-amber-400 rounded-lg flex items-center justify-center border-2 border-white">
                <span className="text-[8px]">⭐</span>
            </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2 min-w-0">
            <span className={`text-[13px] tracking-tight truncate ${!read ? 'font-bold' : 'font-medium'} ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                {sender || sender_email || 'Unknown'}
            </span>
            {messageCount > 1 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${isSelected ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {messageCount}
              </span>
            )}
          </div>
          <span className={`text-[10px] font-bold whitespace-nowrap ml-2 uppercase tracking-widest ${isSelected ? 'text-white/40' : 'text-slate-400'}`}>
            {timestamp || ''}
          </span>
        </div>
        
        <p className={`text-[12px] truncate mb-1 leading-snug ${!read ? 'font-bold' : 'font-medium'} ${isSelected ? 'text-white/90' : 'text-slate-700'}`}>
          {subject || 'No Subject'}
        </p>

        <div className="flex items-center justify-between gap-2">
          <p className={`text-[11px] truncate leading-relaxed ${isSelected ? 'text-white/60' : 'text-slate-400'}`}>
            {snippet || 'No message content...'}
          </p>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {has_attachments && (
                <span className={`text-[10px] ${isSelected ? 'text-white/40' : 'text-slate-400'}`}>📎</span>
            )}
            {status && (
              <span className={`text-[9px] font-black uppercase tracking-[0.1em] px-2 py-0.5 rounded-md border ${
                  isSelected 
                    ? 'border-white/20 text-white bg-white/5' 
                    : 'border-slate-100 text-slate-500 bg-slate-50'
              }`}>
                {status}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

const SkeletonItem = () => (
    <div className="flex items-start gap-4 px-6 py-5 border-b border-slate-50 animate-pulse">
        <div className="w-10 h-10 rounded-2xl bg-slate-100 flex-shrink-0" />
        <div className="flex-1 min-w-0 space-y-3">
            <div className="flex justify-between items-center">
                <div className="h-3 bg-slate-100 rounded-md w-1/3" />
                <div className="h-2 bg-slate-50 rounded-md w-1/6" />
            </div>
            <div className="h-3 bg-slate-50 rounded-md w-full" />
            <div className="h-2 bg-slate-50 rounded-md w-2/3" />
        </div>
    </div>
);

const MessageList = memo(({ 
    messages = [], 
    selectedId, 
    selectedIds = [],
    onSelect, 
    toggleSelect,
    activeTab, 
    setActiveTab, 
    searchQuery, 
    setSearchQuery,
    isSyncing = false,
    syncProgress = '',
    pagination
}) => {
    const tabs = [
      { id: 'primary', label: 'Primary', icon: Inbox },
      { id: 'social', label: 'Social', icon: Rocket },
      { id: 'promotions', label: 'Promotions', icon: Zap }
    ];

    return (
        <div className="flex flex-col h-full bg-white relative">
            {/* Header / Tabs */}
            <div className="flex-shrink-0 bg-white/80 backdrop-blur-md z-20 border-b border-slate-100 p-4">
                <div className="flex p-1 bg-slate-100 rounded-2xl mb-4">
                    {tabs.map(tab => (
                        <button 
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex-1 flex items-center justify-center gap-2 py-2 text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all
                            ${activeTab === tab.id 
                                ? 'bg-white text-slate-900 shadow-sm scale-[1.02]' 
                                : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <tab.icon className={`w-3 h-3 ${activeTab === tab.id ? 'text-primary' : ''}`} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="relative group">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-colors group-focus-within:text-primary" />
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search in list..."
                        className="w-full bg-slate-100 border border-transparent rounded-2xl pl-11 pr-4 py-2.5 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
                    />
                </div>
            </div>

            {/* Sync Progress Banner */}
            {isSyncing && (
                <div className="absolute top-28 left-4 right-4 z-30 px-4 py-3 bg-slate-900 text-white rounded-2xl flex items-center justify-between shadow-2xl animate-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-[11px] font-black uppercase tracking-widest">
                            {syncProgress || 'Syncing...'}
                        </span>
                    </div>
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                </div>
            )}

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto scroll-smooth">
                {isSyncing && messages.length === 0 ? (
                    <div className="flex flex-col">
                        {[...Array(8)].map((_, i) => <SkeletonItem key={i} />)}
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 px-8 py-20">
                        <div className="w-20 h-20 rounded-[2rem] bg-slate-50 flex items-center justify-center mb-6 rotate-12">
                            <Mail className="w-10 h-10 text-slate-200" />
                        </div>
                        <h3 className="text-lg font-black text-slate-900 mb-2 tracking-tight">Zero inbox!</h3>
                        <p className="text-sm text-slate-500 text-center font-medium leading-relaxed">
                            No messages found in your {activeTab} tab. Great job staying organized!
                        </p>
                    </div>
                ) : (
                    <div className={`transition-opacity duration-300 ${isSyncing ? 'opacity-30 pointer-events-none grayscale-[0.5]' : 'opacity-100'}`}>
                        {messages.map((msg) => (
                        <MessageItem 
                            key={msg.id}
                            message={msg} 
                            isSelected={msg.id === selectedId}
                            isChecked={selectedIds.includes(msg.id)}
                            onClick={() => onSelect(msg.id)}
                            onToggleCheck={toggleSelect}
                        />
                        ))}
                    </div>
                )}
            </div>

            {/* Pagination Footer */}
            {pagination && pagination.totalItems > 0 && (
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-white z-20 shadow-[0_-8px_24px_rgba(0,0,0,0.02)]">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-xl">
                            <span className="text-[11px] font-black text-slate-900">
                                {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1}
                            </span>
                            <span className="text-[10px] text-slate-400">-</span>
                            <span className="text-[11px] font-black text-slate-900">
                                {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}
                            </span>
                        </div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                            of {pagination.totalItems.toLocaleString()}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button 
                            onClick={pagination.onPrev}
                            disabled={!pagination.hasPrev || isSyncing}
                            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                                !pagination.hasPrev || isSyncing 
                                    ? 'text-slate-200 cursor-not-allowed' 
                                    : 'bg-white text-slate-600 hover:text-black hover:shadow-lg border border-slate-100 active:scale-90'
                            }`}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={pagination.onNext}
                            disabled={!pagination.hasNext || isSyncing}
                            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                                !pagination.hasNext || isSyncing 
                                    ? 'text-slate-200 cursor-not-allowed' 
                                    : 'bg-white text-slate-600 hover:text-black hover:shadow-lg border border-slate-100 active:scale-90'
                            }`}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
});

export default MessageList;
