import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import BrandMark from '../components/BrandMark';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <header className="px-6 py-5">
                <BrandMark />
            </header>
            <main className="flex-1 flex items-center justify-center p-6">
                <div className="max-w-md w-full text-center">
                    <p className="text-sm font-semibold text-brand-600">404 error</p>
                    <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Page not found</h1>
                    <p className="mt-3 text-slate-500">
                        The page you are looking for doesn&apos;t exist or has been moved.
                    </p>
                    <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                        <button onClick={() => navigate(-1)} className="btn btn-secondary w-full sm:w-auto">
                            <ArrowLeft className="w-4 h-4" /> Go back
                        </button>
                        <button
                            onClick={() => {
                                if (window.electronAPI) {
                                    window.electronAPI.quitApp();
                                } else {
                                    navigate('/');
                                }
                            }}
                            className="btn btn-primary w-full sm:w-auto"
                        >
                            <Home className="w-4 h-4" /> {window.electronAPI ? 'Close application' : 'Go to home'}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default NotFound;
