import { useContext } from 'react';
import { EmailContext } from '../context/EmailContext';

/**
 * useEmailStore
 * Custom hook to access the global Email Store.
 * Part of the Universal Architecture to centralize logic.
 */
export const useEmailStore = () => {
    const context = useContext(EmailContext);
    if (!context) {
        throw new Error('useEmailStore must be used within an EmailProvider');
    }
    return context;
};
