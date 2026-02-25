import { useState, useCallback } from 'react';
import { ENV } from '../config/envConfig';

/**
 * useAuth Hook
 * Centralized authentication state and logic.
 * Uses ENV Source of Truth for Client ID.
 */
export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);

    const login = useCallback(async () => {
        setLoading(true);
        try {
            // Implementation for login using ENV.GOOGLE.CLIENT_ID
            console.log("[Auth] Initiating login with Client ID:", ENV.GOOGLE.CLIENT_ID);
            // ... login logic ...
        } catch (error) {
            console.error("[Auth] Login failed:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        console.log("[Auth] Logged out");
    }, []);

    return {
        user,
        loading,
        login,
        logout,
        clientId: ENV.GOOGLE.CLIENT_ID
    };
};

export default useAuth;
