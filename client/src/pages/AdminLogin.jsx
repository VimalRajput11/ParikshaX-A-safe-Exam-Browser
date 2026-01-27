import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ChevronRight, AlertCircle, CheckCircle } from 'lucide-react';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Default Credentials
    const DEFAULT_EMAIL = 'admin@parikshax.com';
    const DEFAULT_PASSWORD = 'admin';

    const handleLogin = (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        setTimeout(() => {
            if (email === DEFAULT_EMAIL && password === DEFAULT_PASSWORD) {
                localStorage.setItem('adminAuth', 'true');
                navigate('/admin');
            } else {
                setError('Invalid credentials. Please try again.');
                setLoading(false);
            }
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center p-4 selection:bg-cyan-500/30">
            {/* Background Glow */}
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="w-full max-w-[440px] relative">
                <div className="absolute -top-12 -left-12 w-24 h-24 bg-cyan-600/20 blur-3xl rounded-full"></div>
                <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-blue-600/20 blur-3xl rounded-full"></div>

                <div className="relative bg-[#111218]/80 backdrop-blur-xl border border-white/5 p-10 rounded-[32px] shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="mb-10 text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-cyan-500/20 ring-1 ring-white/20">
                            <Lock className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-2">
                            Admin Access
                        </h1>
                        <p className="text-gray-500 text-sm">Secure Portal Login</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@parikshax.com"
                                    className="w-full bg-[#1a1b23] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-gray-200 outline-none focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/5 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Password</label>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-[#1a1b23] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-gray-200 outline-none focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/5 transition-all"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 animate-shake">
                                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                                <p className="text-red-400 text-sm font-medium">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full group relative bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-cyan-500/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <div className="flex items-center justify-center gap-2">
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <span>Sign In Now</span>
                                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </div>
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-white/5 text-center">
                        <p className="text-gray-600 text-[10px] uppercase tracking-[0.2em]">
                            System Security v2.0 • Encryption Enabled
                        </p>
                    </div>
                </div>

                {/* Footer Link */}
                <div className="mt-8 text-center text-gray-500 text-sm">
                    Not an admin? <button onClick={() => navigate('/')} className="text-cyan-400 hover:text-cyan-300 font-bold underline-offset-4 hover:underline transition-all">Go to Home</button>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
