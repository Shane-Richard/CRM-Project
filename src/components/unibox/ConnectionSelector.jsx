import React from 'react';
import { Server } from 'lucide-react';

/**
 * Universal Configuration Pattern
 * Adding a new connection type only requires adding one object to this array.
 */
const connectionConfigs = [
  {
    id: 'gmail',
    title: 'Connect Gmail',
    description: 'Sync emails securely via OAuth.',
    iconType: 'image',
    iconSrc: 'https://www.gstatic.com/images/branding/product/1x/gmail_2020q4_48dp.png',
    hoverClass: 'hover:border-primary hover:bg-primary/5',
    glowClass: 'group-hover:shadow-[0_0_15px_rgba(178,244,14,0.2)]',
    textHoverClass: 'group-hover:text-black'
  },
  {
    id: 'manual',
    title: 'Connect via IMAP/SMTP',
    description: 'Manually configure your custom email server.',
    iconType: 'lucide',
    IconComponent: Server,
    hoverClass: 'hover:border-primary hover:bg-primary/5',
    glowClass: 'group-hover:shadow-[0_0_15px_rgba(178,244,14,0.2)]',
    textHoverClass: 'group-hover:text-black'
  }
];

const ConnectionSelector = ({ onSelect }) => {
  return (
    <div className="grid grid-cols-1 gap-4">
      {connectionConfigs.map((config) => (
        <button
          key={config.id}
          onClick={() => onSelect(config.id)}
          className={`flex items-center p-4 border border-gray-200 rounded-xl transition-all duration-300 group text-left ${config.hoverClass} ${config.glowClass}`}
        >
          {/* Icon Container */}
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mr-4 border border-gray-100 transition-all duration-300 group-hover:scale-105">
            {config.iconType === 'image' && (
              <img src={config.iconSrc} alt={config.title} className="w-6 h-6 object-contain" />
            )}
            {config.iconType === 'lucide' && (
              <config.IconComponent className="w-6 h-6 text-gray-400 group-hover:text-primary transition-colors" />
            )}
            {config.iconType === 'custom' && (
              <config.IconComponent className="w-7 h-7" />
            )}
          </div>

          {/* Text Content */}
          <div className="flex-1">
            <h4 className={`font-semibold text-gray-900 transition-colors ${config.textHoverClass}`}>
              {config.title}
            </h4>
            <p className="text-sm text-gray-500 leading-tight mt-0.5">
              {config.description}
            </p>
          </div>

          {/* Invisible arrow indicator */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
             <span className="text-gray-400">→</span>
          </div>
        </button>
      ))}
    </div>
  );
};

export default ConnectionSelector;
