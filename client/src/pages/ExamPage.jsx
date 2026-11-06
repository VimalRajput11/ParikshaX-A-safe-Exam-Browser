import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Maximize, Monitor, Eye, Activity, ChevronLeft, ChevronRight, CheckCircle,
    Clock, ClipboardList, Play, AlertCircle, Info, ListChecks, Camera, WifiOff,
    ShieldAlert, Mic, RotateCcw, Send
} from 'lucide-react';
import BrandMark from '../components/BrandMark';
import ConsentModal from '../components/ConsentModal';
import IntegrityReport from '../components/IntegrityReport';
import ConfirmationModal from '../components/ConfirmationModal';
import { API_BASE_URL } from '../config';
import AlertModal from '../components/AlertModal';
import FaceDetectionService from '../services/FaceDetectionService';


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
    const [integrityScore, setIntegrityScore] = useState(100);
    const [lockdownMode, setLockdownMode] = useState(false);
    const [lockdownBreachCount, setLockdownBreachCount] = useState(0);

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [stream, setStream] = useState(null);
    const [cameraConnected, setCameraConnected] = useState(false);
    const [sections, setSections] = useState([]);
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(parseInt(localStorage.getItem('timeLeft') || '0')); // in seconds
    const videoRef = useRef(null);
    const [faceScanStatus, setFaceScanStatus] = useState('none'); // none, scanning, verified



    // Internet Monitoring State
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const offlineStartTime = useRef(null);
    const pendingLogs = useRef([]);
    const sessionIdRef = useRef(sessionId);

    useEffect(() => {
        sessionIdRef.current = sessionId;
    }, [sessionId]);




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

                            // On resumption, show instructions again so they can enter fullscreen properly
                            setShowConsent(false);
                            setShowInstructions(true);
                            setIsExamActive(false);

                            setConsentGiven(true);
                            if (sessionData.session.integrityScore !== undefined) {
                                setIntegrityScore(sessionData.session.integrityScore);
                            }
                            if (sessionData.session.metrics?.lockdownBreachCount !== undefined) {
                                setLockdownBreachCount(sessionData.session.metrics.lockdownBreachCount);
                            }
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

        // Load face detection models
        const loadModels = async () => {
            try {
                await FaceDetectionService.loadModels();
                console.log("Models loaded in ExamPage");
            } catch (err) {
                console.error("Failed to load face models:", err);
            }
        };
        loadModels();

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


    // Internet Connection Monitoring
    useEffect(() => {
        const handleOffline = () => {
            console.warn("Internet Connection Lost");
            setIsOffline(true);
            offlineStartTime.current = Date.now();
            addWarning("Internet Connection Lost! Exam Paused.");
        };

        const handleOnline = () => {
            console.log("Internet Connection Restored");
            setIsOffline(false);
            const duration = offlineStartTime.current ? (Date.now() - offlineStartTime.current) / 1000 : 0;
            offlineStartTime.current = null;

            // Log the failure itself
            logEvent('internet_failure', duration, 'medium');

            // Flush pending logs
            while (pendingLogs.current.length > 0) {
                const log = pendingLogs.current.shift();
                logEvent(log.eventType, log.duration, log.severity);
            }
            addWarning("Internet Restored. Exam Resumed.");
        };

        window.addEventListener('offline', handleOffline);
        window.addEventListener('online', handleOnline);

        return () => {
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('online', handleOnline);
        };
    }, []);

    const logEvent = async (eventType, duration = 0, severity = 'low') => {
        if (!navigator.onLine) {
            console.warn(`[Integrity] Offline: Queuing ${eventType}...`);

            // Queue the log with current timestamp
            pendingLogs.current.push({ eventType, duration, severity });
            return;
        }

        const sid = sessionIdRef.current;
        if (!sid) return;

        try {
            const response = await fetch(`${API_BASE_URL}/sessions/${sid}/event`, {
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

    // Face Scanning Logic (Pre-Exam)
    useEffect(() => {
        if (!showInstructions || !stream || faceScanStatus === 'verified') return;

        let scanInterval;
        const startScanning = async () => {
            setFaceScanStatus('scanning');

            // Check if we already have a stored reference face for this session
            const storedDescriptor = localStorage.getItem('referenceFaceDescriptor');
            if (storedDescriptor && FaceDetectionService.modelsLoaded) {
                try {
                    const descriptorArray = new Float32Array(JSON.parse(storedDescriptor));
                    FaceDetectionService.setReferenceFace(descriptorArray);
                    console.log("Loaded existing reference face from storage.");
                } catch (e) {
                    console.error("Failed to load reference face:", e);
                }
            }

            scanInterval = setInterval(async () => {
                if (videoRef.current && FaceDetectionService.modelsLoaded) {
                    const detections = await FaceDetectionService.detectFaces(videoRef.current);
                    if (detections.length === 1) {
                        const currentDescriptor = detections[0].descriptor;

                        // If a reference face was already loaded/set (e.g. from storage), VERIFY against it
                        if (FaceDetectionService.referenceDescriptor) {
                            const matchResult = FaceDetectionService.compareFace(currentDescriptor);
                            if (matchResult.match) {
                                console.log("Identity RE-VERIFIED against stored face.");
                                setFaceScanStatus('verified');
                                clearInterval(scanInterval);
                            } else {
                                console.warn(`Identity Mismatch during resume! Distance: ${matchResult.distance}`);
                                // Optional: You could show a specific error message state here "Incorrect User"
                            }
                        } else {
                            // First time setup: Set this face as the reference and save it
                            FaceDetectionService.setReferenceFace(currentDescriptor);
                            localStorage.setItem('referenceFaceDescriptor', JSON.stringify(Array.from(currentDescriptor)));
                            console.log("New reference face saved to storage.");
                            setFaceScanStatus('verified');
                            clearInterval(scanInterval);
                        }
                    }
                }
            }, 1000);
        };

        startScanning();
        return () => clearInterval(scanInterval);
    }, [showInstructions, stream, faceScanStatus]);


    useEffect(() => {
        const handleFullscreenChange = () => {
            const hasFullscreen = !!document.fullscreenElement;
            console.log(`[Screen Monitor] Change detected. Fullscreen: ${hasFullscreen}, ExamActive: ${isExamActive}`);

            // Electron kiosk mode doesn't use the standard fullscreen API
            if (window.electronAPI) return;

            if (!hasFullscreen && isExamActive) {
                // User dropped out of fullscreen during an active exam
                console.warn("[Screen Monitor] Lockdown BREACH detected!");
                setLockdownMode(true);
                setLockdownBreachCount(prev => prev + 1);
                logEvent('environment_breach', 0, 'high');
            } else if (hasFullscreen && isExamActive) {

                // User returned or entered fullscreen, ensure lockdown UI is gone
                console.log("[Screen Monitor] Fullscreen restored/entered.");
                setLockdownMode(false);
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

                await fetch(`${API_BASE_URL}/sessions/${sessionId}/snapshot`, {
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

    // Live Face Monitoring during Exam
    useEffect(() => {
        if (!isExamActive || !sessionId || !stream || !FaceDetectionService.modelsLoaded) return;

        const monitorFace = async () => {
            if (!videoRef.current) return;

            try {
                const detections = await FaceDetectionService.detectFaces(videoRef.current);

                if (detections.length === 0) {
                    const isBlocked = FaceDetectionService.isCameraBlocked(videoRef.current);
                    console.log(`[Face Monitor] No faces detected. isBlocked: ${isBlocked}`);
                    if (isBlocked) {
                        addWarning("Security Alert: Camera appears to be blocked or covered!");
                        await logEvent('camera_blocked', 0, 'high');
                    } else {
                        addWarning("Security Alert: Face not detected! Please stay in view.");
                        await logEvent('face_absent', 0, 'medium');
                    }
                } else {
                    console.log(`[Face Monitor] Found ${detections.length} faces`);
                    if (detections.length > 1) {
                        console.warn(`[Face Monitor] MULTIPLE FACES DETECTED (${detections.length})! Triggering Event.`);
                        addWarning("Security Alert: Multiple people detected!");
                        await logEvent('multiple_faces', 0, 'high');
                    } else {

                        // Exactly one face, verify identity
                        const result = FaceDetectionService.compareFace(detections[0].descriptor);
                        if (!result.match) {
                            addWarning("Security Alert: Face mismatch! Identity verification failed.");
                            await logEvent('face_mismatch', 0, 'high');
                        } else {
                            // Exactly one matching face detected
                            console.log(`[Face Monitor] Identity verified (Distance: ${result.distance.toFixed(4)})`);
                            // Check head pose for gaze deviation
                            const pose = FaceDetectionService.getHeadPose(detections[0].landmarks);

                            if (pose !== 'center') {
                                // Log gaze deviation but let warning stay if there was one
                                logEvent('gaze_deviation', 0, 'low');
                            } else {
                                // EVERYTHING IS FINE: Clear the warning log from UI
                                setWarnings([]);
                            }
                        }
                    }
                }

            } catch (err) {
                console.warn("[Face Monitor] Error:", err.message);
            }
        };


        const interval = setInterval(monitorFace, 1000); // Check every 1 second (High Frequency for strict monitoring)

        return () => clearInterval(interval);
    }, [isExamActive, sessionId, stream, FaceDetectionService.modelsLoaded]);

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
                try { navigator.keyboard.lock(['Escape']); } catch { /* keyboard lock unsupported */ }
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
                .catch(() => {
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
        localStorage.removeItem('referenceFaceDescriptor'); // Clear stored face data


        if (document.exitFullscreen) {
            try { await document.exitFullscreen(); } catch { /* not in fullscreen */ }
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

    const candidateName = localStorage.getItem('studentName') || 'Candidate';
    const timerTone = timeLeft < 60 ? 'danger' : timeLeft < 300 ? 'warning' : 'normal';
    const integrityTone = integrityScore >= 80 ? 'success' : integrityScore >= 60 ? 'warning' : 'danger';
    const toneText = { success: 'text-emerald-600', warning: 'text-amber-600', danger: 'text-red-600' };
    const toneBar = { success: 'bg-emerald-500', warning: 'bg-amber-500', danger: 'bg-red-500' };

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6">
                    <BrandMark subtitle="Secure Assessment" />
                </header>
                <main className="flex-1 flex items-center justify-center p-6">
                    <div className="card max-w-lg w-full p-10 text-center">
                        <div className="w-16 h-16 bg-emerald-50 ring-8 ring-emerald-50/50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-8 h-8 text-emerald-600" />
                        </div>
                        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Exam submitted successfully</h1>
                        <p className="mt-3 text-slate-500 leading-relaxed">
                            Thank you, {candidateName}. Your responses have been recorded and sent to the examination server.
                            Results will be shared by your institution.
                        </p>

                        {sessionId && (
                            <div className="mt-8 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 flex items-center justify-between text-sm">
                                <span className="text-slate-500">Submission reference</span>
                                <span className="font-mono font-medium text-slate-800">{sessionId.substring(0, 12).toUpperCase()}</span>
                            </div>
                        )}

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
                            className="btn btn-primary btn-lg w-full mt-8"
                        >
                            Close secure browser
                        </button>
                        <p className="mt-4 text-xs text-slate-400">You may now safely close this window.</p>
                    </div>
                </main>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 text-slate-500">
                <div className="w-8 h-8 border-[3px] border-slate-200 border-t-brand-600 rounded-full animate-spin" />
                <span className="text-sm font-medium">Loading your exam…</span>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    const isLastQuestionOfSection = currentQuestionIndex === questions.length - 1;
    const isLastSection = sections.length > 0 ? (currentSectionIndex === sections.length - 1) : true;
    const isFinalSubmit = isLastQuestionOfSection && isLastSection;
    const answeredCount = questions.filter(q => userAnswers[q._id]).length;

    if (showInstructions) {
        const totalDuration = sections.reduce((acc, s) => acc + s.duration, 0);
        const totalQuestions = sections.reduce((acc, s) => acc + s.questions.length, 0);
        const scanning = cameraConnected && faceScanStatus !== 'verified';

        const checks = [
            { ok: consentGiven, label: 'Proctoring consent accepted' },
            { ok: cameraConnected, label: cameraConnected ? 'Camera & microphone connected' : 'No camera detected', warn: !cameraConnected },
            { ok: faceScanStatus === 'verified', label: faceScanStatus === 'verified' ? 'Identity verified' : cameraConnected ? 'Verifying identity…' : 'Identity check skipped', warn: !cameraConnected },
        ];

        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
                    <BrandMark subtitle="Secure Assessment" />
                    <div className="text-right">
                        <div className="text-xs text-slate-500">Candidate</div>
                        <div className="text-sm font-semibold text-slate-900">{candidateName}</div>
                    </div>
                </header>

                <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-8">
                    <div className="mb-6">
                        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Exam instructions</h1>
                        <p className="text-sm text-slate-500 mt-1">Read the details below carefully before you begin.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            {/* Summary */}
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { icon: ClipboardList, label: 'Sections', value: sections.length || 1 },
                                    { icon: ListChecks, label: 'Questions', value: totalQuestions || questions.length },
                                    { icon: Clock, label: 'Total duration', value: `${totalDuration} min` },
                                ].map(({ icon: Icon, label, value }) => (
                                    <div key={label} className="card p-4 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                                            <Icon className="w-5 h-5 text-brand-600" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="stat-label truncate">{label}</div>
                                            <div className="text-lg font-semibold text-slate-900">{value}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Sections table */}
                            <div className="card overflow-hidden">
                                <div className="card-header">
                                    <h2 className="card-title">Section breakdown</h2>
                                </div>
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th className="w-16">#</th>
                                            <th>Section</th>
                                            <th className="text-right">Questions</th>
                                            <th className="text-right">Time limit</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sections.map((section, idx) => (
                                            <tr key={idx}>
                                                <td className="font-mono text-slate-400">{String(idx + 1).padStart(2, '0')}</td>
                                                <td className="font-medium text-slate-900">{section.title}</td>
                                                <td className="text-right">{section.questions.length}</td>
                                                <td className="text-right font-medium text-slate-900">{section.duration} min</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Rules */}
                            <div className="card card-body">
                                <h2 className="card-title flex items-center gap-2 mb-4">
                                    <Info className="w-4 h-4 text-brand-600" /> General instructions
                                </h2>
                                <ol className="space-y-3 text-sm text-slate-600">
                                    {[
                                        'The exam runs in fullscreen mode. Leaving fullscreen pauses the exam and is recorded.',
                                        'Do not switch tabs, minimise the window, or open other applications.',
                                        'Sections are timed independently and must be completed in order. You cannot return to a previous section.',
                                        'When a section timer reaches zero you will move to the next section automatically.',
                                        'Keep your face clearly visible to the camera. Only you should be present in the room.',
                                        'Copy, paste and right-click are disabled for the duration of the exam.',
                                    ].map((rule, i) => (
                                        <li key={i} className="flex gap-3">
                                            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                                            <span>{rule}</span>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        </div>

                        {/* Right: system check */}
                        <div className="space-y-6">
                            <div className="card overflow-hidden">
                                <div className="card-header">
                                    <h2 className="card-title">System check</h2>
                                    <span className={`badge ${faceScanStatus === 'verified' ? 'badge-success' : scanning ? 'badge-warning' : 'badge-neutral'}`}>
                                        {faceScanStatus === 'verified' ? 'Ready' : scanning ? 'Scanning' : 'Preview'}
                                    </span>
                                </div>
                                <div className="p-4">
                                    <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-900">
                                        <video
                                            ref={handleVideoRef}
                                            autoPlay
                                            playsInline
                                            muted
                                            className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]"
                                        />
                                        {!cameraConnected && (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 text-xs gap-2">
                                                <Camera className="w-6 h-6" /> Camera unavailable
                                            </div>
                                        )}
                                        {scanning && (
                                            <div className="absolute inset-6 border-2 border-dashed border-white/60 rounded-[40%] pointer-events-none" />
                                        )}
                                    </div>
                                    {scanning && (
                                        <p className="text-xs text-slate-500 mt-3 text-center">Look directly at the camera to verify your identity.</p>
                                    )}

                                    <ul className="mt-4 space-y-2.5">
                                        {checks.map((c) => (
                                            <li key={c.label} className="flex items-center gap-2.5 text-sm">
                                                {c.ok ? (
                                                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                                                ) : c.warn ? (
                                                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                                                ) : (
                                                    <span className="w-4 h-4 border-2 border-slate-200 border-t-brand-600 rounded-full animate-spin shrink-0" />
                                                )}
                                                <span className={c.ok ? 'text-slate-700' : 'text-slate-500'}>{c.label}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <button
                                onClick={handleStartExam}
                                disabled={scanning}
                                className="btn btn-primary btn-lg w-full py-3.5"
                            >
                                {scanning ? (
                                    <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Verifying identity…</>
                                ) : (
                                    <><Play className="w-4 h-4 fill-current" /> Start exam</>
                                )}
                            </button>
                            <p className="text-xs text-slate-500 text-center -mt-3">
                                {cameraConnected ? 'The timer starts as soon as you click Start exam.' : 'You are proceeding without a camera. This will be noted.'}
                            </p>
                        </div>
                    </div>
                </main>
            </div>
        );
    }


    return (
        <div
            className="min-h-screen bg-slate-50 text-slate-900 flex flex-col select-none drag-none"
            onCopy={(e) => {
                e.preventDefault();
                return false;
            }}
            onContextMenu={(e) => {
                e.preventDefault();
                return false;
            }}
        >

            {/* Internet Failure Modal */}
            {isOffline && (
                <div className="modal-backdrop z-[60] bg-slate-900/80">
                    <div className="modal-panel max-w-md p-8 text-center">
                        <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-5">
                            <WifiOff className="w-7 h-7 text-amber-600" />
                        </div>
                        <h1 className="text-xl font-semibold text-slate-900">Connection lost</h1>
                        <p className="text-slate-500 mt-2 text-sm leading-relaxed">
                            Your internet connection was interrupted. The exam will resume automatically once you are back online.
                        </p>
                        <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-amber-700">
                            <span className="w-4 h-4 border-2 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
                            Reconnecting…
                        </div>
                    </div>
                </div>
            )}

            {lockdownMode && (
                <div className="modal-backdrop z-50 bg-slate-900/95">
                    <div className="modal-panel max-w-lg p-8 text-center">
                        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
                            <ShieldAlert className="w-7 h-7 text-red-600" />
                        </div>
                        <h1 className="text-xl font-semibold text-slate-900">Exam paused — fullscreen exited</h1>
                        <p className="text-slate-500 mt-2 text-sm leading-relaxed">
                            You left fullscreen mode. This incident has been recorded.
                            Return to fullscreen to continue your exam.
                        </p>

                        <div className="mt-6 grid grid-cols-2 gap-3 text-left">
                            <div className="rounded-lg border border-slate-200 p-3">
                                <div className="stat-label">Integrity score</div>
                                <div className={`text-xl font-semibold mt-0.5 ${toneText[integrityTone]}`}>{integrityScore}%</div>
                            </div>
                            <div className="rounded-lg border border-slate-200 p-3">
                                <div className="stat-label">Breaches</div>
                                <div className="text-xl font-semibold mt-0.5 text-slate-900">{lockdownBreachCount}</div>
                            </div>
                        </div>

                        <button onClick={restoreFullscreen} className="btn btn-primary btn-lg w-full mt-6">
                            <Maximize className="w-4 h-4" /> Return to fullscreen
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
                title="Submit your exam?"
                message={`You have answered ${answeredCount} of ${questions.length} questions in this section.\nOnce submitted, you cannot change your answers and the secure browser will close.`}
                onConfirm={confirmAndExit}
                onCancel={() => setShowConfirmModal(false)}
            />

            {!isFullscreen ? (
                <div className="flex-1 flex flex-col">
                    <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6 shrink-0">
                        <BrandMark subtitle="Secure Assessment" />
                    </header>
                    <div className="flex-1 flex items-center justify-center p-6">
                        <div className="card max-w-lg w-full p-8">
                            <div className="w-12 h-12 rounded-lg bg-brand-50 flex items-center justify-center mb-5">
                                <Monitor className="w-6 h-6 text-brand-600" />
                            </div>
                            <h1 className="text-xl font-semibold text-slate-900">Environment check</h1>
                            <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                                Make sure you are in a quiet room. The exam will run in fullscreen and tab switching will be monitored.
                            </p>

                            <ul className="mt-6 divide-y divide-slate-100 rounded-lg border border-slate-200">
                                {[
                                    { ok: cameraConnected, label: cameraConnected ? 'Camera & microphone connected' : 'Camera not connected' },
                                    { ok: consentGiven, label: consentGiven ? 'Consent given' : 'Waiting for consent' },
                                    { ok: false, label: 'Waiting for fullscreen' },
                                ].map(({ ok, label }) => (
                                    <li key={label} className="flex items-center gap-3 px-4 py-3 text-sm">
                                        <span className={`w-2 h-2 rounded-full ${ok ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                                        <span className="text-slate-700">{label}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-6 flex flex-col gap-3">
                                {!cameraConnected && (
                                    <button onClick={startCamera} className="btn btn-secondary w-full py-3">
                                        <Eye className="w-4 h-4" /> Try connecting camera
                                    </button>
                                )}
                                <button onClick={enterFullscreen} disabled={!consentGiven} className="btn btn-primary w-full py-3">
                                    <Maximize className="w-4 h-4" />
                                    {cameraConnected ? 'Enter fullscreen & start exam' : 'Enter secure mode (no camera)'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col h-screen">
                    {/* Header */}
                    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between gap-4 px-4 md:px-6 shrink-0">
                        <div className="flex items-center gap-4 min-w-0">
                            <BrandMark />
                            <div className="hidden md:block h-8 w-px bg-slate-200" />
                            <div className="hidden md:block min-w-0">
                                <div className="text-xs text-slate-500">Current section</div>
                                <div className="text-sm font-semibold text-slate-900 truncate">
                                    {sections[currentSectionIndex]?.title || 'Assessment'}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-red-600">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                                </span>
                                Proctored
                            </div>
                            <div className="hidden lg:block text-right">
                                <div className="text-xs text-slate-500">Candidate</div>
                                <div className="text-sm font-semibold text-slate-900 max-w-[180px] truncate">{candidateName}</div>
                            </div>
                            <div
                                className={`relative overflow-hidden flex items-center gap-2 rounded-lg px-4 h-10 min-w-[128px] justify-center ring-1 ring-inset
                                    ${timerTone === 'danger' ? 'bg-red-50 ring-red-200 text-red-700' : timerTone === 'warning' ? 'bg-amber-50 ring-amber-200 text-amber-800' : 'bg-slate-900 ring-slate-900 text-white'}`}
                                aria-label="Time remaining"
                            >
                                <Clock className="w-4 h-4 opacity-80" />
                                <span className="font-mono text-lg font-semibold tabular-nums">{formatTime(timeLeft)}</span>
                                <div
                                    className={`absolute left-0 bottom-0 h-0.5 transition-all duration-1000 ${timerTone === 'normal' ? 'bg-brand-400' : 'bg-current'}`}
                                    style={{ width: `${(timeLeft / (sections[currentSectionIndex]?.duration * 60 || 3600)) * 100}%` }}
                                />
                            </div>
                        </div>
                    </header>

                    {/* Section stepper */}
                    {sections.length > 1 && (
                        <div className="bg-white border-b border-slate-200 px-4 md:px-6 overflow-x-auto shrink-0">
                            <div className="flex items-center gap-1 h-11">
                                {sections.map((s, idx) => {
                                    const done = idx < currentSectionIndex;
                                    const active = idx === currentSectionIndex;
                                    return (
                                        <React.Fragment key={idx}>
                                            {idx > 0 && <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />}
                                            <div className={`flex items-center gap-2 px-2.5 py-1 rounded-md text-sm whitespace-nowrap
                                                ${active ? 'bg-brand-50 text-brand-700 font-semibold' : done ? 'text-slate-500' : 'text-slate-400'}`}>
                                                {done ? (
                                                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                                                ) : (
                                                    <span className={`w-5 h-5 rounded-full text-[11px] font-semibold flex items-center justify-center
                                                        ${active ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500'}`}>{idx + 1}</span>
                                                )}
                                                {s.title}
                                            </div>
                                        </React.Fragment>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="flex flex-1 overflow-hidden">
                        {/* Main Exam Area */}
                        <main className="flex-1 overflow-y-auto">
                            <div className="max-w-4xl mx-auto w-full p-4 md:p-8 flex flex-col min-h-full">
                                <div className="card flex-1 flex flex-col">
                                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                                        <div className="text-sm font-semibold text-slate-900">
                                            Question {currentQuestionIndex + 1}
                                            <span className="font-normal text-slate-400"> / {questions.length}</span>
                                        </div>
                                        <span className={`badge ${userAnswers[currentQuestion._id] ? 'badge-success' : 'badge-neutral'}`}>
                                            {userAnswers[currentQuestion._id] ? 'Answered' : 'Not answered'}
                                        </span>
                                    </div>

                                    <div className="p-6 md:p-8 flex-1">
                                        <h2 className="text-lg md:text-xl font-medium text-slate-900 leading-relaxed">
                                            {currentQuestion.questionText}
                                        </h2>

                                        <div className="mt-8 space-y-3" role="radiogroup">
                                            {currentQuestion.options.map((opt, i) => {
                                                const selected = userAnswers[currentQuestion._id] === opt;
                                                return (
                                                    <label
                                                        key={i}
                                                        className={`flex items-center gap-4 px-4 py-3.5 rounded-lg cursor-pointer border transition-colors
                                                            ${selected
                                                                ? 'bg-brand-50 border-brand-500 ring-1 ring-brand-500'
                                                                : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                                                    >
                                                        <span className={`w-8 h-8 rounded-full border text-sm font-semibold flex items-center justify-center shrink-0 transition-colors
                                                            ${selected ? 'bg-brand-600 border-brand-600 text-white' : 'border-slate-300 text-slate-500'}`}>
                                                            {String.fromCharCode(65 + i)}
                                                        </span>
                                                        <input
                                                            type="radio"
                                                            name={`q-${currentQuestion._id}`}
                                                            className="sr-only"
                                                            checked={selected}
                                                            onChange={() => {
                                                                setUserAnswers(prev => ({
                                                                    ...prev,
                                                                    [currentQuestion._id]: opt
                                                                }));
                                                            }}
                                                        />
                                                        <span className={`text-base ${selected ? 'text-slate-900 font-medium' : 'text-slate-700'}`}>{opt}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Navigation */}
                                    <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50/60 rounded-b-xl">
                                        <div className="flex items-center gap-2">
                                            <button onClick={handlePrev} disabled={currentQuestionIndex === 0} className="btn btn-secondary">
                                                <ChevronLeft className="w-4 h-4" /> Previous
                                            </button>
                                            <button
                                                onClick={() => setUserAnswers(prev => {
                                                    const next = { ...prev };
                                                    delete next[currentQuestion._id];
                                                    return next;
                                                })}
                                                disabled={!userAnswers[currentQuestion._id]}
                                                className="btn btn-ghost hidden sm:inline-flex"
                                            >
                                                <RotateCcw className="w-4 h-4" /> Clear response
                                            </button>
                                        </div>

                                        <button
                                            onClick={handleNext}
                                            className={`btn ${isFinalSubmit ? 'btn-success' : 'btn-primary'} px-6`}
                                        >
                                            {isFinalSubmit ? 'Submit exam' : isLastQuestionOfSection ? 'Save & next section' : 'Save & next'}
                                            {isFinalSubmit ? <Send className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </main>

                        {/* Side Panel */}
                        <aside className="hidden md:flex w-80 bg-white border-l border-slate-200 flex-col shrink-0 overflow-y-auto">
                            {/* Camera Feed */}
                            <div className="p-4 border-b border-slate-200">
                                <div className="aspect-video bg-slate-900 rounded-lg relative overflow-hidden">
                                    <video
                                        ref={handleVideoRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]"
                                    />
                                    <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/50 text-white text-[10px] font-medium px-2 py-0.5 rounded">
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> LIVE
                                    </div>
                                </div>
                                <div className="flex items-center justify-between mt-2.5 text-xs">
                                    <span className="text-slate-500 flex items-center gap-1.5">
                                        <Mic className="w-3.5 h-3.5" /> Microphone active
                                    </span>
                                    <button
                                        onClick={() => {
                                            if (stream && videoRef.current) {
                                                videoRef.current.srcObject = stream;
                                                videoRef.current.play().catch(e => console.error(e));
                                            } else {
                                                startCamera();
                                            }
                                        }}
                                        className="text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
                                    >
                                        <RotateCcw className="w-3 h-3" /> Refresh
                                    </button>
                                </div>
                            </div>

                            {/* Question Palette */}
                            <div className="p-4 border-b border-slate-200">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-semibold text-slate-900">Question palette</h3>
                                    <span className="text-xs text-slate-500">{answeredCount}/{questions.length} answered</span>
                                </div>
                                <div className="grid grid-cols-5 gap-2">
                                    {questions.map((q, idx) => {
                                        const isCurrent = idx === currentQuestionIndex;
                                        const isAnswered = !!userAnswers[q._id];
                                        return (
                                            <button
                                                key={q._id || idx}
                                                onClick={() => setCurrentQuestionIndex(idx)}
                                                className={`h-9 rounded-md text-sm font-semibold transition-colors
                                                    ${isAnswered ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-50'}
                                                    ${isCurrent ? 'ring-2 ring-brand-500 ring-offset-2' : ''}`}
                                                aria-label={`Go to question ${idx + 1}`}
                                            >
                                                {idx + 1}
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="flex items-center gap-4 mt-4 text-xs text-slate-500">
                                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-600" /> Answered</span>
                                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm border border-slate-300" /> Not answered</span>
                                </div>
                            </div>

                            {/* Proctoring status */}
                            <div className="p-4 border-b border-slate-200 space-y-3">
                                <h3 className="text-sm font-semibold text-slate-900">Proctoring status</h3>
                                <div>
                                    <div className="flex items-center justify-between text-xs mb-1.5">
                                        <span className="text-slate-500">Integrity score</span>
                                        <span className={`font-semibold ${toneText[integrityTone]}`}>{integrityScore.toFixed(0)}%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full transition-all ${toneBar[integrityTone]}`} style={{ width: `${integrityScore}%` }} />
                                    </div>
                                </div>
                                <dl className="grid grid-cols-3 gap-2 text-center">
                                    {[
                                        { label: 'Tab switches', value: tabSwitches, bad: tabSwitches > 0 },
                                        { label: 'Focus lost', value: `${Math.round(focusLostTime)}s`, bad: focusLostTime > 0 },
                                        { label: 'Breaches', value: lockdownBreachCount, bad: lockdownBreachCount > 0 },
                                    ].map(({ label, value, bad }) => (
                                        <div key={label} className="rounded-md bg-slate-50 py-2">
                                            <dd className={`text-base font-semibold ${bad ? 'text-red-600' : 'text-slate-900'}`}>{value}</dd>
                                            <dt className="text-[10px] text-slate-500 mt-0.5">{label}</dt>
                                        </div>
                                    ))}
                                </dl>
                            </div>

                            {/* Alerts */}
                            <div className="p-4 flex-1 min-h-[140px] flex flex-col">
                                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-3">
                                    <Activity className="w-4 h-4 text-slate-400" /> Alerts
                                </h3>
                                <div className="flex-1 space-y-2 text-xs">
                                    {warnings.length === 0 && (
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <CheckCircle className="w-4 h-4 text-emerald-600" /> No issues detected.
                                        </div>
                                    )}
                                    {warnings.map(w => (
                                        <div key={w.id} className="flex gap-2 rounded-md bg-amber-50 border border-amber-200 text-amber-800 px-2.5 py-2">
                                            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-px" />
                                            <span>{w.msg}</span>
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
