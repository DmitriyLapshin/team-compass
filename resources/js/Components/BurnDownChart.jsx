import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import InfoTooltip from './InfoTooltip';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer,
    ReferenceLine
} from 'recharts';

export default function BurnDownChart() {
    const { isDark } = useTheme();
    const [data, setData] = useState(null);
    const [sprints, setSprints] = useState([]);
    const [selectedSprint, setSelectedSprint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingSprints, setLoadingSprints] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchSprints();
    }, []);

    useEffect(() => {
        if (selectedSprint) {
            fetchBurndown(selectedSprint);
        }
    }, [selectedSprint]);

    const fetchSprints = async () => {
        setLoadingSprints(true);
        try {
            const response = await fetch('/api/sprints-list');
            const result = await response.json();
            if (response.ok && result.sprints && result.sprints.length > 0) {
                setSprints(result.sprints);
                setSelectedSprint(result.sprints[0].id);
            } else {
                setError('Нет данных о спринтах');
            }
        } catch (err) {
            setError('Ошибка загрузки списка спринтов: ' + err.message);
        } finally {
            setLoadingSprints(false);
        }
    };

    const fetchBurndown = async (sprintId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/burndown?sprint_id=${sprintId}`);
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

    const handleSprintChange = (e) => {
        setSelectedSprint(Number(e.target.value));
    };

    if (loadingSprints) {
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
                            Загрузка спринтов...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (error && !data) {
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
                            onClick={() => fetchSprints()}
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
                        Нет данных для построения графика
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
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-2">
                    <h3 className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        📉 Burn Down Chart
                    </h3>
                    <InfoTooltip content="График сгорания задач в спринте. Показывает, сколько задач осталось выполнить. Идеальная линия — целевой темп, фактическая — реальное выполнение.">
                        <span className="text-xs cursor-help text-gray-400 hover:text-gray-300">ⓘ</span>
                    </InfoTooltip>
                </div>
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} mt-0.5`}>
                    {data.sprint} • {data.total_tasks} задач
                    {data.data && data.data.length > 0 && (
                        <span className="ml-2">
                            осталось: {data.data[data.data.length - 1]?.remaining || 0}
                        </span>
                    )}
                </p>

                <div className="flex items-center gap-2">
                    <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Спринт:
                    </label>
                    <select
                        value={selectedSprint || ''}
                        onChange={handleSprintChange}
                        className={`px-3 py-1.5 text-xs rounded-lg outline-none focus:ring-2 focus:ring-[#7c3aed] ${
                            isDark 
                                ? 'bg-[#1a1a2e] text-gray-300 border border-[#2a2a4a] hover:border-[#3a3a5a]' 
                                : 'bg-gray-100 text-gray-700 border border-gray-200 hover:border-gray-300'
                        }`}
                    >
                        {sprints.map((sprint) => (
                            <option key={sprint.id} value={sprint.id}>
                                {sprint.name} ({sprint.start_date} — {sprint.end_date})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="w-8 h-8 border-4 border-[#7c3aed] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            Загрузка данных...
                        </p>
                    </div>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={data.data}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1a1a2e' : '#e5e7eb'} />
                        <XAxis 
                            dataKey="day" 
                            stroke={isDark ? '#6b6b8b' : '#9ca3af'} 
                            fontSize={11}
                            label={{ value: 'День', position: 'insideBottom', offset: -5, fontSize: 10, fill: isDark ? '#6b6b8b' : '#9ca3af' }}
                        />
                        <YAxis 
                            stroke={isDark ? '#6b6b8b' : '#9ca3af'} 
                            fontSize={11}
                            label={{ value: 'Осталось задач', angle: -90, position: 'insideLeft', fontSize: 10, fill: isDark ? '#6b6b8b' : '#9ca3af' }}
                        />
                        <Tooltip
                            contentStyle={{
                                background: isDark ? '#1a1a2e' : '#ffffff',
                                border: `1px solid ${isDark ? '#2a2a4a' : '#e5e7eb'}`,
                                borderRadius: '8px',
                                color: isDark ? '#e0e0e0' : '#1f2937'
                            }}
                            formatter={(value, name) => {
                                if (name === 'remaining') return [`${Math.round(value)} задач`, 'Осталось'];
                                if (name === 'ideal') return [`${Math.round(value)} задач`, 'Идеальный'];
                                return [value, name];
                            }}
                            labelFormatter={(label) => `День ${label}`}
                        />
                        <Legend 
                            wrapperStyle={{ color: isDark ? '#a0a0c0' : '#6b7280' }}
                            formatter={(value) => {
                                if (value === 'remaining') return 'Фактический';
                                if (value === 'ideal') return 'Идеальный';
                                return value;
                            }}
                        />
                        <ReferenceLine 
                            x={data.data.length - 1} 
                            stroke={isDark ? '#4a4a6a' : '#d1d5db'} 
                            strokeDasharray="3 3"
                        />
                        <Line 
                            type="monotone" 
                            dataKey="remaining" 
                            stroke="#7c3aed" 
                            strokeWidth={2.5}
                            dot={{ r: 3, fill: '#7c3aed' }}
                            activeDot={{ r: 6 }}
                            name="remaining"
                        />
                        <Line 
                            type="monotone" 
                            dataKey="ideal" 
                            stroke={isDark ? '#4a4a6a' : '#9ca3af'} 
                            strokeWidth={1.5}
                            strokeDasharray="5 5"
                            dot={false}
                            name="ideal"
                        />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}
