import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, User, ArrowRight, Scan, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await login.mutateAsync({ username, password });
        } catch (err) {
            console.error(err);
            setError('Access Denied. Check credentials.');
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden font-body selection:bg-liquid-lava selection:text-white">

            {/* Background Data Matrix Overlay */}
            <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: 'linear-gradient(90deg, #FD7912 1px, transparent 1px), linear-gradient(#FD7912 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }} />

            {/* Subtle Randomized Flicker Blobs */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <motion.div
                    animate={{ opacity: [0.1, 0.2, 0.1] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute top-1/4 -left-1/4 w-[800px] h-[800px] bg-obsidian-tide/20 blur-[150px] rounded-full"
                />
            </div>

            {/* The Scanning Frame Context */}
            <div className="relative z-10 w-full max-w-[480px]">

                {/* Viewfinder Brackets */}
                <div className="absolute -inset-10 pointer-events-none select-none">
                    <motion.div
                        initial={{ opacity: 0, scale: 1.2 }}
                        animate={{ opacity: 0.4, scale: 1 }}
                        className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-liquid-lava rounded-tl-3xl shadow-[0_0_15px_rgba(253,121,18,0.3)]"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 1.2 }}
                        animate={{ opacity: 0.4, scale: 1 }}
                        className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-liquid-lava rounded-tr-3xl"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 1.2 }}
                        animate={{ opacity: 0.4, scale: 1 }}
                        className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-liquid-lava rounded-bl-3xl"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 1.2 }}
                        animate={{ opacity: 0.4, scale: 1 }}
                        className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-liquid-lava rounded-br-3xl"
                    />
                </div>

                {/* Vertical Scanning Beam Animation */}
                <motion.div
                    animate={{ top: ['0%', '100%', '0%'] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -inset-x-8 h-[2px] bg-gradient-to-r from-transparent via-liquid-lava to-transparent z-20 opacity-30 pointer-events-none"
                    style={{ filter: 'drop-shadow(0 0 8px #FD7912)' }}
                />

                {/* Login Content Portal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-obsidian-blue/40 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-10 lg:p-12 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
                >
                    {/* Theming Header */}
                    <div className="text-center mb-10 relative">
                        <motion.div
                            animate={{ rotate: [0, 90, 180, 270, 360] }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="inline-block p-1 rounded-2xl bg-gradient-to-tr from-liquid-lava/40 to-transparent mb-6"
                        >
                            <div className="h-14 w-14 bg-obsidian-blue rounded-xl flex items-center justify-center p-2 border border-white/10">
                                <Scan className="text-liquid-lava" size={32} />
                            </div>
                        </motion.div>
                        <h1 className="text-3xl font-header font-black text-white tracking-widest mb-1">
                            QR<span className="text-liquid-lava">360_</span>
                        </h1>

                    </div>

                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div
                                initial={{ y: -10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="mb-8 p-4 bg-red-950/40 border-l-4 border-red-500 text-red-400 text-[10px] font-bold uppercase tracking-widest"
                            >
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="relative">
                            <label className="text-[10px] font-black text-taupe uppercase tracking-widest mb-2 block">Username</label>
                            <div className="flex items-center gap-3 bg-white/[0.03] border border-white/5 rounded-xl px-4 py-4 group focus-within:border-liquid-lava/50 transition-colors">
                                <User className="text-taupe group-focus-within:text-liquid-lava" size={18} />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="bg-transparent text-white text-sm focus:outline-none w-full placeholder:text-taupe/20"
                                    placeholder="Enter Username..."
                                    required
                                />
                            </div>
                        </div>

                        <div className="relative">
                            <label className="text-[10px] font-black text-taupe uppercase tracking-widest mb-2 block">Password</label>
                            <div className="flex items-center gap-3 bg-white/[0.03] border border-white/5 rounded-xl px-4 py-4 group focus-within:border-liquid-lava/50 transition-colors">
                                <Lock className="text-taupe group-focus-within:text-liquid-lava" size={18} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-transparent text-white text-sm focus:outline-none w-full placeholder:text-taupe/20 font-mono tracking-widest"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="text-taupe hover:text-white transition-colors focus:outline-none"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={login.isPending}
                            className="w-full relative h-14 group overflow-hidden rounded-xl"
                        >
                            <div className="absolute inset-0 bg-liquid-lava transition-transform origin-left group-hover:scale-x-105" />
                            <div className="relative flex items-center justify-center gap-3 text-white font-header font-black tracking-[0.2em] text-xs">
                                {login.isPending ? (
                                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <span>SIGN IN</span>
                                        <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                                    </>
                                )}
                            </div>

                            {/* Scanning line for button */}
                            <motion.div
                                animate={{ left: ['-100%', '100%'] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="absolute top-0 h-full w-1/3 bg-white/20 skew-x-[30deg] pointer-events-none"
                            />
                        </button>
                    </form>

                </motion.div>

            </div>

            {/* Background Branding Elements */}
            <div className="absolute top-12 left-12 opacity-10 hidden lg:block">
                <p className="text-7xl font-header font-black text-transparent stroke-white stroke-1" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.1)' }}>QR CODE</p>
            </div>
            <div className="absolute bottom-12 right-12 opacity-10 hidden lg:block">
                <p className="text-7xl font-header font-black text-transparent" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.1)' }}>SYSTEM</p>
            </div>
        </div >
    );
};

export default Login;
