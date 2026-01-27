import React from 'react';
import {
    BookOpen, Terminal, MousePointer2, Target,
    Database, Server, Laptop, CheckCircle2,
    Smartphone, QrCode, Globe, Layers, BarChart3
} from 'lucide-react';

const Guide = () => {
    return (
        <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Section */}
            <div className="bg-obsidian-blue rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-3xl font-header font-bold mb-2">System Documentation</h2>
                    <p className="text-light-grey/80 max-w-2xl">
                        Everything you need to know about setting up, managing, and tracking your dynamic QR campaigns.
                    </p>
                </div>
                <BookOpen className="absolute right-[-20px] bottom-[-20px] w-64 h-64 text-white/5 rotate-12" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Setup */}
                <div className="lg:col-span-1 space-y-6">
                    <section className="card-base p-6 bg-white border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                <Terminal size={20} />
                            </div>
                            <h3 className="font-header font-bold text-lg text-obsidian-blue">Setup Guide</h3>
                        </div>

                        <div className="space-y-4 text-sm text-taupe leading-relaxed">
                            <div className="flex gap-3">
                                <Database className="shrink-0 mt-1 text-liquid-lava" size={16} />
                                <div>
                                    <p className="font-bold text-obsidian-blue">1. Database</p>
                                    <p>Ensure MongoDB is running on <code>localhost:27017</code>. Use Docker or a local installation.</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <Server className="shrink-0 mt-1 text-liquid-lava" size={16} />
                                <div>
                                    <p className="font-bold text-obsidian-blue">2. Backend</p>
                                    <p>Go to <code>/backend</code>, install <code>requirements.txt</code>, and run <code>python main.py</code>.</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <Laptop className="shrink-0 mt-1 text-liquid-lava" size={16} />
                                <div>
                                    <p className="font-bold text-obsidian-blue">3. Frontend</p>
                                    <p>Go to <code>/frontend</code>, run <code>npm install</code> then <code>npm run dev</code>.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="card-base p-6 bg-slate-900 text-white shadow-xl border border-slate-800">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-obsidian-eclipse rounded-lg text-liquid-lava">
                                <CheckCircle2 size={20} />
                            </div>
                            <h3 className="font-header font-bold text-lg">System Specs</h3>
                        </div>
                        <ul className="space-y-3 text-xs text-light-grey">
                            <li className="flex justify-between border-b border-slate-800 pb-2">
                                <span>API Port</span>
                                <span className="font-mono text-liquid-lava">8001</span>
                            </li>
                            <li className="flex justify-between border-b border-slate-800 pb-2">
                                <span>Web Port</span>
                                <span className="font-mono text-liquid-lava">5173</span>
                            </li>
                            <li className="flex justify-between border-b border-slate-800 pb-2">
                                <span>DB Name</span>
                                <span className="font-mono text-liquid-lava">qr_system</span>
                            </li>
                            <li className="flex justify-between">
                                <span>Auth</span>
                                <span className="font-mono text-liquid-lava">JWT + OAuth2</span>
                            </li>
                        </ul>
                    </section>
                </div>

                {/* Right Column: Usage & Source Tracking */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Usage Guide */}
                    <section className="card-base p-8 bg-white border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-orange-50 rounded-lg text-liquid-lava">
                                <MousePointer2 size={24} />
                            </div>
                            <h3 className="font-header font-bold text-2xl text-obsidian-blue">How to Use</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 font-bold text-obsidian-blue">
                                    <Globe size={18} className="text-blue-500" />
                                    <span>Website Campaigns</span>
                                </div>
                                <p className="text-sm text-taupe leading-relaxed">
                                    Create a URL QR code to redirect users to anything. Since it's <strong>Dynamic</strong>, you can change the target URL anytime without reprinting the physical QR.
                                </p>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 font-bold text-obsidian-blue">
                                    <Smartphone size={18} className="text-emerald-500" />
                                    <span>vCard (Contacts)</span>
                                </div>
                                <p className="text-sm text-taupe leading-relaxed">
                                    Store name, phone, email, and organization. When scanned, it prompts the user to "Save Contact" automatically.
                                </p>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 font-bold text-obsidian-blue">
                                    <Layers size={18} className="text-purple-500" />
                                    <span>Personal Branding</span>
                                </div>
                                <p className="text-sm text-taupe leading-relaxed">
                                    Upload a logo (PNG/JPG) to the "Logo" field. It will be <strong>embedded in the center</strong> and properly included in the high-res PNG download.
                                </p>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 font-bold text-obsidian-blue">
                                    <QrCode size={18} className="text-orange-500" />
                                    <span>Exporting</span>
                                </div>
                                <p className="text-sm text-taupe leading-relaxed">
                                    Use the <strong>"Download"</strong> button to get a 1024x1024 high-resolution image ready for professional printing on flyers, business cards, or billboards.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Source Tracking */}
                    <section className="card-base p-8 bg-white border border-slate-100 shadow-sm overflow-hidden relative">
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                                    <Target size={24} />
                                </div>
                                <h3 className="font-header font-bold text-2xl text-obsidian-blue">Source Tracking</h3>
                            </div>

                            <div className="space-y-6">
                                <p className="text-taupe">
                                    The <strong>"Source"</strong> field is your secret weapon for attribution. Instead of creating 10 different QR codes for the same destination, create them with different source tags to know exactly where your traffic is coming from.
                                </p>

                                <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                                    <h4 className="font-bold text-obsidian-blue mb-4 flex items-center gap-2">
                                        <BarChart3 size={16} className="text-liquid-lava" />
                                        Example Campaign Strategy:
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="bg-white p-3 rounded-lg border border-slate-200">
                                            <p className="text-[10px] uppercase font-bold text-taupe">Source Tag</p>
                                            <p className="font-mono text-sm font-bold text-obsidian-blue">Instagram-Bio</p>
                                        </div>
                                        <div className="bg-white p-3 rounded-lg border border-slate-200">
                                            <p className="text-[10px] uppercase font-bold text-taupe">Source Tag</p>
                                            <p className="font-mono text-sm font-bold text-obsidian-blue">Print-Flyer-A</p>
                                        </div>
                                        <div className="bg-white p-3 rounded-lg border border-slate-200">
                                            <p className="text-[10px] uppercase font-bold text-taupe">Source Tag</p>
                                            <p className="font-mono text-sm font-bold text-obsidian-blue">Store-Counter</p>
                                        </div>
                                    </div>
                                    <p className="mt-4 text-xs text-taupe italic">
                                        Check the "Live Scan Analytics" table to see these tags appear in real-time as users scan.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <Target className="absolute right-[-30px] top-[-30px] w-48 h-48 text-emerald-50/50 -rotate-12" />
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Guide;
