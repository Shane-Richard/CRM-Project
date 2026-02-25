import React from 'react';

const SecondaryButton = ({ 
  children, 
  onClick, 
  disabled = false, 
  type = 'button', 
  className = '' 
}) => {
  return (
    <button
      type={type}
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      className={`
        bg-white 
        text-black 
        border 
        border-gray-200 
        font-medium 
        text-sm
        px-4 
        py-2.5 
        rounded-lg 
        transition-colors 
        duration-200 
        hover:bg-gray-50 
        active:scale-95
        disabled:opacity-50 
        disabled:cursor-not-allowed
        flex 
        items-center 
        justify-center 
        gap-2
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export default SecondaryButton;
