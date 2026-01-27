import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, AlertOctagon, ChevronLeft, ShieldAlert } from 'lucide-react';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center p-4 selection:bg-cyan-500/30 overflow-hidden relative">
            {/* Animated Background Elements */}
            <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-cyan-500/10 blur-[100px] rounded-full animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-blue-600/10 blur-[100px] rounded-full animate-pulse transition-all duration-1000"></div>

            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

            <div className="max-w-2xl w-full text-center relative z-10">
                {/* 404 Icon Header */}
                <div className="relative inline-block mb-12">
                    <div className="absolute inset-0 bg-cyan-500/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
                    <div className="relative w-32 h-32 bg-gray-900 border border-white/10 rounded-[40px] flex items-center justify-center shadow-2xl mx-auto rotate-12 hover:rotate-0 transition-transform duration-500">
                        <ShieldAlert className="w-16 h-16 text-cyan-400" />
                    </div>
                    {/* Floating mini-icons */}
                    <div className="absolute -top-4 -right-4 w-12 h-12 bg-gray-800 border border-white/5 rounded-2xl flex items-center justify-center animate-bounce duration-[2000ms]">
                        <AlertOctagon className="w-6 h-6 text-red-500" />
                    </div>
                </div>

                {/* Text Content */}
                <h1 className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-800 tracking-tighter mb-4 select-none">
                    404
                </h1>

                <h2 className="text-3xl font-bold text-white mb-6">Environment Lost in Space</h2>

                <p className="text-gray-400 text-lg mb-12 max-w-md mx-auto leading-relaxed">
                    The secure node you're looking for doesn't exist or has been moved to a different sector.
                    <span className="block mt-2 text-cyan-500/80 font-mono text-sm">Error Code: SEC_NODE_NOT_FOUND</span>
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                        onClick={() => {
                            if (window.electronAPI) {
                                window.electronAPI.quitApp();
                            } else {
                                navigate('/');
                            }
                        }}
                        className="group relative flex items-center gap-2 bg-white text-black font-bold px-8 py-4 rounded-2xl hover:bg-cyan-500 hover:text-white transition-all active:scale-95 shadow-xl shadow-white/5"
                    >
                        <Home className="w-5 h-5" />
                        <span>Close Application</span>
                    </button>

                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-400 hover:text-white font-bold px-8 py-4 rounded-2xl border border-white/5 hover:bg-white/5 transition-all active:scale-95"
                    >
                        <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                        <span>Previous Sector</span>
                    </button>
                </div>

                {/* Footer status-like text */}
                <div className="mt-20 flex items-center justify-center gap-8 text-[10px] uppercase tracking-[0.3em] font-bold text-gray-600">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></div>
                        System Integrity: Secure
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                        Connection: Fragmented
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
