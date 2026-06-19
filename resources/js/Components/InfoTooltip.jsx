import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

export default function InfoTooltip({ children, content, position = 'top' }) {
    const { isDark } = useTheme();
    const [isVisible, setIsVisible] = useState(false);

    const positionClasses = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    };

    return (
        <div 
            className="relative inline-flex items-center"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            {isVisible && (
                <div className={`absolute z-10 ${positionClasses[position]} w-64 p-3 text-xs rounded-lg shadow-xl transition-opacity duration-200 ${
                    isDark 
                        ? 'bg-[#1a1a2e] text-gray-300 border border-[#2a2a4a]' 
                        : 'bg-white text-gray-700 border border-gray-200 shadow-lg'
                }`}>
                    {content}
                    <div className={`absolute w-2 h-2 rotate-45 ${
                        isDark ? 'bg-[#1a1a2e]' : 'bg-white'
                    } ${
                        position === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2' :
                        position === 'bottom' ? 'top-[-4px] left-1/2 -translate-x-1/2' :
                        position === 'left' ? 'right-[-4px] top-1/2 -translate-y-1/2' :
                        'left-[-4px] top-1/2 -translate-y-1/2'
                    }`} />
                </div>
            )}
        </div>
    );
}
