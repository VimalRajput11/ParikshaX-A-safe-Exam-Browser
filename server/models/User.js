const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['student', 'admin', 'instructor'],
        default: 'student'
    },
    institution: String,
    studentId: {
        type: String,
        unique: true,
        sparse: true // Allows null/undefined for admins
    },

    // Authorization
    eligibleExams: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam'
    }],

    createdAt: {
        type: Date,
        default: Date.now
    }
}, { bufferCommands: false });

UserSchema.index({ role: 1, eligibleExams: 1 });

module.exports = mongoose.model('User', UserSchema);
