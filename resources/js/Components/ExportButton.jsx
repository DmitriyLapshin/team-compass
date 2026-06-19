import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useTheme } from '../context/ThemeContext';

export default function ExportButton({ targetRef, title = 'Delivery Report' }) {
    const { isDark } = useTheme();
    const [isExporting, setIsExporting] = useState(false);

    const exportAsPNG = async () => {
        if (!targetRef?.current) return;
        
        setIsExporting(true);
        try {
            const canvas = await html2canvas(targetRef.current, {
                scale: 2,
                backgroundColor: isDark ? '#0a0a0f' : '#f3f4f6',
                useCORS: true,
                logging: false,
            });
            
            const link = document.createElement('a');
            link.download = `${title.replace(/\s/g, '_')}_${new Date().toISOString().slice(0, 10)}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (error) {
            console.error('Ошибка экспорта PNG:', error);
        } finally {
            setIsExporting(false);
        }
    };

    const exportAsPDF = async () => {
        if (!targetRef?.current) return;
        
        setIsExporting(true);
        try {
            const canvas = await html2canvas(targetRef.current, {
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
            pdf.save(`${title.replace(/\s/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`);
        } catch (error) {
            console.error('Ошибка экспорта PDF:', error);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="flex gap-2">
            <button
                onClick={exportAsPNG}
                disabled={isExporting}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isDark
                        ? 'bg-[#1a1a2e] text-gray-300 hover:bg-[#2a2a4a] border border-[#2a2a4a] hover:border-[#3a3a5a]'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200 hover:border-gray-300'
                } ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {isExporting ? (
                    <div className="w-4 h-4 border-2 border-[#7c3aed] border-t-transparent rounded-full animate-spin"></div>
                ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                )}
                PNG
            </button>
            
            <button
                onClick={exportAsPDF}
                disabled={isExporting}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isDark
                        ? 'bg-[#1a1a2e] text-gray-300 hover:bg-[#2a2a4a] border border-[#2a2a4a] hover:border-[#3a3a5a]'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200 hover:border-gray-300'
                } ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {isExporting ? (
                    <div className="w-4 h-4 border-2 border-[#7c3aed] border-t-transparent rounded-full animate-spin"></div>
                ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                )}
                PDF
            </button>
        </div>
    );
}
