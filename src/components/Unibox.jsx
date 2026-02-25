import React from 'react';
import { useEmailStore } from '../hooks/useEmailStore';
import FilterList from './unibox/FilterList';
import MessageList from './unibox/MessageList';
import MessageContent from './unibox/MessageContent';
import { Loader2 } from 'lucide-react';

const Unibox = () => {
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
    onToggleStar,
    triggerSync,
    pagination
  } = useEmailStore();

  return (
    <div className="flex w-full h-full overflow-hidden bg-white">
      {/* Column 1: Filters & Navigation (Premium Glass) */}
      <div className="w-[280px] h-full flex-shrink-0 z-20 border-r border-slate-200">
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

      {/* Column 2: Message Threads (Infinite List) */}
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

      {/* Column 3: Email Reader (Full Viewport) */}
      <div className="flex-1 h-full flex flex-col bg-white overflow-hidden relative">
        <MessageContent 
          activeMessage={selectedEmail}
          selectedIds={selectedIds}
          onUpdateStatus={onUpdateStatus}
          onArchive={onArchive}
          onDelete={onDelete}
          onToggleStar={onToggleStar}
        />
        
        {/* Global Loading Overlay for syncing if needed */}
        {isSyncing && messages.length === 0 && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-[60] flex items-center justify-center">
             <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-3xl shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-300">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-sm font-black uppercase tracking-widest text-slate-900">Synchronizing Inbox...</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Unibox;
