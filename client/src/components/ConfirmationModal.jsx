import React from 'react';
import { AlertCircle } from 'lucide-react';

function ConfirmationModal({ isOpen, onConfirm, onCancel, title, message }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                        <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                    <p className="text-gray-400 mb-8 whitespace-pre-line">{message}</p>

                    <div className="flex gap-4 w-full">
                        <button
                            onClick={onCancel}
                            className="flex-1 py-3 px-4 rounded-xl border border-gray-600 hover:border-gray-500 bg-transparent text-gray-300 font-semibold transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg hover:shadow-red-500/20 transition-all"
                        >
                            Yes, Submit & Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ConfirmationModal;
