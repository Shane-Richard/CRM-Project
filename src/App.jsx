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
import CommandPalette from './components/Search/CommandPalette';
import useAuth from './hooks/useAuth';
import Login from './components/Auth/Login';

// Lazy-load Heavy Pages
const Dashboard  = lazy(() => import('./components/Dashboard/Dashboard'));
const LeadFinder = lazy(() => import('./components/LeadFinder/LeadFinder'));
const SearchPage = lazy(() => import('./components/Search/SearchPage'));
const Campaigns  = lazy(() => import('./components/Campaigns/Campaigns'));
const Analytics  = lazy(() => import('./components/Analytics/Analytics'));
const Settings   = lazy(() => import('./components/Settings/Settings'));

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

// ── Global Ctrl+K Command Palette mount
const GlobalCommandPalette = () => {
    const [open, setOpen] = useState(false);
    useEffect(() => {
        const handler = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setOpen(v => !v);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);
    if (!open) return null;
    return <CommandPalette onClose={() => setOpen(false)} />;
};

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

        case 'Search':
            return (
                <Suspense fallback={<PageLoader />}>
                    <SearchPage />
                </Suspense>
            );

        case 'Campaigns':
            return (
                <Suspense fallback={<PageLoader />}>
                    <Campaigns />
                </Suspense>
            );

        case 'Analytics':
            return (
                <Suspense fallback={<PageLoader />}>
                    <Analytics />
                </Suspense>
            );

        case 'Settings':
            return (
                <Suspense fallback={<PageLoader />}>
                    <Settings />
                </Suspense>
            );

        default:
            return <ComingSoon module={activeItem} />;
    }
};

function App() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest italic animate-pulse">Initializing CRM Core...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <NavigationProvider>
      <ToastProvider>
        <OrganizationProvider>
          <UIProvider>
            <AccountsProvider>
              <EmailProvider>
                <MainLayout logout={logout}>
                  <NavigationContent />
                </MainLayout>
                {/* Global Ctrl+K Command Palette — always mounted */}
                <GlobalCommandPalette />
              </EmailProvider>
            </AccountsProvider>
          </UIProvider>
        </OrganizationProvider>
      </ToastProvider>
    </NavigationProvider>
  );
}

export default App;
