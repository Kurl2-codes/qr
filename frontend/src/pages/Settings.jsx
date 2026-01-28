import React, { useState } from 'react';
import axios from 'axios';
import { Lock, Save, AlertCircle, CheckCircle2, BarChart2, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

import { useAuth } from '../hooks/useAuth';
import { useQR } from '../hooks/useQR';

const Settings = ({ user }) => {
    const { updateProfile, updatePassword } = useAuth();
    const { qrs } = useQR();
    const [activeTab, setActiveTab] = useState('profile');
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [profile, setProfile] = useState({
        fullName: user?.fullName || '',
        profileImage: user?.profileImage || null
    });
    const [status, setStatus] = useState({ type: '', message: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        setStatus({ type: '', message: '' });

        const reader = new FileReader();
        reader.onloadend = () => {
            setProfile(prev => ({ ...prev, profileImage: reader.result }));
            setIsUploading(false);
            setStatus({ type: 'success', message: 'Profile image preview set! Save changes to finalize.' });
        };
        reader.readAsDataURL(file);
    };

    const handlePasswordChange = (e) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: '', message: '' });

        if (passwords.newPassword !== passwords.confirmPassword) {
            setStatus({ type: 'error', message: 'New passwords do not match' });
            return;
        }

        if (passwords.newPassword.length < 6) {
            setStatus({ type: 'error', message: 'Password must be at least 6 characters' });
            return;
        }

        setIsLoading(true);
        try {
            await updatePassword.mutateAsync({
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword
            });
            setStatus({ type: 'success', message: 'Security credentials updated' });
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            console.error("Password update error:", error);
            const msg = error.response?.data?.detail || 'Failed to update password';
            setStatus({ type: 'error', message: msg });
        } finally {
            setIsLoading(false);
        }
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setStatus({ type: '', message: '' });
        try {
            await updateProfile.mutateAsync(profile);
            setStatus({ type: 'success', message: 'Account profile updated' });
        } catch (error) {
            console.error("Profile update error:", error);
            setStatus({ type: 'error', message: 'Failed to update profile' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleExport = () => {
        try {
            const data = qrs || [];
            const headers = ['Name', 'Target URL', 'Proxy URL', 'Source', 'Clicks', 'Date Created'];
            const csvRows = [
                headers.join(','),
                ...data.map(qr => [
                    `"${qr.name || ''}"`,
                    `"${qr.targetUrl}"`,
                    `"${qr.proxyUrl}"`,
                    `"${qr.source || 'General'}"`,
                    qr.clicks,
                    new Date(qr.createdAt).toLocaleDateString()
                ].join(','))
            ];
            const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.setAttribute('hidden', '');
            a.setAttribute('href', url);
            a.setAttribute('download', `qr_export_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch (error) {
            console.error(error);
            alert('Failed to export data');
        }
    };

    const tabs = [
        { id: 'profile', label: 'My Profile', icon: <Plus size={18} /> },
        { id: 'security', label: 'Security', icon: <Lock size={18} /> },
        { id: 'data', label: 'System Data', icon: <Save size={18} /> }
    ];

    return (
        <div className="max-w-5xl mx-auto pb-20 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex justify-between items-end mb-8 px-2">
                <div>
                    <h1 className="text-3xl font-header font-black text-obsidian-blue tracking-tight">
                        Settings<span className="text-liquid-lava">.</span>
                    </h1>
                    <p className="text-taupe text-sm">Configure your executive environment.</p>
                </div>
                {status.message && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={clsx(
                            "px-4 py-2 rounded-xl flex items-center gap-2 border shadow-sm",
                            status.type === 'error' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        )}
                    >
                        {status.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
                        <span className="text-xs font-bold">{status.message}</span>
                    </motion.div>
                )}
            </div>

            {/* Unified Control Center Grid */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col md:flex-row min-h-[600px]">

                {/* Internal Sidebar Rail */}
                <div className="w-full md:w-64 bg-slate-50/50 border-r border-slate-100 p-6 flex flex-col justify-between">
                    <div className="space-y-4">
                        <div className="px-3 mb-6">
                            <p className="text-[10px] font-black text-taupe uppercase tracking-widest opacity-50">Preferences</p>
                        </div>
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={clsx(
                                    "w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all text-sm",
                                    activeTab === tab.id
                                        ? "bg-obsidian-blue text-white shadow-lg shadow-blue-900/20 translate-x-1"
                                        : "text-taupe hover:bg-slate-100 hover:text-obsidian-blue"
                                )}
                            >
                                {tab.icon}
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>

                </div>

                {/* Dynamic Content Area */}
                <div className="flex-1 p-8 md:p-12">
                    <AnimatePresence mode="wait">
                        {activeTab === 'profile' && (
                            <motion.div
                                key="profile"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-12 max-w-2xl"
                            >
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-header font-black text-obsidian-blue">Personal Identity</h3>
                                    <p className="text-sm text-taupe">Update your display information and profile image.</p>
                                </div>

                                <form onSubmit={handleProfileSubmit} className="space-y-10">
                                    <div className="flex flex-col md:flex-row items-center gap-10">
                                        <div className="relative group">
                                            <div className="h-32 w-32 rounded-[2.5rem] overflow-hidden border-4 border-slate-50 bg-slate-100 flex items-center justify-center shadow-inner group-hover:shadow-md transition-all duration-300">
                                                {profile.profileImage ? (
                                                    <img
                                                        src={
                                                            profile.profileImage.startsWith('http') || profile.profileImage.startsWith('data:')
                                                                ? profile.profileImage
                                                                : `${import.meta.env.VITE_UPLOAD_BASE_URL || 'http://localhost:8001'}${profile.profileImage}`
                                                        }
                                                        alt="Profile"
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-3xl font-black text-slate-200">
                                                        {(profile.fullName || user?.username || 'AU').substring(0, 2).toUpperCase()}
                                                    </span>
                                                )}
                                                {isUploading && (
                                                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-obsidian-blue"></div>
                                                    </div>
                                                )}
                                            </div>
                                            <label className="absolute -bottom-2 -right-2 p-2 bg-obsidian-blue text-white rounded-xl shadow-lg cursor-pointer hover:bg-liquid-lava transition-all active:scale-95 border-2 border-white">
                                                <Plus size={20} />
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleImageUpload}
                                                    disabled={isUploading}
                                                />
                                            </label>
                                        </div>

                                        <div className="flex-1 w-full space-y-6">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-taupe uppercase tracking-widest ml-1">Username / ID</label>
                                                <input
                                                    type="text"
                                                    value={user?.username || ''}
                                                    disabled
                                                    className="w-full bg-slate-50 text-slate-400 font-bold px-5 py-3.5 rounded-2xl border border-slate-100 cursor-not-allowed"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-taupe uppercase tracking-widest ml-1">Full Name</label>
                                                <input
                                                    type="text"
                                                    value={profile.fullName}
                                                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                                                    className="w-full bg-white text-obsidian-blue font-bold px-5 py-3.5 rounded-2xl border border-slate-200 focus:border-obsidian-blue focus:ring-4 focus:ring-obsidian-blue/5 outline-none transition-all"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="px-8 py-4 bg-obsidian-blue hover:bg-obsidian-tide text-white font-black rounded-2xl shadow-xl shadow-blue-900/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3"
                                        >
                                            <Save size={18} />
                                            <span>{isLoading ? 'Processing...' : 'Save Profile Changes'}</span>
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        )}

                        {activeTab === 'security' && (
                            <motion.div
                                key="security"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-10 max-w-2xl"
                            >
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-header font-black text-obsidian-blue">Security Check</h3>
                                    <p className="text-sm text-taupe">Manage your password and system permissions.</p>
                                </div>

                                <form onSubmit={handlePasswordSubmit} className="space-y-8">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-taupe uppercase tracking-widest ml-1">Current Account Password</label>
                                        <input
                                            type="password"
                                            name="currentPassword"
                                            value={passwords.currentPassword}
                                            onChange={handlePasswordChange}
                                            className="w-full bg-slate-50/50 text-obsidian-blue font-bold px-5 py-4 rounded-2xl border border-slate-200 focus:border-obsidian-blue focus:ring-4 focus:ring-obsidian-blue/5 outline-none transition-all"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-taupe uppercase tracking-widest ml-1">New Password</label>
                                            <input
                                                type="password"
                                                name="newPassword"
                                                value={passwords.newPassword}
                                                onChange={handlePasswordChange}
                                                className="w-full bg-white text-obsidian-blue font-bold px-5 py-4 rounded-2xl border border-slate-200 focus:border-liquid-lava focus:ring-4 focus:ring-lava/5 outline-none transition-all"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-taupe uppercase tracking-widest ml-1">Confirm New Password</label>
                                            <input
                                                type="password"
                                                name="confirmPassword"
                                                value={passwords.confirmPassword}
                                                onChange={handlePasswordChange}
                                                className="w-full bg-white text-obsidian-blue font-bold px-5 py-4 rounded-2xl border border-slate-200 focus:border-liquid-lava focus:ring-4 focus:ring-lava/5 outline-none transition-all"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4 flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="px-8 py-4 bg-liquid-lava hover:bg-liquid-lava/90 text-white font-black rounded-2xl shadow-xl shadow-lava/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3"
                                        >
                                            <Lock size={18} />
                                            <span>{isLoading ? 'Updating...' : 'Secure Account'}</span>
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        )}

                        {activeTab === 'data' && (
                            <motion.div
                                key="data"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-10 max-w-2xl"
                            >
                                <div className="space-y-2 text-center md:text-left">
                                    <h3 className="text-2xl font-header font-black text-obsidian-blue">System Data Core</h3>
                                    <p className="text-sm text-taupe">Export and manage your archival campaign records.</p>
                                </div>

                                <div className="p-10 bg-slate-50 border border-slate-100 rounded-[2.5rem] flex flex-col items-center gap-8 text-center group">
                                    <div className="h-20 w-20 bg-white rounded-3xl flex items-center justify-center text-obsidian-blue shadow-xl shadow-slate-200/50 group-hover:scale-110 transition-transform duration-500">
                                        <BarChart2 size={40} className="text-liquid-lava" />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="font-black text-obsidian-blue">Redirection Metrics (.CSV)</h4>
                                        <p className="text-xs text-taupe px-4">Download a full archival snapshot of every QR campaign created in this environment, including total click-through rates.</p>
                                    </div>
                                    <button
                                        onClick={handleExport}
                                        className="w-full max-w-sm py-5 bg-white hover:bg-slate-50 text-obsidian-blue border border-slate-200 font-black rounded-2xl shadow-xl shadow-slate-100 transition-all active:scale-95 flex items-center justify-center gap-3"
                                    >
                                        <Save size={20} className="text-emerald-500" />
                                        <span>Export Database</span>
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="mt-12 text-center opacity-30">
                <p className="text-[10px] text-obsidian-blue font-black uppercase tracking-[0.4em]">
                    QR Proxy Core Architecture • v1.2.0 • 2026 Ready
                </p>
            </div>
        </div>
    );
};

export default Settings;
