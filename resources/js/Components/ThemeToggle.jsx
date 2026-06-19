import React from 'react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
    const { isDark, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="relative w-12 h-6 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:ring-offset-2 focus:ring-offset-[#0a0a0f]"
            style={{
                backgroundColor: isDark ? '#4f46e5' : '#d1d5db',
            }}
        >
            <div
                className="absolute top-1 left-1 w-4 h-4 rounded-full transition-all duration-300 bg-white shadow-md flex items-center justify-center"
                style={{
                    transform: isDark ? 'translateX(24px)' : 'translateX(0)',
                }}
            >
                {isDark ? (
                    <span className="text-[10px]">🌙</span>
                ) : (
                    <span className="text-[10px]">☀️</span>
                )}
            </div>
        </button>
    );
}
