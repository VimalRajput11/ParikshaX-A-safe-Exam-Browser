import React from 'react';
import { Send } from 'lucide-react';

function ConfirmationModal({ isOpen, onConfirm, onCancel, title, message }) {
    if (!isOpen) return null;

    return (
        <div className="modal-backdrop z-[100]" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
            <div className="modal-panel max-w-md p-6">
                <div className="flex gap-4">
                    <div className="w-11 h-11 bg-brand-50 rounded-full flex items-center justify-center shrink-0">
                        <Send className="w-5 h-5 text-brand-600" />
                    </div>
                    <div className="min-w-0 pt-0.5">
                        <h3 id="confirm-title" className="text-lg font-semibold text-slate-900">{title}</h3>
                        <p className="mt-1.5 text-sm text-slate-600 leading-relaxed whitespace-pre-line">{message}</p>
                    </div>
                </div>
                <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                    <button onClick={onCancel} className="btn btn-secondary">
                        Continue Exam
                    </button>
                    <button onClick={onConfirm} className="btn btn-primary">
                        Submit &amp; Finish
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmationModal;
