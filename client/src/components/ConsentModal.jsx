import React, { useState } from 'react';
import { ShieldCheck, Eye, EyeOff, Lock, Scale } from 'lucide-react';

const Section = ({ icon: Icon, title, children }) => (
    <div className="rounded-lg border border-slate-200 p-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-2">
            <Icon className="w-4 h-4 text-slate-500" /> {title}
        </h3>
        {children}
    </div>
);

function ConsentModal({ onAccept, onDecline }) {
    const [understood, setUnderstood] = useState(false);

    return (
        <div className="modal-backdrop z-50" role="dialog" aria-modal="true" aria-labelledby="consent-title">
            <div className="modal-panel max-w-2xl flex flex-col max-h-[92vh]">
                <div className="flex items-start gap-4 px-6 py-5 border-b border-slate-200">
                    <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-5 h-5 text-brand-600" />
                    </div>
                    <div>
                        <h2 id="consent-title" className="text-lg font-semibold text-slate-900">Remote Proctoring Consent</h2>
                        <p className="text-sm text-slate-500 mt-0.5">Please review how this exam is monitored before you begin.</p>
                    </div>
                </div>

                <div className="px-6 py-5 space-y-3 overflow-y-auto text-sm text-slate-600">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Section icon={Eye} title="What we monitor">
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Tab switching and window focus changes</li>
                                <li>Face presence in front of the camera</li>
                                <li>Attention direction (gaze)</li>
                                <li>Audio activity patterns</li>
                                <li>Exam screen environment</li>
                            </ul>
                        </Section>
                        <Section icon={EyeOff} title="What we don't store">
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Video or audio recordings</li>
                                <li>Voice data</li>
                                <li>Biometric identifiers</li>
                                <li>Screenshots of your screen</li>
                            </ul>
                        </Section>
                    </div>

                    <Section icon={Lock} title="Privacy">
                        <p>
                            Only <strong className="text-slate-800">event types, timestamps and durations</strong> are logged.
                            Data is encrypted and used solely to produce an integrity report. No automated cheating
                            decisions are made — every report is reviewed by a person.
                        </p>
                    </Section>

                    <Section icon={Scale} title="Your rights">
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Request deletion of your monitoring data after the exam</li>
                            <li>Review your integrity report</li>
                            <li>Appeal any flagged behaviour through human review</li>
                            <li>Protection under applicable data-protection laws</li>
                        </ul>
                    </Section>
                </div>

                <div className="px-6 py-5 border-t border-slate-200 bg-slate-50 rounded-b-xl space-y-4">
                    <label htmlFor="consent-check" className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            id="consent-check"
                            checked={understood}
                            onChange={(e) => setUnderstood(e.target.checked)}
                            className="checkbox mt-0.5"
                        />
                        <span className="text-sm text-slate-700">
                            I have read and understood the monitoring policy and consent to the collection of
                            behavioural data described above for exam-integrity purposes.
                        </span>
                    </label>

                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                        <button onClick={onDecline} className="btn btn-secondary">
                            Decline
                        </button>
                        <button onClick={onAccept} disabled={!understood} className="btn btn-primary">
                            Accept &amp; Continue
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ConsentModal;
