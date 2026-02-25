import React, { createContext, useContext, useState, useCallback } from 'react';

// Create Context
const NavigationContext = createContext();

// Provider Component
export const NavigationProvider = ({ children }) => {
  const [activeItem, setActiveItem] = useState('Dashboard');

  const navigate = useCallback((item) => {
    setActiveItem(item);
  }, []);

  return (
    <NavigationContext.Provider value={{ activeItem, navigate }}>
      {children}
    </NavigationContext.Provider>
  );
};

// Hook to consume context
export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
