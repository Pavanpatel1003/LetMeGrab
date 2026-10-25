import React, { createContext, useCallback, useContext, useState } from 'react';
import { Check, CircleAlert, Info, X } from 'lucide-react';

const ToastContext = createContext(null);
const icons = { success: Check, error: CircleAlert, info: Info };

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const dismiss = useCallback(id => setToasts(items => items.filter(item => item.id !== id)), []);
    const notify = useCallback((message, type = 'success') => {
        const id = `${Date.now()}-${Math.random()}`;
        setToasts(items => [...items, { id, message, type }]);
        window.setTimeout(() => dismiss(id), 4200);
    }, [dismiss]);

    return (
        <ToastContext.Provider value={{ notify }}>
            {children}
            <div className="toast-stack" aria-live="polite" aria-atomic="false">
                {toasts.map(toast => {
                    const Icon = icons[toast.type] || Info;
                    return (
                        <div className={`toast-message toast-${toast.type}`} key={toast.id} role="status">
                            <Icon size={18} aria-hidden="true" />
                            <span>{toast.message}</span>
                            <button type="button" aria-label="Dismiss notification" onClick={() => dismiss(toast.id)}><X size={15} /></button>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used inside ToastProvider.');
    return context;
};