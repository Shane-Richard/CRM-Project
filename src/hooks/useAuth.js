import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { ENV } from '../config/envConfig';

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Initial Check
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // 2. Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const logout = useCallback(async () => {
        setLoading(true);
        try {
            await supabase.auth.signOut();
        } catch (err) {
            console.warn('[Auth] signOut error (continuing):', err.message);
        }
        // Clear all CRM local state
        localStorage.removeItem('txb_accounts');
        localStorage.removeItem('txb_active_account_id');
        localStorage.removeItem('txb_orgs');
        setUser(null);
        setLoading(false);
        // Hard redirect — ensures no stale React state survives
        window.location.href = '/';
    }, []);

    return {
        user,
        loading,
        logout,
        clientId: ENV.GOOGLE.CLIENT_ID
    };
};

export default useAuth;
