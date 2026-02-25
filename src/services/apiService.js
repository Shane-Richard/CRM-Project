import { api } from './api';
import supabase from './supabaseClient';

/**
 * apiService.js
 * Unified interface for all API calls (Gmail, Supabase, etc.)
 * Ensures zero logic duplication across components.
 */

export const apiService = {
    // --- Messages API ---
    messages: {
        /**
         * Update message status in Supabase (SSOT)
         */
        updateStatus: async (messageId, status) => {
            // Handle Demo Persistence
            if (messageId.includes('demo_')) {
                const overrides = JSON.parse(localStorage.getItem('demo_status_overrides') || '{}');
                overrides[messageId] = status;
                localStorage.setItem('demo_status_overrides', JSON.stringify(overrides));
                return { success: true, demo: true };
            }

            const { data, error } = await supabase
                .from('messages')
                .update({ 
                    status, 
                    updated_at: new Date().toISOString() 
                })
                .eq('id', messageId)
                .select();
            
            if (error) throw error;
            return data;
        },

        /**
         * Batch update message flags
         */
        updateFlags: async (ids, updates) => {
            // Handle Demo Persistence for flags
            const demoIds = ids.filter(id => id.includes('demo_'));
            if (demoIds.length > 0) {
                const overrides = JSON.parse(localStorage.getItem('demo_status_overrides') || '{}');
                demoIds.forEach(id => {
                    overrides[id] = { ...(overrides[id] || {}), ...updates };
                });
                localStorage.setItem('demo_status_overrides', JSON.stringify(overrides));
            }

            const realIds = ids.filter(id => !id.includes('demo_'));
            if (realIds.length === 0) return { success: true, demo: true };

            const { data, error } = await supabase
                .from('messages')
                .update({ 
                    ...updates, 
                    updated_at: new Date().toISOString() 
                })
                .in('id', realIds)
                .select();
            
            if (error) throw error;
            return data;
        },

        /**
         * Fetch recent messages from Gmail (Universal Gateway)
         */
        syncGmail: async (email, count = 25, pageToken = null, category = 'primary') => {
            // Root all Gmail sync through the mailService which handles adapter selection
            const { mailService } = await import('./MailService');
            return mailService.triggerSync(email, count, pageToken, category);
        }
    },

    // --- Organizations API ---
    organizations: {
        get: async (id) => api.get(`/organizations/${id}`),
        update: async (id, data) => api.patch(`/organizations/${id}`, data)
    },

    // --- User Profile ---
    user: {
        getProfile: async () => api.get('/user/profile'),
    }
};
