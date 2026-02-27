import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useNavigation } from '../hooks/useNavigation';
import { useEmailStore } from '../hooks/useEmailStore';

const MainLayout = ({ children }) => {
  const { activeItem, navigate } = useNavigation();
  const { allMessages = [] } = useEmailStore();

  // Compute live unread count for the sidebar badge
  const unreadCount = allMessages.filter(
    m => !m.read && !m.isDeleted && !m.isArchived
  ).length;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-surface">
      {/* Sidebar - Fixed Left (80px) */}
      <Sidebar activeItem={activeItem} navigate={navigate} unreadCount={unreadCount} />

      {/* Content Container */}
      <div className="flex-1 ml-20 flex flex-col h-full bg-background relative overflow-hidden">
        {/* Header */}
        <Header title={activeItem} />

        {/* Dynamic Page Content */}
        <main className="flex-1 w-full overflow-hidden relative">
          {children ? (
            <div className="h-full w-full">{children}</div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
