import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'info', duration = 3000) => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type, duration }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((toast) => toast.id !== id));
        }, duration);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
}

function ToastContainer({ toasts, removeToast }) {
    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-md w-full">
            {toasts.map((toast) => (
                <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
            ))}
        </div>
    );
}

function Toast({ toast, onClose }) {
    const { message, type } = toast;

    const getStyles = () => {
        switch (type) {
            case 'success':
                return {
                    bg: 'bg-green-500/10',
                    border: 'border-green-500/30',
                    icon: '✅',
                    text: 'text-green-500',
                };
            case 'error':
                return {
                    bg: 'bg-red-500/10',
                    border: 'border-red-500/30',
                    icon: '❌',
                    text: 'text-red-500',
                };
            case 'warning':
                return {
                    bg: 'bg-yellow-500/10',
                    border: 'border-yellow-500/30',
                    icon: '⚠️',
                    text: 'text-yellow-500',
                };
            default:
                return {
                    bg: 'bg-blue-500/10',
                    border: 'border-blue-500/30',
                    icon: 'ℹ️',
                    text: 'text-blue-500',
                };
        }
    };

    const styles = getStyles();

    return (
        <div
            className={`flex items-start gap-3 p-4 rounded-xl border backdrop-blur-sm shadow-lg animate-slideIn ${styles.bg} ${styles.border}`}
            role="alert"
        >
            <span className="text-xl">{styles.icon}</span>
            <div className="flex-1">
                <p className={`text-sm font-medium ${styles.text}`}>{message}</p>
            </div>
            <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
                ✕
            </button>
        </div>
    );
}
