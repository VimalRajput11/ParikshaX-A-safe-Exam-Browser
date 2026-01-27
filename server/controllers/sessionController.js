const ExamSession = require('../models/ExamSession');
const crypto = require('crypto');
const emailService = require('../utils/emailService');

// Start a new exam session
exports.startSession = async (req, res) => {
    try {
        const { examId, studentId, consentGiven } = req.body;

        if (!consentGiven) {
            return res.status(400).json({
                error: 'Student consent is required to start the exam session'
            });
        }

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

        // Update metrics based on event type
        switch (eventType) {
            case 'tab_switch':
                session.metrics.tabSwitchCount += 1;
                break;
            case 'focus_lost':
                session.metrics.totalFocusLostDuration += (duration || 0);
                break;
            case 'face_absent':
                session.metrics.faceAbsentCount += 1;
                break;
            case 'gaze_deviation':
                session.metrics.gazeDeviationCount += 1;
                break;
            case 'audio_spike':
                session.metrics.audioSpikeCount += 1;
                break;
            case 'warning_shown':
                session.metrics.warningsShown += 1;
                break;
        }

        // Calculate Integrity Score
        let score = 100;
        score -= Math.min(session.metrics.tabSwitchCount * 5, 30);
        score -= Math.min(Math.floor(session.metrics.totalFocusLostDuration / 10) * 2, 20);
        score -= Math.min(session.metrics.faceAbsentCount * 3, 20);
        score -= Math.min(session.metrics.gazeDeviationCount * 2, 15);
        score -= Math.min(session.metrics.audioSpikeCount * 2, 15);

        session.integrityScore = Math.max(score, 0);

        // Determine risk level
        if (session.integrityScore >= 80) {
            session.riskLevel = 'low';
        } else if (session.integrityScore >= 60) {
            session.riskLevel = 'medium';
        } else {
            session.riskLevel = 'high';
        }

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

// Get session details
exports.getSession = async (req, res) => {
    try {
        const { sessionId } = req.params;

        const session = await ExamSession.findById(sessionId)
            .populate('examId')
            .populate('studentId', 'name email');

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

// Get all sessions
exports.getAllSessions = async (req, res) => {
    try {
        const sessions = await ExamSession.find()
            .populate('examId', 'title')
            .populate('studentId', 'name email studentId')
            .sort({ createdAt: -1 });

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
exports.emailResults = async (req, res) => {
    try {
        const { sessionIds } = req.body; // Array of session IDs

        if (!sessionIds || !Array.isArray(sessionIds)) {
            return res.status(400).json({ error: 'Valid sessionIds array required' });
        }

        const sessions = await ExamSession.find({ _id: { $in: sessionIds } })
            .populate('studentId', 'name email')
            .populate('examId', 'title');

        let sentCount = 0;
        for (const session of sessions) {
            if (session.studentId?.email) {
                await emailService.sendExamResult(
                    session.studentId.email,
                    session.studentId.name,
                    session.examId.title,
                    session.score,
                    session.maxScore,
                    session.integrityScore
                );
                sentCount++;
            }
        }

        res.json({ success: true, message: `Emails sent to ${sentCount} students` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
