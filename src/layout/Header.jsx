import WorkspaceSwitcher from '../components/layout/WorkspaceSwitcher';
import { useAccounts } from '../hooks/useAccounts';
import { normalizeEmail } from '../utils/normalizeEmail';

const Header = ({ title }) => {
  const { accounts } = useAccounts();
  const gmailAccount = accounts.find(a => a.type === 'gmail');
  
  // If we are in Inboxes and have a connected account, show the email as the main branding
  const displayTitle = (title === 'Inboxes' && gmailAccount) 
    ? normalizeEmail(gmailAccount.label) 
    : title.toLowerCase().replace('_', ' ');

  return (
    <header className="h-16 flex-shrink-0 bg-background flex items-center justify-between px-6 z-40 border-b border-gray-100">
      {/* Left side: Page Title */}
      <div className="flex items-center">
        <h1 className="text-xl font-bold text-gray-900 tracking-tight capitalize border-r border-gray-200 pr-6">
            {displayTitle}
        </h1> 
      </div>

      {/* Right side: Workspace Switcher */}
      <div className="flex items-center">
        <WorkspaceSwitcher />
      </div>
    </header>
  );
};

export default Header;
