import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

export default function YandexTrackerSettings({ onImportSuccess }) {
    const { isDark } = useTheme();
    const [orgId, setOrgId] = useState('');
    const [token, setToken] = useState('');
    const [queue, setQueue] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);

    const testConnection = async () => {
        if (!orgId || !token || !queue) {
            setStatus({ type: 'error', message: 'Заполните все поля' });
            return;
        }

        setLoading(true);
        setStatus(null);

        try {
            const response = await fetch('/api/yandex-tracker/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ org_id: orgId, token, queue }),
            });

            const result = await response.json();

            if (response.ok) {
                setStatus({ type: 'success', message: result.message });
            } else {
                setStatus({ type: 'error', message: result.message });
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'Ошибка соединения: ' + error.message });
        } finally {
            setLoading(false);
        }
    };

    const fetchSprints = async () => {
        if (!orgId || !token || !queue) {
            setStatus({ type: 'error', message: 'Заполните все поля' });
            return;
        }

        setLoading(true);
        setStatus(null);

        try {
            const response = await fetch('/api/yandex-tracker/fetch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ org_id: orgId, token, queue }),
            });

            const result = await response.json();

            if (response.ok) {
                setStatus({ type: 'success', message: result.message });
                if (onImportSuccess) {
                    setTimeout(onImportSuccess, 1000);
                }
            } else {
                setStatus({ type: 'error', message: result.message });
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'Ошибка соединения: ' + error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`rounded-xl border p-6 transition-all duration-300 ${
            isDark 
                ? 'bg-[#11111f] border-[#1a1a2e]' 
                : 'bg-white border-gray-200 shadow-sm'
        }`}>
            <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🔗</span>
                <div>
                    <h3 className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Яндекс.Трекер
                    </h3>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        Подключите очередь для автоматического импорта
                    </p>
                </div>
            </div>

            <div className="space-y-3">
                <div>
                    <label className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                        ID организации (X-Org-Id)
                    </label>
                    <input
                        type="text"
                        value={orgId}
                        onChange={(e) => setOrgId(e.target.value)}
                        placeholder="Например: 123456"
                        className={`w-full px-3 py-2 text-sm rounded-lg outline-none focus:ring-2 focus:ring-[#7c3aed] ${
                            isDark 
                                ? 'bg-[#1a1a2e] text-gray-300 border border-[#2a2a4a]' 
                                : 'bg-gray-100 text-gray-700 border border-gray-200'
                        }`}
                    />
                </div>

                <div>
                    <label className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                        OAuth-токен
                    </label>
                    <input
                        type="password"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        placeholder="Ваш OAuth-токен"
                        className={`w-full px-3 py-2 text-sm rounded-lg outline-none focus:ring-2 focus:ring-[#7c3aed] ${
                            isDark 
                                ? 'bg-[#1a1a2e] text-gray-300 border border-[#2a2a4a]' 
                                : 'bg-gray-100 text-gray-700 border border-gray-200'
                        }`}
                    />
                </div>

                <div>
                    <label className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                        Очередь (Queue Key)
                    </label>
                    <input
                        type="text"
                        value={queue}
                        onChange={(e) => setQueue(e.target.value)}
                        placeholder="Например: PM"
                        className={`w-full px-3 py-2 text-sm rounded-lg outline-none focus:ring-2 focus:ring-[#7c3aed] ${
                            isDark 
                                ? 'bg-[#1a1a2e] text-gray-300 border border-[#2a2a4a]' 
                                : 'bg-gray-100 text-gray-700 border border-gray-200'
                        }`}
                    />
                </div>

                {status && (
                    <div className={`p-3 rounded-lg text-sm ${
                        status.type === 'success' 
                            ? 'bg-green-500/10 border border-green-500/20 text-green-500' 
                            : 'bg-red-500/10 border border-red-500/20 text-red-500'
                    }`}>
                        {status.message}
                    </div>
                )}

                <div className="flex gap-2">
                    <button
                        onClick={testConnection}
                        disabled={loading}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                            loading ? 'opacity-50 cursor-not-allowed' : ''
                        } ${
                            isDark
                                ? 'bg-[#1a1a2e] text-gray-300 hover:bg-[#2a2a4a] border border-[#2a2a4a]'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                        }`}
                    >
                        {loading ? '⏳' : '🔌'} Проверить
                    </button>
                    <button
                        onClick={fetchSprints}
                        disabled={loading}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                            loading ? 'opacity-50 cursor-not-allowed' : ''
                        } ${
                            isDark
                                ? 'bg-[#7c3aed] text-white hover:bg-[#6d28d9] shadow-lg shadow-purple-500/20'
                                : 'bg-[#7c3aed] text-white hover:bg-[#6d28d9] shadow-lg shadow-purple-500/20'
                        }`}
                    >
                        {loading ? '⏳' : '📥'} Импортировать
                    </button>
                </div>
            </div>
        </div>
    );
}
