import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer
} from 'recharts';

export default function PeriodComparison() {
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
            const response = await fetch('/api/compare-periods');
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
                <div className="flex items-center justify-center h-48">
                    <div className="text-center">
                        <div className="w-8 h-8 border-4 border-[#7c3aed] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            Загрузка данных...
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
                <div className="flex items-center justify-center h-48">
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

    if (!data || !data.current || !data.previous) {
        return null;
    }

    const chartData = [
        {
            name: 'Скорость (SP)',
            Текущие: data.current.avg_velocity,
            Ранние: data.previous.avg_velocity,
        },
        {
            name: 'Задач закрыто',
            Текущие: data.current.total_tasks,
            Ранние: data.previous.total_tasks,
        },
    ];

    const isUp = data.comparison.velocity_change === 'up';

    return (
        <div className={`rounded-xl border p-6 transition-all duration-300 ${
            isDark 
                ? 'bg-[#11111f] border-[#1a1a2e]' 
                : 'bg-white border-gray-200 shadow-sm'
        }`}>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        📊 Сравнение периодов
                    </h3>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} mt-0.5`}>
                        {data.current.sprint_count} спринтов vs {data.previous.sprint_count} спринтов
                    </p>
                </div>
                <div className={`px-3 py-1 rounded-lg text-xs font-medium ${
                    isUp 
                        ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                        : 'bg-red-500/10 text-red-500 border border-red-500/20'
                }`}>
                    {isUp ? '↑' : '↓'} {Math.abs(data.comparison.velocity_percent)}% 
                    {isUp ? ' рост' : ' падение'}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Сравнительный график */}
                <div>
                    <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1a1a2e' : '#e5e7eb'} horizontal={false} />
                            <XAxis 
                                type="number"
                                stroke={isDark ? '#6b6b8b' : '#9ca3af'} 
                                fontSize={10}
                            />
                            <YAxis 
                                type="category" 
                                dataKey="name"
                                stroke={isDark ? '#6b6b8b' : '#9ca3af'} 
                                fontSize={10}
                                width={80}
                            />
                            <Tooltip
                                contentStyle={{
                                    background: isDark ? '#1a1a2e' : '#ffffff',
                                    border: `1px solid ${isDark ? '#2a2a4a' : '#e5e7eb'}`,
                                    borderRadius: '8px',
                                    color: isDark ? '#e0e0e0' : '#1f2937'
                                }}
                            />
                            <Legend wrapperStyle={{ color: isDark ? '#a0a0c0' : '#6b7280', fontSize: 10 }} />
                            <Bar dataKey="Текущие" fill="#7c3aed" radius={[0, 4, 4, 0]} />
                            <Bar dataKey="Ранние" fill="#4f46e5" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Цифры */}
                <div className="grid grid-cols-2 gap-2">
                    <div className={`p-3 rounded-lg ${isDark ? 'bg-[#1a1a2e]' : 'bg-gray-100'}`}>
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Текущие спринты</p>
                        <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {data.current.avg_velocity} SP
                        </p>
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            {data.current.total_tasks} задач
                        </p>
                    </div>
                    <div className={`p-3 rounded-lg ${isDark ? 'bg-[#1a1a2e]' : 'bg-gray-100'}`}>
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Ранние спринты</p>
                        <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {data.previous.avg_velocity} SP
                        </p>
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            {data.previous.total_tasks} задач
                        </p>
                    </div>
                    <div className={`col-span-2 p-3 rounded-lg ${isDark ? 'bg-[#1a1a2e]' : 'bg-gray-100'}`}>
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Изменение скорости</p>
                        <p className={`text-lg font-bold ${isUp ? 'text-green-500' : 'text-red-500'}`}>
                            {isUp ? '+' : ''}{data.comparison.velocity_percent}%
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
