import React, { useState, useEffect } from 'react';
import {
    Loader2, TrendingUp, MousePointerClick, QrCode, BarChart2,
    Link as LinkIcon, Smartphone, Monitor, Tablet, Bot, Globe, Apple, Chrome, FileSpreadsheet, Clock
} from 'lucide-react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import { toJpeg } from 'html-to-image';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useRef } from 'react';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const DeviceIcon = ({ type }) => {
    if (type === 'PC') return <Monitor size={16} className="text-slate-500" />;
    if (type === 'Mobile') return <Smartphone size={16} className="text-slate-500" />;
    if (type === 'Tablet') return <Tablet size={16} className="text-slate-500" />;
    if (type === 'Bot') return <Bot size={16} className="text-slate-500" />;
    return <Globe size={16} className="text-slate-500" />;
};

const BrowserIcon = ({ browser }) => {
    const b = browser?.toLowerCase() || '';
    if (b.includes('safari')) return <div className="p-1 bg-blue-50 rounded-full"><div className="w-3 h-3 bg-blue-400 rounded-full flex items-center justify-center text-[8px] text-white">S</div></div>;
    if (b.includes('chrome')) return <div className="p-1 bg-yellow-50 rounded-full"><div className="w-3 h-3 bg-yellow-500 rounded-full flex items-center justify-center text-[8px] text-white">C</div></div>;
    if (b.includes('firefox')) return <div className="p-1 bg-orange-50 rounded-full"><div className="w-3 h-3 bg-orange-500 rounded-full flex items-center justify-center text-[8px] text-white">F</div></div>;
    return <Globe size={16} className="text-slate-400" />;
};

import { useAnalytics } from '../hooks/useAnalytics';

const Analytics = () => {
    const { data, isLoading, error } = useAnalytics();
    const [currentPage, setCurrentPage] = useState(1);
    const [isExporting, setIsExporting] = useState(false);
    const reportRef = useRef(null);
    const rowsPerPage = 8;

    useEffect(() => {
        if (data?.recentScans) {
            const maxPage = Math.max(1, Math.ceil(data.recentScans.length / rowsPerPage));
            if (currentPage > maxPage) {
                setCurrentPage(maxPage);
            }
        }
    }, [data, rowsPerPage]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 text-liquid-lava animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 text-red-500 bg-red-50 border border-red-200 rounded-lg">
                Failed to load analytics. {error.message}
            </div>
        );
    }

    const topDevice = data?.deviceStats?.[0]?._id || 'N/A';
    const topBrowser = data?.browserStats?.[0]?._id || 'N/A';
    const topOS = data?.osStats?.[0]?._id || 'N/A';

    const exportToCSV = () => {
        if (!data?.recentScans) return;
        const headers = ["Time", "QR ID", "QR Name", "Source", "Device", "Model", "Browser", "OS"];
        const rows = data.recentScans.map(s => [
            new Date(s.timestamp).toLocaleString(),
            s.qrId,
            s.qrName || 'Untitled',
            s.source || 'General',
            s.deviceType,
            s.deviceModel,
            s.browser,
            s.os
        ]);
        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "qr_scans_report.csv");
        document.body.appendChild(link);
        link.click();
    };

    const exportToPDF = async () => {
        if (!reportRef.current) return;
        setIsExporting(true);
        try {
            const element = reportRef.current;

            // html-to-image is much better with modern CSS (oklch, blur, etc)
            const imgData = await toJpeg(element, {
                quality: 0.8,
                backgroundColor: '#ffffff',
                cacheBust: true,
                style: {
                    // Force content to be visible/stable
                    transform: 'scale(1)',
                    opacity: '1'
                }
            });

            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            // Create a temp image to get dimensions correctly
            const img = new Image();
            img.src = imgData;
            await new Promise(resolve => img.onload = resolve);

            const imgWidth = pageWidth;
            const imgHeight = (img.height * imgWidth) / img.width;

            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save(`QR360_Report_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (err) {
            console.error("PDF Export Error:", err);
            alert(`Export failed: ${err.message || 'Check console for details'}`);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="space-y-6 pb-12">
            <div className="flex justify-between items-center mb-2 px-1" data-html2canvas-ignore="true">
                <div>
                    <h2 className="text-2xl font-header font-bold text-obsidian-blue">Analytics Report</h2>
                    <p className="text-taupe text-sm">Generated on {new Date().toLocaleDateString()}</p>
                </div>
                <button
                    onClick={exportToPDF}
                    disabled={isExporting}
                    className="flex items-center gap-2 px-6 py-2.5 bg-obsidian-blue text-white text-sm font-bold rounded-xl transition-all shadow-lg hover:shadow-obsidian-blue/20 active:scale-95 disabled:opacity-50"
                >
                    {isExporting ? (
                        <Loader2 size={16} className="animate-spin" />
                    ) : (
                        <BarChart2 size={16} className="text-liquid-lava" />
                    )}
                    <span>{isExporting ? 'Generating PDF...' : 'Download PDF Report'}</span>
                </button>
            </div>

            <div ref={reportRef} className="space-y-6 bg-white p-4 rounded-2xl">
                {/* Insight Section */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="card-base p-6 bg-obsidian-blue text-white shadow-xl">
                        <p className="text-light-grey text-xs font-bold uppercase tracking-widest mb-2">Top Device</p>
                        <div className="flex items-center gap-3">
                            <div className="bg-liquid-lava p-2 rounded-lg">
                                <Smartphone size={20} />
                            </div>
                            <div>
                                <h4 className="text-2xl font-header font-bold">{topDevice}</h4>
                                <p className="text-[10px] text-light-grey">Most dominant device</p>
                            </div>
                        </div>
                    </div>

                    <div className="card-base p-6 bg-white border border-slate-100 shadow-sm">
                        <p className="text-taupe text-xs font-bold uppercase tracking-widest mb-2">Top Browser</p>
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
                                <Globe size={20} />
                            </div>
                            <div>
                                <h4 className="text-2xl font-header font-bold text-obsidian-blue">{topBrowser}</h4>
                                <p className="text-[10px] text-taupe">Preferred browser</p>
                            </div>
                        </div>
                    </div>

                    <div className="card-base p-6 bg-white border border-slate-100 shadow-sm">
                        <p className="text-taupe text-xs font-bold uppercase tracking-widest mb-2">Top OS</p>
                        <div className="flex items-center gap-3">
                            <div className="bg-green-50 text-green-600 p-2 rounded-lg">
                                <Monitor size={20} />
                            </div>
                            <div>
                                <h4 className="text-2xl font-header font-bold text-obsidian-blue">{topOS}</h4>
                                <p className="text-[10px] text-taupe">Most active OS</p>
                            </div>
                        </div>
                    </div>

                    <div className="card-base p-6 bg-white border border-slate-100 shadow-sm">
                        <p className="text-taupe text-xs font-bold uppercase tracking-widest mb-2">Total Scans</p>
                        <div className="flex items-center gap-3">
                            <div className="bg-orange-50 text-liquid-lava p-2 rounded-lg">
                                <MousePointerClick size={20} />
                            </div>
                            <div>
                                <h4 className="text-2xl font-header font-bold text-obsidian-blue">{data?.totalClicks || 0}</h4>
                                <p className="text-[10px] text-taupe">Lifetime clicks</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Device Distribution Donut */}
                    <div className="bg-white border border-slate-100 shadow-sm rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-obsidian-blue text-sm">Device Categories</h3>
                            <Smartphone size={16} className="text-taupe" />
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data?.deviceStats?.map(i => ({ name: i._id, value: i.count })) || []}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {data?.deviceStats?.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* OS Distribution Donut */}
                    <div className="bg-white border border-slate-100 shadow-sm rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-obsidian-blue text-sm">Operating Systems</h3>
                            <Monitor size={16} className="text-taupe" />
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data?.osStats?.map(i => ({ name: i._id, value: i.count })) || []}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {data?.osStats?.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Browser Distribution Donut */}
                    <div className="bg-white border border-slate-100 shadow-sm rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-obsidian-blue text-sm">Browsers</h3>
                            <Globe size={16} className="text-taupe" />
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data?.browserStats?.map(i => ({ name: i._id, value: i.count })) || []}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {data?.browserStats?.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Detailed Scan Log Table */}
                <div className="bg-slate-900 text-white rounded-2xl shadow-2xl overflow-hidden border border-slate-800">
                    <div className="px-8 py-6 flex items-center justify-between border-b border-slate-800 bg-slate-900" data-html2canvas-ignore="true">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-obsidian-tide rounded-lg">
                                <Clock size={20} className="text-blue-400" />
                            </div>
                            <div>
                                <h3 className="font-header font-bold text-lg">Live Scan Analytics</h3>
                                <p className="text-[10px] text-taupe uppercase tracking-widest font-bold">Real-time incoming traffic</p>
                            </div>
                        </div>
                        <button
                            onClick={exportToCSV}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sm font-bold rounded-xl transition-all border border-slate-700 active:scale-95"
                        >
                            <FileSpreadsheet size={16} className="text-emerald-400" />
                            <span>Export to Sheets</span>
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[10px] uppercase tracking-[0.2em] font-black text-taupe/80 border-b border-slate-800">
                                    <th className="px-8 py-5">Time</th>
                                    <th className="px-8 py-5">QR ID</th>
                                    <th className="px-8 py-5">Name / Source</th>
                                    <th className="px-8 py-5">Device</th>
                                    <th className="px-8 py-5">Browser</th>
                                    <th className="px-8 py-5">OS</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {data?.recentScans?.length > 0 ? (
                                    data.recentScans.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage).map((scan) => (
                                        <tr key={scan.id || scan._id} className="hover:bg-slate-800/30 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-200">
                                                        {new Date(scan.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    <span className="text-[10px] text-taupe group-hover:text-liquid-lava transition-colors font-mono">
                                                        {new Date(scan.timestamp).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-xs font-mono text-liquid-lava bg-liquid-lava/10 px-2 py-1 rounded">
                                                    {scan.qrId}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-300">
                                                        {scan.qrName || 'Untitled'}
                                                    </span>
                                                    <span className="text-[10px] text-taupe group-hover:text-liquid-lava transition-colors font-mono uppercase">
                                                        Source: {scan.source || 'Direct'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <DeviceIcon type={scan.deviceType} />
                                                    <span className="text-sm font-medium text-slate-300">{scan.deviceModel || scan.deviceBrand}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <BrowserIcon browser={scan.browser} />
                                                    <span className="text-sm font-medium text-slate-300">{scan.browser}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-slate-300">{scan.os}</span>
                                                    <span className="text-[10px] text-taupe font-mono">{scan.osVersion}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-8 py-16 text-center text-taupe italic bg-slate-900/50">
                                            Waiting for incoming scans...
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {data?.recentScans?.length > rowsPerPage && (
                        <div className="px-8 py-4 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between">
                            <p className="text-xs text-taupe">
                                Showing <span className="text-slate-200 font-bold">{(currentPage - 1) * rowsPerPage + 1}</span> to <span className="text-slate-200 font-bold">{Math.min(currentPage * rowsPerPage, data.recentScans.length)}</span> of <span className="text-slate-200 font-bold">{data.recentScans.length}</span> scans
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs font-bold hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Previous
                                </button>
                                <div className="flex items-center gap-1">
                                    {[...Array(Math.ceil(data.recentScans.length / rowsPerPage))].map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentPage(i + 1)}
                                            className={`w-6 h-6 rounded-md text-[10px] font-bold transition-colors ${currentPage === i + 1
                                                ? 'bg-liquid-lava text-white shadow-lg shadow-liquid-lava/20'
                                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                                }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(data.recentScans.length / rowsPerPage)))}
                                    disabled={currentPage === Math.ceil(data.recentScans.length / rowsPerPage)}
                                    className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs font-bold hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Analytics;
