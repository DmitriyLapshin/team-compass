import React from 'react';
import { useTheme } from '../context/ThemeContext';
import YandexTrackerSettings from './YandexTrackerSettings';
import JiraSettings from './JiraSettings';
import { useToast } from '../context/ToastContext';

export default function SettingsModal({ isOpen, onClose, onImportSuccess }) {
    const { isDark } = useTheme();
    const { showToast } = useToast();

    const handleLogout = async () => {
        try {
            const response = await fetch('/logout', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                    'Content-Type': 'application/json',
                },
            });
            if (response.redirected) {
                window.location.href = response.url;
            } else {
                window.location.href = '/login';
            }
        } catch (error) {
            console.error('Ошибка выхода:', error);
            showToast('❌ Ошибка выхода', 'error');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className={`w-full max-w-2xl max-h-[80vh] rounded-xl shadow-2xl overflow-hidden ${
                isDark ? 'bg-[#0a0a0f]' : 'bg-gray-50'
            }`}>
                {/* Header */}
                <div className={`flex items-center justify-between p-6 border-b ${
                    isDark ? 'border-[#1a1a2e]' : 'border-gray-200'
                }`}>
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">⚙️</span>
                        <div>
                            <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Настройки интеграций
                            </h2>
                            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                Подключение к внешним системам
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-lg transition-all duration-200 ${
                            isDark 
                                ? 'hover:bg-[#1a1a2e] text-gray-400 hover:text-white' 
                                : 'hover:bg-gray-200 text-gray-500 hover:text-gray-900'
                        }`}
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
                    <YandexTrackerSettings onImportSuccess={onImportSuccess} />
                    <div className={`border-t ${isDark ? 'border-[#1a1a2e]' : 'border-gray-200'}`} />
                    <JiraSettings onImportSuccess={onImportSuccess} />
                </div>

                {/* Footer с кнопкой выхода */}
                <div className={`p-4 border-t flex items-center justify-between ${
                    isDark ? 'border-[#1a1a2e]' : 'border-gray-200'
                }`}>
                    <button
                        onClick={handleLogout}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                            isDark
                                ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30'
                                : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 hover:border-red-300'
                        }`}
                    >
                        🚪 Выйти
                    </button>
                    <button
                        onClick={onClose}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                            isDark
                                ? 'bg-[#1a1a2e] text-gray-300 hover:bg-[#2a2a4a]'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Закрыть
                    </button>
                </div>
            </div>
        </div>
    );
}
