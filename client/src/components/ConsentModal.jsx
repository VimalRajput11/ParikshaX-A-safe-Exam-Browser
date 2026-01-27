import React, { useState } from 'react';
import { Shield, CheckCircle } from 'lucide-react';

function ConsentModal({ onAccept, onDecline }) {
    const [understood, setUnderstood] = useState(false);

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-2xl w-full p-8 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                    <Shield className="w-8 h-8 text-cyan-500" />
                    <h2 className="text-2xl font-bold">Exam Monitoring Consent</h2>
                </div>

                <div className="space-y-4 text-gray-300 mb-6 max-h-96 overflow-y-auto pr-2">
                    <p className="text-lg font-semibold text-white">
                        Before starting your exam, please review and accept the following:
                    </p>

                    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                        <h3 className="font-bold text-white mb-2">What We Monitor:</h3>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                            <li>Tab switching and window focus changes</li>
                            <li>Face presence (not facial recognition or identification)</li>
                            <li>Attention direction (gaze tracking for attention only)</li>
                            <li>Audio activity patterns (no recording or content storage)</li>
                            <li>Screen activity and exam environment</li>
                        </ul>
                    </div>

                    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                        <h3 className="font-bold text-white mb-2">What We DON'T Store:</h3>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                            <li>Video recordings or camera images</li>
                            <li>Audio recordings or voice data</li>
                            <li>Biometric identifiers or facial recognition data</li>
                            <li>Screenshots of your screen</li>
                        </ul>
                    </div>

                    <div className="bg-cyan-900/20 p-4 rounded-lg border border-cyan-700/50">
                        <h3 className="font-bold text-cyan-400 mb-2">Privacy Guarantee:</h3>
                        <p className="text-sm">
                            We only log <strong>event types, timestamps, and durations</strong>.
                            All data is encrypted and used solely to generate an integrity report.
                            No automatic cheating accusations are made—all reports are human-reviewed.
                        </p>
                    </div>

                    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                        <h3 className="font-bold text-white mb-2">Your Rights:</h3>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                            <li>You can request deletion of your monitoring data after the exam</li>
                            <li>You have the right to review your integrity report</li>
                            <li>You can appeal any flagged behavior with human review</li>
                            <li>Your data is protected under applicable data protection laws</li>
                        </ul>
                    </div>
                </div>

                <div className="flex items-center gap-3 mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
                    <input
                        type="checkbox"
                        id="consent-check"
                        checked={understood}
                        onChange={(e) => setUnderstood(e.target.checked)}
                        className="w-5 h-5 text-cyan-500 rounded focus:ring-cyan-500"
                    />
                    <label htmlFor="consent-check" className="text-sm cursor-pointer">
                        I have read and understood the monitoring policy. I consent to the collection
                        of behavioral data as described above for exam integrity purposes.
                    </label>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={onAccept}
                        disabled={!understood}
                        className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2
              ${understood
                                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:shadow-lg hover:shadow-cyan-500/20 text-white'
                                : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
                    >
                        <CheckCircle className="w-5 h-5" />
                        Accept & Continue
                    </button>
                    <button
                        onClick={onDecline}
                        className="px-6 py-3 rounded-xl border border-gray-600 hover:border-gray-400 bg-gray-800 hover:bg-gray-700 font-bold text-white transition-all"
                    >
                        Decline
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConsentModal;
