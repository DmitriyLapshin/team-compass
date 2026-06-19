import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';

export default function DataImporter({ onImportSuccess }) {
    const { isDark } = useTheme();
    const { showToast } = useToast();
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [importType, setImportType] = useState('sprints');

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setUploadStatus(null);
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv'))) {
            setFile(droppedFile);
            setUploadStatus(null);
        } else {
            showToast('Пожалуйста, загрузите CSV файл', 'error');
        }
    };

    const handleUpload = async () => {
        if (!file) {
            showToast('Выберите файл для загрузки', 'error');
            return;
        }

        setIsUploading(true);
        setUploadStatus(null);

        const formData = new FormData();
        formData.append('file', file);

        const endpoint = importType === 'sprints' 
            ? '/api/import/sprints' 
            : '/api/import/releases';

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            const result = await response.json();

            if (response.ok) {
                showToast(`✅ Успешно импортировано ${result.imported || 0} записей`, 'success');
                setUploadStatus({ 
                    type: 'success', 
                    message: `✅ Успешно импортировано ${result.imported || 0} записей` 
                });
                setFile(null);
                document.getElementById('fileInput').value = '';
                
                if (onImportSuccess) {
                    setTimeout(() => {
                        onImportSuccess();
                    }, 500);
                }
            } else {
                showToast(`❌ Ошибка: ${result.message || 'Не удалось импортировать данные'}`, 'error');
                setUploadStatus({ 
                    type: 'error', 
                    message: `❌ Ошибка: ${result.message || 'Не удалось импортировать данные'}` 
                });
            }
        } catch (error) {
            showToast(`❌ Ошибка соединения: ${error.message}`, 'error');
            setUploadStatus({ 
                type: 'error', 
                message: `❌ Ошибка соединения: ${error.message}` 
            });
        } finally {
            setIsUploading(false);
        }
    };

    const downloadTemplate = () => {
        let headers = '';
        if (importType === 'sprints') {
            headers = [
                'sprint_name,start_date,end_date,story_points,tasks_completed',
                'Sprint 23,2026-06-01,2026-06-14,32,12',
                'Sprint 24,2026-06-15,2026-06-28,38,15'
            ].join('\n');
        } else {
            headers = [
                'version,released_at,tasks_count,post_release_bugs',
                'v1.0.0,2026-01-15,12,2',
                'v1.1.0,2026-02-01,8,0'
            ].join('\n');
        }
        
        const blob = new Blob([headers], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = importType === 'sprints' ? 'sprint_template.csv' : 'release_template.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className={`rounded-xl border p-6 transition-all duration-300 ${
            isDark 
                ? 'bg-[#11111f] border-[#1a1a2e]' 
                : 'bg-white border-gray-200 shadow-sm'
        }`}>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        📥 Импорт данных из CSV
                    </h3>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
                        Загрузите данные из Jira или Яндекс.Трекера
                    </p>
                </div>
                <button
                    onClick={downloadTemplate}
                    className={`text-xs px-3 py-1 rounded-lg transition-all duration-200 ${
                        isDark 
                            ? 'bg-[#1a1a2e] text-gray-400 hover:text-white hover:bg-[#2a2a4a]' 
                            : 'bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                    }`}
                >
                    📄 Скачать шаблон
                </button>
            </div>

            {/* Выбор типа импорта */}
            <div className="flex gap-2 mb-4">
                <button
                    onClick={() => { setImportType('sprints'); setUploadStatus(null); }}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        importType === 'sprints'
                            ? 'bg-[#7c3aed] text-white shadow-lg shadow-purple-500/20'
                            : isDark
                                ? 'bg-[#1a1a2e] text-gray-400 hover:text-white hover:bg-[#2a2a4a]'
                                : 'bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                    }`}
                >
                    📊 Спринты
                </button>
                <button
                    onClick={() => { setImportType('releases'); setUploadStatus(null); }}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        importType === 'releases'
                            ? 'bg-[#7c3aed] text-white shadow-lg shadow-purple-500/20'
                            : isDark
                                ? 'bg-[#1a1a2e] text-gray-400 hover:text-white hover:bg-[#2a2a4a]'
                                : 'bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                    }`}
                >
                    📦 Релизы
                </button>
            </div>

            <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                    dragActive
                        ? 'border-[#7c3aed] bg-purple-500/5'
                        : isDark 
                            ? 'border-[#2a2a4a] hover:border-[#3a3a5a]' 
                            : 'border-gray-300 hover:border-gray-400'
                }`}
            >
                <div className="flex flex-col items-center gap-3">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {file ? (
                                <span className="text-[#7c3aed] font-medium">{file.name}</span>
                            ) : (
                                'Перетащите CSV файл сюда или кликните для выбора'
                            )}
                        </p>
                        <p className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'} mt-1`}>
                            Поддерживаются файлы .csv с разделителем запятая
                        </p>
                    </div>
                    <input
                        id="fileInput"
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    <button
                        onClick={() => document.getElementById('fileInput').click()}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                            isDark
                                ? 'bg-[#1a1a2e] text-gray-300 hover:bg-[#2a2a4a] border border-[#2a2a4a]'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                        }`}
                    >
                        Выбрать файл
                    </button>
                </div>
            </div>

            {(file || uploadStatus) && (
                <div className="mt-4 flex items-center justify-between gap-4">
                    <div className="flex-1">
                        {uploadStatus && (
                            <p className={`text-sm ${
                                uploadStatus.type === 'success' 
                                    ? 'text-green-500' 
                                    : uploadStatus.type === 'error'
                                    ? 'text-red-500'
                                    : 'text-gray-400'
                            }`}>
                                {uploadStatus.message}
                            </p>
                        )}
                    </div>
                    <div className="flex gap-2">
                        {file && (
                            <button
                                onClick={handleUpload}
                                disabled={isUploading}
                                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                                    isDark
                                        ? 'bg-[#7c3aed] text-white hover:bg-[#6d28d9] shadow-lg shadow-purple-500/20'
                                        : 'bg-[#7c3aed] text-white hover:bg-[#6d28d9] shadow-lg shadow-purple-500/20'
                                } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isUploading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Загрузка...
                                    </>
                                ) : (
                                    '📤 Загрузить'
                                )}
                            </button>
                        )}
                        {uploadStatus && uploadStatus.type === 'success' && (
                            <button
                                onClick={() => setUploadStatus(null)}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                                    isDark
                                        ? 'bg-[#1a1a2e] text-gray-400 hover:text-white hover:bg-[#2a2a4a]'
                                        : 'bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                                }`}
                            >
                                ✕ Закрыть
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
