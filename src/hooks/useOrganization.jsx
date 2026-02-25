import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { useToast } from './useToast.jsx';
import { normalizeEmail } from '../utils/normalizeEmail';

const OrganizationContext = createContext();

const INITIAL_ORGANIZATIONS = [
    { id: 'my_org', label: 'My Organization', domain: 'myorg.com' }
];

export const OrganizationProvider = ({ children }) => {
    const [organizations, setOrganizations] = useState(() => {
        try {
            const saved = localStorage.getItem('txb_organizations');
            if (saved) {
                let parsed = JSON.parse(saved);
                // Cleanup: Filter out old demo organizations
                if (Array.isArray(parsed)) {
                    parsed = parsed.filter(org => !['client_x', 'marketing_team'].includes(org.id));
                    // Retroactively normalize org labels that are email addresses
                    parsed = parsed.map(org => ({
                        ...org,
                        label: org.label && org.label.includes('@') ? normalizeEmail(org.label) : org.label
                    }));
                }
                return Array.isArray(parsed) ? parsed : INITIAL_ORGANIZATIONS;
            }
            return INITIAL_ORGANIZATIONS;
        } catch {
            return INITIAL_ORGANIZATIONS;
        }
    });

    const [activeOrgId, setActiveOrgId] = useState(() => {
        const saved = localStorage.getItem('txb_active_org');
        // Check if saved ID exists in current organizations
        return saved || 'my_org';
    });

    const [isSwitching, setIsSwitching] = useState(false);
    const { showToast } = useToast();

    // Persist organizations when updated
    useEffect(() => {
        localStorage.setItem('txb_organizations', JSON.stringify(organizations));
    }, [organizations]);

    // Persist activeOrgId when updated
    useEffect(() => {
        localStorage.setItem('txb_active_org', activeOrgId);
    }, [activeOrgId]);

    const activeOrg = useMemo(() => 
        organizations.find(org => org.id === activeOrgId) || organizations[0]
    , [organizations, activeOrgId]);

    const switchOrganization = useCallback(async (orgId) => {
        setIsSwitching(true);
        // Simulate API loading for "Optimistic Loading" requirement
        await new Promise(resolve => setTimeout(resolve, 600));
        setActiveOrgId(orgId);
        setIsSwitching(false);
        console.log(`[Org Switcher] Switched to workspace: ${orgId}`);
    }, []);

    const addOrganization = useCallback(async (label, domain) => {
        const id = label.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Math.random().toString(36).substr(2, 5);
        const newOrg = { id, label, domain };
        
        setOrganizations(prev => [...prev, newOrg]);
        
        showToast({ message: `Creating workspace "${label}"...`, duration: 2000 });
        
        // Auto-Redirect: Switch to the newly created workspace immediately
        await switchOrganization(id);
        
        showToast({ message: `Successfully switched to ${label}`, type: 'success' });
        return newOrg;
    }, [switchOrganization, showToast]);

    const value = {
        organizations,
        activeOrg,
        isSwitching,
        switchOrganization,
        addOrganization
    };

    return (
        <OrganizationContext.Provider value={value}>
            {children}
        </OrganizationContext.Provider>
    );
};

export const useOrganization = () => {
    const context = useContext(OrganizationContext);
    if (!context) {
        throw new Error('useOrganization must be used within an OrganizationProvider');
    }
    return context;
};
