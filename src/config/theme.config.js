/**
 * Antigravity Theme Configuration
 * Centralized design tokens for colors, spacing, and transition speeds.
 * Enforces "Single Source of Truth" for the UI Design System.
 */

export const THEME_CONFIG = {
    colors: {
        primary: '#b2f40e',       // Universal Lime
        secondary: '#41246D',     // Deep Purple
        background: {
            light: '#ffffff',     // Primary Content
            dark: '#1a1a1a',      // Modal/Dark Context
            surface: '#f9fafb'    // Sidebar/Status Area
        },
        text: {
            primary: '#111827',
            secondary: '#6b7280',
            muted: '#9ca3af',
            onPrimary: '#000000'
        },
        border: {
            subtle: '#f3f4f6',
            base: '#e5e7eb',
            active: '#b2f40e'
        },
        status: {
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444',
            info: '#3b82f6'
        }
    },
    spacing: {
        header: '64px',
        sidebar: '260px',
        uniboxFilters: '280px',
        uniboxList: '360px'
    },
    transitions: {
        smooth: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        fast: 'all 0.15s ease'
    },
    radii: {
        lg: '16px',
        md: '12px',
        sm: '8px'
    }
};
