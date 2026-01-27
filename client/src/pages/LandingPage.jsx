import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, User, Key, ChevronRight, Hash } from 'lucide-react';
import { API_BASE_URL } from '../config';

function LandingPage() {
    const navigate = useNavigate();

    const [examCode, setExamCode] = useState('');
    const [candidateId, setCandidateId] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();

        // Student Validation against Server
        if (!examCode || !candidateId) {
            alert('Please enter both Exam Code and Candidate ID.');
            return;
        }

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
                body: JSON.stringify({ studentId: candidateId })
            });
            if (!studentRes.ok) throw new Error('Invalid Candidate ID');
            const studentData = await studentRes.json();
            if (!studentData.success) throw new Error('Student not found');

            localStorage.setItem('isRegistered', 'true');
            if (window.electronAPI) window.electronAPI.setExamMode();

            // Store IDs for the exam session
            localStorage.setItem('examId', examData.exam._id);
            localStorage.setItem('studentId', studentData.student._id); // This is the mongo _id
            localStorage.setItem('studentName', studentData.student.name);

            navigate('/exam');

        } catch (error) {
            console.error(error);
            alert(error.message || 'Login Failed');
        }
    };

    return (
        <div className="h-screen bg-[#0f1115] text-white font-sans flex overflow-hidden select-none drag-none">

            {/* Left Decoration - Abstract Secure Graphic */}
            <div className="hidden lg:flex w-1/2 relative items-center justify-center bg-gray-900 border-r border-gray-800">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-900/20 via-transparent to-purple-900/20"></div>

                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-32 h-32 mb-8 rounded-3xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_50px_rgba(6,182,212,0.3)]">
                        <Shield className="w-16 h-16 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold mb-2 tracking-tight">ParikshaX</h1>
                    <p className="text-gray-400 font-medium">Secure Exam Environment</p>

                    <div className="mt-12 space-y-4 opacity-70">
                        <div className="flex items-center gap-3 text-sm text-gray-400">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span>System Integrity Check: <span className="text-green-400">Passed</span></span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-400">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span>Secure Boot: <span className="text-green-400">Enabled</span></span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-400">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span>App Version: <span className="text-green-400">v1.2.0</span></span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Panel */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
                <div className="max-w-md w-full">

                    <div className="mb-8">
                        <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
                        <p className="text-gray-500">Enter your credentials to access the secure exam.</p>
                    </div>

                    <form className="space-y-4" onSubmit={handleLogin}>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-400 uppercase ml-1">Exam Code</label>
                            <div className="relative">
                                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="text"
                                    value={examCode}
                                    onChange={(e) => setExamCode(e.target.value)}
                                    placeholder="EXAM-1234-5678"
                                    className="w-full bg-gray-800/50 border border-gray-700 focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-400 uppercase ml-1">Candidate ID</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="text"
                                    value={candidateId}
                                    onChange={(e) => setCandidateId(e.target.value)}
                                    placeholder="Enter your ID"
                                    className="w-full bg-gray-800/50 border border-gray-700 focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 transition-all outline-none"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 mt-6 active:scale-95"
                        >
                            Start Secure Exam
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm text-gray-500">
                        Protected by ParikshaX Secure Environment.
                        <br />
                        IP: 192.168.1.10 • Session: Secure
                    </p>

                    <div className="mt-8 pt-8 border-t border-gray-800 text-center">
                        <button
                            onClick={() => navigate('/admin/login')}
                            className="text-xs text-gray-600 hover:text-cyan-500 transition-colors uppercase tracking-widest font-bold"
                        >
                            Internal Admin Portal
                        </button>
                    </div>
                </div>

                {/* Window Controls (Mock for Kiosk feel) */}
                {!window.electronAPI && ( // Only show if not in real fullscreen/kiosk to verify UI
                    <div className="absolute top-4 right-4 flex gap-2 text-gray-600">
                    </div>
                )}
            </div>
        </div>
    );
}

export default LandingPage;
