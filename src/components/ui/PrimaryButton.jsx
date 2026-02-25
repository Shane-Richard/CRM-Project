import React from 'react';
import { Loader2 } from 'lucide-react';

const PrimaryButton = ({ 
  children, 
  onClick, 
  loading = false, 
  disabled = false, 
  type = 'button', 
  className = '' 
}) => {
  return (
    <button
      type={type}
      onClick={!loading && !disabled ? onClick : undefined}
      disabled={loading || disabled}
      className={`
        bg-primary 
        text-black 
        font-bold 
        text-sm
        px-6 
        py-2.5 
        rounded-lg 
        shadow-sm 
        transition-all 
        duration-200 
        hover:bg-lime-400 
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
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
};

export default PrimaryButton;
