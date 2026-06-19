import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

export default function ZoomControls({ targetRef }) {
    const { isDark } = useTheme();
    const [zoomLevel, setZoomLevel] = useState(100);

    const applyZoom = (level) => {
        const newZoom = Math.min(Math.max(level, 70), 150);
        setZoomLevel(newZoom);
        if (targetRef?.current) {
            targetRef.current.style.transform = `scale(${newZoom / 100})`;
            targetRef.current.style.transformOrigin = 'top left';
            targetRef.current.style.width = `${100 / (newZoom / 100)}%`;
        }
    };

    const handleZoomIn = () => applyZoom(zoomLevel + 10);
    const handleZoomOut = () => applyZoom(zoomLevel - 10);
    const handleReset = () => applyZoom(100);

    // Слушаем Ctrl+ / Ctrl- для зума
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey && e.key === '=') {
                e.preventDefault();
                handleZoomIn();
            } else if (e.ctrlKey && e.key === '-') {
                e.preventDefault();
                handleZoomOut();
            } else if (e.ctrlKey && e.key === '0') {
                e.preventDefault();
                handleReset();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [zoomLevel]);

    return (
        <div className="flex items-center gap-1">
            <button
                onClick={handleZoomOut}
                className={`px-2 py-1 text-sm rounded-lg transition-all duration-200 ${
                    isDark
                        ? 'hover:bg-[#2a2a4a] text-gray-400 hover:text-white'
                        : 'hover:bg-gray-200 text-gray-500 hover:text-gray-700'
                }`}
                title="Уменьшить (Ctrl+-)"
            >
                −
            </button>
            <span className={`text-xs min-w-[40px] text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {zoomLevel}%
            </span>
            <button
                onClick={handleZoomIn}
                className={`px-2 py-1 text-sm rounded-lg transition-all duration-200 ${
                    isDark
                        ? 'hover:bg-[#2a2a4a] text-gray-400 hover:text-white'
                        : 'hover:bg-gray-200 text-gray-500 hover:text-gray-700'
                }`}
                title="Увеличить (Ctrl++)"
            >
                +
            </button>
            <button
                onClick={handleReset}
                className={`px-2 py-1 text-xs rounded-lg transition-all duration-200 ${
                    isDark
                        ? 'hover:bg-[#2a2a4a] text-gray-400 hover:text-white'
                        : 'hover:bg-gray-200 text-gray-500 hover:text-gray-700'
                }`}
                title="Сбросить (Ctrl+0)"
            >
                ↺
            </button>
        </div>
    );
}
