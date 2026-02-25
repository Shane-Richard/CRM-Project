import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { X, Undo2 } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const timers = useRef({});

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
        if (timers.current[id]) {
            clearTimeout(timers.current[id]);
            delete timers.current[id];
        }
    }, []);

    const showToast = useCallback(({ message, type = 'success', duration = 5000, onUndo }) => {
        const id = Math.random().toString(36).substr(2, 9);
        
        setToasts(prev => [...prev, { id, message, type, onUndo }]);

        if (duration !== Infinity) {
            timers.current[id] = setTimeout(() => {
                removeToast(id);
            }, duration);
        }

        return id;
    }, [removeToast]);

    const handleUndo = useCallback((id, onUndo) => {
        if (onUndo) onUndo();
        removeToast(id);
    }, [removeToast]);

    return (
        <ToastContext.Provider value={{ showToast, removeToast }}>
            {children}
            
            {/* Toast Container */}
            <div className="fixed bottom-6 right-6 z-[100] flex flex-col space-y-3">
                {toasts.map((toast) => (
                    <div 
                        key={toast.id}
                        className="flex items-center bg-gray-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-white/10 animate-in slide-in-from-right duration-300 min-w-[300px]"
                    >
                        <div className="flex-1 mr-4">
                            <p className="text-sm font-medium">{toast.message}</p>
                        </div>
                        
                        {toast.onUndo && (
                            <button 
                                onClick={() => handleUndo(toast.id, toast.onUndo)}
                                className="flex items-center space-x-1 px-2 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold transition-colors mr-2 text-primary"
                            >
                                <Undo2 className="w-3 h-3" />
                                <span>Undo</span>
                            </button>
                        )}
                        
                        <button 
                            onClick={() => removeToast(toast.id)}
                            className="p-1 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
