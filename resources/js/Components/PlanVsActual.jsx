import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis,
    CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    ComposedChart
} from 'recharts';
import InfoTooltip from './InfoTooltip';

export default function PlanVsActual({ projectId }) {
    const { isDark } = useTheme();
    const [plans, setPlans] = useState([]);
    const [actual, setActual] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (projectId && projectId !== 'all') {
            fetchData(projectId);
        }
    }, [projectId]);

    const fetchData = async (projectId) => {
        setLoading(true);
        setError(null);
        try {
            // Получаем планы
            const plansResponse = await fetch(`/api/project-plans?project_id=${projectId}`);
            const plansData = await plansResponse.json();
            
            // Получаем фактические данные (метрики)
            const actualResponse = await fetch(`/api/metrics?project=${projectId}`);
            const actualData = await actualResponse.json();
            
            setPlans(plansData.plans || []);
            setActual(actualData.sprint_chart || []);
        } catch (err) {
            setError('Ошибка загрузки данных: ' + err.message);
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
                            onClick={() => fetchData(projectId)}
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

    if (!plans.length || !actual.length) {
        return (
            <div className={`rounded-xl border p-6 transition-all duration-300 ${
                isDark 
                    ? 'bg-[#11111f] border-[#1a1a2e]' 
                    : 'bg-white border-gray-200 shadow-sm'
            }`}>
                <div className="flex items-center justify-center h-64">
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Нет данных для сравнения. Добавьте планы или импортируйте спринты.
                    </p>
                </div>
            </div>
        );
    }

    // Объединяем данные для графика
    const chartData = plans.map((plan) => {
        const month = plan.month;
        // Ищем фактические данные за этот месяц
        const monthActual = actual.filter((a) => {
            // Пытаемся сопоставить по названию спринта или дате
            return a.name && a.name.includes(month.slice(0, 7));
        });
        
        const avgVelocity = monthActual.length > 0 
            ? monthActual.reduce((sum, a) => sum + a.points, 0) / monthActual.length
            : 0;
        
        const avgTasks = monthActual.length > 0
            ? monthActual.reduce((sum, a) => sum + a.tasks, 0) / monthActual.length
            : 0;
        
        return {
            month: month,
            planned_velocity: plan.planned_velocity,
            actual_velocity: Math.round(avgVelocity),
            planned_tasks: plan.planned_tasks,
            actual_tasks: Math.round(avgTasks),
        };
    });

    return (
        <div className={`rounded-xl border p-6 transition-all duration-300 ${
            isDark 
                ? 'bg-[#11111f] border-[#1a1a2e]' 
                : 'bg-white border-gray-200 shadow-sm'
        }`}>
            <div className="flex items-center gap-2 mb-4">
                <h3 className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    📊 План vs Факт
                </h3>
                <InfoTooltip content="Сравнение плановых и фактических показателей по месяцам. Помогает оценить точность планирования.">
                    <span className="text-xs cursor-help text-gray-400 hover:text-gray-300">ⓘ</span>
                </InfoTooltip>
            </div>

            <ResponsiveContainer width="100%" height={280}>
                <ComposedChart data={chartData}>
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
                    />
                    <Legend wrapperStyle={{ color: isDark ? '#a0a0c0' : '#6b7280' }} />
                    <Bar dataKey="planned_velocity" fill="#4f46e5" name="План (SP)" />
                    <Bar dataKey="actual_velocity" fill="#7c3aed" name="Факт (SP)" />
                    <Line 
                        type="monotone" 
                        dataKey="planned_velocity" 
                        stroke="#4f46e5" 
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        name="План (тренд)"
                    />
                    <Line 
                        type="monotone" 
                        dataKey="actual_velocity" 
                        stroke="#7c3aed" 
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        name="Факт (тренд)"
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}
