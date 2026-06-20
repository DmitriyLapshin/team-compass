import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

export default function Filters({ onFilterChange, initialPeriod = '6', initialProject = 'all' }) {
    const { isDark } = useTheme();
    const [period, setPeriod] = useState(initialPeriod);
    const [project, setProject] = useState(initialProject);
    const [projects, setProjects] = useState([]);
    const [loadingProjects, setLoadingProjects] = useState(true);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const response = await fetch('/api/projects');
            const data = await response.json();
            setProjects(data.projects || []);
        } catch (error) {
            console.error('Ошибка загрузки проектов:', error);
        } finally {
            setLoadingProjects(false);
        }
    };

    useEffect(() => {
        setPeriod(initialPeriod);
        setProject(initialProject);
    }, [initialPeriod, initialProject]);

    const periods = [
        { value: '3', label: '3 месяца' },
        { value: '6', label: '6 месяцев' },
        { value: '12', label: '12 месяцев' },
        { value: 'all', label: 'Всё время' },
    ];

    // Строим список проектов с опцией "Все"
    const projectOptions = [
        { value: 'all', label: 'Все проекты' },
        ...projects.map(p => ({ value: p.key, label: p.name })),
    ];

    const handlePeriodChange = (value) => {
        setPeriod(value);
        onFilterChange({ period: value, project });
    };

    const handleProjectChange = (e) => {
        const value = e.target.value;
        setProject(value);
        onFilterChange({ period, project: value });
    };

    const handleReset = () => {
        setPeriod('6');
        setProject('all');
        onFilterChange({ period: '6', project: 'all' });
    };

    return (
        <div className={`flex flex-wrap items-center gap-3 p-4 rounded-xl border ${
            isDark 
                ? 'bg-[#11111f] border-[#1a1a2e]' 
                : 'bg-white border-gray-200 shadow-sm'
        }`}>
            <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                📊 Фильтры
            </span>
            
            <div className="flex-1"></div>

            {/* Период */}
            <div className="flex items-center gap-2">
                <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Период:</span>
                <div className={`flex gap-1 rounded-lg p-1 ${isDark ? 'bg-[#1a1a2e]' : 'bg-gray-100'}`}>
                    {periods.map(p => (
                        <button
                            key={p.value}
                            onClick={() => handlePeriodChange(p.value)}
                            className={`px-3 py-1 text-xs rounded-md transition-all duration-200 ${
                                period === p.value
                                    ? 'bg-[#7c3aed] text-white shadow-lg shadow-purple-500/20'
                                    : isDark 
                                        ? 'text-gray-400 hover:text-white hover:bg-[#2a2a4a]' 
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                            }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Проекты */}
            <div className="flex items-center gap-2">
                <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Проект:</span>
                <select
                    value={project}
                    onChange={handleProjectChange}
                    className={`text-xs rounded-lg px-3 py-1.5 outline-none transition-all duration-200 focus:ring-2 focus:ring-[#7c3aed] ${
                        isDark 
                            ? 'bg-[#1a1a2e] text-gray-300 border border-[#2a2a4a] hover:border-[#3a3a5a]' 
                            : 'bg-gray-100 text-gray-700 border border-gray-200 hover:border-gray-300'
                    }`}
                    disabled={loadingProjects}
                >
                    {loadingProjects ? (
                        <option>Загрузка...</option>
                    ) : (
                        projectOptions.map(p => (
                            <option key={p.value} value={p.value}>
                                {p.label}
                            </option>
                        ))
                    )}
                </select>
            </div>

            {/* Индикатор активных фильтров */}
            {(period !== '6' || project !== 'all') && (
                <button
                    onClick={handleReset}
                    className={`text-xs px-2 py-1 rounded-lg transition-all duration-200 ${
                        isDark 
                            ? 'text-gray-400 hover:text-white hover:bg-[#2a2a4a]' 
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                    }`}
                >
                    ✕ Сбросить
                </button>
            )}
        </div>
    );
}
