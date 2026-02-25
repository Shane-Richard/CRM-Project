
import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { AccountsContext } from '../hooks/useAccounts';
import { normalizeEmail, toAccountId } from '../utils/normalizeEmail';

const INITIAL_ACCOUNTS = [];

export const AccountsProvider = ({ children }) => {
  const [accounts, setAccounts] = useState(() => {
    try {
      const saved = localStorage.getItem('txb_accounts');
      if (!saved) return INITIAL_ACCOUNTS;
      let parsed = JSON.parse(saved);
      
      // Cleanup: Remove demo accounts if they exist in storage
      if (Array.isArray(parsed)) {
        parsed = parsed.filter(a => ![ 'support_company', 'sales_company' ].includes(a.id));
      }
      
      // Retroactively normalize any stored emails (fixes dot mismatch)
      if (Array.isArray(parsed)) {
        parsed = parsed.map(a => ({
          ...a,
          label: normalizeEmail(a.label),
          email: a.email ? normalizeEmail(a.email) : undefined,
          id: a.type === 'gmail' ? toAccountId(a.label) : a.id
        }));
      }
      
      return Array.isArray(parsed) ? parsed : INITIAL_ACCOUNTS;
    } catch (err) {
      console.warn("[AccountsContext] corrupted storage, resetting...", err);
      return INITIAL_ACCOUNTS;
    }
  });

  const [activeAccountId, setActiveAccountId] = useState(() => {
    return localStorage.getItem('txb_active_account_id') || null;
  });

  const activeAccount = accounts.find(a => a.id === activeAccountId) || accounts[0] || null;

  useEffect(() => {
    if (accounts) {
      // Important: Remove the 'icon' component reference before stringifying
      const safeAccounts = accounts.map(acc => {
        const { icon: _unused, ...rest } = acc;
        return rest;
      });
      localStorage.setItem('txb_accounts', JSON.stringify(safeAccounts));
    }
  }, [accounts]);

  useEffect(() => {
    if (activeAccount) {
      localStorage.setItem('txb_active_account_id', activeAccount.id);
    }
  }, [activeAccount]);

  const addAccount = (accountData) => {
    const cleanLabel = normalizeEmail(accountData.label);
    const cleanEmail = accountData.email ? normalizeEmail(accountData.email) : cleanLabel;
    
    const newAccount = {
        ...accountData,
        label: cleanLabel,
        email: cleanEmail,
        id: accountData.id || toAccountId(cleanLabel),
        icon: User,
        connectedAt: new Date().toISOString()
    };
    
    setAccounts(prev => {
        if (prev.find(a => normalizeEmail(a.label) === cleanLabel)) return prev;
        return [...prev, newAccount];
    });

    if (!activeAccountId) setActiveAccountId(newAccount.id);
    
    return newAccount;
  };

  return (
    <AccountsContext.Provider value={{ 
      accounts, 
      activeAccount, 
      setActiveAccount: setActiveAccountId,
      addAccount 
    }}>
      {children}
    </AccountsContext.Provider>
  );
};
