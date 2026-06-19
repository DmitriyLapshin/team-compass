import React, { useEffect, useState, useRef } from 'react';
import { 
    BarChart, Bar, LineChart, Line, XAxis, YAxis, 
    CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    ComposedChart, Area
} from 'recharts';
import ThemeToggle from './components/ThemeToggle';
import Filters from './components/Filters';
import ExportButton from './components/ExportButton';
import DataImporter from './components/DataImporter';
import DetailModal from './components/DetailModal';
import MonteCarlo from './components/MonteCarlo';
import BurnDownChart from './components/BurnDownChart';
import LeadCycleTime from './components/LeadCycleTime';
import PeriodComparison from './components/PeriodComparison';
import Anomalies from './components/Anomalies';
import ReleaseTimeline from './components/ReleaseTimeline';
import MonthOverMonth from './components/MonthOverMonth';
import SettingsModal from './components/SettingsModal';
import AnimatedCounter from './components/AnimatedCounter';
import InfoTooltip from './components/InfoTooltip';
import ZoomControls from './components/ZoomControls';
import FullscreenButton from './components/FullscreenButton';
import { useTheme } from './context/ThemeContext';

export default function Dashboard() {
    const { isDark } = useTheme();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ period: '6', project: 'all' });
    const [showImporter, setShowImporter] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showDevTools, setShowDevTools] = useState(false);
    const [modalData, setModalData] = useState(null);
    const dashboardRef = useRef(null);

    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

    const loadData = async (currentFilters) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/metrics?period=${currentFilters.period}&project=${currentFilters.project}`);
            const json = await response.json();
            setData(json);
        } catch (error) {
            console.error('Ошибка загрузки:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData(filters);
    }, [filters]);

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
    };

    const handleImportSuccess = () => {
        setShowImporter(false);
        loadData(filters);
    };

    const handleChartClick = (type, item) => {
        if (!item) return;
        
        let details = [];
        let title = '';

        switch (type) {
            case 'sprint':
                title = `Детали спринта: ${item.name}`;
                details = [
                    {
                        name: item.name,
                        subtitle: `Story Points: ${item.points} | Задач: ${item.tasks}`,
                        status: 'Completed',
                        ...item,
                    }
                ];
                break;
            case 'release':
                title = `Детали релиза: ${item.version}`;
                details = [
                    {
                        name: item.version,
                        subtitle: `Дата: ${item.date} | Багов: ${item.bugs}`,
                        status: item.bugs === 0 ? '✅ Stable' : '⚠️ Has bugs',
                        ...item,
                    }
                ];
                break;
            default:
                return;
        }

        setModalData({
            title,
            data: details,
            type,
        });
    };

    const handleCloseModal = () => {
        setModalData(null);
    };

    const handleLogout = async () => {
        try {
            const response = await fetch('/logout', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                    'Content-Type': 'application/json',
                },
            });
            if (response.redirected) {
                window.location.href = response.url;
            }
        } catch (error) {
            console.error('Ошибка выхода:', error);
        }
    };

    if (loading) {
        return (
            <div className={`flex items-center justify-center h-screen ${isDark ? 'bg-[#0a0a0f]' : 'bg-gray-50'}`}>
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-[#7c3aed] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Загрузка данных...</p>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className={`flex items-center justify-center h-screen ${isDark ? 'bg-[#0a0a0f]' : 'bg-gray-50'}`}>
                <div className="text-center">
                    <p className="text-red-400 text-lg">Ошибка загрузки данных</p>
                </div>
            </div>
        );
    }

    const metrics = [
        {
            title: 'Скорость команды',
            value: data.current_velocity,
            suffix: ' sp',
            subtitle: 'средняя за 5 спринтов',
            icon: '📈',
            color: '#7c3aed',
            trend: data.trend,
        },
        {
            title: 'Прогноз бэклога',
            value: data.forecast_weeks,
            suffix: ' нед.',
            subtitle: `${data.forecast_sprints} спринтов`,
            icon: '🎯',
            color: '#10b981',
            trend: null,
        },
        {
            title: 'Cycle Time',
            value: data.avg_cycle_time,
            suffix: ' дн.',
            subtitle: 'среднее время выполнения',
            icon: '⏱️',
            color: '#f59e0b',
            trend: null,
        },
        {
            title: 'Инциденты',
            value: data.incidents_last_month,
            subtitle: `MTTR: ${data.mttr_hours} ч.`,
            icon: '🚨',
            color: '#ef4444',
            trend: null,
        },
        {
            title: 'Стабильность',
            value: data.stability_rate,
            suffix: '%',
            subtitle: 'релизов без багов',
            icon: '🛡️',
            color: '#06b6d4',
            trend: null,
        },
    ];

    return (
        <div 
            ref={dashboardRef}
            className={`min-h-screen p-6 transition-colors duration-300 ${isDark ? 'bg-[#0a0a0f]' : 'bg-gray-50'}`}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#7c3aed] to-[#4f46e5] rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Team Compass
                        </h1>
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                            Delivery Analytics Dashboard
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowDevTools(!showDevTools)}
                        className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                            isDark
                                ? 'bg-[#1a1a2e] text-gray-400 hover:text-white hover:bg-[#2a2a4a] border border-[#2a2a4a]'
                                : 'bg-gray-100 text-gray-500 hover:text-gray-700 hover:bg-gray-200 border border-gray-200'
                        } ${showDevTools ? 'ring-2 ring-[#7c3aed]' : ''}`}
                    >
                        🛠️ Dev
                    </button>
                    <button
                        onClick={() => setShowImporter(true)}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                            isDark
                                ? 'bg-[#1a1a2e] text-gray-300 hover:bg-[#2a2a4a] border border-[#2a2a4a]'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm'
                        }`}
                    >
                        📥 Импорт
                    </button>
                    <button
                        onClick={() => setShowSettings(true)}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                            isDark
                                ? 'bg-[#1a1a2e] text-gray-300 hover:bg-[#2a2a4a] border border-[#2a2a4a] hover:border-[#3a3a5a]'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm hover:border-gray-300'
                        }`}
                        title="Настройки интеграций"
                    >
                        ⚙️ Настройки
                    </button>
                    <ExportButton targetRef={dashboardRef} title="Team_Compass_Report" />
                    <FullscreenButton />
                    <ZoomControls targetRef={dashboardRef} />
                    <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'} ${isDark ? 'bg-[#1a1a2e]' : 'bg-gray-200'} px-3 py-1 rounded-full border ${isDark ? 'border-[#2a2a4a]' : 'border-gray-300'}`}>
                        {new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    {/*<button
                        onClick={handleLogout}
                        className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                            isDark
                                ? 'bg-[#1a1a2e] text-gray-400 hover:text-white hover:bg-[#2a2a4a] border border-[#2a2a4a]'
                                : 'bg-gray-100 text-gray-500 hover:text-gray-700 hover:bg-gray-200 border border-gray-200'
                        }`}
                    >
                        🚪 Выйти
                    </button> */}
                    <ThemeToggle />
                </div>
            </div>

            {/* Dev Tools Panel */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                showDevTools ? 'max-h-96 opacity-100 mb-6' : 'max-h-0 opacity-0'
            }`}>
                <div className={`p-4 rounded-xl border ${
                    isDark 
                        ? 'bg-[#11111f] border-[#1a1a2e]' 
                        : 'bg-white border-gray-200 shadow-sm'
                }`}>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            🛠️ Developer Tools
                        </h3>
                        <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            API эндпоинты для разработчиков
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <a
                            href="/api/documentation"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                                isDark
                                    ? 'bg-[#1a1a2e] text-gray-300 hover:bg-[#2a2a4a] border border-[#2a2a4a]'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                            }`}
                        >
                            📚 Swagger / OpenAPI
                        </a>
                        <a
                            href="/api/health"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                                isDark
                                    ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20 border border-green-500/20'
                                    : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                            }`}
                        >
                            💚 Health Check
                        </a>
                        <a
                            href="/api/health/readiness"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                                isDark
                                    ? 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border border-blue-500/20'
                                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                            }`}
                        >
                            🔄 Readiness
                        </a>
                        <a
                            href="/api/health/liveness"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                                isDark
                                    ? 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border border-yellow-500/20'
                                    : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200'
                            }`}
                        >
                            ⚡ Liveness
                        </a>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="mb-6">
                <Filters 
                    onFilterChange={handleFilterChange} 
                    initialPeriod={filters.period}
                    initialProject={filters.project}
                />
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                {metrics.map((metric, index) => (
                    <div 
                        key={index}
                        className={`rounded-xl border p-5 transition-all duration-300 hover:scale-[1.02] ${
                            isDark 
                                ? 'bg-[#11111f] border-[#1a1a2e] hover:border-[#2a2a4a]' 
                                : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
                        }`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-2xl">{metric.icon}</span>
                            {metric.trend ? (
                                <span className={`text-xs flex items-center gap-1 ${
                                    metric.trend.direction === 'up' 
                                        ? 'text-green-500' 
                                        : metric.trend.direction === 'down'
                                        ? 'text-red-500'
                                        : 'text-gray-400'
                                }`}>
                                    {metric.trend.direction === 'up' ? '↑' : metric.trend.direction === 'down' ? '↓' : '—'}
                                    {metric.trend.direction !== 'neutral' ? `${metric.trend.percent}%` : ''}
                                </span>
                            ) : (
                                <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>—</span>
                            )}
                        </div>
                        <p className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            <AnimatedCounter 
                                value={metric.value} 
                                duration={1200}
                                suffix={metric.suffix || ''}
                            />
                        </p>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>{metric.title}</p>
                        {metric.subtitle && (
                            <p className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'} mt-2`}>{metric.subtitle}</p>
                        )}
                        <div className={`mt-3 h-1 w-full rounded-full overflow-hidden ${isDark ? 'bg-[#1a1a2e]' : 'bg-gray-200'}`}>
                            <div 
                                className="h-full rounded-full transition-all duration-1000 ease-out" 
                                style={{ 
                                    width: '65%',
                                    backgroundColor: metric.color,
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sprint Velocity Chart */}
                <div className={`rounded-xl border p-5 transition-all duration-300 ${
                    isDark 
                        ? 'bg-[#11111f] border-[#1a1a2e] hover:border-[#2a2a4a]' 
                        : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
                }`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <h3 className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                📊 Скорость по спринтам
                            </h3>
                            <InfoTooltip content="График показывает, сколько Story Points и задач было завершено в каждом спринте. Кликни на бар для деталей.">
                                <span className="text-xs cursor-help text-gray-400 hover:text-gray-300">ⓘ</span>
                            </InfoTooltip>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <ComposedChart data={data.sprint_chart}>
                            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1a1a2e' : '#e5e7eb'} />
                            <XAxis dataKey="name" stroke={isDark ? '#6b6b8b' : '#9ca3af'} fontSize={11} />
                            <YAxis stroke={isDark ? '#6b6b8b' : '#9ca3af'} fontSize={11} />
                            <Tooltip 
                                contentStyle={{ 
                                    background: isDark ? '#1a1a2e' : '#ffffff', 
                                    border: `1px solid ${isDark ? '#2a2a4a' : '#e5e7eb'}`,
                                    borderRadius: '8px',
                                    color: isDark ? '#e0e0e0' : '#1f2937'
                                }}
                            />
                            <Legend wrapperStyle={{ color: isDark ? '#a0a0c0' : '#6b7280' }} />
                            <Bar 
                                dataKey="points" 
                                fill="#7c3aed" 
                                radius={[4, 4, 0, 0]} 
                                name="Story Points"
                                cursor="pointer"
                                onClick={(e) => handleChartClick('sprint', e.payload)}
                            />
                            <Bar 
                                dataKey="tasks" 
                                fill="#4f46e5" 
                                radius={[4, 4, 0, 0]} 
                                name="Задач закрыто"
                                cursor="pointer"
                                onClick={(e) => handleChartClick('sprint', e.payload)}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>

                {/* Releases Chart */}
                <div className={`rounded-xl border p-5 transition-all duration-300 ${
                    isDark 
                        ? 'bg-[#11111f] border-[#1a1a2e] hover:border-[#2a2a4a]' 
                        : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
                }`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <h3 className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                🐞 Релизы и пост-релизные баги
                            </h3>
                            <InfoTooltip content="График показывает количество багов, найденных после каждого релиза. Кликни на точку для деталей релиза.">
                                <span className="text-xs cursor-help text-gray-400 hover:text-gray-300">ⓘ</span>
                            </InfoTooltip>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <ComposedChart data={data.release_chart}>
                            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1a1a2e' : '#e5e7eb'} />
                            <XAxis dataKey="date" stroke={isDark ? '#6b6b8b' : '#9ca3af'} fontSize={11} />
                            <YAxis stroke={isDark ? '#6b6b8b' : '#9ca3af'} fontSize={11} />
                            <Tooltip 
                                contentStyle={{ 
                                    background: isDark ? '#1a1a2e' : '#ffffff', 
                                    border: `1px solid ${isDark ? '#2a2a4a' : '#e5e7eb'}`,
                                    borderRadius: '8px',
                                    color: isDark ? '#e0e0e0' : '#1f2937'
                                }}
                            />
                            <Legend wrapperStyle={{ color: isDark ? '#a0a0c0' : '#6b7280' }} />
                            <Area 
                                type="monotone" 
                                dataKey="bugs" 
                                fill="#ef4444" 
                                stroke="#ef4444" 
                                fillOpacity={0.2} 
                                name="Баги"
                                cursor="pointer"
                                onClick={(e) => handleChartClick('release', e.payload)}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="bugs" 
                                stroke="#ef4444" 
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                activeDot={{ r: 8 }}
                                cursor="pointer"
                                onClick={(e) => handleChartClick('release', e.payload)}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>

                {/* Release Frequency Chart */}
                <div className={`rounded-xl border p-5 transition-all duration-300 ${
                    isDark 
                        ? 'bg-[#11111f] border-[#1a1a2e] hover:border-[#2a2a4a]' 
                        : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
                }`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <h3 className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                📦 Частота релизов
                            </h3>
                            <InfoTooltip content="График показывает размер каждого релиза в задачах. Чем выше бар, тем больше задач было в релизе.">
                                <span className="text-xs cursor-help text-gray-400 hover:text-gray-300">ⓘ</span>
                            </InfoTooltip>
                        </div>
                        <span className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                            {data.release_chart?.length || 0} релизов
                        </span>
                    </div>
                    {data.release_chart && data.release_chart.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={data.release_chart} margin={{ top: 10, right: 10, left: 0, bottom: 30 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1a1a2e' : '#e5e7eb'} />
                                <XAxis 
                                    dataKey="date" 
                                    stroke={isDark ? '#6b6b8b' : '#9ca3af'} 
                                    fontSize={10}
                                    interval={Math.floor(data.release_chart.length / 6)}
                                    angle={-45}
                                    textAnchor="end"
                                    height={45}
                                    tick={{ fontSize: 8 }}
                                />
                                <YAxis 
                                    stroke={isDark ? '#6b6b8b' : '#9ca3af'} 
                                    fontSize={11}
                                    allowDecimals={false}
                                />
                                <Tooltip 
                                    contentStyle={{ 
                                        background: isDark ? '#1a1a2e' : '#ffffff', 
                                        border: `1px solid ${isDark ? '#2a2a4a' : '#e5e7eb'}`,
                                        borderRadius: '8px',
                                        color: isDark ? '#e0e0e0' : '#1f2937'
                                    }}
                                    formatter={(value, name, props) => {
                                        if (name === 'tasks_count') {
                                            return [`${value} задач`, 'Размер релиза'];
                                        }
                                        return [value, name];
                                    }}
                                    labelFormatter={(label) => `Дата: ${label}`}
                                />
                                <Bar 
                                    dataKey="tasks_count" 
                                    fill="#06b6d4" 
                                    radius={[4, 4, 0, 0]} 
                                    name="Размер релиза"
                                    cursor="pointer"
                                    onClick={(e) => handleChartClick('release', e.payload)}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[280px] text-gray-400 text-sm">
                            Нет данных о релизах
                        </div>
                    )}
                </div>

                {/* Health Score */}
                <div className={`rounded-xl border p-5 transition-all duration-300 ${
                    isDark 
                        ? 'bg-[#11111f] border-[#1a1a2e] hover:border-[#2a2a4a]' 
                        : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
                }`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <h3 className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                💚 Общее здоровье продукта
                            </h3>
                            <InfoTooltip content="Индекс здоровья рассчитывается на основе стабильности релизов и скорости команды. Чем выше процент, тем здоровее продукт.">
                                <span className="text-xs cursor-help text-gray-400 hover:text-gray-300">ⓘ</span>
                            </InfoTooltip>
                        </div>
                        <span className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                            {filters.period === 'all' ? 'За всё время' : `За ${filters.period} мес.`}
                        </span>
                    </div>
                    <div className="flex items-center justify-center h-[280px]">
                        <div className="text-center">
                            <div className={`text-6xl font-bold text-[#7c3aed] mb-2 transition-all duration-1000`}>
                                <AnimatedCounter 
                                    value={(data.stability_rate * 0.7 + (data.current_velocity / 40) * 30).toFixed(0)}
                                    duration={1500}
                                    suffix="%"
                                />
                            </div>
                            <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Индекс здоровья</p>
                            <div className={`mt-4 flex gap-4 justify-center text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                <span>⬆ Скорость: {data.current_velocity} sp</span>
                                <span>⬇ Инциденты: {data.incidents_last_month}</span>
                            </div>
                            <div className="mt-4 w-48 h-2 mx-auto bg-gray-200 dark:bg-[#1a1a2e] rounded-full overflow-hidden">
                                <div 
                                    className="h-full rounded-full bg-gradient-to-r from-[#7c3aed] to-[#4f46e5]"
                                    style={{ 
                                        width: `${(data.stability_rate * 0.7 + (data.current_velocity / 40) * 30).toFixed(0)}%`,
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Burn Down Chart */}
            <div className="mt-6 col-span-1 lg:col-span-2">
                <BurnDownChart />
            </div>

            {/* Lead / Cycle Time */}
            <div className="mt-6 col-span-1 lg:col-span-2">
                <LeadCycleTime />
            </div>

            {/* Сравнение периодов */}
            <div className="mt-6 col-span-1 lg:col-span-2">
                <PeriodComparison />
            </div>

            {/* Аномалии */}
            <div className="mt-6 col-span-1 lg:col-span-2">
                <Anomalies />
            </div>

            {/* Календарь релизов */}
            <div className="mt-6 col-span-1 lg:col-span-2">
                <ReleaseTimeline />
            </div>

            {/* MoM */}
            <div className="mt-6 col-span-1 lg:col-span-2">
                <MonthOverMonth />
            </div>

            {/* Monte Carlo Simulation */}
            <div className="mt-6 col-span-1 lg:col-span-2">
                <MonteCarlo />
            </div>

            {/* Modal для импорта */}
            {showImporter && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
                    <div className={`w-full max-w-2xl rounded-xl shadow-2xl ${
                        isDark ? 'bg-[#0a0a0f]' : 'bg-gray-50'
                    }`}>
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    📥 Импорт данных
                                </h2>
                                <button
                                    onClick={() => setShowImporter(false)}
                                    className={`p-1 rounded-lg transition-all duration-200 ${
                                        isDark 
                                            ? 'hover:bg-[#1a1a2e] text-gray-400 hover:text-white' 
                                            : 'hover:bg-gray-200 text-gray-500 hover:text-gray-900'
                                    }`}
                                >
                                    ✕
                                </button>
                            </div>
                            <DataImporter onImportSuccess={handleImportSuccess} />
                        </div>
                    </div>
                </div>
            )}

            {/* Modal для настроек */}
            <SettingsModal 
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
                onImportSuccess={() => loadData(filters)}
            />

            {/* Modal для деталей */}
            {modalData && (
                <DetailModal
                    isOpen={!!modalData}
                    onClose={handleCloseModal}
                    title={modalData.title}
                    data={modalData.data}
                    type={modalData.type}
                />
            )}

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}