import { createContext, useContext } from 'react';

// We create the context here so it can be shared between the Provider and the Hook
// without triggering Fast Refresh warnings (since this file contains no components)
export const AccountsContext = createContext();

export const useAccounts = () => {
  const context = useContext(AccountsContext);
  if (!context) {
    throw new Error('useAccounts must be used within an AccountsProvider');
  }
  return context;
};
