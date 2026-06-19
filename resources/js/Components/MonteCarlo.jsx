import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';

export default function MonteCarlo() {
    const { isDark } = useTheme();
    const { showToast } = useToast();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [backlogPoints, setBacklogPoints] = useState(100);
    const [simulations, setSimulations] = useState(10000);
    const [error, setError] = useState(null);
    const [isExporting, setIsExporting] = useState(false);
    const chartRef = useRef(null);

    const runSimulation = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `/api/monte-carlo?backlog_points=${backlogPoints}&simulations=${simulations}`
            );
            const result = await response.json();
            if (response.ok) {
                setData(result);
                showToast(`Симуляция завершена (${simulations.toLocaleString()} вариантов)`, 'success');
            } else {
                setError(result.message || 'Ошибка симуляции');
                showToast(`${result.message || 'Ошибка симуляции'}`, 'error');
            }
        } catch (err) {
            setError('Ошибка соединения: ' + err.message);
            showToast(`Ошибка соединения: ${err.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        runSimulation();
    }, []);

    const exportToPDF = async () => {
        if (!chartRef.current) return;
        
        setIsExporting(true);
        try {
            const canvas = await html2canvas(chartRef.current, {
                scale: 2,
                backgroundColor: isDark ? '#0a0a0f' : '#f3f4f6',
                useCORS: true,
                logging: false,
            });
            
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });
            
            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            pdf.save(`monte_carlo_forecast_${new Date().toISOString().slice(0, 10)}.pdf`);
            showToast('Прогноз успешно экспортирован в PDF', 'success');
        } catch (error) {
            console.error('Ошибка экспорта PDF:', error);
            showToast('Ошибка экспорта PDF', 'error');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div ref={chartRef} className={`rounded-xl border p-6 transition-all duration-300 ${
            isDark 
                ? 'bg-[#11111f] border-[#1a1a2e]' 
                : 'bg-white border-gray-200 shadow-sm'
        }`}>
            <div className="flex items-center justify-between">
                <h3 className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    🎲 Monte Carlo симуляция
                </h3>
                {data && !loading && (
                    <button
                        onClick={exportToPDF}
                        disabled={isExporting}
                        className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                            isDark
                                ? 'bg-[#1a1a2e] text-gray-300 hover:bg-[#2a2a4a] border border-[#2a2a4a]'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                        } ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isExporting ? '⏳' : '📄'} 
                        {isExporting ? 'Экспорт...' : 'PDF'}
                    </button>
                )}
            </div>
            
            <div className="flex flex-wrap items-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                    <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Бэклог (SP):
                    </label>
                    <input
                        type="number"
                        value={backlogPoints}
                        onChange={(e) => setBacklogPoints(Number(e.target.value))}
                        className={`w-20 px-2 py-1 text-xs rounded-lg outline-none focus:ring-2 focus:ring-[#7c3aed] ${
                            isDark 
                                ? 'bg-[#1a1a2e] text-gray-300 border border-[#2a2a4a]' 
                                : 'bg-gray-100 text-gray-700 border border-gray-200'
                        }`}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Симуляций:
                    </label>
                    <select
                        value={simulations}
                        onChange={(e) => setSimulations(Number(e.target.value))}
                        className={`px-2 py-1 text-xs rounded-lg outline-none focus:ring-2 focus:ring-[#7c3aed] ${
                            isDark 
                                ? 'bg-[#1a1a2e] text-gray-300 border border-[#2a2a4a]' 
                                : 'bg-gray-100 text-gray-700 border border-gray-200'
                        }`}
                    >
                        <option value={1000}>1 000</option>
                        <option value={5000}>5 000</option>
                        <option value={10000}>10 000</option>
                        <option value={50000}>50 000</option>
                    </select>
                </div>

                <button
                    onClick={runSimulation}
                    disabled={loading}
                    className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                        loading ? 'opacity-50 cursor-not-allowed' : ''
                    } ${
                        isDark
                            ? 'bg-[#7c3aed] text-white hover:bg-[#6d28d9] shadow-lg shadow-purple-500/20'
                            : 'bg-[#7c3aed] text-white hover:bg-[#6d28d9] shadow-lg shadow-purple-500/20'
                    }`}
                >
                    {loading ? '⏳ Считаю...' : '🚀 Запустить'}
                </button>
            </div>

            {loading && (
                <div className="flex items-center justify-center h-48 mt-4">
                    <div className="text-center">
                        <div className="w-8 h-8 border-4 border-[#7c3aed] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            Симулирую {simulations.toLocaleString()} вариантов...
                        </p>
                    </div>
                </div>
            )}

            {error && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-sm text-red-500">{error}</p>
                </div>
            )}

            {data && !loading && (
                <div className="mt-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                        <div className={`p-2 rounded-lg ${isDark ? 'bg-[#1a1a2e]' : 'bg-gray-100'}`}>
                            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Средняя скорость</p>
                            <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {data.avg_velocity} SP
                            </p>
                        </div>
                        <div className={`p-2 rounded-lg ${isDark ? 'bg-[#1a1a2e]' : 'bg-gray-100'}`}>
                            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Оптимистичный (50%)</p>
                            <p className={`text-lg font-bold text-green-500`}>
                                {data.confidence_intervals[50]} спринтов
                            </p>
                        </div>
                        <div className={`p-2 rounded-lg ${isDark ? 'bg-[#1a1a2e]' : 'bg-gray-100'}`}>
                            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Реалистичный (70%)</p>
                            <p className={`text-lg font-bold text-yellow-500`}>
                                {data.confidence_intervals[70]} спринтов
                            </p>
                        </div>
                        <div className={`p-2 rounded-lg ${isDark ? 'bg-[#1a1a2e]' : 'bg-gray-100'}`}>
                            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Консервативный (85%)</p>
                            <p className={`text-lg font-bold text-orange-500`}>
                                {data.confidence_intervals[85]} спринтов
                            </p>
                        </div>
                    </div>

                    {data.distribution && data.distribution.length > 0 && (
                        <div className="mt-4">
                            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-2`}>
                                Распределение вероятностей
                            </p>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={data.distribution}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1a1a2e' : '#e5e7eb'} />
                                    <XAxis dataKey="sprints" stroke={isDark ? '#6b6b8b' : '#9ca3af'} fontSize={11} />
                                    <YAxis stroke={isDark ? '#6b6b8b' : '#9ca3af'} fontSize={11} />
                                    <Tooltip
                                        contentStyle={{
                                            background: isDark ? '#1a1a2e' : '#ffffff',
                                            border: `1px solid ${isDark ? '#2a2a4a' : '#e5e7eb'}`,
                                            borderRadius: '8px',
                                            color: isDark ? '#e0e0e0' : '#1f2937'
                                        }}
                                        formatter={(value, name) => {
                                            if (name === 'percentage') return [`${value}%`, 'Вероятность'];
                                            if (name === 'count') return [value, 'Симуляций'];
                                            return [value, name];
                                        }}
                                    />
                                    <Bar dataKey="percentage" fill="#7c3aed" name="Вероятность %">
                                        {data.distribution.map((entry, index) => {
                                            const isBest = entry.sprints === data.confidence_intervals[50];
                                            const isWorst = entry.sprints === data.confidence_intervals[85];
                                            let color = '#7c3aed';
                                            if (isBest) color = '#10b981';
                                            if (isWorst) color = '#f59e0b';
                                            return <Cell key={index} fill={color} />;
                                        })}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
