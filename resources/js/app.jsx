import React from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import Dashboard from './Dashboard';

const container = document.getElementById('app');
const root = createRoot(container);

root.render(
    <ThemeProvider>
        <ToastProvider>
            <Dashboard />
        </ToastProvider>
    </ThemeProvider>
);
