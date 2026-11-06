import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowLeft, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../config';
import BrandMark from '../components/BrandMark';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Prevent access to login page if already authenticated
    useEffect(() => {
        const isAuthenticated = localStorage.getItem('adminAuth') === 'true';
        if (isAuthenticated) {
            navigate('/admin', { replace: true });
        }
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${API_BASE_URL}/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();

            if (data.success) {
                localStorage.setItem('adminAuth', 'true');
                localStorage.setItem('adminEmail', email); // Store email for password change
                navigate('/admin');
            } else {
                setError(data.error || 'Invalid credentials');
                setLoading(false);
            }
        } catch (err) {
            console.error(err);
            setError('Connection failed. Please check that the server is running.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-[400px]">
                    <div className="flex justify-center mb-8">
                        <BrandMark subtitle="Administration Console" size="lg" />
                    </div>

                    <div className="card p-8">
                        <div className="mb-6">
                            <h1 className="text-xl font-semibold text-slate-900">Sign in to your account</h1>
                            <p className="text-sm text-slate-500 mt-1">Authorised personnel only.</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-5">
                            <div>
                                <label htmlFor="email" className="label">Email address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        id="email"
                                        type="email"
                                        required
                                        autoComplete="username"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="admin@institution.edu"
                                        className="input pl-10"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="label">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        id="password"
                                        type="password"
                                        required
                                        autoComplete="current-password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="input pl-10"
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5" role="alert">
                                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                                    <p className="text-red-700 text-sm">{error}</p>
                                </div>
                            )}

                            <button type="submit" disabled={loading} className="btn btn-primary w-full py-3">
                                {loading ? (
                                    <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Signing in…</>
                                ) : 'Sign in'}
                            </button>
                        </form>
                    </div>

                    <div className="mt-6 text-center">
                        <button onClick={() => navigate('/')} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors">
                            <ArrowLeft className="w-4 h-4" /> Back to candidate login
                        </button>
                    </div>
                </div>
            </div>
            <footer className="py-5 text-center text-xs text-slate-400">
                &copy; {new Date().getFullYear()} ParikshaX · Secure Assessment Platform
            </footer>
        </div>
    );
};

export default AdminLogin;
