/**
 * supabaseClient.js
 * Single Source of Truth — Supabase Connection
 * Real-time enabled for live message streaming.
 */
import { createClient } from '@supabase/supabase-js';
import { ENV } from '../config/envConfig';

const supabaseUrl = ENV.SUPABASE.URL;
const supabaseAnonKey = ENV.SUPABASE.ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[Supabase] Missing URL or Anon Key — check your .env file');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    realtime: {
        params: {
            eventsPerSecond: 10
        }
    }
});

// Log connection status
supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
        console.log('[Supabase] User signed in:', session?.user?.email);
    }
});

console.log('[Supabase] Client initialized:', supabaseUrl ? '✅ Connected' : '❌ Missing URL');

export default supabase;
