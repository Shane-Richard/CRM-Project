import React, { useState, useRef, useEffect, memo } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';

const UniversalDropdown = memo(({ 
    items, 
    activeItem, 
    onSelect, 
    placeholder = "Search...",
    triggerLabel,
    triggerIcon: TriggerIcon,
    triggerColor,
    footerButton,
    isLoading = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredItems = items.filter(item => 
    item.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:border-gray-300 transition-all text-sm font-medium group relative"
        style={triggerColor ? { color: triggerColor } : {}}
      >
        {TriggerIcon && <TriggerIcon className="w-4 h-4" />}
        <span className="text-gray-700 truncate max-w-[120px]">{triggerLabel}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        
        {/* Loading Indicator (Glowing Dot) */}
        {isLoading && (
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#b2f40e] rounded-full animate-pulse shadow-[0_0_8px_rgba(178,244,14,0.8)]" />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Search Bar */}
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder={placeholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-sm bg-gray-50 border-none rounded-md focus:ring-1 focus:ring-primary/30 outline-none"
                autoFocus
              />
            </div>
          </div>

          {/* Items List */}
          <div className="max-h-64 overflow-y-auto py-1">
            {filteredItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelect(item.id);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className={`w-full flex items-center px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 group ${isActive ? 'bg-[#b2f40e]/5' : ''}`}
                >
                  {Icon && (
                    <Icon 
                        className="w-4 h-4 mr-3" 
                        style={item.color ? { color: item.color } : {}}
                    />
                  )}
                  <div className="flex-1 text-left flex flex-col">
                    <span className={`${isActive ? 'font-bold text-gray-900' : 'text-gray-600'}`}>
                        {item.label}
                    </span>
                    {item.sublabel && (
                        <span className="text-[10px] text-gray-400 font-normal">{item.sublabel}</span>
                    )}
                  </div>
                  {isActive && (
                      <Check className="w-4 h-4 text-[#b2f40e]" />
                  )}
                </button>
              );
            })}
            
            {filteredItems.length === 0 && (
                <div className="px-4 py-3 text-xs text-gray-400 text-center uppercase tracking-wider">
                    No results found
                </div>
            )}
          </div>

          {/* Footer Action */}
          {footerButton && (
            <div className="border-t border-gray-100 bg-gray-50">
                <button 
                   onClick={() => {
                       footerButton.onClick();
                       setIsOpen(false);
                   }}
                   className="w-full flex items-center px-4 py-3 hover:bg-white transition-colors text-sm font-semibold text-blue-600"
                >
                    <FooterIcon icon={footerButton.icon} className="w-4 h-4 mr-3" />
                    {footerButton.label}
                </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

// Helper component for footer icon to avoid lowercase tag issues
const FooterIcon = ({ icon: Icon, className }) => {
    if (!Icon) return null;
    return <Icon className={className} />;
};

export default UniversalDropdown;
