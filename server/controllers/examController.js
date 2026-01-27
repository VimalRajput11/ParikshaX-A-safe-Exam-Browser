const Exam = require('../models/Exam');
const User = require('../models/User');
const ExamSession = require('../models/ExamSession');

// Get all exams
exports.getAllExams = async (req, res) => {
    try {
        const exams = await Exam.find().populate('createdBy', 'name email');
        res.json({ success: true, exams });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get exam by ID or Code
exports.getExamById = async (req, res) => {
    try {
        let exam;
        if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            exam = await Exam.findById(req.params.id).populate('createdBy', 'name email');
        } else {
            exam = await Exam.findOne({ code: req.params.id }).populate('createdBy', 'name email');
        }

        if (!exam) {
            return res.status(404).json({ error: 'Exam not found' });
        }

        res.json({ success: true, exam });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create new exam
exports.createExam = async (req, res) => {
    try {
        const { title, description, duration, scheduledDate, sections, createdBy } = req.body;

        const code = `EXAM-${Math.floor(1000 + Math.random() * 9000)}`;

        const exam = new Exam({
            title,
            description,
            duration,
            scheduledDate,
            sections,
            createdBy,
            code
        });

        await exam.save();

        res.status(201).json({ success: true, exam });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update exam
exports.updateExam = async (req, res) => {
    try {
        const exam = await Exam.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!exam) {
            return res.status(404).json({ error: 'Exam not found' });
        }

        res.json({ success: true, exam });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete exam (with cascade cleanup)
exports.deleteExam = async (req, res) => {
    try {
        const examId = req.params.id;

        // 1. Find the exam first
        const exam = await Exam.findById(examId);
        if (!exam) {
            return res.status(404).json({ error: 'Exam not found' });
        }

        // 2. Cascade Delete: Remove all Exam Sessions related to this exam
        await ExamSession.deleteMany({ examId: examId });

        // 3. Cleanup Users/Students
        // Find students who have this exam in their eligible list
        const students = await User.find({ eligibleExams: examId, role: 'student' });

        for (const student of students) {
            // Remove this exam from their list
            student.eligibleExams = student.eligibleExams.filter(id => id.toString() !== examId.toString());

            // If they have no other exams, delete the student record entirely
            if (student.eligibleExams.length === 0) {
                await User.findByIdAndDelete(student._id);
            } else {
                await student.save();
            }
        }

        // 4. Finally delete the exam itself
        await Exam.findByIdAndDelete(examId);

        res.json({ success: true, message: 'Exam and associated student records deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
