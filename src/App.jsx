import React, { useState, useEffect } from 'react';
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

const NavigationContent = () => {
    const { activeItem } = useNavigation();
    const [tests, setTests] = useState([]); // Start with empty to show empty state initially

    // Simulate fetching data or toggle for demo purposes
    // In a real app, this would be a useEffect calling an API
    useEffect(() => {
        if (activeItem === 'Inbox Placement') {
             // Simulate an API call delay for demo purposes
             const timer = setTimeout(() => {
                 setTests(inboxTests);
             }, 500);
             return () => clearTimeout(timer);
        }
    }, [activeItem]);

    // Function to add a test manually for demo
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

    if (activeItem === 'Inbox Placement') {
        return <InboxPlacement tests={tests} onAddTest={handleAddTest} />;
    }

    if (activeItem === 'Inboxes') {
        return <Unibox />;
    }

    return (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-2xl mx-auto mt-10">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">Welcome to {activeItem}</h2>
            <p className="text-gray-600 mb-6 text-lg">
                This is the placeholder for the {activeItem} view.
            </p>
            <div className="p-4 bg-surface rounded-lg border border-gray-200">
                <p className="text-sm text-gray-500 font-mono">
                    System Version 1.0.0
                    <br />
                    Environment: Production Ready
                </p>
            </div>
        </div>
    );
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
