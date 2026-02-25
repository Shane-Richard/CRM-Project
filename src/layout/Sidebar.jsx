import React, { useState } from 'react';
import { 
  Search, 
  LayoutDashboard, 
  Megaphone, 
  Inbox, 
  BarChart2, 
  Settings, 
  Box,
  Link,
  Send,
  FileText,
  Zap,
  Monitor,
  MessageSquare,
  Rocket,
  User,
  Bug,
  Hexagon
} from 'lucide-react';

const Sidebar = ({ activeItem, navigate }) => {
  const [hoveredItem, setHoveredItem] = useState(null);
  const [hoveredRect, setHoveredRect] = useState(null);

  const handleMouseEnter = (event, name) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setHoveredRect(rect);
    setHoveredItem(name);
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
    setHoveredRect(null);
  };

  const menuItems = [
    { name: 'Lead Finder', icon: LayoutDashboard },
    { name: 'Inboxes', icon: Inbox },
    { name: 'Search', icon: Search },
    { name: 'Campaigns', icon: Megaphone },
    { name: 'Sending', icon: Send },
    { name: 'Templates', icon: FileText },
    { name: 'Analytics', icon: BarChart2 },
    { name: 'Accelerator', icon: Zap },
    { name: 'Debug', icon: Bug },
    { name: 'Inbox Placement', icon: Monitor },
    { name: 'Settings', icon: Settings },
  ];

  const bottomItems = [
    { name: 'Chat', icon: MessageSquare },
    { name: 'Growth', icon: Rocket },
    { name: 'Profile', icon: User },
  ];

  return (
    <>
      <aside className="fixed left-0 top-0 h-screen w-20 bg-[#0a0a0b] border-r border-white/5 flex flex-col z-50 items-center py-6 shadow-[4px_0_24px_rgba(0,0,0,0.3)]">
        {/* Logo Section */}
        <div className="mb-10 group cursor-pointer relative">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-[#8bc60a] flex items-center justify-center rotate-3 group-hover:rotate-12 transition-all duration-300 shadow-lg shadow-primary/20">
            <Hexagon className="w-7 h-7 text-black fill-black/10" strokeWidth={2.5} />
          </div>
        </div>

        {/* Main Menu Section */}
        <nav className="flex-1 w-full px-3 space-y-3 overflow-y-auto no-scrollbar flex flex-col items-center">
          {menuItems.map((item) => {
            const isActive = activeItem === item.name || (item.name === 'Inboxes' && activeItem === 'Unibox');
            return (
              <button
                key={item.name}
                onClick={() => navigate(item.name)}
                onMouseEnter={(e) => handleMouseEnter(e, item.name)}
                onMouseLeave={handleMouseLeave}
                className={`w-11 h-11 flex items-center justify-center rounded-2xl transition-all duration-300 group relative ${
                  isActive
                    ? 'bg-primary text-black shadow-[0_0_20px_rgba(178,244,14,0.3)] scale-105'
                    : 'text-slate-500 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon
                  className={`w-[18px] h-[18px] transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                
                {/* Active Indicator Glow */}
                {isActive && (
                    <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-primary rounded-r-full shadow-[4px_0_12px_rgba(178,244,14,0.6)]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="mt-auto pt-6 pb-2 w-full px-3 space-y-4 flex flex-col items-center border-t border-white/5">
          {bottomItems.map((item) => (
             <button
              key={item.name}
              onMouseEnter={(e) => handleMouseEnter(e, item.name)}
              onMouseLeave={handleMouseLeave}
              className="w-10 h-10 flex items-center justify-center rounded-2xl text-slate-500 hover:text-white hover:bg-white/5 transition-all group relative"
            >
              <item.icon className="w-[18px] h-[18px] group-hover:scale-110 transition-transform" />
            </button>
          ))}
        </div>
      </aside>

      {/* Premium Tooltip */}
      {hoveredItem && hoveredRect && (
        <div 
          className="fixed px-3 py-2 bg-slate-900/90 backdrop-blur-md text-white text-[11px] font-bold uppercase tracking-widest rounded-xl border border-white/10 shadow-2xl pointer-events-none z-[100] transition-opacity duration-200 animate-in fade-in slide-in-from-left-2"
          style={{
            top: hoveredRect.top + (hoveredRect.height / 2),
            left: hoveredRect.right + 16,
            transform: 'translateY(-50%)'
          }}
        >
          {hoveredItem}
          <div 
            className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-slate-900 border-l border-b border-white/10 rotate-45"
          />
        </div>
      )}
    </>
  );
};

export default Sidebar;
