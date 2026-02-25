import React, { memo, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { LABEL_CONFIG } from '../../config/labelConfig';
import UniversalDropdown from '../ui/UniversalDropdown';

const StatusDropdown = memo(({ currentStatus, onStatusChange }) => {
  const status = (currentStatus || '').toLowerCase();
  const activeLabel = LABEL_CONFIG.find(
    l => l.id.toLowerCase() === status || l.label.toLowerCase() === status
  ) || LABEL_CONFIG[0];

  const handleSelect = useCallback((id) => {
    onStatusChange(id);
  }, [onStatusChange]);

  const footerAction = {
    label: 'Create Label',
    icon: Plus,
    onClick: () => console.log('Create Label triggered')
  };

  return (
    <UniversalDropdown 
        items={LABEL_CONFIG}
        activeItem={activeLabel.id}
        onSelect={handleSelect}
        triggerLabel={activeLabel.label}
        triggerIcon={activeLabel.icon}
        triggerColor={activeLabel.color}
        footerButton={footerAction}
        placeholder="Search status..."
    />
  );
});

export default StatusDropdown;
