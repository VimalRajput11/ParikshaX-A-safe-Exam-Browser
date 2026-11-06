import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Hash, ArrowRight, Camera, ClipboardCheck } from 'lucide-react';
import { API_BASE_URL } from '../config';
import AlertModal from '../components/AlertModal';
import BrandMark from '../components/BrandMark';

const FEATURES = [
    { icon: Lock, title: 'Lockdown environment', text: 'Fullscreen mode with tab and focus monitoring.' },
    { icon: Camera, title: 'Remote proctoring', text: 'Camera-based identity verification throughout.' },
    { icon: ClipboardCheck, title: 'Guided experience', text: 'Clear instructions and section timers before you start.' },
];

function LandingPage() {
    const navigate = useNavigate();

    useEffect(() => {
        // Auto-redirect if session is active or recently submitted
        const isRegistered = localStorage.getItem('isRegistered') === 'true';
        const hasSession = localStorage.getItem('sessionId');
        if (isRegistered && hasSession) {
            navigate('/exam');
        }
    }, [navigate]);

    const [examCode, setExamCode] = useState('');
    const [candidateId, setCandidateId] = useState('');
    const [loading, setLoading] = useState(false);

    // Custom Alert State
    const [alertConfig, setAlertConfig] = useState({ isOpen: false, title: '', message: '', type: 'error', onClose: null });

    const showAlert = (title, message, type = 'error', onClose = null) => {
        setAlertConfig({ isOpen: true, title, message, type, onClose });
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        // Student Validation against Server
        if (!examCode || !candidateId) {
            showAlert('Missing details', 'Please enter both your Exam Code and Candidate ID.', 'warning');
            return;
        }

        setLoading(true);
        try {
            // Verify Exam
            const examRes = await fetch(`${API_BASE_URL}/exams/${examCode}`);
            if (!examRes.ok) throw new Error('Invalid Exam Code');
            const examData = await examRes.json();
            if (!examData.success) throw new Error('Exam not found');

            // Verify Student
            const studentRes = await fetch(`${API_BASE_URL}/students/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentId: candidateId,
                    examId: examData.exam._id
                })
            });

            const studentData = await studentRes.json();
            if (!studentRes.ok) throw new Error(studentData.error || 'Invalid Candidate ID');
            if (!studentData.success) throw new Error('Student not found');

            localStorage.setItem('isRegistered', 'true');
            localStorage.setItem('examId', examData.exam._id);
            localStorage.setItem('studentId', studentData.student._id);
            localStorage.setItem('studentName', studentData.student.name);
            localStorage.removeItem('sessionId'); // Clear old session ID before starting new

            if (window.electronAPI) {
                window.electronAPI.setExamMode();
                setTimeout(() => navigate('/exam'), 150);
            } else {
                navigate('/exam');
            }

        } catch (error) {
            console.error(error);
            setLoading(false);
            const isAccessDenied = error.message.toLowerCase().includes('already completed') || error.message.toLowerCase().includes('not assigned');

            showAlert(
                isAccessDenied ? 'Access denied' : 'Sign in failed',
                error.message || 'Something went wrong. Please check your details.',
                'error',
                () => {
                    if (isAccessDenied && window.electronAPI) {
                        window.electronAPI.quitApp();
                    }
                }
            );
        }
    };

    return (
        <div className="min-h-screen bg-white text-slate-900 flex select-none drag-none">

            {/* Left — Brand panel */}
            <aside className="hidden lg:flex lg:w-[44%] xl:w-[40%] relative flex-col justify-between bg-slate-900 text-white p-12 overflow-hidden">
                <div
                    className="absolute inset-0 opacity-[0.07] pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}
                />
                <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-brand-600/30 blur-3xl pointer-events-none" />

                <div className="relative">
                    <BrandMark tone="light" subtitle="Secure Assessment Platform" size="lg" />
                </div>

                <div className="relative max-w-md">
                    <h1 className="text-3xl xl:text-4xl font-semibold leading-tight tracking-tight">
                        Fair, secure and reliable online examinations.
                    </h1>
                    <p className="mt-4 text-slate-400 leading-relaxed">
                        Sign in with the credentials provided by your institution to begin your proctored assessment.
                    </p>

                    <ul className="mt-10 space-y-5">
                        {FEATURES.map(({ icon: Icon, title, text }) => (
                            <li key={title} className="flex gap-4">
                                <div className="w-9 h-9 rounded-lg bg-white/10 ring-1 ring-white/10 flex items-center justify-center shrink-0">
                                    <Icon className="w-4 h-4 text-brand-300" />
                                </div>
                                <div>
                                    <div className="font-medium text-white">{title}</div>
                                    <div className="text-sm text-slate-400">{text}</div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="relative text-xs text-slate-500">
                    &copy; {new Date().getFullYear()} ParikshaX. All rights reserved.
                </div>
            </aside>

            {/* Right — Login form */}
            <main className="flex-1 flex flex-col min-h-screen">
                <div className="lg:hidden px-6 pt-6">
                    <BrandMark subtitle="Secure Assessment Platform" />
                </div>

                <div className="flex-1 flex items-center justify-center px-6 py-12">
                    <div className="w-full max-w-sm">
                        <div className="mb-8">
                            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Candidate sign in</h2>
                            <p className="mt-2 text-sm text-slate-500">Enter the exam code and candidate ID shared with you by your institution.</p>
                        </div>

                        <form className="space-y-5" onSubmit={handleLogin}>
                            <div>
                                <label htmlFor="examCode" className="label">Exam code</label>
                                <div className="relative">
                                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        id="examCode"
                                        type="text"
                                        autoComplete="off"
                                        value={examCode}
                                        onChange={(e) => setExamCode(e.target.value.replace(/\s/g, ''))}
                                        placeholder="e.g. EXAM-1234"
                                        className="input pl-10 font-mono tracking-wide placeholder:font-sans placeholder:tracking-normal"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="candidateId" className="label">Candidate ID</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        id="candidateId"
                                        type="text"
                                        autoComplete="off"
                                        value={candidateId}
                                        onChange={(e) => setCandidateId(e.target.value.replace(/\s/g, ''))}
                                        placeholder="Your candidate ID"
                                        className="input pl-10 font-mono tracking-wide placeholder:font-sans placeholder:tracking-normal"
                                    />
                                </div>
                            </div>

                            <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
                                {loading ? (
                                    <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Verifying…</>
                                ) : (
                                    <>Continue to exam <ArrowRight className="w-4 h-4" /></>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 leading-relaxed">
                            <span className="font-medium text-slate-800">Before you start:</span> make sure your camera works,
                            you are in a quiet, well-lit room, and you have a stable internet connection.
                        </div>
                    </div>
                </div>

                <footer className="px-6 py-5 border-t border-slate-100 flex flex-col sm:flex-row gap-2 items-center justify-between text-xs text-slate-500">
                    <span>Need help? Contact your exam administrator.</span>
                    <button
                        onClick={() => navigate('/admin/login')}
                        className="font-medium text-slate-500 hover:text-brand-600 transition-colors"
                    >
                        Administrator login
                    </button>
                </footer>
            </main>

            <AlertModal
                isOpen={alertConfig.isOpen}
                onClose={() => {
                    if (alertConfig.onClose) alertConfig.onClose();
                    setAlertConfig(prev => ({ ...prev, isOpen: false }));
                }}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
            />
        </div>
    );
}

export default LandingPage;
