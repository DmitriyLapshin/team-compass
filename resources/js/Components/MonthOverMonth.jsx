import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis,
    CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    ComposedChart
} from 'recharts';
import InfoTooltip from './InfoTooltip';

export default function MonthOverMonth() {
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
            const response = await fetch('/api/month-over-month');
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
                <div className="flex items-center justify-center h-64">
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
                <div className="flex items-center justify-center h-64">
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

    if (!data || !data.data || data.data.length === 0) {
        return (
            <div className={`rounded-xl border p-6 transition-all duration-300 ${
                isDark 
                    ? 'bg-[#11111f] border-[#1a1a2e]' 
                    : 'bg-white border-gray-200 shadow-sm'
            }`}>
                <div className="flex items-center justify-center h-64">
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Нет данных для сравнения по месяцам
                    </p>
                </div>
            </div>
        );
    }

    const isUp = data.trend === 'up';

    return (
        <div className={`rounded-xl border p-6 transition-all duration-300 ${
            isDark 
                ? 'bg-[#11111f] border-[#1a1a2e]' 
                : 'bg-white border-gray-200 shadow-sm'
        }`}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <h3 className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        📈 Месяц к месяцу (MoM)
                    </h3>
                    <InfoTooltip content="Сравнение скорости команды по месяцам. Зелёный — рост, красный — падение. Показывает динамику производительности.">
                        <span className="text-xs cursor-help text-gray-400 hover:text-gray-300">ⓘ</span>
                    </InfoTooltip>
                </div>
                <div className={`px-3 py-1 rounded-lg text-xs font-medium ${
                    isUp 
                        ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                        : 'bg-red-500/10 text-red-500 border border-red-500/20'
                }`}>
                    {isUp ? '↑' : '↓'} Тренд {isUp ? 'рост' : 'падение'}
                </div>
            </div>

            <ResponsiveContainer width="100%" height={220}>
                <ComposedChart data={data.data}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1a1a2e' : '#e5e7eb'} />
                    <XAxis dataKey="month" stroke={isDark ? '#6b6b8b' : '#9ca3af'} fontSize={10} />
                    <YAxis stroke={isDark ? '#6b6b8b' : '#9ca3af'} fontSize={10} />
                    <Tooltip
                        contentStyle={{
                            background: isDark ? '#1a1a2e' : '#ffffff',
                            border: `1px solid ${isDark ? '#2a2a4a' : '#e5e7eb'}`,
                            borderRadius: '8px',
                            color: isDark ? '#e0e0e0' : '#1f2937'
                        }}
                        formatter={(value, name) => {
                            if (name === 'velocity') return [`${value} SP`, 'Скорость'];
                            if (name === 'tasks') return [`${value} задач`, 'Задач закрыто'];
                            return [value, name];
                        }}
                    />
                    <Legend wrapperStyle={{ color: isDark ? '#a0a0c0' : '#6b7280' }} />
                    <Bar 
                        dataKey="velocity" 
                        fill="#7c3aed" 
                        radius={[4, 4, 0, 0]} 
                        name="Скорость (SP)"
                    />
                    <Line 
                        type="monotone" 
                        dataKey="velocity" 
                        stroke="#4f46e5" 
                        strokeWidth={2}
                        dot={{ r: 3, fill: '#4f46e5' }}
                        activeDot={{ r: 6 }}
                        name="Тренд"
                    />
                </ComposedChart>
            </ResponsiveContainer>

            {/* Детали по месяцам */}
            <div className="grid grid-cols-3 gap-2 mt-3">
                {data.data.slice(-3).map((item, index) => (
                    <div key={index} className={`p-2 rounded-lg ${isDark ? 'bg-[#1a1a2e]' : 'bg-gray-100'}`}>
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{item.month}</p>
                        <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {item.velocity} SP
                        </p>
                        <p className={`text-xs ${item.velocity_change > 0 ? 'text-green-500' : item.velocity_change < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                            {item.velocity_change > 0 ? '↑' : item.velocity_change < 0 ? '↓' : '—'}
                            {Math.abs(item.velocity_change)}%
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
