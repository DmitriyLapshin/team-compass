import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import InfoTooltip from './InfoTooltip';

export default function ReleaseTimeline() {
    const { isDark } = useTheme();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const scrollRef = useRef(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/release-timeline');
            const result = await response.json();
            if (response.ok) {
                setData(result);
            } else {
                setError(result.message || 'Ошибка загрузки данных');
            }
        } catch (err) {
            setError('Ошибка соединения: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const scroll = (direction) => {
        if (scrollRef.current) {
            const scrollAmount = 300;
            const newScroll = scrollRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
            scrollRef.current.scrollTo({
                left: newScroll,
                behavior: 'smooth',
            });
        }
    };

    if (loading) {
        return (
            <div className={`rounded-xl border p-6 transition-all duration-300 ${
                isDark 
                    ? 'bg-[#11111f] border-[#1a1a2e]' 
                    : 'bg-white border-gray-200 shadow-sm'
            }`}>
                <div className="flex items-center justify-center h-24">
                    <div className="text-center">
                        <div className="w-6 h-6 border-4 border-[#7c3aed] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            Загрузка релизов...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`rounded-xl border p-6 transition-all duration-300 ${
                isDark 
                    ? 'bg-[#11111f] border-[#1a1a2e]' 
                    : 'bg-white border-gray-200 shadow-sm'
            }`}>
                <div className="flex items-center justify-center h-24">
                    <p className="text-sm text-red-500">{error}</p>
                </div>
            </div>
        );
    }

    if (!data || !data.releases || data.releases.length === 0) {
        return (
            <div className={`rounded-xl border p-6 transition-all duration-300 ${
                isDark 
                    ? 'bg-[#11111f] border-[#1a1a2e]' 
                    : 'bg-white border-gray-200 shadow-sm'
            }`}>
                <div className="flex items-center justify-center h-24">
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Нет данных о релизах
                    </p>
                </div>
            </div>
        );
    }

    const colors = {
        success: isDark ? 'bg-green-500' : 'bg-green-500',
        warning: isDark ? 'bg-yellow-500' : 'bg-yellow-500',
        danger: isDark ? 'bg-red-500' : 'bg-red-500',
    };
    const bgColors = {
        success: isDark ? 'bg-green-500/20' : 'bg-green-50',
        warning: isDark ? 'bg-yellow-500/20' : 'bg-yellow-50',
        danger: isDark ? 'bg-red-500/20' : 'bg-red-50',
    };
    const textColors = {
        success: isDark ? 'text-green-400' : 'text-green-700',
        warning: isDark ? 'text-yellow-400' : 'text-yellow-700',
        danger: isDark ? 'text-red-400' : 'text-red-700',
    };

    return (
        <div className={`rounded-xl border p-6 transition-all duration-300 ${
            isDark 
                ? 'bg-[#11111f] border-[#1a1a2e]' 
                : 'bg-white border-gray-200 shadow-sm'
        }`}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <h3 className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        📅 Календарь релизов
                    </h3>
                    <InfoTooltip content="Визуальный таймлайн всех релизов. ✅ — без багов, ⚠️ — с багами, 🚨 — много багов.">
                        <span className="text-xs cursor-help text-gray-400 hover:text-gray-300">ⓘ</span>
                    </InfoTooltip>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        {data.total} релизов
                    </span>
                </div>
            </div>

            {/* Таймлайн с горизонтальным скроллом */}
            <div className="relative">
                {/* Кнопки скролла */}
                {data.releases.length > 6 && (
                    <>
                        <button
                            onClick={() => scroll('left')}
                            className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                                isDark 
                                    ? 'bg-[#1a1a2e] text-gray-400 hover:bg-[#2a2a4a] hover:text-white border border-[#2a2a4a]'
                                    : 'bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-700 border border-gray-200 shadow-sm'
                            }`}
                        >
                            ‹
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                                isDark 
                                    ? 'bg-[#1a1a2e] text-gray-400 hover:bg-[#2a2a4a] hover:text-white border border-[#2a2a4a]'
                                    : 'bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-700 border border-gray-200 shadow-sm'
                            }`}
                        >
                            ›
                        </button>
                    </>
                )}

                <div
                    ref={scrollRef}
                    className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#2a2a4a] scrollbar-track-transparent pb-4"
                    style={{
                        scrollbarWidth: 'thin',
                        scrollbarColor: isDark ? '#2a2a4a transparent' : '#d1d5db transparent',
                    }}
                >
                    <div className="relative min-w-max px-8">
                        {/* Линия времени */}
                        <div className={`absolute left-0 right-0 top-1/2 h-0.5 ${isDark ? 'bg-[#2a2a4a]' : 'bg-gray-300'}`}></div>
                        
                        <div className="flex justify-between items-center relative gap-4 min-w-max">
                            {data.releases.map((release, index) => {
                                const color = colors[release.status] || colors.success;
                                const bgColor = bgColors[release.status] || bgColors.success;
                                const textColor = textColors[release.status] || textColors.success;

                                return (
                                    <div key={index} className="flex flex-col items-center z-10 min-w-[80px]">
                                        <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-1 whitespace-nowrap`}>
                                            {release.date}
                                        </div>
                                        <div className={`w-4 h-4 rounded-full ${color} ring-2 ${isDark ? 'ring-[#0a0a0f]' : 'ring-white'}`}></div>
                                        <div className={`mt-1 px-2 py-0.5 text-xs rounded-full ${bgColor} ${textColor} whitespace-nowrap`}>
                                            {release.label}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Статистика */}
            <div className="flex gap-4 mt-4 text-xs">
                <div className={`px-3 py-1 rounded-lg ${isDark ? 'bg-[#1a1a2e]' : 'bg-gray-100'}`}>
                    <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>Всего релизов: </span>
                    <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{data.total}</span>
                </div>
                <div className={`px-3 py-1 rounded-lg ${isDark ? 'bg-[#1a1a2e]' : 'bg-gray-100'}`}>
                    <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>Среднее багов: </span>
                    <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{data.avg_bugs}</span>
                </div>
                <div className={`px-3 py-1 rounded-lg ${isDark ? 'bg-[#1a1a2e]' : 'bg-gray-100'}`}>
                    <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>Без багов: </span>
                    <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {data.releases.filter(r => r.bugs === 0).length}
                    </span>
                </div>
            </div>

            {/* Кастомный скроллбар */}
            <style>{`
                .scrollbar-thin::-webkit-scrollbar {
                    height: 4px;
                }
                .scrollbar-thin::-webkit-scrollbar-track {
                    background: transparent;
                }
                .scrollbar-thin::-webkit-scrollbar-thumb {
                    background: ${isDark ? '#2a2a4a' : '#d1d5db'};
                    border-radius: 2px;
                }
                .scrollbar-thin::-webkit-scrollbar-thumb:hover {
                    background: ${isDark ? '#3a3a5a' : '#9ca3af'};
                }
            `}</style>
        </div>
    );
}
