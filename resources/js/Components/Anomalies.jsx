import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

export default function Anomalies() {
    const { isDark } = useTheme();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/anomalies');
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

    if (loading) {
        return (
            <div className={`rounded-xl border p-6 transition-all duration-300 ${
                isDark 
                    ? 'bg-[#11111f] border-[#1a1a2e]' 
                    : 'bg-white border-gray-200 shadow-sm'
            }`}>
                <div className="flex items-center justify-center h-32">
                    <div className="text-center">
                        <div className="w-8 h-8 border-4 border-[#7c3aed] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            Поиск аномалий...
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
                <div className="flex items-center justify-center h-32">
                    <div className="text-center">
                        <p className="text-sm text-red-500">{error}</p>
                        <button
                            onClick={fetchData}
                            className={`mt-2 px-4 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                                isDark
                                    ? 'bg-[#1a1a2e] text-gray-300 hover:bg-[#2a2a4a]'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            🔄 Попробовать снова
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!data || data.total_anomalies === 0) {
        return (
            <div className={`rounded-xl border p-6 transition-all duration-300 ${
                isDark 
                    ? 'bg-[#11111f] border-[#1a1a2e]' 
                    : 'bg-white border-gray-200 shadow-sm'
            }`}>
                <div className="flex items-center gap-3">
                    <span className="text-2xl">✅</span>
                    <div>
                        <h3 className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Аномалий не обнаружено
                        </h3>
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            Все показатели в норме
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const allAnomalies = [
        ...(data.velocity_anomalies || []),
        ...(data.release_anomalies || []),
        ...(data.task_anomalies || []),
    ];

    const getSeverityIcon = (severity) => {
        switch (severity) {
            case 'critical': return '🚨';
            case 'warning': return '⚠️';
            default: return 'ℹ️';
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'critical': return 'text-red-500 border-red-500/20 bg-red-500/5';
            case 'warning': return 'text-yellow-500 border-yellow-500/20 bg-yellow-500/5';
            default: return 'text-blue-500 border-blue-500/20 bg-blue-500/5';
        }
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'velocity': return '📊 Скорость';
            case 'release': return '📦 Релизы';
            case 'task': return '✅ Задачи';
            default: return type;
        }
    };

    return (
        <div className={`rounded-xl border p-6 transition-all duration-300 ${
            isDark 
                ? 'bg-[#11111f] border-[#1a1a2e]' 
                : 'bg-white border-gray-200 shadow-sm'
        }`}>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        🔍 Аномалии в данных
                    </h3>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} mt-0.5`}>
                        Найдено {data.total_anomalies} аномалий
                        {data.has_critical && ' 🚨 есть критичные'}
                    </p>
                </div>
                <button
                    onClick={fetchData}
                    className={`text-xs px-3 py-1 rounded-lg transition-all duration-200 ${
                        isDark 
                            ? 'bg-[#1a1a2e] text-gray-400 hover:text-white hover:bg-[#2a2a4a]' 
                            : 'bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                    }`}
                >
                    🔄 Обновить
                </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {allAnomalies.map((anomaly, index) => (
                    <div
                        key={index}
                        className={`p-3 rounded-lg border transition-all duration-200 ${getSeverityColor(anomaly.severity)}`}
                    >
                        <div className="flex items-start gap-3">
                            <span className="text-lg">{getSeverityIcon(anomaly.severity)}</span>
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                        isDark ? 'bg-[#1a1a2e]' : 'bg-gray-200'
                                    }`}>
                                        {getTypeLabel(anomaly.type)}
                                    </span>
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                        anomaly.severity === 'critical' 
                                            ? 'bg-red-500/20 text-red-500'
                                            : 'bg-yellow-500/20 text-yellow-500'
                                    }`}>
                                        {anomaly.severity === 'critical' ? 'Критично' : 'Предупреждение'}
                                    </span>
                                </div>
                                <p className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {anomaly.message}
                                </p>
                                {anomaly.sprint_name && (
                                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
                                        {anomaly.sprint_name} • {anomaly.date}
                                    </p>
                                )}
                                {anomaly.version && (
                                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
                                        {anomaly.version} • {anomaly.date}
                                    </p>
                                )}
                                {anomaly.task_key && (
                                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
                                        {anomaly.task_key}
                                    </p>
                                )}
                            </div>
                            <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} whitespace-nowrap`}>
                                z={anomaly.z_score}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
