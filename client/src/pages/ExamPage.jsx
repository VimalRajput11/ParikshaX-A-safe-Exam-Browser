import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Maximize, Monitor, Eye, Activity, ChevronLeft, ChevronRight, CheckCircle,
    Clock, ClipboardList, Play, AlertCircle, Shield
} from 'lucide-react';
import ConsentModal from '../components/ConsentModal';
import IntegrityReport from '../components/IntegrityReport';
import ConfirmationModal from '../components/ConfirmationModal';
import { API_BASE_URL } from '../config';
import AlertModal from '../components/AlertModal';

// Mock Questions Data
// MOCK_QUESTIONS removed in favor of dynamic state

function ExamPage() {
    const navigate = useNavigate();
    const [showConsent, setShowConsent] = useState(true);
    const [consentGiven, setConsentGiven] = useState(false);
    const [showInstructions, setShowInstructions] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [warnings, setWarnings] = useState([]);
    const [tabSwitches, setTabSwitches] = useState(0);
    const [focusLostTime, setFocusLostTime] = useState(0);
    const [isExamActive, setIsExamActive] = useState(false);
    const [sessionId, setSessionId] = useState(localStorage.getItem('sessionId'));
    const [showReport, setShowReport] = useState(false);
    const [finalReport, setFinalReport] = useState(null);
    const [integrityScore, setIntegrityScore] = useState(100);
    const [lockdownMode, setLockdownMode] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [stream, setStream] = useState(null);
    const [cameraConnected, setCameraConnected] = useState(false);
    const [sections, setSections] = useState([]);
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(parseInt(localStorage.getItem('timeLeft') || '0')); // in seconds
    const videoRef = useRef(null);

    // Custom Alert State
    const [alertConfig, setAlertConfig] = useState({ isOpen: false, title: '', message: '', type: 'error', onClose: null });

    const showAlert = (title, message, type = 'error', onClose = null) => {
        setAlertConfig({ isOpen: true, title, message, type, onClose });
    };

    // Question State
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState(JSON.parse(localStorage.getItem('userAnswers') || '{}'));

    const focusLostStartRef = useRef(null);

    useEffect(() => {
        const fetchExamData = async () => {
            const storedExamId = localStorage.getItem('examId');
            if (!storedExamId) return;
            try {
                const res = await fetch(`${API_BASE_URL}/exams/${storedExamId}`);
                const data = await res.json();
                if (data.success) {
                    if (data.exam.sections && data.exam.sections.length > 0) {
                        setSections(data.exam.sections);
                        setCurrentSectionIndex(0);
                        setQuestions(data.exam.sections[0].questions);
                        // Only set initial time if not resuming
                        if (!localStorage.getItem('timeLeft')) {
                            setTimeLeft(data.exam.sections[0].duration * 60);
                        }
                    } else if (data.exam.questions) {
                        setQuestions(data.exam.questions);
                        if (data.exam.duration && !localStorage.getItem('timeLeft')) {
                            setTimeLeft(data.exam.duration * 60);
                        }
                    }

                    // Auto-resume if session exists
                    const existingSessionId = localStorage.getItem('sessionId');
                    if (existingSessionId) {
                        try {
                            const sessionRes = await fetch(`${API_BASE_URL}/sessions/${existingSessionId}`);
                            const sessionData = await sessionRes.json();

                            if (sessionData.success && (sessionData.session.status === 'completed' || sessionData.session.status === 'submitted')) {
                                // Session is already over, clear and quit/redirect
                                localStorage.removeItem('sessionId');
                                if (window.electronAPI) {
                                    window.electronAPI.quitApp();
                                } else {
                                    navigate('/');
                                }
                                return;
                            }

                            setShowConsent(false);
                            setShowInstructions(false);
                            setIsExamActive(true);
                            setConsentGiven(true);
                        } catch (err) {
                            console.error('Session verify failed', err);
                        }
                    }
                }
            } catch (e) { console.error('Failed to load exam', e); }
        };
        fetchExamData();
        // Prompt for camera early
        startCamera();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        }
    }, []);

    const startCamera = async () => {
        try {
            if (stream) return;
            // Add a timeout or fallback for systems without a camera
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            }).catch(async (e) => {
                console.warn("Camera failed, trying audio only or skipping proctoring:", e);
                // Return null if no devices found
                return null;
            });

            if (mediaStream) {
                setStream(mediaStream);
                setCameraConnected(true);
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                    videoRef.current.play().catch(e => console.error(e));
                }
            } else {
                // No camera found, but we let them proceed (as requested)
                setCameraConnected(false);
            }
        } catch (err) {
            console.error("Camera access error:", err);
            setCameraConnected(false);
        }
    };

    // Ensure video ref is updated whenever stream or state changes
    useEffect(() => {
        if (stream && videoRef.current) {
            if (videoRef.current.srcObject !== stream) {
                videoRef.current.srcObject = stream;
                videoRef.current.play().catch(e => console.error("Auto-play failed:", e));
            }
        }
    }, [stream, isFullscreen, isExamActive, showInstructions]);

    // Robust ref callback to attach stream immediately upon mounting
    const handleVideoRef = React.useCallback((el) => {
        if (el) {
            videoRef.current = el;
            if (stream && el.srcObject !== stream) {
                el.srcObject = stream;
                el.play().catch(e => console.error("Manual play failed:", e));
            }
        }
    }, [stream]);

    // Unified Integrity Monitoring consolidated in the next useEffect


    const logEvent = async (eventType, duration = 0, severity = 'low') => {
        if (!sessionId) return;
        console.log(`[Integrity] Logging ${eventType}...`);
        try {
            const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/event`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ eventType, duration, severity })
            });
            const data = await response.json();
            if (data.success) {
                console.log(`[Integrity] Score Update: ${data.integrityScore}%`);
                setIntegrityScore(data.integrityScore);
            }
        } catch (error) {
            console.error('[Integrity] Error logging event:', error);
        }
    };

    useEffect(() => {
        if (!isExamActive) return;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                // User switched tabs or minimized
                setTabSwitches(prev => prev + 1);
                if (!focusLostStartRef.current) {
                    focusLostStartRef.current = Date.now();
                }
                addWarning("Security Alert: Tab switch detected! Return immediately.");
                logEvent('tab_switch', 0, 'medium');
            } else {
                // User returned
                if (focusLostStartRef.current) {
                    const duration = (Date.now() - focusLostStartRef.current) / 1000;
                    setFocusLostTime(prev => prev + duration);
                    // Only log if duration is significant to avoid jitter
                    if (duration > 0.5) {
                        logEvent('focus_lost', duration, duration > 10 ? 'high' : 'low');
                    }
                    focusLostStartRef.current = null;
                }
            }
        };

        const handleBlur = () => {
            // Window lost focus (could be an overlay or switching apps)
            if (!focusLostStartRef.current) {
                focusLostStartRef.current = Date.now();
                addWarning("Warning: Exam window lost focus! This event is logged.");
            }
        };

        const handleFocus = () => {
            // Window regained focus
            if (focusLostStartRef.current) {
                const duration = (Date.now() - focusLostStartRef.current) / 1000;
                setFocusLostTime(prev => prev + duration);
                if (duration > 0.5) {
                    logEvent('focus_lost', duration, duration > 10 ? 'high' : 'low');
                }
                focusLostStartRef.current = null;
            }
        };

        const handleContextMenu = (e) => e.preventDefault();
        const handleCopyPaste = (e) => {
            e.preventDefault();
            addWarning("Security violation: Copy/Paste is disabled.");
            logEvent('warning_shown', 0, 'low');
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("blur", handleBlur);
        window.addEventListener("focus", handleFocus);
        document.addEventListener("contextmenu", handleContextMenu);
        document.addEventListener("copy", handleCopyPaste);
        document.addEventListener("paste", handleCopyPaste);
        document.addEventListener("cut", handleCopyPaste);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("blur", handleBlur);
            window.removeEventListener("focus", handleFocus);
            document.removeEventListener("contextmenu", handleContextMenu);
            document.removeEventListener("copy", handleCopyPaste);
            document.removeEventListener("paste", handleCopyPaste);
            document.removeEventListener("cut", handleCopyPaste);
        };
    }, [isExamActive, sessionId]);

    useEffect(() => {
        const handleFullscreenChange = () => {
            if (!document.fullscreenElement && isExamActive) {
                setLockdownMode(true);
                logEvent('environment_breach', 0, 'high');
            }
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, [isExamActive, sessionId]);

    // Timer Countdown Effect
    useEffect(() => {
        let interval = null;
        if (isExamActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        handleSectionExpiry();
                        return 0;
                    }
                    localStorage.setItem('timeLeft', prev - 1); // Persist time
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isExamActive, timeLeft]);


    // Live Snapshot Broadcaster
    useEffect(() => {
        if (!isExamActive || !sessionId || !stream) return;

        const captureFrame = async () => {
            if (!videoRef.current) return;

            // Check if video is playing
            if (videoRef.current.readyState < 2) return;

            try {
                const canvas = document.createElement('canvas');
                canvas.width = 320;
                canvas.height = 240;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
                const snapshot = canvas.toDataURL('image/jpeg', 0.4); // High compression for speed

                const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/snapshot`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ snapshot })
                });

                // Snapshot uploaded successfully
            } catch (err) {
                console.warn('[Snapshot] Upload error:', err.message);
            }
        };

        // Capture immediately then every 2 seconds
        captureFrame();
        const interval = setInterval(captureFrame, 2000);
        return () => clearInterval(interval);
    }, [isExamActive, sessionId, stream]);

    const handleSectionExpiry = () => {
        if (sections.length > 0 && currentSectionIndex < sections.length - 1) {
            const nextIndex = currentSectionIndex + 1;
            setCurrentSectionIndex(nextIndex);
            setQuestions(sections[nextIndex].questions);
            setCurrentQuestionIndex(0);
            setTimeLeft(sections[nextIndex].duration * 60);
            addWarning(`Time for ${sections[currentSectionIndex].title} is over! Moving to ${sections[nextIndex].title}.`);
        } else {
            // Auto-submit directly when time is up
            confirmAndExit();
        }
    };

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const restoreFullscreen = () => {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen().then(() => {
                setLockdownMode(false);
                if (navigator.keyboard && navigator.keyboard.lock) {
                    try { navigator.keyboard.lock(['Escape']); } catch (e) { console.log(e); }
                }
            });
        }
    };

    const addWarning = (msg) => {
        setWarnings(prev => [{ id: Date.now(), msg }, ...prev].slice(0, 5));
    };

    const handleConsentAccept = async () => {
        setConsentGiven(true);
        try {
            const response = await fetch(`${API_BASE_URL}/sessions/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    examId: localStorage.getItem('examId'),
                    studentId: localStorage.getItem('studentId'),
                    consentGiven: true
                })
            });
            const data = await response.json();
            if (data.success) {
                setSessionId(data.sessionId);
                localStorage.setItem('sessionId', data.sessionId); // Save for persistence
                setShowConsent(false); // Only hide if success
                setShowInstructions(true); // Show instructions after session start
            } else {
                showAlert('Access Denied', data.error, 'error', () => {
                    if (window.electronAPI) {
                        window.electronAPI.quitApp();
                    } else {
                        navigate('/');
                    }
                });
            }
        } catch (error) {
            console.error('Error starting session:', error);
            showAlert('Connection Error', 'Failed to reach proctoring servers. Please check your internet.', 'error');
        }
    };

    const handleConsentDecline = () => {
        showAlert('Consent Required', 'You must accept the proctoring agreement to proceed with the exam.', 'warning');
    };

    const handleStartExam = () => {
        setShowInstructions(false);
        enterFullscreen();
    };

    const enterFullscreen = () => {
        if (!consentGiven) {
            showAlert('Setup Incomplete', 'Please accept the monitoring consent before entering secure mode.', 'warning');
            return;
        }

        const proceedToExam = () => {
            if (!sessionId) {
                showAlert('Session Expired', 'Your session has timed out. Please log in again.', 'error', () => navigate('/'));
                return;
            }
            setIsFullscreen(true);
            setIsExamActive(true);
            if (navigator.keyboard && navigator.keyboard.lock) {
                try { navigator.keyboard.lock(['Escape']); } catch (e) { }
            }
        };

        // If in Electron, it's already in Kiosk/Fullscreen. Proceed regardless of API status.
        if (window.electronAPI) {
            window.electronAPI.setExamMode();
            proceedToExam();
            return;
        }

        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen({ navigationUI: "hide" })
                .then(proceedToExam)
                .catch((err) => {
                    console.warn("Fullscreen with navigationUI hidden failed, retrying standard...");
                    elem.requestFullscreen()
                        .then(proceedToExam)
                        .catch(err2 => {
                            console.error("Fullscreen failed:", err2);
                            proceedToExam(); // Fallback: Proceed even if fullscreen fails
                        });
                });
        } else {
            proceedToExam();
        }
    };

    const [isSubmitted, setIsSubmitted] = useState(false); // Add submission state

    const initiateExit = () => {
        setShowConfirmModal(true);
    };

    const confirmAndExit = async () => {
        setShowConfirmModal(false);
        setIsExamActive(false);
        setIsSubmitted(true); // switch to success screen immediately
        localStorage.removeItem('sessionId');
        localStorage.removeItem('isRegistered');
        localStorage.removeItem('timeLeft');
        localStorage.removeItem('userAnswers');

        if (document.exitFullscreen) {
            try { await document.exitFullscreen(); } catch (e) { }
        }
        setIsFullscreen(false);

        // Stop Camera Streams
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }

        if (sessionId) {
            try {
                await fetch(`${API_BASE_URL}/sessions/${sessionId}/end`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ answers: userAnswers })
                });
            } catch (error) {
                console.error('Error ending session:', error);
            }
        }
    };

    // Navigation Handlers
    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            // Last question reached in current section
            if (sections.length > 0 && currentSectionIndex < sections.length - 1) {
                // Move to next section
                const nextIndex = currentSectionIndex + 1;
                setCurrentSectionIndex(nextIndex);
                setQuestions(sections[nextIndex].questions);
                setCurrentQuestionIndex(0);
                setTimeLeft(sections[nextIndex].duration * 60);
            } else {
                // Truly the end of the assessment
                initiateExit();
            }
        }
    };

    const handlePrev = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleOptionSelect = (option) => {
        const updatedAnswers = {
            ...userAnswers,
            [questions[currentQuestionIndex]._id || questions[currentQuestionIndex].id]: option
        };
        setUserAnswers(updatedAnswers);
        localStorage.setItem('userAnswers', JSON.stringify(updatedAnswers));
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-[#0f1115] text-white flex flex-col items-center justify-center p-4">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
                <div className="bg-gray-800/50 backdrop-blur-xl p-12 rounded-[40px] shadow-2xl max-w-lg w-full text-center border border-white/5 relative z-10">
                    <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
                        <CheckCircle className="w-12 h-12 text-green-500" />
                    </div>
                    <h1 className="text-4xl font-black mb-4 tracking-tighter">SUCCESSFULLY SUBMITTED</h1>
                    <p className="text-gray-400 mb-10 text-lg leading-relaxed">
                        Your assessment responses have been securely encrypted and transmitted to the central server.
                    </p>
                    <div className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 p-4 rounded-2xl mb-10 text-sm font-bold uppercase tracking-widest">
                        Integrity Verified: SECURE
                    </div>
                    <button
                        onClick={() => {
                            if (window.electronAPI) {
                                window.electronAPI.quitApp();
                            } else {
                                // Attempt to close, fallback to blank
                                window.open('', '_self', '');
                                window.close();
                                window.location.href = 'about:blank';
                            }
                        }}
                        className="w-full py-5 rounded-3xl bg-white text-black font-black text-xl hover:bg-cyan-500 hover:text-white transition-all transform active:scale-95 shadow-xl shadow-white/5"
                    >
                        Close Browser
                    </button>
                    {/* Subtle footer */}
                    <div className="mt-8 text-[10px] text-gray-600 font-bold tracking-[0.3em] uppercase">
                        ParikshaX Secure Protocol v1.0
                    </div>
                </div>
            </div>
        );
    }

    if (questions.length === 0) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading Exam...</div>;

    const currentQuestion = questions[currentQuestionIndex];
    const isLastQuestionOfSection = currentQuestionIndex === questions.length - 1;
    const isLastSection = sections.length > 0 ? (currentSectionIndex === sections.length - 1) : true;
    const isFinalSubmit = isLastQuestionOfSection && isLastSection;

    if (showInstructions) {
        const totalDuration = sections.reduce((acc, s) => acc + s.duration, 0);
        const totalQuestions = sections.reduce((acc, s) => acc + s.questions.length, 0);

        return (
            <div className="min-h-screen bg-[#0f1115] text-white flex items-center justify-center p-6">
                <div className="max-w-4xl w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Info */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8 backdrop-blur-sm">
                                <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Assessment Overview</h1>
                                <p className="text-gray-400 mb-8 border-b border-gray-700 pb-4">Please read the section details and instructions carefully.</p>

                                <div className="space-y-4">
                                    {sections.map((section, idx) => (
                                        <div key={idx} className="bg-gray-900/50 border border-gray-700 rounded-xl p-5 flex items-center justify-between group hover:border-cyan-500/50 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-cyan-400 font-bold font-mono">
                                                    0{idx + 1}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-lg text-white">{section.title}</div>
                                                    <div className="text-sm text-gray-500 uppercase tracking-widest font-medium">Part {idx + 1} of Assessment</div>
                                                </div>
                                            </div>
                                            <div className="flex gap-8 text-right">
                                                <div>
                                                    <div className="text-xs text-gray-500 uppercase">Questions</div>
                                                    <div className="font-bold text-white">{section.questions.length} Qs</div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-gray-500 uppercase">Time limit</div>
                                                    <div className="font-bold text-cyan-400">{section.duration} Mins</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-blue-900/10 border border-blue-500/20 rounded-2xl p-6 flex flex-col sm:flex-row gap-6 items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-500/20 rounded-full text-blue-400"><Shield className="w-6 h-6" /></div>
                                    <div>
                                        <div className="font-bold">AI Proctoring Active</div>
                                        <div className="text-sm text-gray-400">Environment and browser monitoring enabled.</div>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="text-center">
                                        <div className="text-sm text-gray-500">Total Qs</div>
                                        <div className="font-bold">{totalQuestions}</div>
                                    </div>
                                    <div className="w-px h-10 bg-gray-700"></div>
                                    <div className="text-center">
                                        <div className="text-sm text-gray-500">Duration</div>
                                        <div className="font-bold">{totalDuration}m</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Actions */}
                        <div className="space-y-6">
                            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
                                <h3 className="font-bold mb-4 flex items-center gap-2"><AlertCircle className="w-4 h-4 text-orange-400" /> Key Rules</h3>
                                <ul className="space-y-3 text-sm text-gray-400">
                                    <li className="flex gap-2"><span>•</span> Fullscreen mode is mandatory.</li>
                                    <li className="flex gap-2"><span>•</span> No tab switching or window resizing.</li>
                                    <li className="flex gap-2"><span>•</span> Sections are sequential. Once finished, you cannot go back.</li>
                                    <li className="flex gap-2"><span>•</span> Ensure stable internet & camera access.</li>
                                </ul>
                            </div>

                            {/* Pre-exam Camera Verification */}
                            <div className="bg-black/40 border border-gray-700 rounded-2xl overflow-hidden aspect-video relative group">
                                <video
                                    ref={handleVideoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]"
                                />
                                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-green-500/20 text-green-400 text-[10px] font-mono border border-green-500/30">
                                    PREVIEW ACTIVE
                                </div>
                            </div>

                            <button
                                onClick={handleStartExam}
                                className="w-full group relative overflow-hidden bg-cyan-600 hover:bg-cyan-500 rounded-2xl p-8 transition-all shadow-xl hover:shadow-cyan-500/20"
                            >
                                <div className="relative z-10 flex flex-col items-center gap-2">
                                    <Play className="w-12 h-12 text-white fill-white mb-2 group-hover:scale-110 transition-transform" />
                                    <span className="text-2xl font-black text-white uppercase tracking-tighter">Start Assessment</span>
                                    <span className="text-cyan-200 text-xs font-medium uppercase tracking-widest">
                                        {cameraConnected ? 'Entry to secure mode' : 'Proceeding without Camera'}
                                    </span>
                                </div>
                                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }


    return (
        <div
            className={`min-h-screen ${isFullscreen ? 'bg-black text-white' : 'bg-gray-900 text-white'} font-sans flex flex-col select-none drag-none`}
            onCopy={(e) => {
                e.preventDefault();
                return false;
            }}
            onContextMenu={(e) => {
                e.preventDefault();
                return false;
            }}
        >

            {lockdownMode && (
                <div className="fixed inset-0 bg-red-900 z-50 flex items-center justify-center p-4">
                    <div className="bg-gray-900 p-8 rounded-2xl shadow-2xl max-w-2xl w-full text-center border-2 border-red-500 animate-pulse">
                        <Activity className="w-24 h-24 text-red-500 mx-auto mb-6" />
                        <h1 className="text-4xl font-bold mb-4 text-red-500">EXAM PAUSED</h1>
                        <h2 className="text-2xl font-bold mb-4 text-white">Environment Lockdown Breached</h2>
                        <p className="text-gray-300 mb-6 text-lg">
                            You have exited fullscreen mode. This incident has been logged.
                            <br />
                            You cannot continue the exam until you return to fullscreen.
                        </p>

                        <div className="bg-gray-800/80 rounded-2xl p-6 mb-8 border border-gray-700">
                            <div className="text-xs text-gray-500 uppercase tracking-widest mb-2 font-bold">Current Integrity Status</div>
                            <div className="flex items-center justify-center gap-4">
                                <div className={`text-4xl font-black ${integrityScore >= 80 ? 'text-green-500' : integrityScore >= 60 ? 'text-yellow-500' : 'text-red-500'}`}>
                                    {integrityScore}%
                                </div>
                                <div className="text-left">
                                    <div className={`text-xs font-black uppercase tracking-wider ${integrityScore >= 60 ? 'text-green-500/50' : 'text-red-500/50'}`}>
                                        {integrityScore >= 60 ? 'Protocol Intact' : 'High Risk Level'}
                                    </div>
                                    <div className="text-[10px] text-gray-500 font-mono">ID: {sessionId?.substring(0, 8)}...</div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={restoreFullscreen}
                            className="w-full py-5 rounded-2xl bg-red-600 hover:bg-red-700 font-black text-white text-xl transition-all shadow-xl shadow-red-900/40 active:scale-95"
                        >
                            Return to Fullscreen to Continue
                        </button>
                    </div>
                </div>
            )}

            {showConsent && (
                <ConsentModal
                    onAccept={handleConsentAccept}
                    onDecline={handleConsentDecline}
                />
            )}

            <ConfirmationModal
                isOpen={showConfirmModal}
                title="Submit Assessment?"
                message="Are you sure you want to submit your exam? This action cannot be undone. The secure browser will close immediately after submission."
                onConfirm={confirmAndExit}
                onCancel={() => setShowConfirmModal(false)}
            />

            {!isFullscreen ? (
                <div className="flex-1 flex flex-col items-center justify-center p-4">
                    <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-2xl w-full text-center border border-gray-700">
                        <Monitor className="w-16 h-16 text-cyan-500 mx-auto mb-6" />
                        <h1 className="text-3xl font-bold mb-4">Environment Setup Check</h1>
                        <p className="text-gray-400 mb-8">
                            Before starting the exam, please ensure you are in a quiet room.
                            The system will enforce fullscreen mode and monitor tab switching.
                        </p>
                        <div className="space-y-4 text-left bg-gray-900/50 p-6 rounded-lg mb-8 border border-gray-700">
                            <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${cameraConnected ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></div>
                                <span>{cameraConnected ? 'Camera & Microphone Connected' : 'Camera Disconnected'}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${consentGiven ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`}></div>
                                <span>{consentGiven ? 'Consent Given' : 'Waiting for Consent'}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse"></div>
                                <span>Waiting for Fullscreen</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            {!cameraConnected && (
                                <button
                                    onClick={startCamera}
                                    className="w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white"
                                >
                                    <Eye className="w-5 h-5" />
                                    Try Connecting Camera
                                </button>
                            )}

                            <button
                                onClick={enterFullscreen}
                                disabled={!consentGiven}
                                className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2
                                ${consentGiven
                                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:shadow-lg hover:shadow-cyan-500/20'
                                        : 'bg-gray-700 cursor-not-allowed opacity-50'}`}
                            >
                                <Maximize className="w-5 h-5" />
                                {cameraConnected ? 'Enter Fullscreen Mode & Start Exam' : 'Enter Secure Mode (No Camera)'}
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col relative h-screen">
                    {/* Header */}
                    <header className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6 select-none shrink-0">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-xl text-cyan-400">ParikshaX</span>
                            <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 font-bold animate-pulse">REC</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Current Section</div>
                            <div className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold text-sm">
                                {sections[currentSectionIndex]?.title || 'Assessment'}
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className={`relative flex items-center justify-center w-48 h-10 rounded-xl overflow-hidden border transition-all duration-500 bg-gray-900/50 ${timeLeft < 60 ? 'border-red-500 shadow-lg shadow-red-500/20' : 'border-cyan-500/30'}`}>
                                <div
                                    className={`absolute left-0 top-0 h-full transition-all duration-1000 ${timeLeft < 60 ? 'bg-red-500/20' : 'bg-cyan-500/10'}`}
                                    style={{ width: `${(timeLeft / (sections[currentSectionIndex]?.duration * 60 || 3600)) * 100}%` }}
                                ></div>
                                <div className="relative z-10 flex items-center gap-2">
                                    <Clock className={`w-4 h-4 ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-cyan-400'}`} />
                                    <span className={`text-xl font-mono font-black tracking-widest ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                                        {formatTime(timeLeft)}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="w-32"></div> {/* Spacer for alignment */}
                    </header>

                    <div className="flex flex-1 overflow-hidden">
                        {/* Main Exam Area */}
                        <main className="flex-1 p-8 flex flex-col max-w-5xl mx-auto w-full">

                            {/* Question Progress */}
                            <div className="mb-6 flex items-center justify-between">
                                <div className="text-lg text-gray-400">
                                    Question <span className="text-white font-bold">{currentQuestionIndex + 1}</span> of {questions.length}
                                </div>
                                <div className="flex gap-1">
                                    {questions.map((_, idx) => (
                                        <div
                                            key={idx}
                                            className={`w-3 h-3 rounded-full ${idx === currentQuestionIndex ? 'bg-cyan-500' :
                                                userAnswers[questions[idx]._id || idx] ? 'bg-green-500/50' : 'bg-gray-700'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Question Card */}
                            <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 flex-1 flex flex-col shadow-xl">
                                <h2 className="text-2xl font-bold mb-8 leading-relaxed">
                                    {currentQuestion.questionText}
                                </h2>

                                <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                                    {currentQuestion.options.map((opt, i) => (
                                        <label
                                            key={i}
                                            className={`flex items-center gap-4 p-5 rounded-xl cursor-pointer border-2 transition-all group
                                                ${userAnswers[currentQuestion._id] === opt
                                                    ? 'bg-cyan-900/20 border-cyan-500 shadow-lg shadow-cyan-900/20'
                                                    : 'bg-gray-900/50 border-gray-700 hover:border-gray-500 hover:bg-gray-700/50'}`
                                            }
                                        >
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0
                                                ${userAnswers[currentQuestion._id] === opt
                                                    ? 'border-cyan-500 bg-cyan-500'
                                                    : 'border-gray-500 group-hover:border-gray-400'}`
                                            }>
                                                {userAnswers[currentQuestion._id] === opt && <CheckCircle className="w-4 h-4 text-white" />}
                                            </div>
                                            <input
                                                type="radio"
                                                name={`q-${currentQuestion._id}`}
                                                className="hidden"
                                                checked={userAnswers[currentQuestion._id] === opt}
                                                onChange={() => {
                                                    setUserAnswers(prev => ({
                                                        ...prev,
                                                        [currentQuestion._id]: opt
                                                    }));
                                                }}
                                            />
                                            <span className="text-lg">{opt}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Navigation Buttons */}
                            <div className="mt-8 flex justify-between">
                                <button
                                    onClick={handlePrev}
                                    disabled={currentQuestionIndex === 0}
                                    className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all
                                        ${currentQuestionIndex === 0
                                            ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                                            : 'bg-gray-700 hover:bg-gray-600 text-white'}`
                                    }
                                >
                                    <ChevronLeft className="w-5 h-5" /> Previous
                                </button>

                                <button
                                    onClick={handleNext}
                                    className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg
                                        ${isFinalSubmit
                                            ? 'bg-red-600 hover:bg-red-700 hover:shadow-red-500/20'
                                            : isLastQuestionOfSection ? 'bg-orange-600 hover:bg-orange-700' : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:shadow-cyan-500/20'}`
                                    }
                                >
                                    {isFinalSubmit ? 'Submit Exam' : isLastQuestionOfSection ? 'Next Section' : 'Next Question'}
                                    {!isFinalSubmit && <ChevronRight className="w-5 h-5" />}
                                </button>
                            </div>
                        </main>

                        {/* Side Monitor Panel */}
                        <aside className="w-80 bg-gray-900 border-l border-gray-800 p-4 flex flex-col gap-6 shrink-0">
                            {/* Camera Feed Placeholder */}
                            {/* Camera Feed */}
                            <div className="aspect-video bg-black rounded-lg border border-gray-700 relative overflow-hidden group">
                                <video
                                    ref={handleVideoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]"
                                />
                                <div className="absolute top-2 left-2 flex gap-1 z-10">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                    <span className="text-[10px] text-green-500 font-mono">LIVE FEED</span>
                                </div>
                                <div className="absolute bottom-2 left-2 flex flex-col items-start gap-1 z-10">
                                    <div className="text-[10px] text-green-500 font-mono">Mic: Active</div>
                                    <button
                                        onClick={() => {
                                            if (stream && videoRef.current) {
                                                videoRef.current.srcObject = stream;
                                                videoRef.current.play().catch(e => console.error(e));
                                            } else {
                                                startCamera();
                                            }
                                        }}
                                        className="text-[9px] text-cyan-400 hover:text-white font-mono bg-cyan-900/40 px-1 rounded border border-cyan-800/50"
                                    >
                                        ↻ Refresh Camera
                                    </button>
                                </div>
                            </div>

                            {/* Status Board */}
                            <div className="space-y-4">
                                <div className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Integrity Score</div>
                                    <div className="flex items-end gap-2">
                                        <span className={`text-2xl font-bold ${integrityScore >= 80 ? 'text-green-400' : integrityScore >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                                            {integrityScore.toFixed(0)}%
                                        </span>
                                        <span className="text-xs text-gray-400 mb-1">
                                            {integrityScore >= 80 ? 'Excellent' : integrityScore >= 60 ? 'Fair' : 'Poor'}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-700 h-1.5 rounded-full mt-2 overflow-hidden">
                                        <div className={`h-full ${integrityScore >= 80 ? 'bg-green-500' : integrityScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${integrityScore}%` }}></div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                                        <div className="text-xs text-gray-500 mb-1">Tab Switches</div>
                                        <div className={`text-xl font-bold ${tabSwitches > 0 ? 'text-red-400' : 'text-white'}`}>
                                            {tabSwitches}
                                        </div>
                                    </div>
                                    <div className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                                        <div className="text-xs text-gray-500 mb-1">Focus Lost</div>
                                        <div className="text-xl font-bold text-white">
                                            {Math.round(focusLostTime)}s
                                        </div>
                                    </div>
                                    <div className="p-3 bg-gray-800 rounded-lg border border-gray-700 col-span-2">
                                        <div className="text-xs text-gray-500 mb-1">Lockdown Breaches</div>
                                        <div className="text-xl font-bold text-red-500">
                                            {integrityScore < 100 && (100 - integrityScore) >= 10 ? Math.floor((100 - integrityScore) / 10) : 0}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Warnings Stream */}
                            <div className="flex-1 bg-black/20 rounded-lg border border-gray-800 p-3 overflow-hidden flex flex-col">
                                <div className="text-xs text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <Activity className="w-3 h-3" /> Event Log
                                </div>
                                <div className="flex-1 overflow-y-auto space-y-2 text-xs font-mono">
                                    {warnings.length === 0 && <span className="text-gray-600 italic">No suspicious activity detected.</span>}
                                    {warnings.map(w => (
                                        <div key={w.id} className="text-yellow-500 border-l-2 border-yellow-500 pl-2 py-1">
                                            {w.msg}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            )}

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

            {/* Hidden video element for webcam capture */}
            <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="hidden"
            />
        </div>
    );
}

export default ExamPage;
