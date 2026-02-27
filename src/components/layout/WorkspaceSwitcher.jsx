import React, { memo, useState, useEffect } from 'react';
import { Plus, Briefcase } from 'lucide-react';
import { useOrganization } from '../../hooks/useOrganization.jsx';
import { useUI } from '../../hooks/useUI.jsx';
import UniversalDropdown from '../ui/UniversalDropdown';
import { useAccounts } from '../../hooks/useAccounts';
import { normalizeEmail } from '../../utils/normalizeEmail';
import { supabase } from '../../services/supabaseClient';

const WorkspaceSwitcher = memo(() => {
  const { organizations, activeOrg, isSwitching, switchOrganization } = useOrganization();
  const { openAddAccountModal } = useUI();
  const { accounts } = useAccounts();
  const [sessionUser, setSessionUser] = useState(null);

  // Fetch the real logged-in user from Supabase session
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session?.user) setSessionUser(data.session.user);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionUser(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const gmailAccount = accounts.find(a => a.type === 'gmail');

  // Real display name: Supabase session name > email fallback
  const realName = sessionUser?.user_metadata?.full_name
    || sessionUser?.user_metadata?.name
    || (gmailAccount ? normalizeEmail(gmailAccount.label) : 'My Organization');

  const dropdownItems = organizations.map(org => {
      const isDefaultOrg = org.id === 'my_org';
      const shouldPersonalize = isDefaultOrg && (sessionUser || gmailAccount);

      return {
          ...org,
          label: shouldPersonalize ? realName : org.label,
          sublabel: shouldPersonalize ? (sessionUser?.email || normalizeEmail(gmailAccount?.label || '')) : org.domain,
          icon: Briefcase
      };
  });

  const footerAction = {
    label: 'Create Workspace',
    icon: Plus,
    onClick: openAddAccountModal
  };

  // Display label uses real name not raw email
  const displayLabel = (activeOrg.id === 'my_org' && (sessionUser || gmailAccount))
    ? realName
    : activeOrg.label;

  return (
    <div className="workspace-switcher">
        <UniversalDropdown 
            items={dropdownItems}
            activeItem={activeOrg.id}
            onSelect={switchOrganization}
            triggerLabel={displayLabel}
            triggerIcon={Briefcase}
            isLoading={isSwitching}
            footerButton={footerAction}
            placeholder="Search workspaces..."
        />
    </div>
  );
});

export default WorkspaceSwitcher;

