import React, { useState } from 'react';
import { useEmailStore } from '../hooks/useEmailStore';
import FilterList from './unibox/FilterList';
import MessageList from './unibox/MessageList';
import MessageContent from './unibox/MessageContent';
import ComposeModal from './unibox/ComposeModal';
import { Loader2, PenSquare } from 'lucide-react';

const Unibox = () => {
  const [showCompose, setShowCompose] = useState(false);

  const { 
    messages = [], 
    selectedEmail, 
    selectedEmailId, 
    selectedIds = [],
    activeFilter, 
    activeTab,
    isSyncing,
    syncProgress,
    lastSyncTime,
    lastSyncLabel,
    filters = [],
    campaigns = [],
    inboxes = [],
    moreFilters = [],
    statusCounts = {},
    searchQuery,
    setSearchQuery,
    setActiveTab, 
    onSelectEmail, 
    toggleSelectId,
    selectAll,
    onSelectFilter,
    onUpdateStatus,
    onArchive,
    onDelete,
    onRestore,
    onToggleStar,
    triggerSync,
    pagination
  } = useEmailStore();

  // Total unread count across all messages
  const unreadCount = messages.filter(m => !m.read && !m.isDeleted && !m.isArchived).length;

  return (
    <div className="flex w-full h-full overflow-hidden bg-white">
      {/* Column 1: Filters & Navigation */}
      <div className="w-[280px] h-full flex-shrink-0 z-20 border-r border-slate-200 flex flex-col">
        {/* Compose Button */}
        <div className="px-4 pt-5 pb-2 flex-shrink-0">
          <button
            onClick={() => setShowCompose(true)}
            className="w-full flex items-center gap-3 px-4 py-3 bg-slate-900 hover:bg-black text-white rounded-2xl transition-all shadow-lg shadow-slate-900/20 hover:shadow-slate-900/30 hover:-translate-y-0.5 active:translate-y-0 group"
          >
            <div className="w-7 h-7 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/30 transition-colors">
              <PenSquare className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="text-[12px] font-black uppercase tracking-[0.12em]">Compose</span>
            {unreadCount > 0 && (
              <span className="ml-auto text-[10px] font-black bg-primary text-black px-2 py-0.5 rounded-full leading-none">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          <FilterList 
            filters={filters}
            activeFilter={activeFilter}
            onSelectFilter={onSelectFilter}
            campaigns={campaigns}
            inboxes={inboxes}
            moreFilters={moreFilters}
            counts={statusCounts}
            isSyncing={isSyncing}
            onSync={triggerSync}
            lastSyncTime={lastSyncTime}
            lastSyncLabel={lastSyncLabel}
          />
        </div>
      </div>

      {/* Column 2: Message Threads */}
      <div className="w-[380px] h-full flex-shrink-0 border-r border-slate-200 bg-white z-10">
        <MessageList 
          messages={messages}
          selectedId={selectedEmailId}
          selectedIds={selectedIds}
          onSelect={onSelectEmail}
          toggleSelect={toggleSelectId}
          onSelectAll={selectAll}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isSyncing={isSyncing}
          syncProgress={syncProgress}
          pagination={pagination}
        />
      </div>

      {/* Column 3: Email Reader */}
      <div className="flex-1 h-full flex flex-col bg-white overflow-hidden relative">
        <MessageContent 
          activeMessage={selectedEmail}
          selectedIds={selectedIds}
          onUpdateStatus={onUpdateStatus}
          onArchive={onArchive}
          onDelete={onDelete}
          onRestore={onRestore}
          onToggleStar={onToggleStar}
          activeFilter={activeFilter}
        />
        
        {/* Global Loading Overlay */}
        {isSyncing && messages.length === 0 && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-[60] flex items-center justify-center">
             <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-3xl shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-300">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-sm font-black uppercase tracking-widest text-slate-900">Synchronizing Inbox...</p>
             </div>
          </div>
        )}
      </div>

      {/* Compose Modal — Global Floating */}
      {showCompose && (
        <ComposeModal onClose={() => setShowCompose(false)} />
      )}
    </div>
  );
};

export default Unibox;

