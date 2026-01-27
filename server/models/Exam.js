const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    questionText: String,
    options: [String],
    correctOption: Number // index
});

const SectionSchema = new mongoose.Schema({
    title: String,
    duration: {
        type: Number, // in minutes
        required: true
    },
    questions: [QuestionSchema]
});

const ExamSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true,
        unique: true
    },
    description: String,
    duration: {
        type: Number, // Total duration in minutes (calculated or specified)
        required: true
    },
    sections: [SectionSchema],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Exam', ExamSchema);
