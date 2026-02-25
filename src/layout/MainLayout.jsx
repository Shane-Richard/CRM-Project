import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useNavigation } from '../hooks/useNavigation';

const MainLayout = ({ children }) => {
  const { activeItem, navigate } = useNavigation();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-surface">
      {/* Sidebar - Fixed Left (80px) */}
      <Sidebar activeItem={activeItem} navigate={navigate} />

      {/* Content Container (Remaining Width) */}
      <div className="flex-1 ml-20 flex flex-col h-full bg-background relative overflow-hidden">
        {/* Header - Fixed Height (64px) */}
        <Header title={activeItem} />

        {/* Dynamic Page Content */}
        <main className="flex-1 w-full overflow-hidden relative">
            {children ? (
                <div className="h-full w-full">
                    {children}
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center">
                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            )}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
