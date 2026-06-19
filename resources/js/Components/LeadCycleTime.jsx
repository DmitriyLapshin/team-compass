import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import InfoTooltip from './InfoTooltip';
import {
    PieChart, Pie, Cell, ResponsiveContainer,
    Tooltip, Legend
} from 'recharts';

export default function LeadCycleTime() {
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
            const response = await fetch('/api/lead-cycle-time');
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

    const COLORS = ['#7c3aed', '#4f46e5', '#06b6d4', '#f59e0b'];

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

    if (!data) {
        return (
            <div className={`rounded-xl border p-6 transition-all duration-300 ${
                isDark 
                    ? 'bg-[#11111f] border-[#1a1a2e]' 
                    : 'bg-white border-gray-200 shadow-sm'
            }`}>
                <div className="flex items-center justify-center h-64">
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Нет данных
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={`rounded-xl border p-6 transition-all duration-300 ${
            isDark 
                ? 'bg-[#11111f] border-[#1a1a2e]' 
                : 'bg-white border-gray-200 shadow-sm'
        }`}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <h3 className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        ⏱️ Lead / Cycle Time
                    </h3>
                    <InfoTooltip content="Lead Time — время от создания задачи до закрытия. Cycle Time — время от начала работы до закрытия. Чем меньше разница, тем меньше задач ждёт в очереди.">
                        <span className="text-xs cursor-help text-gray-400 hover:text-gray-300">ⓘ</span>
                    </InfoTooltip>
                </div>
                <div className="flex gap-4 text-xs">
                    <div className="text-center">
                        <p className={isDark ? 'text-gray-500' : 'text-gray-400'}>Lead Time</p>
                        <p className="text-lg font-bold text-[#7c3aed]">
                            {data.avg_lead_time || 0} ч
                        </p>
                    </div>
                    <div className="text-center">
                        <p className={isDark ? 'text-gray-500' : 'text-gray-400'}>Cycle Time</p>
                        <p className="text-lg font-bold text-[#06b6d4]">
                            {data.avg_cycle_time || 0} ч
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Pie Chart - Распределение */}
                <div>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} mb-2 text-center`}>
                        Распределение задач по времени выполнения
                    </p>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie
                                data={data.distribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={70}
                                paddingAngle={2}
                                dataKey="value"
                                label={({ name, percentage }) => `${name} ${percentage}%`}
                                labelLine={false}
                            >
                                {data.distribution.map((entry, index) => (
                                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    background: isDark ? '#1a1a2e' : '#ffffff',
                                    border: `1px solid ${isDark ? '#2a2a4a' : '#e5e7eb'}`,
                                    borderRadius: '8px',
                                    color: isDark ? '#e0e0e0' : '#1f2937',
                                }}
                                itemStyle={{
                                    color: isDark ? '#e0e0e0' : '#1f2937',
                                }}
                                labelStyle={{
                                    color: isDark ? '#a0a0c0' : '#6b7280',
                                }}
                                formatter={(value, name, props) => {
                                    if (props && props.payload) {
                                        return [`${props.payload.percentage}% (${value} задач)`, props.payload.name];
                                    }
                                    return [value, name];
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Пояснение */}
                <div className="flex flex-col justify-center gap-2">
                    <div className={`p-3 rounded-lg ${isDark ? 'bg-[#1a1a2e]' : 'bg-gray-100'}`}>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-[#7c3aed] rounded-full"></div>
                            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                Lead Time
                            </span>
                            <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} ml-auto`}>
                                {data.avg_lead_time || 0} ч (среднее)
                            </span>
                        </div>
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} mt-1 ml-5`}>
                            От создания задачи до закрытия
                        </p>
                    </div>
                    <div className={`p-3 rounded-lg ${isDark ? 'bg-[#1a1a2e]' : 'bg-gray-100'}`}>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-[#06b6d4] rounded-full"></div>
                            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                Cycle Time
                            </span>
                            <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} ml-auto`}>
                                {data.avg_cycle_time || 0} ч (среднее)
                            </span>
                        </div>
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} mt-1 ml-5`}>
                            От начала работы до закрытия
                        </p>
                    </div>
                    <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} mt-2 p-2 border ${isDark ? 'border-[#1a1a2e]' : 'border-gray-200'} rounded-lg`}>
                        💡 Чем меньше разница между Lead Time и Cycle Time, тем меньше времени задачи ждут в очереди.
                    </div>
                </div>
            </div>
        </div>
    );
}
