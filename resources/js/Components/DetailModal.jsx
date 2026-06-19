import React from 'react';
import { useTheme } from '../context/ThemeContext';

export default function DetailModal({ isOpen, onClose, title, data, type }) {
    const { isDark } = useTheme();

    if (!isOpen) return null;

    const getTypeIcon = () => {
        switch (type) {
            case 'sprint':
                return '📊';
            case 'release':
                return '📦';
            case 'task':
                return '✅';
            default:
                return '📋';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className={`w-full max-w-4xl max-h-[80vh] rounded-xl shadow-2xl overflow-hidden ${
                isDark ? 'bg-[#0a0a0f]' : 'bg-gray-50'
            }`}>
                {/* Header */}
                <div className={`flex items-center justify-between p-6 border-b ${
                    isDark ? 'border-[#1a1a2e]' : 'border-gray-200'
                }`}>
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">{getTypeIcon()}</span>
                        <div>
                            <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {title}
                            </h2>
                            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                {data?.length || 0} записей
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
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {!data || data.length === 0 ? (
                        <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            <p>Нет данных для отображения</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {data.map((item, index) => (
                                <div
                                    key={index}
                                    className={`p-4 rounded-lg border transition-all duration-200 ${
                                        isDark 
                                            ? 'bg-[#11111f] border-[#1a1a2e] hover:border-[#2a2a4a]' 
                                            : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
                                    }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h4 className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                                                {item.name || item.title || item.version || `Запись ${index + 1}`}
                                            </h4>
                                            {item.subtitle && (
                                                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                                                    {item.subtitle}
                                                </p>
                                            )}
                                            <div className="flex flex-wrap gap-3 mt-2">
                                                {Object.entries(item)
                                                    .filter(([key]) => !['name', 'title', 'version', 'subtitle', 'id'].includes(key))
                                                    .map(([key, value]) => (
                                                        <span
                                                            key={key}
                                                            className={`text-xs px-2 py-1 rounded-full ${
                                                                isDark 
                                                                    ? 'bg-[#1a1a2e] text-gray-400' 
                                                                    : 'bg-gray-100 text-gray-600'
                                                            }`}
                                                        >
                                                            {key}: {value}
                                                        </span>
                                                    ))}
                                            </div>
                                        </div>
                                        {item.status && (
                                            <span className={`text-xs px-3 py-1 rounded-full ${
                                                item.status === 'Done' || item.status === 'Completed'
                                                    ? 'bg-green-500/20 text-green-500'
                                                    : item.status === 'In Progress'
                                                    ? 'bg-yellow-500/20 text-yellow-500'
                                                    : item.status === 'Review'
                                                    ? 'bg-blue-500/20 text-blue-500'
                                                    : 'bg-gray-500/20 text-gray-500'
                                            }`}>
                                                {item.status}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className={`p-4 border-t ${isDark ? 'border-[#1a1a2e]' : 'border-gray-200'}`}>
                    <button
                        onClick={onClose}
                        className={`w-full px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
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
