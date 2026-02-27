import React, { useState, useEffect, lazy, Suspense } from 'react';
import MainLayout from './layout/MainLayout';
import { NavigationProvider, useNavigation } from './hooks/useNavigation';
import InboxPlacement from './components/InboxPlacement';
import Unibox from './components/Unibox';
import { inboxTests } from './mocks/inboxPlacementData';
import { AccountsProvider } from './context/AccountsContext';
import { EmailProvider } from './context/EmailContext';
import { UIProvider } from './hooks/useUI.jsx';
import { OrganizationProvider } from './hooks/useOrganization.jsx';
import { ToastProvider } from './hooks/useToast.jsx';

// Lazy-load Heavy Pages for performance
const Dashboard  = lazy(() => import('./components/Dashboard/Dashboard'));
const LeadFinder = lazy(() => import('./components/LeadFinder/LeadFinder'));

// ── Full-page spinner for Suspense fallback
const PageLoader = () => (
    <div className="flex h-full w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <p className="text-sm text-gray-400 font-medium">Loading...</p>
        </div>
    </div>
);

// ── Coming Soon placeholder for unbuilt modules
const ComingSoon = ({ module }) => (
    <div className="flex h-full w-full items-center justify-center">
        <div className="text-center max-w-sm">
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-primary/10 flex items-center justify-center">
                <span className="text-4xl">🚧</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{module}</h2>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                This module is part of the master plan and is being built next.<br />
                Check back soon!
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                ⚡ Planned — Master Plan Phase Active
            </div>
        </div>
    </div>
);

// ── Main router component
const NavigationContent = () => {
    const { activeItem, navigate } = useNavigation();
    const [tests, setTests] = useState([]);

    useEffect(() => {
        if (activeItem === 'Inbox Placement') {
            const timer = setTimeout(() => setTests(inboxTests), 500);
            return () => clearTimeout(timer);
        }
    }, [activeItem]);

    const handleAddTest = () => {
        const newTest = {
            id: tests.length + 1,
            name: `New Test Campaign ${tests.length + 1}`,
            status: 'In Progress',
            score: 0,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        };
        setTests([newTest, ...tests]);
    };

    // ── Route map
    switch (activeItem) {
        case 'Dashboard':
            return (
                <Suspense fallback={<PageLoader />}>
                    <Dashboard navigate={navigate} />
                </Suspense>
            );

        case 'Inboxes':
            return <Unibox />;

        case 'Inbox Placement':
            return <InboxPlacement tests={tests} onAddTest={handleAddTest} />;

        case 'Lead Finder':
            return (
                <Suspense fallback={<PageLoader />}>
                    <LeadFinder />
                </Suspense>
            );
        case 'Campaigns':
        case 'Analytics':
        case 'Settings':
        case 'Sending':
        case 'Templates':
        case 'Accelerator':
        case 'Debug':
            return <ComingSoon module={activeItem} />;

        default:
            return <ComingSoon module={activeItem} />;
    }
};

function App() {
  return (
    <NavigationProvider>
      <ToastProvider>
        <OrganizationProvider>
          <UIProvider>
            <AccountsProvider>
              <EmailProvider>
                <MainLayout>
                  <NavigationContent />
                </MainLayout>
              </EmailProvider>
            </AccountsProvider>
          </UIProvider>
        </OrganizationProvider>
      </ToastProvider>
    </NavigationProvider>
  );
}

export default App;
