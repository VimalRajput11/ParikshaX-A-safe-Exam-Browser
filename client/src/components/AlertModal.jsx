import React from 'react';
import { AlertCircle, CheckCircle2, Info, XCircle } from 'lucide-react';

function AlertModal({ isOpen, onClose, title, message, type = 'error' }) {
    if (!isOpen) return null;

    const config = {
        error: {
            icon: <XCircle className="w-8 h-8 text-red-500" />,
            bg: 'bg-red-500/10',
            button: 'bg-red-600 hover:bg-red-700 shadow-red-500/20'
        },
        success: {
            icon: <CheckCircle2 className="w-8 h-8 text-emerald-500" />,
            bg: 'bg-emerald-500/10',
            button: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
        },
        warning: {
            icon: <AlertCircle className="w-8 h-8 text-amber-500" />,
            bg: 'bg-amber-500/10',
            button: 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20'
        },
        info: {
            icon: <Info className="w-8 h-8 text-cyan-500" />,
            bg: 'bg-cyan-500/10',
            button: 'bg-cyan-600 hover:bg-cyan-700 shadow-cyan-500/20'
        }
    };

    const current = config[type] || config.error;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[999] p-4">
            <div className="bg-gray-900 border border-gray-800 rounded-3xl max-w-sm w-full p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex flex-col items-center text-center">
                    <div className={`w-20 h-20 ${current.bg} rounded-full flex items-center justify-center mb-6`}>
                        {current.icon}
                    </div>

                    <h3 className="text-2xl font-black text-white mb-2 tracking-tight">{title}</h3>
                    <p className="text-gray-400 mb-8 leading-relaxed">{message}</p>

                    <button
                        onClick={onClose}
                        className={`w-full py-4 rounded-2xl ${current.button} text-white font-bold transition-all transform active:scale-95 shadow-lg`}
                    >
                        Got it, Thanks
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AlertModal;
