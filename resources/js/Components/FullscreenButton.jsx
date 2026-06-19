import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';

export default function FullscreenButton() {
    const { isDark } = useTheme();
    const { showToast } = useToast();
    const [isFullscreen, setIsFullscreen] = useState(false);

    const toggleFullscreen = async () => {
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
                setIsFullscreen(true);
                showToast('📺 Полноэкранный режим включён', 'info');
            } else {
                if (document.exitFullscreen) {
                    await document.exitFullscreen();
                    setIsFullscreen(false);
                    showToast('📺 Полноэкранный режим выключен', 'info');
                }
            }
        } catch (error) {
            showToast('❌ Ошибка: ' + error.message, 'error');
        }
    };

    // Слушаем изменения fullscreen
    React.useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    return (
        <button
            onClick={toggleFullscreen}
            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                isDark
                    ? 'bg-[#1a1a2e] text-gray-400 hover:text-white hover:bg-[#2a2a4a] border border-[#2a2a4a]'
                    : 'bg-gray-100 text-gray-500 hover:text-gray-700 hover:bg-gray-200 border border-gray-200'
            } ${isFullscreen ? 'ring-2 ring-[#7c3aed]' : ''}`}
            title={isFullscreen ? 'Выйти из полноэкранного режима' : 'Включить полноэкранный режим'}
        >
            {isFullscreen ? '⛶' : '⛶'}
        </button>
    );
}
