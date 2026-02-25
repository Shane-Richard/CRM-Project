/**
 * envConfig.js
 * Single Source of Truth for all Environment Variables.
 * Automatically handles fallbacks and provides warnings for missing keys.
 */

const getEnv = (key, fallback = null) => {
    // Vite uses import.meta.env
    const value = import.meta.env[key];
    
    if (!value && !fallback) {
        console.warn(`[Config Warning] Missing environment variable: ${key}`);
    }
    
    return value || fallback;
};

export const ENV = {
    GOOGLE: {
        CLIENT_ID: getEnv('VITE_GOOGLE_CLIENT_ID'),
        REDIRECT_URI: getEnv('VITE_REDIRECT_URI', 'http://localhost:3000'),
    },
    SUPABASE: {
        URL: getEnv('VITE_SUPABASE_URL'),
        ANON_KEY: getEnv('VITE_SUPABASE_ANON_KEY'),
    },
    IS_DEV: import.meta.env.DEV,
    IS_PROD: import.meta.env.PROD,
};

export default ENV;
