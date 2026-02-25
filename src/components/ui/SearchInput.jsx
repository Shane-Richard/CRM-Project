import React from 'react';
import { Search } from 'lucide-react';

const SearchInput = ({ 
  placeholder = 'Search...', 
  value, 
  onChange, 
  className = '' 
}) => {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="
          block 
          w-full 
          pl-10 
          pr-3 
          py-2.5 
          border 
          border-transparent 
          rounded-lg 
          leading-5 
          bg-gray-100 
          text-text 
          placeholder-gray-500 
          focus:outline-none 
          focus:bg-white 
          focus:ring-2 
          focus:ring-primary 
          focus:border-transparent 
          sm:text-sm 
          transition-all 
          duration-200
        "
      />
    </div>
  );
};

export default SearchInput;
