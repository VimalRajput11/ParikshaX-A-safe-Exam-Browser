const mongoose = require('mongoose');

const EventLogSchema = new mongoose.Schema({
    eventType: {
        type: String,
        enum: [
            'tab_switch', 'focus_lost', 'face_absent', 'gaze_deviation',
            'audio_spike', 'warning_shown', 'environment_breach',
            'face_mismatch', 'multiple_faces', 'camera_blocked', 'internet_failure'

        ],
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    duration: Number, // in seconds, for continuous events
    severity: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'low'
    },
    metadata: mongoose.Schema.Types.Mixed // Additional context without PII
});

const ExamSessionSchema = new mongoose.Schema({
    examId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam',
        required: true
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    startTime: {
        type: Date,
        default: Date.now
    },
    endTime: Date,
    status: {
        type: String,
        enum: ['in_progress', 'completed', 'submitted', 'terminated'],
        default: 'in_progress'
    },

    // Monitoring Data (Privacy-First)
    eventLogs: [EventLogSchema],

    // Aggregated Metrics (No Raw Data)
    metrics: {
        tabSwitchCount: { type: Number, default: 0 },
        totalFocusLostDuration: { type: Number, default: 0 }, // seconds
        faceAbsentCount: { type: Number, default: 0 },
        gazeDeviationCount: { type: Number, default: 0 },
        audioSpikeCount: { type: Number, default: 0 },
        warningsShown: { type: Number, default: 0 },
        lockdownBreachCount: { type: Number, default: 0 },
        faceMismatchCount: { type: Number, default: 0 },
        multipleFacesCount: { type: Number, default: 0 },
        cameraBlockedCount: { type: Number, default: 0 }
    },


    // Integrity Score
    integrityScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 100
    },
    riskLevel: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'low'
    },

    // Exam Results
    score: { type: Number, default: 0 },
    maxScore: { type: Number, default: 0 },
    sectionResults: [{
        sectionTitle: String,
        score: Number,
        maxScore: Number
    }],
    isGraded: { type: Boolean, default: false },

    // Consent & Legal
    consentGiven: {
        type: Boolean,
        required: true
    },
    consentTimestamp: Date,

    // Digital Signature (Tamper-Proof)
    reportHash: String,
    reportSignature: String,

    // Answers
    answers: [{
        questionId: String,
        answer: mongoose.Schema.Types.Mixed,
        timestamp: Date
    }],

    lastSnapshot: String, // Store latest B64 frame for live monitoring

    createdAt: {
        type: Date,
        default: Date.now
    }
}, { bufferCommands: false });

// Add Indexes for performance
ExamSessionSchema.index({ examId: 1, startTime: -1 });
ExamSessionSchema.index({ studentId: 1, status: 1 });
ExamSessionSchema.index({ status: 1, integrityScore: -1 });
ExamSessionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ExamSession', ExamSessionSchema);
