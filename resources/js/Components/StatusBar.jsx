import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

export default function StatusBar({ incidents }) {
    const { isDark } = useTheme();
    const [status, setStatus] = useState('operational');
    const [lastCheck, setLastCheck] = useState(new Date());

    useEffect(() => {
        // Анализируем инциденты для определения статуса
        const hasCriticalIncidents = incidents?.some(
            inc => inc.severity === 'P1' && new Date(inc.occurred_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
        );
        
        const hasMajorIncidents = incidents?.some(
            inc => inc.severity === 'P2' && new Date(inc.occurred_at) > new Date(Date.now() - 48 * 60 * 60 * 1000)
        );

        if (hasCriticalIncidents) {
            setStatus('critical');
        } else if (hasMajorIncidents) {
            setStatus('degraded');
        } else {
            setStatus('operational');
        }
    }, [incidents]);

    // Обновляем время последней проверки каждую минуту
    useEffect(() => {
        const interval = setInterval(() => {
            setLastCheck(new Date());
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    const getStatusConfig = () => {
        switch (status) {
            case 'operational':
                return {
                    icon: '✅',
                    color: 'text-green-500',
                    bg: isDark ? 'bg-green-500/10' : 'bg-green-50',
                    border: isDark ? 'border-green-500/20' : 'border-green-200',
                    text: 'Все системы работают штатно',
                    dotColor: 'bg-green-500',
                };
            case 'degraded':
                return {
                    icon: '⚠️',
                    color: 'text-yellow-500',
                    bg: isDark ? 'bg-yellow-500/10' : 'bg-yellow-50',
                    border: isDark ? 'border-yellow-500/20' : 'border-yellow-200',
                    text: 'Обнаружены незначительные проблемы',
                    dotColor: 'bg-yellow-500 animate-pulse',
                };
            case 'critical':
                return {
                    icon: '🚨',
                    color: 'text-red-500',
                    bg: isDark ? 'bg-red-500/10' : 'bg-red-50',
                    border: isDark ? 'border-red-500/20' : 'border-red-200',
                    text: 'Критические инциденты требуют внимания',
                    dotColor: 'bg-red-500 animate-pulse',
                };
            default:
                return {
                    icon: '❓',
                    color: 'text-gray-500',
                    bg: isDark ? 'bg-gray-500/10' : 'bg-gray-50',
                    border: isDark ? 'border-gray-500/20' : 'border-gray-200',
                    text: 'Статус неизвестен',
                    dotColor: 'bg-gray-500',
                };
        }
    };

    const config = getStatusConfig();

    const formatTime = (date) => {
        return date.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    return (
        <div className={`flex items-center gap-4 px-4 py-2 rounded-xl border transition-all duration-300 ${config.bg} ${config.border}`}>
            <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${config.dotColor}`} />
                <span className={`text-sm font-medium ${config.color}`}>
                    {config.icon} {config.text}
                </span>
            </div>
            
            <div className="flex-1"></div>

            <div className="flex items-center gap-4 text-xs">
                {incidents && incidents.length > 0 && (
                    <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                        📋 Инцидентов: {incidents.length}
                    </span>
                )}
                <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>
                    🕐 Обновлено: {formatTime(lastCheck)}
                </span>
            </div>
        </div>
    );
}
