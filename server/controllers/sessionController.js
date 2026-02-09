const ExamSession = require('../models/ExamSession');
const crypto = require('crypto');
const emailService = require('../utils/emailService');
const mongoose = require('mongoose');

// Start a new exam session
exports.startSession = async (req, res) => {
    try {
        let { examId, studentId, consentGiven } = req.body;

        if (!consentGiven) {
            return res.status(400).json({
                error: 'Student consent is required to start the exam session'
            });
        }

        // Cast to ObjectId for precise matching
        const sId = new mongoose.Types.ObjectId(studentId);
        const eId = new mongoose.Types.ObjectId(examId);

        // --- DUPLICATE CHECK ---

        // 1. Check for ANY finished session (Block Re-entry)
        const finishedSession = await ExamSession.findOne({
            examId: eId,
            studentId: sId,
            status: { $in: ['completed', 'submitted', 'terminated'] }
        });

        if (finishedSession) {
            return res.status(400).json({
                success: false,
                error: `You have already finished this exam (Status: ${finishedSession.status}).`,
                alreadyCompleted: true
            });
        }

        // 2. Check for in-progress session (Allow Resumption)
        const existingSession = await ExamSession.findOne({
            examId: eId,
            studentId: sId,
            status: 'in_progress'
        }).sort({ createdAt: -1 });

        if (existingSession) {
            return res.status(200).json({
                success: true,
                sessionId: existingSession._id,
                message: 'Resuming existing exam session',
                resumed: true
            });
        }
        // -----------------------

        const session = new ExamSession({
            examId,
            studentId,
            consentGiven,
            consentTimestamp: new Date(),
            status: 'in_progress'
        });

        await session.save();

        res.status(201).json({
            success: true,
            sessionId: session._id,
            message: 'Exam session started successfully'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Log an event during exam
exports.logEvent = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { eventType, duration, severity, metadata } = req.body;
        console.log(`[Session ${sessionId}] Incoming Event: ${eventType} (${severity})`);

        const session = await ExamSession.findById(sessionId);


        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        if (session.status !== 'in_progress') {
            return res.status(400).json({ error: 'Session is not active' });
        }

        // Add event to log
        session.eventLogs.push({
            eventType,
            duration,
            severity: severity || 'low',
            metadata: metadata || {}
        });

        // Initialize metrics if they don't exist (safety for older sessions)
        if (!session.metrics) session.metrics = {};

        // Update metrics based on event type safely
        switch (eventType) {
            case 'tab_switch':
                session.metrics.tabSwitchCount = (session.metrics.tabSwitchCount || 0) + 1;
                break;
            case 'focus_lost':
                session.metrics.totalFocusLostDuration = (session.metrics.totalFocusLostDuration || 0) + (duration || 0);
                break;
            case 'face_absent':
                session.metrics.faceAbsentCount = (session.metrics.faceAbsentCount || 0) + 1;
                break;
            case 'gaze_deviation':
                session.metrics.gazeDeviationCount = (session.metrics.gazeDeviationCount || 0) + 1;
                break;
            case 'face_mismatch':
                session.metrics.faceMismatchCount = (session.metrics.faceMismatchCount || 0) + 1;
                break;
            case 'audio_spike':

                session.metrics.audioSpikeCount = (session.metrics.audioSpikeCount || 0) + 1;
                break;
            case 'multiple_faces':
                session.metrics.multipleFacesCount = (session.metrics.multipleFacesCount || 0) + 1;
                break;
            case 'warning_shown':

                session.metrics.warningsShown = (session.metrics.warningsShown || 0) + 1;
                break;
            case 'environment_breach':
                session.metrics.lockdownBreachCount = (session.metrics.lockdownBreachCount || 0) + 1;
                break;
            case 'camera_blocked':
                session.metrics.cameraBlockedCount = (session.metrics.cameraBlockedCount || 0) + 1;
                break;
            case 'internet_failure':
                session.metrics.internetFailureCount = (session.metrics.internetFailureCount || 0) + 1;
                break;

        }


        // Calculate Integrity Score with revised weighting
        let score = 100;
        const faceDeduction = (session.metrics.faceAbsentCount || 0) * 0;
        const mismatchDeduction = (session.metrics.faceMismatchCount || 0) * 0;
        const multipleFaceDeduction = (session.metrics.multipleFacesCount || 0) * 1;
        const blockedDeduction = (session.metrics.cameraBlockedCount || 0) * 1;

        // Zero-deduction for environment/lockdown events as requested
        const tabDeduction = (session.metrics.tabSwitchCount || 0) * 5; // Tab switches now deduct 5 points
        const focusDeduction = (session.metrics.totalFocusLostDuration || 0) * 0.5;
        const gazeDeduction = (session.metrics.gazeDeviationCount || 0) * 0;
        const audioDeduction = (session.metrics.audioSpikeCount || 0) * 0;
        const breachDeduction = (session.metrics.lockdownBreachCount || 0) * 10; // Lockdown breaches deduct 10 points




        score -= (tabDeduction + focusDeduction + faceDeduction + mismatchDeduction + gazeDeduction + audioDeduction + multipleFaceDeduction + blockedDeduction + breachDeduction);




        // Round to 2 decimal places to avoid floating-point precision errors
        session.integrityScore = Math.max(Math.round(score * 100) / 100, 0);


        // Determine risk level
        if (session.integrityScore >= 80) {
            session.riskLevel = 'low';
        } else if (session.integrityScore >= 60) {
            session.riskLevel = 'medium';
        } else {
            session.riskLevel = 'high';
        }

        // Mark metrics as modified to ensure Mongoose saves the nested object
        session.markModified('metrics');
        await session.save();

        res.json({
            success: true,
            integrityScore: session.integrityScore,
            riskLevel: session.riskLevel
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update live snapshot
exports.updateSnapshot = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { snapshot } = req.body;

        await ExamSession.findByIdAndUpdate(sessionId, { lastSnapshot: snapshot });

        res.json({ success: true });
    } catch (error) {
        console.error(`[Snapshot] Error updating snapshot:`, error.message);
        res.status(500).json({ error: error.message });
    }
};

// Submit answer
exports.submitAnswer = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { questionId, answer } = req.body;

        const session = await ExamSession.findById(sessionId);

        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        session.answers.push({
            questionId,
            answer,
            timestamp: new Date()
        });

        await session.save();

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// End exam session and generate report
exports.endSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { answers } = req.body; // Answers sent from frontend on submit

        const session = await ExamSession.findById(sessionId)
            .populate('examId') // Need full exam for questions
            .populate('studentId', 'name email');

        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        // --- SCORING LOGIC ---
        let calculatedScore = 0;
        let maxScore = 0;
        const sectionResults = [];
        const exam = session.examId;
        const finalAnswers = answers || {};

        // VITAL FIX: Save the final answers into the session document 
        // ensuring 'emailResults' has access to the complete answer set later.
        if (answers) {
            const answerArray = Object.entries(answers).map(([key, value]) => ({
                questionId: key,
                answer: value,
                timestamp: new Date()
            }));
            session.answers = answerArray;
        }


        if (exam.sections && exam.sections.length > 0) {
            exam.sections.forEach(section => {
                let sectionScore = 0;
                let sectionMax = section.questions.length;
                maxScore += sectionMax;

                section.questions.forEach(q => {
                    const studentAnswer = finalAnswers[q._id.toString()];
                    if (studentAnswer && studentAnswer === q.options[q.correctOption]) {
                        sectionScore++;
                        calculatedScore++;
                    }
                });

                sectionResults.push({
                    sectionTitle: section.title,
                    score: sectionScore,
                    maxScore: sectionMax
                });
            });
        } else {
            const questions = exam.questions || [];
            maxScore = questions.length;
            questions.forEach(q => {
                const studentAnswer = finalAnswers[q._id.toString()];
                if (studentAnswer && studentAnswer === q.options[q.correctOption]) {
                    calculatedScore++;
                }
            });
            sectionResults.push({
                sectionTitle: 'Main',
                score: calculatedScore,
                maxScore: maxScore
            });
        }

        session.score = calculatedScore;
        session.maxScore = maxScore;
        session.sectionResults = sectionResults;
        session.isGraded = true;
        // ---------------------

        session.endTime = new Date();
        session.status = 'completed';

        // Generate tamper-proof hash
        const reportData = {
            sessionId: session._id,
            examId: session.examId._id,
            studentId: session.studentId._id,
            metrics: session.metrics,
            integrityScore: session.integrityScore,
            score: session.score, // Add score to hash
            riskLevel: session.riskLevel,
            startTime: session.startTime,
            endTime: session.endTime
        };

        const hash = crypto
            .createHash('sha256')
            .update(JSON.stringify(reportData))
            .digest('hex');

        session.reportHash = hash;

        // In production, use proper digital signature with private key
        session.reportSignature = crypto
            .createHmac('sha256', process.env.REPORT_SECRET || 'default-secret-key')
            .update(hash)
            .digest('hex');

        await session.save();

        res.json({
            success: true,
            report: {
                sessionId: session._id,
                exam: session.examId.title,
                student: session.studentId.name,
                duration: Math.floor((session.endTime - session.startTime) / 1000 / 60), // minutes
                metrics: session.metrics,
                integrityScore: session.integrityScore,
                riskLevel: session.riskLevel,
                reportHash: session.reportHash,
                reportSignature: session.reportSignature,
                timestamp: session.endTime
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get single session with full details
exports.getSession = async (req, res) => {
    try {
        const { sessionId } = req.params;

        const session = await ExamSession.findById(sessionId)
            .populate('examId')
            .populate('studentId', 'name email studentId');

        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        res.json({ success: true, session });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Verify report integrity
exports.verifyReport = async (req, res) => {
    try {
        const { sessionId } = req.params;

        const session = await ExamSession.findById(sessionId)
            .populate('examId', 'title duration')
            .populate('studentId', 'name email');

        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        // Recalculate hash
        const reportData = {
            sessionId: session._id,
            examId: session.examId,
            studentId: session.studentId,
            metrics: session.metrics,
            integrityScore: session.integrityScore,
            riskLevel: session.riskLevel,
            startTime: session.startTime,
            endTime: session.endTime
        };

        const calculatedHash = crypto
            .createHash('sha256')
            .update(JSON.stringify(reportData))
            .digest('hex');

        const isValid = calculatedHash === session.reportHash;

        res.json({
            success: true,
            isValid,
            message: isValid ? 'Report is authentic and unmodified' : 'Report has been tampered with'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all sessions - Optimized for list view (excludes heavy logs)
exports.getAllSessions = async (req, res) => {
    try {
        const sessions = await ExamSession.find()
            .select('-eventLogs -answers') // Exclude heavy data for performance
            .populate('examId', 'title')
            .populate('studentId', 'name email studentId')
            .sort({ startTime: -1 });

        res.json({ success: true, sessions });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



// Delete session
exports.deleteSession = async (req, res) => {
    try {
        const session = await ExamSession.findByIdAndDelete(req.params.id);
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }
        res.json({ success: true, message: 'Session deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete all sessions
exports.deleteAllSessions = async (req, res) => {
    try {
        await ExamSession.deleteMany({});
        res.json({ success: true, message: 'All sessions deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// Email exam results
// Email exam results
exports.emailResults = async (req, res) => {
    try {
        const { sessionIds } = req.body; // Array of session IDs

        if (!sessionIds || !Array.isArray(sessionIds)) {
            return res.status(400).json({ error: 'Valid sessionIds array required' });
        }

        const sessions = await ExamSession.find({ _id: { $in: sessionIds } })
            .populate('studentId', 'name email')
            .populate({
                path: 'examId',
                populate: { path: 'sections.questions' } // Ensure deep population if needed, though schema is embedded
            });

        let sentCount = 0;
        for (const session of sessions) {
            if (session.studentId?.email && session.examId) {
                const exam = session.examId;
                const studentAnswersMap = new Map();

                if (session.answers && Array.isArray(session.answers)) {
                    // Create a normalized map of answers
                    session.answers.forEach(a => {
                        if (a.questionId) {
                            studentAnswersMap.set(String(a.questionId), a.answer);
                        }
                    });
                }


                const questionsAnalysis = [];

                // Helper to process a question
                const processQuestion = (q) => {
                    const qId = q._id.toString();
                    const studentAns = studentAnswersMap.get(qId);
                    const correctAns = q.options[q.correctOption];

                    questionsAnalysis.push({
                        questionText: q.questionText,
                        studentAnswer: studentAns || 'Not Answered',
                        correctAnswer: correctAns,
                        isCorrect: studentAns === correctAns
                    });
                };

                // Handle Sections or Direct Questions
                if (exam.sections && exam.sections.length > 0) {
                    exam.sections.forEach(section => {
                        if (section.questions) {
                            section.questions.forEach(q => processQuestion(q));
                        }
                    });
                } else if (exam.questions && exam.questions.length > 0) { // Fallback if schema differs
                    exam.questions.forEach(q => processQuestion(q));
                }


                await emailService.sendExamResult(
                    session.studentId.email,
                    session.studentId.name,
                    session.examId.title,
                    session.score,
                    session.maxScore,
                    session.integrityScore,
                    questionsAnalysis
                );
                sentCount++;
            }
        }

        res.json({ success: true, message: `Emails sent to ${sentCount} students` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

