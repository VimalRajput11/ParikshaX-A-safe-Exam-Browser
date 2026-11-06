import React from 'react';
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';

function AlertModal({ isOpen, onClose, title, message, type = 'error' }) {
    if (!isOpen) return null;

    const config = {
        error: {
            icon: <XCircle className="w-6 h-6 text-red-600" />,
            bg: 'bg-red-50',
            button: 'btn-danger'
        },
        success: {
            icon: <CheckCircle2 className="w-6 h-6 text-emerald-600" />,
            bg: 'bg-emerald-50',
            button: 'btn-success'
        },
        warning: {
            icon: <AlertTriangle className="w-6 h-6 text-amber-600" />,
            bg: 'bg-amber-50',
            button: 'btn-primary'
        },
        info: {
            icon: <Info className="w-6 h-6 text-brand-600" />,
            bg: 'bg-brand-50',
            button: 'btn-primary'
        }
    };

    const current = config[type] || config.error;

    return (
        <div className="modal-backdrop z-[999]" role="alertdialog" aria-modal="true" aria-labelledby="alert-title">
            <div className="modal-panel max-w-md p-6">
                <div className="flex gap-4">
                    <div className={`w-11 h-11 ${current.bg} rounded-full flex items-center justify-center shrink-0`}>
                        {current.icon}
                    </div>
                    <div className="min-w-0 pt-0.5">
                        <h3 id="alert-title" className="text-lg font-semibold text-slate-900">{title}</h3>
                        <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">{message}</p>
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <button onClick={onClose} className={`btn ${current.button} min-w-[96px]`} autoFocus>
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AlertModal;
