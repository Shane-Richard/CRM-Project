import React, { memo } from 'react';
import { Plus, Briefcase } from 'lucide-react';
import { useOrganization } from '../../hooks/useOrganization.jsx';
import { useUI } from '../../hooks/useUI.jsx';
import UniversalDropdown from '../ui/UniversalDropdown';

import { useAccounts } from '../../hooks/useAccounts';
import { normalizeEmail } from '../../utils/normalizeEmail';

const WorkspaceSwitcher = memo(() => {
  const { organizations, activeOrg, isSwitching, switchOrganization } = useOrganization();
  const { openAddAccountModal } = useUI();
  const { accounts } = useAccounts();
  
  const gmailAccount = accounts.find(a => a.type === 'gmail');

  const dropdownItems = organizations.map(org => {
      const isDefaultOrg = org.id === 'my_org';
      const shouldPersonalize = isDefaultOrg && gmailAccount;
      
      return {
          ...org,
          label: shouldPersonalize ? normalizeEmail(gmailAccount.label) : org.label,
          sublabel: shouldPersonalize ? 'Primary Identity' : org.domain,
          icon: Briefcase
      };
  });

  const footerAction = {
    label: 'Create Workspace',
    icon: Plus,
    onClick: openAddAccountModal
  };

  // If we have a connected gmail, we use that as the primary label for the workspace switcher
  // if the active workspace is still the default one.
  const displayLabel = (activeOrg.id === 'my_org' && gmailAccount) 
    ? normalizeEmail(gmailAccount.label) 
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
