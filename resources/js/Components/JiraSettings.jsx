import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';

export default function JiraSettings({ onImportSuccess }) {
    const { isDark } = useTheme();
    const { showToast } = useToast();
    const [domain, setDomain] = useState('');
    const [email, setEmail] = useState('');
    const [apiToken, setApiToken] = useState('');
    const [projectKey, setProjectKey] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);

    const testConnection = async () => {
        if (!domain || !email || !apiToken || !projectKey) {
            showToast('Заполните все поля', 'error');
            return;
        }

        setLoading(true);
        setStatus(null);

        try {
            const response = await fetch('/api/jira/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ domain, email, api_token: apiToken, project_key: projectKey }),
            });

            const result = await response.json();

            if (response.ok) {
                showToast('✅ ' + result.message, 'success');
                setStatus({ type: 'success', message: result.message });
            } else {
                showToast('❌ ' + result.message, 'error');
                setStatus({ type: 'error', message: result.message });
            }
        } catch (error) {
            showToast('❌ Ошибка соединения: ' + error.message, 'error');
            setStatus({ type: 'error', message: 'Ошибка соединения: ' + error.message });
        } finally {
            setLoading(false);
        }
    };

    const fetchSprints = async () => {
        if (!domain || !email || !apiToken || !projectKey) {
            showToast('Заполните все поля', 'error');
            return;
        }

        setLoading(true);
        setStatus(null);

        try {
            const response = await fetch('/api/jira/fetch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ domain, email, api_token: apiToken, project_key: projectKey }),
            });

            const result = await response.json();

            if (response.ok) {
                showToast('✅ ' + result.message, 'success');
                setStatus({ type: 'success', message: result.message });
                if (onImportSuccess) {
                    setTimeout(onImportSuccess, 1000);
                }
            } else {
                showToast('❌ ' + result.message, 'error');
                setStatus({ type: 'error', message: result.message });
            }
        } catch (error) {
            showToast('❌ Ошибка соединения: ' + error.message, 'error');
            setStatus({ type: 'error', message: 'Ошибка соединения: ' + error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🔷</span>
                <div>
                    <h4 className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Jira
                    </h4>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        Подключите проект Jira для автоматического импорта
                    </p>
                </div>
            </div>

            <div className="space-y-3">
                <div>
                    <label className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                        Домен Jira
                    </label>
                    <div className="flex items-center gap-1">
                        <input
                            type="text"
                            value={domain}
                            onChange={(e) => setDomain(e.target.value)}
                            placeholder="your-domain"
                            className={`flex-1 px-3 py-2 text-sm rounded-lg outline-none focus:ring-2 focus:ring-[#7c3aed] ${
                                isDark 
                                    ? 'bg-[#1a1a2e] text-gray-300 border border-[#2a2a4a]' 
                                    : 'bg-gray-100 text-gray-700 border border-gray-200'
                            }`}
                        />
                        <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            .atlassian.net
                        </span>
                    </div>
                </div>

                <div>
                    <label className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                        Email (логин)
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@example.com"
                        className={`w-full px-3 py-2 text-sm rounded-lg outline-none focus:ring-2 focus:ring-[#7c3aed] ${
                            isDark 
                                ? 'bg-[#1a1a2e] text-gray-300 border border-[#2a2a4a]' 
                                : 'bg-gray-100 text-gray-700 border border-gray-200'
                        }`}
                    />
                </div>

                <div>
                    <label className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                        API Token
                    </label>
                    <input
                        type="password"
                        value={apiToken}
                        onChange={(e) => setApiToken(e.target.value)}
                        placeholder="Ваш API токен из Jira"
                        className={`w-full px-3 py-2 text-sm rounded-lg outline-none focus:ring-2 focus:ring-[#7c3aed] ${
                            isDark 
                                ? 'bg-[#1a1a2e] text-gray-300 border border-[#2a2a4a]' 
                                : 'bg-gray-100 text-gray-700 border border-gray-200'
                        }`}
                    />
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
                        Получите токен в <span className="text-[#7c3aed]">https://id.atlassian.com/manage-profile/security/api-tokens</span>
                    </p>
                </div>

                <div>
                    <label className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                        Ключ проекта (Project Key)
                    </label>
                    <input
                        type="text"
                        value={projectKey}
                        onChange={(e) => setProjectKey(e.target.value.toUpperCase())}
                        placeholder="Например: PROJ"
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
