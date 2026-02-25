import React from 'react';

const StatusBadge = ({ status }) => {
  const getStatusStyles = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'landed':
        return 'bg-green-100 text-green-800';
      case 'in progress':
      case 'spam':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
      case 'missing':
        return 'bg-gray-100 text-gray-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`
      px-2.5 
      py-0.5 
      inline-flex 
      text-xs 
      leading-5 
      font-semibold 
      rounded-full 
      align-middle
      ${getStatusStyles(status)}
    `}>
      {status}
    </span>
  );
};

export default StatusBadge;
