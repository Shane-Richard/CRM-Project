import React, { createContext, useContext, useState, useCallback } from 'react';

const UIContext = createContext();

export const UIProvider = ({ children }) => {
    const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
    const [modalView, setModalView] = useState('selection'); // 'selection' or 'manual_form'

    const openAddAccountModal = useCallback(() => {
        setIsAddAccountOpen(true);
        setModalView('selection');
    }, []);

    const closeAddAccountModal = useCallback(() => {
        setIsAddAccountOpen(false);
    }, []);

    const value = {
        isAddAccountOpen,
        modalView,
        setModalView,
        openAddAccountModal,
        closeAddAccountModal
    };

    return (
        <UIContext.Provider value={value}>
            {children}
        </UIContext.Provider>
    );
};

export const useUI = () => {
    const context = useContext(UIContext);
    if (!context) {
        throw new Error('useUI must be used within a UIProvider');
    }
    return context;
};
